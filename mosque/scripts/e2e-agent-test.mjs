// Full end-to-end verification script for AGENT.md rules
const BASE = process.env.BASE || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'dev-cron-secret-key-16-chars-min';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
  }
}

// Cookie jar helper
function makeClient() {
  let cookie = '';
  return {
    async request(path, opts = {}) {
      const headers = {
        'content-type': 'application/json',
        ...(opts.headers || {}),
      };
      if (cookie) headers['cookie'] = cookie;

      const res = await fetch(`${BASE}${path}`, {
        ...opts,
        headers,
      });

      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        cookie = setCookie.split(';')[0];
      }

      let json = null;
      const text = await res.text();
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }

      return { status: res.status, data: json, headers: res.headers };
    },
    get cookie() { return cookie; }
  };
}

async function run() {
  console.log('========================================================');
  console.log(' Mosque SaaS — AGENT.md Comprehensive Verification Suite');
  console.log('========================================================\n');

  // --- 1. Authentication & Tenant Isolation ---
  console.log('--- Test Group 1: Auth & Tenant Isolation ---');
  const anon = makeClient();
  const unauthDash = await anon.request('/api/dashboard');
  assert(unauthDash.status === 401, 'Unauthenticated access to /api/dashboard returns 401');

  const pres = makeClient();
  const presLogin = await pres.request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      mosqueSlug: 'baitun-noor',
      loginId: 'president',
      password: 'Mosque@12345'
    })
  });
  assert(presLogin.status === 200, 'President can log in with valid credentials');

  const wrongPass = await anon.request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      mosqueSlug: 'baitun-noor',
      loginId: 'president',
      password: 'WrongPassword'
    })
  });
  assert(wrongPass.status === 401, 'Login with wrong password returns 401');

  // --- 2. Member Registration & Verification Flow ---
  console.log('\n--- Test Group 2: Member Registration & Verification ---');
  const rand = Date.now().toString().slice(-6);
  const newMemberLogin = `user_${rand}`;
  const memberClient = makeClient();

  const regRes = await memberClient.request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      mosqueSlug: 'baitun-noor',
      name: 'Salim Ullah',
      loginId: newMemberLogin,
      password: 'StrongPassword@123'
    })
  });
  assert(regRes.status === 200, 'New member registers successfully');

  const dupReg = await anon.request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      mosqueSlug: 'baitun-noor',
      name: 'Another Person',
      loginId: newMemberLogin,
      password: 'StrongPassword@123'
    })
  });
  assert(dupReg.status === 409, 'Duplicate loginId registration rejected with 409');

  // Member is PENDING, must not see dashboard
  const pendingDash = await memberClient.request('/api/dashboard');
  assert(pendingDash.status === 403, 'Pending member is blocked from /api/dashboard (403)');

  const memberMePending = await memberClient.request('/api/me');
  assert(memberMePending.status === 200 && memberMePending.data?.status === 'PENDING', 'Pending member can check /api/me and sees status PENDING');
  const membershipId = memberMePending.data?.membershipId;

  // President verifies member and sets monthly pledge
  const verifyRes = await pres.request(`/api/members/${membershipId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'ACTIVE',
      monthlyPledge: 600
    })
  });
  assert(verifyRes.status === 200, 'President verifies member and sets monthly pledge to 600');

  // Now member is ACTIVE, can open dashboard and see statement
  const activeDash = await memberClient.request('/api/dashboard');
  assert(activeDash.status === 200, 'Verified ACTIVE member can now access dashboard');

  const memberStatement = await memberClient.request('/api/members/me');
  assert(memberStatement.status === 200, 'Active member can access /api/members/me statement');
  const currentMonthDue = memberStatement.data?.months?.[0]?.due;
  assert(Number(currentMonthDue) === 600, 'Member statement reflects assigned monthly pledge of 600', `got ${currentMonthDue}`);

  // Member cannot change their own pledge
  const memberChangeSelf = await memberClient.request(`/api/members/${membershipId}`, {
    method: 'PATCH',
    body: JSON.stringify({ monthlyPledge: 100 })
  });
  assert(memberChangeSelf.status === 403, 'Member cannot change own pledge (403 forbidden)');

  // --- 3. Payments, Idempotency & Receipts ---
  console.log('\n--- Test Group 3: Payments, Idempotency & Receipts ---');
  const treas = makeClient();
  await treas.request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      mosqueSlug: 'baitun-noor',
      loginId: 'treasurer',
      password: 'Mosque@12345'
    })
  });

  // Member cannot record payments
  const memberPayAttempt = await memberClient.request('/api/payments', {
    method: 'POST',
    body: JSON.stringify({
      membershipId,
      period: '2026-10',
      amount: 600,
      method: 'CASH',
      idempotencyKey: `member-unauth-${rand}`
    })
  });
  assert(memberPayAttempt.status === 403, 'Regular member cannot record payment (403)');

  // Treasurer records payment with idempotency key
  const idemKey = `pay-${rand}-${Date.now()}`;
  const pay1 = await treas.request('/api/payments', {
    method: 'POST',
    body: JSON.stringify({
      membershipId,
      period: '2026-10',
      amount: 600,
      method: 'BKASH',
      idempotencyKey: idemKey
    })
  });
  assert(pay1.status === 200 && pay1.data?.duplicate === false, 'Treasurer records payment successfully');
  const receiptNo = pay1.data?.receiptNo;
  const paymentId = pay1.data?.id;

  // Duplicate payment request with same idempotency key
  const pay2 = await treas.request('/api/payments', {
    method: 'POST',
    body: JSON.stringify({
      membershipId,
      period: '2026-10',
      amount: 600,
      method: 'BKASH',
      idempotencyKey: idemKey
    })
  });
  assert(pay2.status === 200 && pay2.data?.duplicate === true && pay2.data?.receiptNo === receiptNo,
    'Duplicate payment with same idempotencyKey returns original receipt and duplicate=true');

  // Member opens own receipt
  const ownReceipt = await memberClient.request(`/api/receipts/${paymentId}`);
  assert(ownReceipt.status === 200 && ownReceipt.data?.receiptNo === receiptNo, 'Member can open own receipt');

  // Another member cannot open that receipt (privacy isolation)
  const otherMember = makeClient();
  await otherMember.request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mosqueSlug: 'baitun-noor', loginId: 'member02', password: 'Mosque@12345' })
  });
  const leakReceipt = await otherMember.request(`/api/receipts/${paymentId}`);
  assert(leakReceipt.status === 404, 'Other member cannot view foreign receipt (returns 404)');

  // --- 4. Dynamic Mosque & Roles ---
  console.log('\n--- Test Group 4: Dynamic Mosque & Roles ---');
  const newMosqueSlug = `mosque-${rand}`;
  const newMosqueAdmin = makeClient();
  const createMosqueRes = await newMosqueAdmin.request('/api/mosques', {
    method: 'POST',
    body: JSON.stringify({
      mosqueName: 'Dhanmondi Central Mosque',
      mosqueSlug: newMosqueSlug,
      name: 'Mohammad Admin',
      loginId: `admin_${rand}`,
      password: 'AdminPassword@123'
    })
  });
  assert(createMosqueRes.status === 200, 'New mosque registered dynamically via /api/mosques');

  const newMosqueMe = await newMosqueAdmin.request('/api/me');
  assert(newMosqueMe.data?.status === 'ACTIVE' && newMosqueMe.data?.role?.key === 'president',
    'Creator of new mosque is automatically ACTIVE with president role');

  // Create custom role
  const createRoleRes = await newMosqueAdmin.request('/api/roles', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Auditor',
      permissions: ['finance.view_all', 'members.view']
    })
  });
  assert(createRoleRes.status === 200, 'Admin can create custom dynamic role with permissions');

  // Prevent lockout: Last admin protection
  const rolesList = await newMosqueAdmin.request('/api/roles');
  const presRole = rolesList.data?.roles?.find(r => r.key === 'president');
  const stripAdmin = await newMosqueAdmin.request(`/api/roles/${presRole.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ permissions: [] })
  });
  assert(stripAdmin.status === 409, 'Stripping roles.manage from last admin rejected with 409 (LAST_ADMIN)');

  const deleteSysRole = await newMosqueAdmin.request(`/api/roles/${presRole.id}`, {
    method: 'DELETE'
  });
  assert(deleteSysRole.status === 409, 'Deleting system role rejected with 409');

  // --- 5. Expenses, Approvals & Fund Protection ---
  console.log('\n--- Test Group 5: Expenses, Approvals & Fund Protection ---');
  // Treasurer submits expense
  const expRes = await treas.request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({
      category: 'MAINTENANCE',
      description: `Roof repair test ${rand}`,
      amount: 1500,
      spentAt: '2026-10-12'
    })
  });
  assert(expRes.status === 200, 'Treasurer can submit expense for approval');
  const expenseId = expRes.data?.id;

  // Regular member cannot view pending expense
  const memberExpView = await memberClient.request(`/api/expenses/${expenseId}`);
  assert(memberExpView.status === 404, 'Regular member cannot see pending expense (404)');

  // Approver cannot be self: President submits own expense
  const presExp = await pres.request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({
      category: 'MAINTENANCE',
      description: 'President stationery',
      amount: 300,
      spentAt: '2026-10-12'
    })
  });
  assert(presExp.status === 200, 'President submits own expense');
  const presExpId = presExp.data?.id;
  const selfApprove = await pres.request(`/api/expenses/${presExpId}/decision`, {
    method: 'POST',
    body: JSON.stringify({ decision: 'APPROVE' })
  });
  assert(selfApprove.status === 403, 'Self-approval is blocked (403 forbidden)');

  // President rejects without reason -> 400
  const rejectNoReason = await pres.request(`/api/expenses/${expenseId}/decision`, {
    method: 'POST',
    body: JSON.stringify({ decision: 'REJECT' })
  });
  assert(rejectNoReason.status === 400, 'Rejecting expense without reason rejected with 400');

  // President approves Treasurer expense
  const approveExp = await pres.request(`/api/expenses/${expenseId}/decision`, {
    method: 'POST',
    body: JSON.stringify({ decision: 'APPROVE' })
  });
  assert(approveExp.status === 200, 'President approves Treasurer expense');

  // Treasurer pays the expense
  const payExp = await treas.request(`/api/expenses/${expenseId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ paymentRef: `BKASH-PAY-${rand}` })
  });
  assert(payExp.status === 200, 'Treasurer marks approved expense as PAID');

  // Now regular member CAN view paid expense
  const memberSeePaidExp = await memberClient.request(`/api/expenses/${expenseId}`);
  assert(memberSeePaidExp.status === 200, 'Paid expense is now visible to members');

  // --- 6. Cron & Reminder Safety ---
  console.log('\n--- Test Group 6: Cron & Reminder Safety ---');
  const unauthCron = await anon.request('/api/cron/reminders', { method: 'POST' });
  assert(unauthCron.status === 401, 'Cron endpoint requires CRON_SECRET authorization (401 without)');

  const authCron = await anon.request('/api/cron/reminders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${CRON_SECRET}` }
  });
  assert(authCron.status === 200, 'Cron endpoint executes cleanly with Bearer token');

  // --- Summary ---
  console.log('\n========================================================');
  console.log(` Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
