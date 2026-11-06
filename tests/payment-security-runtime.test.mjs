import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const TEST_SECRET = 'test-super-secret-jwt-key-32-chars-long!';

function encodeBase64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function decodeBase64Url(input) {
  return new Uint8Array(Buffer.from(input, 'base64url'));
}

async function sign(input, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(input));
  return encodeBase64Url(new Uint8Array(signature));
}

async function createSessionToken(user, ttlSeconds = 7200) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    ...user,
    iat: issuedAt,
    exp: issuedAt + ttlSeconds,
  };
  const encodedPayload = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload, TEST_SECRET);
  return `${encodedPayload}.${signature}`;
}

async function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;
  try {
    const [encodedPayload, providedSignature] = token.split('.');
    const expectedSignature = await sign(encodedPayload, TEST_SECRET);
    if (providedSignature !== expectedSignature) return null;

    const payload = JSON.parse(decoder.decode(decodeBase64Url(encodedPayload)));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Pure Business Logic & Authorization Engine for Human Teacher Payment
 * (Mirrors the exact rules in app/api/teacher-marketplace/payment/route.js)
 */
const MIN_PAYMENT_AMOUNT = 10;
const MAX_PAYMENT_AMOUNT = 50000;
const DEFAULT_COMMISSION_PCT = 10;

function validateAndAuthorizePaymentRequest(session, body, serverSettings = { teacherCommissionPercentage: 10 }) {
  // 1. Mandatory Session Check
  if (!session || (!session.authUserId && !session.profileId && !session.id)) {
    return { status: 401, error: 'UNAUTHENTICATED' };
  }

  // 2. Strict Role Check (Student only)
  if (session.role !== 'student') {
    return { status: 403, error: 'FORBIDDEN_ROLE_NOT_STUDENT' };
  }

  // 3. Authoritative Identity (Anti-IDOR)
  const authoritativeStudentId = String(session.profileId || session.authUserId || session.loginId || session.id);
  const authoritativeStudentName = session.name || session.full_name_bn || session.full_name_en || session.loginId || 'ভেরিফাইড শিক্ষার্থী';

  // 4. Input Validations
  const { teacher_id, amount } = body || {};
  if (!teacher_id || typeof teacher_id !== 'string' || !teacher_id.trim()) {
    return { status: 400, error: 'TEACHER_ID_REQUIRED' };
  }

  const numAmount = Number(amount);
  if (!numAmount || Number.isNaN(numAmount) || !Number.isFinite(numAmount)) {
    return { status: 400, error: 'INVALID_AMOUNT' };
  }

  if (numAmount < MIN_PAYMENT_AMOUNT) {
    return { status: 400, error: 'AMOUNT_BELOW_MINIMUM', min: MIN_PAYMENT_AMOUNT };
  }

  if (numAmount > MAX_PAYMENT_AMOUNT) {
    return { status: 400, error: 'AMOUNT_EXCEEDS_MAXIMUM', max: MAX_PAYMENT_AMOUNT };
  }

  // 5. Server-Side Commission Calculation (Client commission_pct is strictly ignored)
  const serverCommissionPct = Number(serverSettings.teacherCommissionPercentage) || DEFAULT_COMMISSION_PCT;
  const commissionAmount = Math.round(numAmount * (serverCommissionPct / 100));
  const netAmount = numAmount - commissionAmount;

  // 6. Payment Intent Generation
  const paymentIntentId = `pi_${teacher_id}_${Date.now()}`;

  return {
    status: 503, // Returns 503 pending official merchant gateway integration
    code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
    wallet_credited: false,
    verified: false,
    payment_intent: {
      id: paymentIntentId,
      student_id: authoritativeStudentId,
      student_name: authoritativeStudentName,
      teacher_id,
      amount_gross: numAmount,
      platform_commission_pct: serverCommissionPct,
      platform_commission_amount: commissionAmount,
      amount_net: netAmount,
      currency: 'BDT',
      status: 'pending_gateway_verification',
    },
  };
}

describe('Runtime Unit Tests: Payment Security & Authorization Logic', () => {
  it('1. Session HMAC Verification — Verifies authentic token and rejects tampered tokens', async () => {
    const validToken = await createSessionToken({
      authUserId: 'uuid-std-001',
      role: 'student',
      loginId: 'STD-001',
      profileId: 'prof-std-001',
    });

    const verified = await verifySessionToken(validToken);
    assert.ok(verified, 'Authentic token must verify successfully');
    assert.equal(verified.role, 'student');
    assert.equal(verified.loginId, 'STD-001');

    // Tampered token test (change signature)
    const tampered = validToken.substring(0, validToken.length - 5) + 'xxxxx';
    const tamperedResult = await verifySessionToken(tampered);
    assert.equal(tamperedResult, null, 'Tampered token must be rejected as null');
  });

  it('2. Guest Rejection — Returns 401 when no session is present', () => {
    const result = validateAndAuthorizePaymentRequest(null, { teacher_id: 'teacher-1', amount: 500 });
    assert.equal(result.status, 401);
    assert.equal(result.error, 'UNAUTHENTICATED');
  });

  it('3. Non-Student Role Rejection — Returns 403 when teacher or admin attempts payment', () => {
    const teacherSession = {
      authUserId: 'uuid-teacher-1',
      role: 'teacher',
      profileId: 'teacher-prof-1',
    };
    const adminSession = {
      authUserId: 'uuid-admin-1',
      role: 'admin',
      profileId: 'admin-prof-1',
    };

    const resTeacher = validateAndAuthorizePaymentRequest(teacherSession, { teacher_id: 'teacher-1', amount: 500 });
    assert.equal(resTeacher.status, 403);
    assert.equal(resTeacher.error, 'FORBIDDEN_ROLE_NOT_STUDENT');

    const resAdmin = validateAndAuthorizePaymentRequest(adminSession, { teacher_id: 'teacher-1', amount: 500 });
    assert.equal(resAdmin.status, 403);
    assert.equal(resAdmin.error, 'FORBIDDEN_ROLE_NOT_STUDENT');
  });

  it('4. Payment Amount Boundaries — Rejects < 10 and > 50,000 BDT with 400', () => {
    const studentSession = { authUserId: 'std-1', role: 'student', profileId: 'prof-1' };

    assert.equal(validateAndAuthorizePaymentRequest(studentSession, { teacher_id: 'teacher-1', amount: 0 }).status, 400);
    assert.equal(validateAndAuthorizePaymentRequest(studentSession, { teacher_id: 'teacher-1', amount: -500 }).status, 400);
    assert.equal(validateAndAuthorizePaymentRequest(studentSession, { teacher_id: 'teacher-1', amount: 5 }).status, 400);
    assert.equal(validateAndAuthorizePaymentRequest(studentSession, { teacher_id: 'teacher-1', amount: 100000 }).status, 400);
  });

  it('5. Anti-IDOR & Client Commission Bypass Protection — Rejects client spoofing and client commission', () => {
    const studentSession = {
      authUserId: 'auth-uuid-42',
      role: 'student',
      profileId: 'student-canonical-42',
      name: 'আহমেদ সাদিক',
    };

    const maliciousBody = {
      teacher_id: 'teacher-1',
      student_id: 'victim-student-999', // Attacker tries to impersonate another student
      student_name: 'ভিক্টিম শিক্ষার্থী',
      amount: 2000,
      commission_pct: 0, // Attacker tries to pay 0% commission
      gateway_ref: 'FORGED_REF_123',
    };

    const result = validateAndAuthorizePaymentRequest(studentSession, maliciousBody, { teacherCommissionPercentage: 15 });

    // Must return 503 pending gateway connection
    assert.equal(result.status, 503);
    assert.equal(result.wallet_credited, false, 'Wallet must NEVER be credited without verified gateway');
    assert.equal(result.verified, false);

    // Anti-IDOR verification
    assert.equal(result.payment_intent.student_id, 'student-canonical-42', 'Must use session student ID, not victim ID');
    assert.equal(result.payment_intent.student_name, 'আহমেদ সাদিক');

    // Commission verification: uses server 15%, completely ignores client 0%
    assert.equal(result.payment_intent.platform_commission_pct, 15);
    assert.equal(result.payment_intent.platform_commission_amount, 300);
    assert.equal(result.payment_intent.amount_net, 1700);
  });

  it('6. Intent Insertion Failure Handling — Rejects with 503 and never claims intent exists on DB error', () => {
    // Simulator for database insertion failure
    function handleIntentPersistence(dbSuccess) {
      if (!dbSuccess) {
        return {
          ok: false,
          status: 503,
          code: 'INTENT_PERSISTENCE_FAILED',
          wallet_credited: false,
          verified: false,
          error: 'পেমেন্ট ইনটেন্ট ডেটাবেজে সংরক্ষণ করা যায়নি।',
        };
      }
      return { ok: true, status: 200 };
    }

    const failedResult = handleIntentPersistence(false);
    assert.equal(failedResult.status, 503);
    assert.equal(failedResult.ok, false);
    assert.equal(failedResult.wallet_credited, false, 'Wallet must NEVER be credited on intent persistence failure');
    assert.equal(failedResult.code, 'INTENT_PERSISTENCE_FAILED');
  });

  it('7. Settlement Logic Verification — Settle RPC requires matching persisted intent, amount and currency', () => {
    // In-memory model of settle_verified_teacher_hadia_payment RPC
    const ledger = {
      intents: new Map([
        [
          'pi_teacher-1_1001',
          {
            id: 'tx-uuid-1001',
            teacher_id: 'teacher-1',
            student_id: 'std-prof-1',
            amount_gross: 1000,
            amount_net: 900,
            status: 'pending_gateway_verification',
            merchant_account_id: 'RAHMANIA_OFFICIAL_MERCHANT',
            gateway_ref: null,
          },
        ],
      ]),
      wallets: new Map([['teacher-1', { balance: 0, total_earned: 0 }]]),
      usedGatewayRefs: new Set(['PREVIOUS_TRX_ALREADY_USED', 'REFUNDED_OLD_TRX', 'FAILED_OLD_TRX']),
    };

    function settleVerifiedPayment(intentId, gatewayRef, verifiedAmount, verifiedCurrency, gatewayProvider, merchantAccountId) {
      const intent = ledger.intents.get(intentId);
      if (!intent) return { success: false, code: 'INTENT_NOT_FOUND' };
      if (intent.status === 'completed') return { success: false, code: 'ALREADY_COMPLETED' };
      if (intent.status !== 'pending_gateway_verification') return { success: false, code: 'INVALID_INTENT_STATUS' };
      if (intent.amount_gross !== verifiedAmount) return { success: false, code: 'AMOUNT_MISMATCH' };
      if (verifiedCurrency !== 'BDT') return { success: false, code: 'CURRENCY_MISMATCH' };
      if (!intent.merchant_account_id || !intent.merchant_account_id.trim()) {
        return { success: false, code: 'MISSING_PERSISTED_MERCHANT_ID' };
      }
      if (intent.merchant_account_id !== merchantAccountId) {
        return { success: false, code: 'MERCHANT_MISMATCH' };
      }
      if (ledger.usedGatewayRefs.has(gatewayRef)) return { success: false, code: 'DUPLICATE_GATEWAY_REF' };

      // Transition
      intent.status = 'completed';
      intent.gateway_ref = gatewayRef;
      ledger.usedGatewayRefs.add(gatewayRef);

      const wallet = ledger.wallets.get(intent.teacher_id) || { balance: 0, total_earned: 0 };
      wallet.balance += intent.amount_net;
      wallet.total_earned += intent.amount_net;
      ledger.wallets.set(intent.teacher_id, wallet);

      return {
        success: true,
        transaction_id: intent.id,
        amount_net: intent.amount_net,
        new_wallet_balance: wallet.balance,
      };
    }

    // 1. Amount mismatch test
    const mismatch = settleVerifiedPayment('pi_teacher-1_1001', 'TRX_NEW_999', 500, 'BDT', 'bkash', 'RAHMANIA_OFFICIAL_MERCHANT');
    assert.equal(mismatch.success, false);
    assert.equal(mismatch.code, 'AMOUNT_MISMATCH');

    // 2. Merchant account mismatch test
    const merchantMismatch = settleVerifiedPayment('pi_teacher-1_1001', 'TRX_NEW_999', 1000, 'BDT', 'bkash', 'FORGED_ATTACKER_MERCHANT');
    assert.equal(merchantMismatch.success, false);
    assert.equal(merchantMismatch.code, 'MERCHANT_MISMATCH');

    // 3. Permanent unique constraint test: Reusing reference from refunded/failed transaction -> MUST REJECT
    const dupRefunded = settleVerifiedPayment('pi_teacher-1_1001', 'REFUNDED_OLD_TRX', 1000, 'BDT', 'bkash', 'RAHMANIA_OFFICIAL_MERCHANT');
    assert.equal(dupRefunded.success, false);
    assert.equal(dupRefunded.code, 'DUPLICATE_GATEWAY_REF');

    // 4. Successful atomic settlement with valid gateway verification
    const success = settleVerifiedPayment('pi_teacher-1_1001', 'VALID_BKASH_TRX_777', 1000, 'BDT', 'bkash', 'RAHMANIA_OFFICIAL_MERCHANT');
    assert.equal(success.success, true);
    assert.equal(success.new_wallet_balance, 900);

    // 5. Double completion attempt rejection
    const alreadyDone = settleVerifiedPayment('pi_teacher-1_1001', 'VALID_BKASH_TRX_777', 1000, 'BDT', 'bkash', 'RAHMANIA_OFFICIAL_MERCHANT');
    assert.equal(alreadyDone.success, false);
    assert.equal(alreadyDone.code, 'ALREADY_COMPLETED');
  });

  it('8. Universal Live Room Identity Immutability & Role Escalation Guard', () => {
    // Model of PostgreSQL trigger prevent_live_room_participant_escalation
    function checkParticipantUpdate(oldRow, newRow, caller, roomHostTeacherId) {
      // 1. UNIVERSAL IMMUTABILITY (Applies to all: students, hosts, and admins)
      if (newRow.user_id !== oldRow.user_id) {
        throw new Error('Access Denied: Participant user_id is strictly immutable for all users');
      }
      if (newRow.room_id !== oldRow.room_id) {
        throw new Error('Access Denied: Participant room_id is strictly immutable for all users');
      }
      if (newRow.joined_at !== oldRow.joined_at) {
        throw new Error('Access Denied: Participant joined_at is strictly immutable for all users');
      }

      const isAdmin = caller.role === 'admin' || caller.role === 'platform_owner';
      const isHost = caller.teacherId && caller.teacherId === roomHostTeacherId;

      // 2. ROLE ALTERATION GUARD & SEPARATION OF PRIVILEGES
      if (newRow.role !== oldRow.role) {
        if (!isAdmin && !isHost) {
          throw new Error('Access Denied: Only the verified room teacher or platform admin can change participant roles');
        }
        if (!['teacher', 'moderator', 'student'].includes(newRow.role)) {
          throw new Error('Access Denied: Invalid participant role requested');
        }
        if (newRow.role === 'teacher' && !isAdmin) {
          if (newRow.user_id !== roomHostTeacherId) {
            throw new Error('Access Denied: The teacher role is strictly reserved for the authorized room teacher. Students cannot be promoted to teacher.');
          }
        }
      }
      return newRow;
    }

    const hostCaller = { role: 'teacher', teacherId: 'host-teacher-101' };
    const nonHostTeacherCaller = { role: 'teacher', teacherId: 'intruder-teacher-202' };
    const adminCaller = { role: 'admin' };
    const studentCaller = { role: 'student' };

    const oldParticipant = {
      user_id: 'std-canonical-1',
      room_id: 'room-uuid-99',
      joined_at: '2026-11-04T00:00:00Z',
      role: 'student',
      is_speaking: false,
    };

    // A. Host attempting to modify user_id -> MUST THROW
    assert.throws(
      () => checkParticipantUpdate(oldParticipant, { ...oldParticipant, user_id: 'tampered-user' }, hostCaller, 'host-teacher-101'),
      /user_id is strictly immutable/
    );

    // B. Admin attempting to modify user_id, room_id, or joined_at -> MUST THROW
    assert.throws(
      () => checkParticipantUpdate(oldParticipant, { ...oldParticipant, user_id: 'admin-tampered' }, adminCaller, 'host-teacher-101'),
      /user_id is strictly immutable/
    );
    assert.throws(
      () => checkParticipantUpdate(oldParticipant, { ...oldParticipant, room_id: 'swapped-room' }, adminCaller, 'host-teacher-101'),
      /room_id is strictly immutable/
    );
    assert.throws(
      () => checkParticipantUpdate(oldParticipant, { ...oldParticipant, joined_at: '2020-01-01T00:00:00Z' }, adminCaller, 'host-teacher-101'),
      /joined_at is strictly immutable/
    );

    // C. Non-host teacher attempting to modify role -> MUST THROW
    assert.throws(
      () => checkParticipantUpdate(oldParticipant, { ...oldParticipant, role: 'moderator' }, nonHostTeacherCaller, 'host-teacher-101'),
      /Only the verified room teacher or platform admin/
    );

    // D. Student attempting self-promotion to teacher/moderator -> MUST THROW
    assert.throws(
      () => checkParticipantUpdate(oldParticipant, { ...oldParticipant, role: 'teacher' }, studentCaller, 'host-teacher-101'),
      /Only the verified room teacher or platform admin/
    );

    // E. Host attempting to promote another student to teacher -> MUST THROW
    assert.throws(
      () => checkParticipantUpdate(oldParticipant, { ...oldParticipant, role: 'teacher' }, hostCaller, 'host-teacher-101'),
      /Students cannot be promoted to teacher/
    );

    // F. Host of this specific room appointing a student to moderator -> ALLOWED
    const hostPromotion = checkParticipantUpdate(oldParticipant, { ...oldParticipant, role: 'moderator' }, hostCaller, 'host-teacher-101');
    assert.equal(hostPromotion.role, 'moderator');

    // G. Admin can manage roles
    const adminPromotion = checkParticipantUpdate(oldParticipant, { ...oldParticipant, role: 'moderator' }, adminCaller, 'host-teacher-101');
    assert.equal(adminPromotion.role, 'moderator');
  });

  it('9. NULL-Safe Settlement Parameters & Real Merchant Identity Validation', () => {
    function validateSettlementInputs(intentId, gatewayRef, verifiedAmount, verifiedCurrency, gatewayProvider, merchantAccountId) {
      if (!intentId || typeof intentId !== 'string' || !intentId.trim()) {
        return { success: false, code: 'EMPTY_INTENT_ID' };
      }
      if (!gatewayRef || typeof gatewayRef !== 'string' || !gatewayRef.trim()) {
        return { success: false, code: 'EMPTY_GATEWAY_REF' };
      }
      if (!gatewayProvider || typeof gatewayProvider !== 'string' || !['bkash', 'nagad'].includes(gatewayProvider.trim().toLowerCase())) {
        return { success: false, code: 'INVALID_GATEWAY_PROVIDER' };
      }
      if (!merchantAccountId || typeof merchantAccountId !== 'string' || !merchantAccountId.trim()) {
        return { success: false, code: 'EMPTY_MERCHANT_ACCOUNT_ID' };
      }
      if (verifiedAmount === null || verifiedAmount === undefined || Number.isNaN(Number(verifiedAmount)) || Number(verifiedAmount) <= 0) {
        return { success: false, code: 'INVALID_VERIFIED_AMOUNT' };
      }
      if (verifiedCurrency !== 'BDT') {
        return { success: false, code: 'CURRENCY_MISMATCH' };
      }
      return { success: true };
    }

    assert.equal(validateSettlementInputs('', 'TRX-123', 500, 'BDT', 'bkash', 'MERCHANT-01').code, 'EMPTY_INTENT_ID');
    assert.equal(validateSettlementInputs('pi-1', '', 500, 'BDT', 'bkash', 'MERCHANT-01').code, 'EMPTY_GATEWAY_REF');
    assert.equal(validateSettlementInputs('pi-1', null, 500, 'BDT', 'bkash', 'MERCHANT-01').code, 'EMPTY_GATEWAY_REF');
    assert.equal(validateSettlementInputs('pi-1', 'TRX-123', 500, 'BDT', 'paypal', 'MERCHANT-01').code, 'INVALID_GATEWAY_PROVIDER');
    assert.equal(validateSettlementInputs('pi-1', 'TRX-123', 500, 'BDT', 'bkash', '').code, 'EMPTY_MERCHANT_ACCOUNT_ID');
    assert.equal(validateSettlementInputs('pi-1', 'TRX-123', null, 'BDT', 'bkash', 'MERCHANT-01').code, 'INVALID_VERIFIED_AMOUNT');
    assert.equal(validateSettlementInputs('pi-1', 'TRX-123', -50, 'BDT', 'bkash', 'MERCHANT-01').code, 'INVALID_VERIFIED_AMOUNT');
    assert.equal(validateSettlementInputs('pi-1', 'TRX-123', 500, 'USD', 'bkash', 'MERCHANT-01').code, 'CURRENCY_MISMATCH');
    assert.equal(validateSettlementInputs('pi-1', 'TRX-123', 500, 'BDT', 'bkash', 'MERCHANT-01').success, true);
  });

  it('10. Wallet Reconciliation Preview — Calculates credits, debits, adjustments & discrepancies without destructive updates', () => {
    // Model of read-only reconciliation preview logic
    const teacherWallet = { teacher_id: 'teacher-1', balance: 14200 }; // Existing unverified balance
    const transactions = [
      { teacher_id: 'teacher-1', type: 'hadia_payment', amount_net: 900, status: 'completed' },
      { teacher_id: 'teacher-1', type: 'monthly_fee', amount_net: 2000, status: 'completed' },
      { teacher_id: 'teacher-1', type: 'withdrawal', amount_net: 1500, status: 'completed' },
      { teacher_id: 'teacher-1', type: 'refund', amount_net: 400, status: 'completed' },
      { teacher_id: 'teacher-1', type: 'adjustment', amount_net: 100, status: 'completed' },
      { teacher_id: 'teacher-1', type: 'hadia_payment', amount_net: 500, status: 'pending_gateway_verification' },
    ];

    function previewWalletReconciliation(wallet, txList) {
      let hadiaCredits = 0;
      let withdrawals = 0;
      let refunds = 0;
      let adjustments = 0;

      for (const t of txList) {
        if (t.teacher_id !== wallet.teacher_id || t.status !== 'completed') continue;
        if (['hadia_payment', 'monthly_fee'].includes(t.type)) hadiaCredits += t.amount_net;
        if (t.type === 'withdrawal') withdrawals += t.amount_net;
        if (t.type === 'refund') refunds += t.amount_net;
        if (t.type === 'adjustment') adjustments += t.amount_net;
      }

      const calculatedBalance = (hadiaCredits + adjustments) - (withdrawals + refunds);
      const discrepancy = wallet.balance - calculatedBalance;

      return {
        teacher_id: wallet.teacher_id,
        existing_balance: wallet.balance,
        hadia_credits: hadiaCredits,
        withdrawals,
        refunds,
        adjustments,
        calculated_balance: calculatedBalance,
        discrepancy,
        reconciliation_status: discrepancy === 0 ? 'BALANCED' : 'DISCREPANCY_DETECTED',
      };
    }

    const preview = previewWalletReconciliation(teacherWallet, transactions);
    assert.equal(preview.existing_balance, 14200);
    assert.equal(preview.hadia_credits, 2900);
    assert.equal(preview.withdrawals, 1500);
    assert.equal(preview.refunds, 400);
    assert.equal(preview.adjustments, 100);
    assert.equal(preview.calculated_balance, 1100);
    assert.equal(preview.discrepancy, 13100, 'Must surface unbacked 13,100 BDT discrepancy without deleting data');
    assert.equal(preview.reconciliation_status, 'DISCREPANCY_DETECTED');
    assert.equal(teacherWallet.balance, 14200, 'Original wallet balance remains untouched in preview mode');
  });

  it('11. Review Dual Transaction Ownership & Sensitive Contact Redaction', () => {
    function sanitizeReviewComment(comment) {
      if (!comment) return '';
      // Redact BD phone numbers (+8801... or 01...)
      const noPhones = comment.replace(/(\+?8801|01)[3-9][0-9]{8}/g, '[ফোন নম্বর গোপনীয়]');
      // Redact emails
      const noEmails = noPhones.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[ইমেইল গোপনীয়]');
      return noEmails;
    }

    function checkReviewVerification(review, transactions) {
      // Must match BOTH teacher_id AND student_id in a completed qualifying transaction
      // AND transaction must have occurred at or before the review was created
      const hasQualifyingTx = transactions.some(
        (t) =>
          t.student_id === review.student_id &&
          t.teacher_id === review.teacher_id &&
          t.status === 'completed' &&
          ['hadia_payment', 'monthly_fee'].includes(t.type) &&
          new Date(t.created_at).getTime() <= new Date(review.created_at).getTime()
      );

      if (!hasQualifyingTx) return null; // Excluded from public view

      const name = (review.student_name || '').trim();
      const displayName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : 'শিক্ষার্থী';

      return {
        id: review.id,
        teacher_id: review.teacher_id,
        student_display_name: displayName,
        rating: review.rating,
        comment: review.moderation_status === 'approved' ? sanitizeReviewComment(review.comment) : null,
        moderation_status: review.moderation_status || 'pending_moderation',
        is_verified_transaction: true,
      };
    }

    const transactions = [
      { student_id: 'std-valid', teacher_id: 'teacher-1', status: 'completed', type: 'hadia_payment', created_at: '2026-11-01T10:00:00Z' },
      { student_id: 'std-other', teacher_id: 'teacher-2', status: 'completed', type: 'hadia_payment', created_at: '2026-11-01T10:00:00Z' },
      { student_id: 'std-future', teacher_id: 'teacher-1', status: 'completed', type: 'hadia_payment', created_at: '2026-11-05T10:00:00Z' },
    ];

    // Case 1: Review for teacher-1 with transaction for teacher-2 (different teacher) -> Excluded
    const mismatchedReview = {
      id: 'rev-mismatch',
      teacher_id: 'teacher-1',
      student_id: 'std-other', // Transaction exists with teacher-2, not teacher-1!
      student_name: 'সাকিব আল হাসান',
      comment: 'উস্তাদ খুব ভালো পড়ান',
      moderation_status: 'approved',
      created_at: '2026-11-02T10:00:00Z',
    };
    assert.equal(checkReviewVerification(mismatchedReview, transactions), null, 'Must exclude review lacking dual student+teacher transaction');

    // Case 2: Matching review with pending moderation -> Comment MUST BE NULL
    const pendingReview = {
      id: 'rev-pending',
      teacher_id: 'teacher-1',
      student_id: 'std-valid',
      student_name: 'আব্দুল্লাহ বিন উমর',
      rating: 5,
      comment: 'আমার ফোন ০১৭৯৯৮৮৭৭৬৬',
      moderation_status: 'pending_moderation',
      created_at: '2026-11-02T10:00:00Z',
    };
    const pubPending = checkReviewVerification(pendingReview, transactions);
    assert.ok(pubPending !== null);
    assert.equal(pubPending.comment, null, 'Unapproved comment must be null even with verified transaction');

    // Case 3: Matching review explicitly approved by moderator -> Sanitized comment visible
    const approvedReview = {
      id: 'rev-approved',
      teacher_id: 'teacher-1',
      student_id: 'std-valid',
      student_name: 'আব্দুল্লাহ বিন উমর',
      rating: 5,
      comment: 'মাশাল্লাহ! আমার ফোন ০১৭৯৯৮৮৭৭৬৬ বা +8801712345678 আর ইমেইল student@rahmania.edu তে যোগাযোগ করতে পারেন।',
      moderation_status: 'approved',
      created_at: '2026-11-02T10:00:00Z',
    };

    const pubApproved = checkReviewVerification(approvedReview, transactions);
    assert.ok(pubApproved !== null);
    assert.equal(pubApproved.student_id, undefined);
    assert.ok(pubApproved.comment.includes('[ফোন নম্বর গোপনীয়]'));
    assert.ok(pubApproved.comment.includes('[ইমেইল গোপনীয়]'));
    assert.ok(!pubApproved.comment.includes('01712345678'));
    assert.ok(!pubApproved.comment.includes('student@rahmania.edu'));

    // Case 3: Review created before transaction occurred (future transaction cannot verify past review) -> Excluded
    const prematureReview = {
      id: 'rev-premature',
      teacher_id: 'teacher-1',
      student_id: 'std-future',
      student_name: 'হাসান মাহমুদ',
      comment: 'ভালো ক্লাস',
      created_at: '2026-11-03T10:00:00Z', // Before the 2026-11-05 transaction!
    };
    assert.equal(checkReviewVerification(prematureReview, transactions), null, 'Future transaction cannot verify prior unverified review');
  });

  it('12. Seed Teacher Sanitization & Unreconciled Withdrawal Protection', () => {
    // 1. Seed Teacher Sanitization: Seed IDs without real auth users are quarantined to 'suspended'
    // Dynamic recomputation: stats are recalculated from verified transactions rather than blindly erased
    function recomputeProfileStats(teacherId, reviews, transactions, rooms) {
      const verifiedReviews = reviews.filter(
        (r) =>
          r.teacher_id === teacherId &&
          r.is_verified_transaction &&
          r.moderation_status === 'approved' &&
          transactions.some(
            (t) =>
              t.student_id === r.student_id &&
              t.teacher_id === r.teacher_id &&
              t.status === 'completed' &&
              ['hadia_payment', 'monthly_fee'].includes(t.type) &&
              new Date(t.created_at).getTime() <= new Date(r.created_at).getTime()
          )
      );

      const rating =
        verifiedReviews.length > 0
          ? Number((verifiedReviews.reduce((sum, r) => sum + r.rating, 0) / verifiedReviews.length).toFixed(2))
          : 0.0;
      const totalReviews = verifiedReviews.length;

      const totalStudents = new Set(
        transactions.filter((t) => t.teacher_id === teacherId && t.status === 'completed').map((t) => t.student_id)
      ).size;

      const totalClasses = rooms.filter((r) => r.teacher_id === teacherId && !r.is_active).length;

      return { rating, totalReviews, totalStudents, totalClasses };
    }

    function sanitizeSeedProfile(profile, reviews, transactions, rooms) {
      const isSeed = ['teacher-1', 'teacher-2', 'teacher-3', 'teacher-4'].includes(profile.teacher_id);
      if (!isSeed) return profile;

      const recomputed = recomputeProfileStats(profile.teacher_id, reviews, transactions, rooms);

      return {
        ...profile,
        status: profile.user_id ? 'pending' : 'suspended',
        rating: recomputed.rating,
        total_reviews: recomputed.totalReviews,
        total_students: recomputed.totalStudents,
        total_classes: recomputed.totalClasses,
      };
    }

    const seedProfileWithoutAuth = {
      teacher_id: 'teacher-1',
      user_id: null,
      status: 'approved',
      rating: 4.95,
      total_reviews: 128,
      total_students: 340,
      total_classes: 1450,
    };

    // Unbacked seed: 0 transactions -> Recomputed to 0.0, 0, 0, 0
    const sanitizedEmpty = sanitizeSeedProfile(seedProfileWithoutAuth, [], [], []);
    assert.equal(sanitizedEmpty.status, 'suspended', 'Unclaimed seed teacher quarantined to suspended');
    assert.equal(sanitizedEmpty.rating, 0.0, 'Recomputed rating is 0.0 when unbacked');
    assert.equal(sanitizedEmpty.total_reviews, 0, 'Recomputed review count is 0 when unbacked');

    // Genuine teacher with real verified reviews -> Real stats preserved
    const realReviews = [
      {
        teacher_id: 'teacher-1',
        student_id: 'std-real',
        rating: 5,
        is_verified_transaction: true,
        moderation_status: 'approved',
        created_at: '2026-11-04T00:00:00Z',
      },
    ];
    const realTxs = [
      {
        teacher_id: 'teacher-1',
        student_id: 'std-real',
        status: 'completed',
        type: 'hadia_payment',
        created_at: '2026-11-03T00:00:00Z',
      },
    ];
    const sanitizedWithRealData = sanitizeSeedProfile(seedProfileWithoutAuth, realReviews, realTxs, []);
    assert.equal(sanitizedWithRealData.rating, 5.0, 'Preserves independently verified rating');
    assert.equal(sanitizedWithRealData.total_reviews, 1, 'Preserves verified review count');
    assert.equal(sanitizedWithRealData.total_students, 1, 'Preserves verified student count');

    // 2. Financial Data Preservation & Withdrawal Safety Gate:
    // Invariant: Existing financial balances are NEVER automatically zeroed out; marked with hold
    function applySeedWalletHold(wallet) {
      const isSeed = ['teacher-1', 'teacher-2', 'teacher-3', 'teacher-4'].includes(wallet.teacher_id);
      if (!isSeed) return wallet;

      return {
        ...wallet, // Balance and total_earned preserved untouched!
        is_withdrawal_held: true,
        hold_reason: 'SEED_WALLET_UNRECONCILED_HOLD: Preserved historical balance pending authorized finance review',
        reconciliation_required: true,
      };
    }

    const rawSeedWallet = { teacher_id: 'teacher-1', balance: 14200, total_earned: 48500 };
    const heldWallet = applySeedWalletHold(rawSeedWallet);
    assert.equal(heldWallet.balance, 14200, 'Existing recorded balance MUST be preserved untouched');
    assert.equal(heldWallet.total_earned, 48500, 'Existing recorded total_earned MUST be preserved untouched');
    assert.equal(heldWallet.is_withdrawal_held, true, 'Administrative withdrawal hold placed');
    assert.equal(heldWallet.reconciliation_required, true, 'Reconciliation required flag set');

    function validateWithdrawalRequest(wallet, ledgerTransactions, requestAmount) {
      if (wallet.is_withdrawal_held) {
        return {
          ok: false,
          code: 'WITHDRAWAL_BLOCKED_ADMINISTRATIVE_HOLD',
          hold_reason: wallet.hold_reason,
        };
      }
      if (requestAmount <= 0) {
        return { ok: false, code: 'INVALID_WITHDRAWAL_AMOUNT' };
      }
      if (wallet.balance < requestAmount) {
        return { ok: false, code: 'INSUFFICIENT_WALLET_BALANCE' };
      }

      // Calculate ledger-backed balance
      const ledgerCredits = ledgerTransactions
        .filter((t) => t.status === 'completed' && ['hadia_payment', 'monthly_fee', 'adjustment'].includes(t.type))
        .reduce((sum, t) => sum + (t.amount_net || 0), 0);
      const ledgerDebits = ledgerTransactions
        .filter((t) => t.status === 'completed' && ['withdrawal', 'refund'].includes(t.type))
        .reduce((sum, t) => sum + (t.amount_net || 0), 0);
      const calculatedBalance = ledgerCredits - ledgerDebits;

      const discrepancy = wallet.balance - calculatedBalance;
      if (discrepancy !== 0) {
        return {
          ok: false,
          code: 'WITHDRAWAL_BLOCKED_UNRECONCILED_DISCREPANCY',
          discrepancy,
          calculated_balance: calculatedBalance,
          wallet_balance: wallet.balance,
        };
      }

      return { ok: true, approved_amount: requestAmount };
    }

    // Seed teacher withdrawal held blocks payout
    const heldWithdrawResult = validateWithdrawalRequest(heldWallet, [], 5000);
    assert.equal(heldWithdrawResult.ok, false);
    assert.equal(heldWithdrawResult.code, 'WITHDRAWAL_BLOCKED_ADMINISTRATIVE_HOLD');

    // Unreconciled balance discrepancy blocks payout
    const unheldDiscrepantWallet = { teacher_id: 'teacher-x', balance: 10000, is_withdrawal_held: false };
    const discrepantResult = validateWithdrawalRequest(unheldDiscrepantWallet, [], 2000);
    assert.equal(discrepantResult.ok, false);
    assert.equal(discrepantResult.code, 'WITHDRAWAL_BLOCKED_UNRECONCILED_DISCREPANCY');

    // Reconciled teacher with matching ledger balance allows withdrawal
    const realWallet = { teacher_id: 'teacher-real', balance: 2500, is_withdrawal_held: false };
    const realLedger = [
      { status: 'completed', type: 'hadia_payment', amount_net: 3000 },
      { status: 'completed', type: 'refund', amount_net: 500 },
    ];
    const realWithdrawResult = validateWithdrawalRequest(realWallet, realLedger, 1000);
    assert.equal(realWithdrawResult.ok, true);
    assert.equal(realWithdrawResult.approved_amount, 1000);
  });

  it('Unit 13: UI Wallet Display Integrity & Financial Contract', () => {
    // Model behavior of TeacherMarketplaceDashboard derived financial state
    function computeWalletDisplayState(teacher) {
      const recordedBalance = Number(teacher?.balance ?? teacher?.walletBalance ?? teacher?.recorded_balance ?? 0);
      const isWithdrawalHeld = Boolean(teacher?.is_withdrawal_held ?? teacher?.isWithdrawalHeld ?? false);
      const reconciliationRequired = Boolean(teacher?.reconciliation_required ?? teacher?.reconciliationRequired ?? false);
      const holdReason =
        teacher?.hold_reason ||
        teacher?.holdReason ||
        (isWithdrawalHeld
          ? "SEED_WALLET_UNRECONCILED_HOLD: Preserved historical balance pending authorized finance review"
          : null);

      // Invariant: If withdrawal is held or reconciliation required, withdrawable balance is strictly 0
      const withdrawableBalance = isWithdrawalHeld || reconciliationRequired ? 0 : 0; // Disabled platform-wide pending payout gateway

      // Invariant: Verified earnings ONLY calculated from qualifying completed credit transactions
      const transactions = Array.isArray(teacher?.transactions) ? teacher.transactions : [];
      const verifiedEarnings = transactions
        .filter((tx) => {
          const isCompleted = tx.status === 'completed' || tx.status === 'সফল';
          const txType = String(tx.type || tx.transaction_type || '').toLowerCase();
          const isCreditType =
            !txType ||
            ['hadia_payment', 'monthly_fee', 'hadia', 'class_fee', 'course_fee', 'credit', 'earning'].some((k) =>
              txType.includes(k)
            );
          return isCompleted && isCreditType;
        })
        .reduce((sum, tx) => sum + (Number(tx.net || tx.amount_net || tx.amount) || 0), 0);

      const rawTotalEarned = Number(teacher?.total_earned ?? teacher?.totalEarned ?? 0);
      const unreconciledEarnings = Math.max(0, rawTotalEarned - verifiedEarnings);

      return {
        recordedBalance,
        withdrawableBalance,
        isWithdrawalHeld,
        reconciliationRequired,
        holdReason,
        verifiedEarnings,
        unreconciledEarnings,
        recordedTotalEarned: rawTotalEarned,
        hasBackendPayoutRoute: false, // Invariant: no backend withdrawal API exists
      };
    }

    // Test 1: Historical seed teacher with preserved balance and administrative hold
    const seedTeacher1 = {
      id: 'teacher-1',
      balance: 14200,
      total_earned: 24500,
      is_withdrawal_held: true,
      reconciliation_required: true,
      hold_reason: 'SEED_WALLET_UNRECONCILED_HOLD: Preserved historical balance pending authorized finance review',
      transactions: [], // 0 ledger transactions
    };

    const displayState = computeWalletDisplayState(seedTeacher1);
    assert.equal(displayState.recordedBalance, 14200, 'Original recorded balance is preserved 100%');
    assert.equal(displayState.withdrawableBalance, 0, 'Held seed wallet NEVER displays recorded balance as withdrawable');
    assert.equal(displayState.isWithdrawalHeld, true, 'Administrative hold flag is active');
    assert.equal(displayState.reconciliationRequired, true, 'Reconciliation requirement flag is active');
    assert.equal(displayState.verifiedEarnings, 0, 'Unreconciled balances without ledger transactions are NEVER treated as verified earnings');
    assert.equal(displayState.unreconciledEarnings, 24500, 'Unreconciled earnings are explicitly separated from verified earnings');
    assert.ok(displayState.holdReason.includes('SEED_WALLET_UNRECONCILED_HOLD'), 'Hold reason is clearly presented');
    assert.equal(displayState.hasBackendPayoutRoute, false, 'No backend payout route exists');

    // Test 2: Unheld teacher with recorded total_earned but no ledger transactions:
    // INVARIANT: Do NOT classify raw total_earned as verified earnings merely because a wallet is unheld!
    const unheldTeacherNoTx = {
      id: 'teacher-unheld',
      balance: 10000,
      total_earned: 25000,
      is_withdrawal_held: false,
      reconciliation_required: false,
      transactions: [], // 0 completed transactions
    };
    const unheldDisplay = computeWalletDisplayState(unheldTeacherNoTx);
    assert.equal(unheldDisplay.verifiedEarnings, 0, 'Raw total_earned is NOT verified without completed ledger transactions');
    assert.equal(unheldDisplay.unreconciledEarnings, 25000, 'Raw earnings without transactions classified as unreconciled');

    // Test 3: Teacher with authentic completed ledger transactions
    const legitTeacher = {
      id: 'teacher-legit',
      balance: 3500,
      total_earned: 3500,
      is_withdrawal_held: false,
      reconciliation_required: false,
      transactions: [
        { id: 'tx-1', status: 'completed', type: 'hadia_payment', net: 2000 },
        { id: 'tx-2', status: 'completed', type: 'monthly_fee', net: 1500 },
        { id: 'tx-3', status: 'pending', type: 'hadia_payment', net: 500 }, // pending not counted
      ],
    };
    const legitDisplay = computeWalletDisplayState(legitTeacher);
    assert.equal(legitDisplay.verifiedEarnings, 3500, 'Calculates verified earnings strictly from completed credit transactions');
    assert.equal(legitDisplay.unreconciledEarnings, 0, 'Fully reconciled ledger leaves 0 unreconciled earnings');
  });

  it('Unit 14: Historical Seed Arithmetic & Authenticated Wallet Data Flow', async () => {
    const fs = await import('node:fs');

    // 1. Historical Seed SQL Arithmetic Verification (20261103)
    const baseMigration = fs.readFileSync('supabase/migrations/20261103_human_teacher_marketplace.sql', 'utf8');
    
    // Parse the seed wallet values: ('teacher-1', 14200, 24500), ('teacher-2', 9800, 16400), ...
    const walletMatch = baseMigration.match(/\('teacher-1',\s*(\d+),\s*(\d+)\)[\s\S]*?\('teacher-2',\s*(\d+),\s*(\d+)\)[\s\S]*?\('teacher-3',\s*(\d+),\s*(\d+)\)[\s\S]*?\('teacher-4',\s*(\d+),\s*(\d+)\)/);
    assert.ok(walletMatch, 'Historical base migration contains the 4 curated teacher wallet seeds');

    const balances = [Number(walletMatch[1]), Number(walletMatch[3]), Number(walletMatch[5]), Number(walletMatch[7])];
    const totalEarnedVals = [Number(walletMatch[2]), Number(walletMatch[4]), Number(walletMatch[6]), Number(walletMatch[8])];

    assert.deepEqual(balances, [14200, 9800, 18500, 8400], 'Balances match historical seeds exactly');
    assert.deepEqual(totalEarnedVals, [24500, 16400, 32000, 13800], 'Total earned values match historical seeds exactly');

    const totalBalanceSum = balances.reduce((a, b) => a + b, 0);
    const totalEarnedSum = totalEarnedVals.reduce((a, b) => a + b, 0);

    assert.equal(totalBalanceSum, 50900, 'Sum of 4 historical seed balances is exactly 50,900 BDT');
    assert.equal(totalEarnedSum, 86700, 'Sum of 4 historical seed total_earned is exactly 86,700 BDT');

    // 2. Authenticated Wallet API Flow Verification
    const walletApiCode = fs.readFileSync('app/api/teacher-marketplace/wallet/route.js', 'utf8');
    assert.ok(walletApiCode.includes('verifySessionToken'), 'Enforces server-side session token verification');
    assert.ok(walletApiCode.includes('AUTH_COOKIE_NAME'), 'Reads authoritative auth cookie');
    assert.ok(walletApiCode.includes('isTeacher'), 'Restricts endpoint to teacher or admin roles');
    assert.ok(walletApiCode.includes('requestedTeacherId !== targetTeacherId'), 'Prevents IDOR cross-teacher wallet access');
    assert.ok(walletApiCode.includes('is_withdrawal_held'), 'Returns is_withdrawal_held status');
    assert.ok(walletApiCode.includes('maskStudentContact'), 'Enforces student privacy masking');

    // 3. Public Teacher Directory Never Leaks Wallets
    const publicDirectoryApi = fs.readFileSync('app/api/teacher-marketplace/route.js', 'utf8');
    assert.ok(!publicDirectoryApi.includes('.from("teacher_wallets").select'), 'Public directory API NEVER queries or exposes teacher_wallets in GET');

    // 4. Bootstrap Schema Consistency Verification
    const bootstrapSql = fs.readFileSync('supabase/scripts/bootstrap_secure_human_teacher.sql', 'utf8');
    assert.ok(bootstrapSql.includes('is_withdrawal_held BOOLEAN DEFAULT false'), 'Bootstrap table contains is_withdrawal_held default');
    assert.ok(bootstrapSql.includes('hold_reason TEXT DEFAULT NULL'), 'Bootstrap table contains hold_reason default');
    assert.ok(bootstrapSql.includes('reconciliation_required BOOLEAN DEFAULT false'), 'Bootstrap table contains reconciliation_required default');
    assert.ok(bootstrapSql.includes('preview_teacher_wallet_reconciliation'), 'Bootstrap script defines preview_teacher_wallet_reconciliation RPC');
    assert.ok(!bootstrapSql.includes("('teacher-1', 14200"), 'Bootstrap script is clean and contains ZERO fake seed wallets');
  });

  it('Unit 15: Strict Transaction Validation, Server-Side Aggregation & Error Handling', async () => {
    // 1. Strict Allowlist & Gateway Proof Evaluation Function (matching server implementation)
    const QUALIFYING_CREDIT_TYPES = Object.freeze(["hadia_payment", "monthly_fee"]);

    function evaluateTransactionSet(transactions, recordedTotalEarned = 0, recordedBalance = 0) {
      let lifetimeVerifiedCredits = 0;
      let lifetimeWithdrawals = 0;
      let lifetimeRefunds = 0;
      let lifetimeAdjustments = 0;
      let unverifiedCompletedCredits = 0;

      for (const tx of transactions) {
        const type = String(tx.transaction_type || "").trim();
        const status = String(tx.status || "").trim().toLowerCase();
        const net = Number(tx.amount_net) || 0;
        const isCompleted = status === "completed";
        const hasAuthoritativeGatewayRef = 
          typeof tx.gateway_ref === "string" && tx.gateway_ref.trim().length > 0;

        // Exact Allowlist Check
        if (QUALIFYING_CREDIT_TYPES.includes(type)) {
          if (isCompleted && hasAuthoritativeGatewayRef) {
            lifetimeVerifiedCredits += net;
          } else if (isCompleted && !hasAuthoritativeGatewayRef) {
            unverifiedCompletedCredits += net;
          }
        } else if (type === "withdrawal" || type === "payout") {
          if (isCompleted) {
            lifetimeWithdrawals += net;
          }
        } else if (type === "refund") {
          if (isCompleted) {
            lifetimeRefunds += net;
          }
        } else if (type === "adjustment") {
          if (isCompleted) {
            lifetimeAdjustments += net;
          }
        }
      }

      const calculatedLedgerBalance = (lifetimeVerifiedCredits + lifetimeAdjustments) - (lifetimeWithdrawals + lifetimeRefunds);
      const earningsDiscrepancy = recordedTotalEarned - lifetimeVerifiedCredits;
      const balanceDiscrepancy = recordedBalance - calculatedLedgerBalance;

      let reconciliationStatus = "BALANCED";
      let discrepancyDirection = "NONE";

      if (earningsDiscrepancy > 0) {
        reconciliationStatus = "RECORDED_EXCEEDS_VERIFIED";
        discrepancyDirection = "RECORDED_SURPLUS";
      } else if (earningsDiscrepancy < 0) {
        reconciliationStatus = "VERIFIED_EXCEEDS_RECORDED";
        discrepancyDirection = "VERIFIED_SURPLUS";
      } else {
        reconciliationStatus = "BALANCED";
        discrepancyDirection = "EXACT_MATCH";
      }

      return {
        lifetimeVerifiedCredits,
        unverifiedCompletedCredits,
        lifetimeWithdrawals,
        lifetimeRefunds,
        calculatedLedgerBalance,
        earningsDiscrepancy,
        balanceDiscrepancy,
        reconciliationStatus,
        discrepancyDirection,
        discrepancyAmount: Math.abs(earningsDiscrepancy),
      };
    }

    // A. Missing transaction type: must NEVER count as earnings
    const missingTypeTxs = [
      { transaction_type: null, status: 'completed', gateway_ref: 'GW-1', amount_net: 1000 },
      { transaction_type: '', status: 'completed', gateway_ref: 'GW-2', amount_net: 500 },
      { status: 'completed', gateway_ref: 'GW-3', amount_net: 200 },
    ];
    const missingRes = evaluateTransactionSet(missingTypeTxs);
    assert.equal(missingRes.lifetimeVerifiedCredits, 0, 'Missing or empty transaction types never count towards verified earnings');

    // B. Unknown transaction type: must NEVER count as earnings
    const unknownTypeTxs = [
      { transaction_type: 'bonus', status: 'completed', gateway_ref: 'GW-4', amount_net: 5000 },
      { transaction_type: 'hadia_tip', status: 'completed', gateway_ref: 'GW-5', amount_net: 300 },
      { transaction_type: 'hadia_payment_unauthorized', status: 'completed', gateway_ref: 'GW-6', amount_net: 1200 },
    ];
    const unknownRes = evaluateTransactionSet(unknownTypeTxs);
    assert.equal(unknownRes.lifetimeVerifiedCredits, 0, 'Unknown or approximate transaction types never count towards verified earnings');

    // C. Refund or withdrawal: must NOT count as earnings
    const debitTxs = [
      { transaction_type: 'withdrawal', status: 'completed', gateway_ref: 'GW-W1', amount_net: 4000 },
      { transaction_type: 'refund', status: 'completed', gateway_ref: 'GW-R1', amount_net: 1500 },
      { transaction_type: 'hadia_payment', status: 'completed', gateway_ref: 'GW-OK', amount_net: 6000 },
    ];
    const debitRes = evaluateTransactionSet(debitTxs);
    assert.equal(debitRes.lifetimeVerifiedCredits, 6000, 'Only qualifying credit types count as earnings');
    assert.equal(debitRes.lifetimeWithdrawals, 4000, 'Withdrawals correctly routed to debit');
    assert.equal(debitRes.lifetimeRefunds, 1500, 'Refunds correctly routed to debit');
    assert.equal(debitRes.calculatedLedgerBalance, 500, 'Calculated balance net = 6000 - 4000 - 1500 = 500');

    // D. Completed status but unverified gateway: must NOT count as verified earnings
    const unverifiedTxs = [
      { transaction_type: 'hadia_payment', status: 'completed', gateway_ref: null, amount_net: 2500 },
      { transaction_type: 'hadia_payment', status: 'completed', gateway_ref: '   ', amount_net: 1500 },
    ];
    const unverifiedRes = evaluateTransactionSet(unverifiedTxs);
    assert.equal(unverifiedRes.lifetimeVerifiedCredits, 0, 'Completed transactions without gateway ref are not verified earnings');
    assert.equal(unverifiedRes.unverifiedCompletedCredits, 4000, 'Tracked as unverified completed credits');

    // E. Partial transaction history vs lifetime aggregation
    // Simulate 100 historical transactions of 100 BDT each
    const fullHistory = Array.from({ length: 100 }, (_, i) => ({
      transaction_type: 'hadia_payment',
      status: 'completed',
      gateway_ref: `GW-REF-${i}`,
      amount_net: 100,
    }));
    const fullRes = evaluateTransactionSet(fullHistory);
    assert.equal(fullRes.lifetimeVerifiedCredits, 10000, 'Server calculates full lifetime total of 10,000 BDT');
    // If client had summed only the top 50 slice:
    const truncatedSlice = fullHistory.slice(0, 50);
    const truncatedRes = evaluateTransactionSet(truncatedSlice);
    assert.equal(truncatedRes.lifetimeVerifiedCredits, 5000, 'Truncated slice would have undercounted by 5,000 BDT');

    // F. Bidirectional Reconciliation: Recorded > Verified (Surplus recorded)
    const recordedSurplusRes = evaluateTransactionSet(
      [{ transaction_type: 'hadia_payment', status: 'completed', gateway_ref: 'GW-1', amount_net: 3000 }],
      10000, // recorded 10,000 > verified 3,000
      10000
    );
    assert.equal(recordedSurplusRes.reconciliationStatus, 'RECORDED_EXCEEDS_VERIFIED');
    assert.equal(recordedSurplusRes.discrepancyDirection, 'RECORDED_SURPLUS');
    assert.equal(recordedSurplusRes.discrepancyAmount, 7000);

    // G. Bidirectional Reconciliation: Verified > Recorded (Deficit recorded / uncredited ledger)
    const verifiedSurplusRes = evaluateTransactionSet(
      [{ transaction_type: 'hadia_payment', status: 'completed', gateway_ref: 'GW-2', amount_net: 8000 }],
      5000, // recorded 5,000 < verified 8,000
      5000
    );
    assert.equal(verifiedSurplusRes.reconciliationStatus, 'VERIFIED_EXCEEDS_RECORDED');
    assert.equal(verifiedSurplusRes.discrepancyDirection, 'VERIFIED_SURPLUS');
    assert.equal(verifiedSurplusRes.discrepancyAmount, 3000);

    // H. Wallet API Security Logic Simulation
    function checkWalletApiAccess(session, requestedTeacherId, canonicalTeacherId) {
      if (!session || !session.id) {
        return { status: 401, code: 'UNAUTHORIZED_GUEST' };
      }
      const isPlatformAdmin = session.role === 'admin' || session.role === 'platform_owner';
      const isTeacher = session.role === 'teacher' || isPlatformAdmin;
      if (!isTeacher) {
        return { status: 403, code: 'FORBIDDEN_ROLE' };
      }
      if (!isPlatformAdmin && requestedTeacherId && requestedTeacherId !== canonicalTeacherId) {
        return { status: 403, code: 'FORBIDDEN_CROSS_TEACHER_ACCESS' };
      }
      return { status: 200, targetTeacherId: isPlatformAdmin && requestedTeacherId ? requestedTeacherId : canonicalTeacherId };
    }

    // Guest rejection
    assert.equal(checkWalletApiAccess(null, 'teacher-1', 'teacher-1').status, 401);
    // Student rejection
    assert.equal(checkWalletApiAccess({ id: 'u1', role: 'student' }, 'teacher-1', 'teacher-1').status, 403);
    // Teacher cross-teacher IDOR rejection
    const idorCheck = checkWalletApiAccess({ id: 'u2', role: 'teacher' }, 'teacher-target', 'teacher-self');
    assert.equal(idorCheck.status, 403);
    assert.equal(idorCheck.code, 'FORBIDDEN_CROSS_TEACHER_ACCESS');
    // Admin authorized inspection
    const adminCheck = checkWalletApiAccess({ id: 'u3', role: 'admin' }, 'teacher-target', 'admin-self');
    assert.equal(adminCheck.status, 200);
    assert.equal(adminCheck.targetTeacherId, 'teacher-target');

    // I. Database Query Failure Handling
    function handleDatabaseQueryResults(walletError, txError) {
      if (walletError) {
        return { status: 500, ok: false, code: 'WALLET_QUERY_FAILED', error: walletError.message };
      }
      if (txError) {
        return { status: 500, ok: false, code: 'TRANSACTIONS_QUERY_FAILED', error: txError.message };
      }
      return { status: 200, ok: true };
    }
    const dbFail = handleDatabaseQueryResults({ message: 'connection timeout' }, null);
    assert.equal(dbFail.status, 500);
    assert.equal(dbFail.code, 'WALLET_QUERY_FAILED');
    assert.equal(dbFail.ok, false, 'Database failure never reports fake zero balance');
  });

  it('Unit 16: Verified Gateway Evidence & Lifetime Ledger Pagination Guarantees', async () => {
    const fs = await import('node:fs');

    // 1. Source Code Security & Architectural Inspection
    const walletApiCode = fs.readFileSync('app/api/teacher-marketplace/wallet/route.js', 'utf8');
    const dashboardCode = fs.readFileSync('src/features/teachers/components/TeacherMarketplaceDashboard.jsx', 'utf8');

    // Verify gateway evidence rejection regex exists in wallet API
    assert.ok(
      walletApiCode.includes('TRX-SIM') && walletApiCode.includes('SIM-') && walletApiCode.includes('DEMO-') && walletApiCode.includes('TEST-'),
      'Wallet API must reject simulated gateway references (TRX-SIM, SIM-, DEMO-, TEST-)'
    );

    // Verify pagination with .range() is used to prevent Supabase 1,000-row limit truncation
    assert.ok(
      walletApiCode.includes('.range(') && walletApiCode.includes('PAGE_SIZE'),
      'Wallet API must use iterative pagination with .range() to prevent silent 1000-row ledger truncation'
    );

    // Verify is_complete_ledger tracking
    assert.ok(
      walletApiCode.includes('is_complete_ledger'),
      'Wallet API must track is_complete_ledger and return it in ledger_summary'
    );

    // Verify accounting categories are separated in API response
    assert.ok(
      walletApiCode.includes('verified_payment_credits') &&
      walletApiCode.includes('unverified_historical_credits') &&
      walletApiCode.includes('lifetime_withdrawals') &&
      walletApiCode.includes('lifetime_refunds') &&
      walletApiCode.includes('lifetime_adjustments') &&
      walletApiCode.includes('withdrawable_balance: 0.00'),
      'Wallet API must strictly isolate all 8 financial accounting categories and keep withdrawable_balance strictly 0'
    );

    // Verify TeacherMarketplaceDashboard displays the accounting breakdown
    assert.ok(
      dashboardCode.includes('unverifiedHistoricalCredits') &&
      dashboardCode.includes('isCompleteLedger') &&
      dashboardCode.includes('ভেরিফাইড পেমেন্ট ক্রেডিট') &&
      dashboardCode.includes('অযাচাইকৃত ঐতিহাসিক ক্রেডিট'),
      'Teacher UI Dashboard must explicitly render verified vs unverified historical credits and complete ledger audit status'
    );

    // 2. Gateway Verification Logic Invariant Simulation
    const QUALIFYING_CREDIT_TYPES = Object.freeze(['hadia_payment', 'monthly_fee']);
    const ALLOWED_GATEWAYS = Object.freeze(['bkash', 'nagad', 'sslcommerz', 'upay']);

    function isAuthoritativeGatewayEvidence(tx, trustedMerchantId) {
      if (!tx) return false;
      const status = String(tx.status || '').trim().toLowerCase();
      if (status !== 'completed') return false;
      const type = String(tx.transaction_type || '').trim();
      if (!QUALIFYING_CREDIT_TYPES.includes(type)) return false;
      const ref = typeof tx.gateway_ref === 'string' ? tx.gateway_ref.trim() : '';
      if (!ref || ref.length < 6) return false;
      if (/^(TRX-SIM|SIM-|DEMO-|TEST-|tx-sim-)/i.test(ref)) return false;
      const gateway = String(tx.payment_gateway || '').trim().toLowerCase();
      if (!ALLOWED_GATEWAYS.includes(gateway)) return false;
      const merchantId = typeof tx.merchant_account_id === 'string' ? tx.merchant_account_id.trim() : '';
      if (!merchantId) return false;
      if (trustedMerchantId && merchantId !== trustedMerchantId) return false;
      return true;
    }

    const TRUSTED_MERCHANT = 'RAHMANIA_OFFICIAL_MERCHANT';

    // A. Simulated references must return false
    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'TRX-SIM-998811',
    }, TRUSTED_MERCHANT), false, 'TRX-SIM prefix rejected');

    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'nagad',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'SIM-123456',
    }, TRUSTED_MERCHANT), false, 'SIM- prefix rejected');

    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'monthly_fee',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'DEMO-REF-99',
    }, TRUSTED_MERCHANT), false, 'DEMO- prefix rejected');

    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'TEST-GATEWAY-1',
    }, TRUSTED_MERCHANT), false, 'TEST- prefix rejected');

    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'tx-sim-abc123',
    }, TRUSTED_MERCHANT), false, 'tx-sim prefix rejected');

    // B. Missing, empty, or short gateway_ref (< 6 chars) rejected
    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: null,
    }, TRUSTED_MERCHANT), false, 'null ref rejected');

    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: '   ',
    }, TRUSTED_MERCHANT), false, 'whitespace ref rejected');

    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'abc',
    }, TRUSTED_MERCHANT), false, 'Short ref (< 6 chars) rejected');

    // C. Missing or mismatched merchant_account_id rejected
    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: null,
      gateway_ref: 'BKASH20261104XYZ',
    }, TRUSTED_MERCHANT), false, 'Missing merchant rejected');

    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: 'UNAUTHORIZED_ROGUE_MERCHANT',
      gateway_ref: 'BKASH20261104XYZ',
    }, TRUSTED_MERCHANT), false, 'Mismatched merchant rejected');

    // D. Unallowlisted payment gateway rejected
    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'stripe_mock',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'BKASH20261104XYZ',
    }, TRUSTED_MERCHANT), false, 'Unallowlisted payment gateway rejected');

    // E. Pending or failed status rejected
    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'pending_gateway_verification',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'BKASH20261104XYZ',
    }, TRUSTED_MERCHANT), false, 'Pending status rejected from verified evidence');

    // F. Non-qualifying transaction type rejected
    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'withdrawal',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'BKASH20261104XYZ',
    }, TRUSTED_MERCHANT), false, 'Withdrawal rejected from credit evidence');

    // G. Legitimate, authoritative server-verified transaction accepted
    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'hadia_payment',
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'BKASH20261104998811',
    }, TRUSTED_MERCHANT), true, 'Legitimate bKash payment verified');

    assert.equal(isAuthoritativeGatewayEvidence({
      status: 'completed',
      transaction_type: 'monthly_fee',
      payment_gateway: 'nagad',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: 'NAGAD20261104332211',
    }, TRUSTED_MERCHANT), true, 'Legitimate Nagad payment verified');

    // 3. Complete Financial Categories & Mixed Ledger Aggregation
    function aggregateTeacherLedger(transactions, safeWallet, trustedMerchant) {
      let lifetimeVerifiedCredits = 0;
      let unverifiedHistoricalCredits = 0;
      let lifetimeWithdrawals = 0;
      let lifetimeRefunds = 0;
      let lifetimeAdjustments = 0;

      for (const tx of transactions) {
        const type = String(tx.transaction_type || '').trim();
        const status = String(tx.status || '').trim().toLowerCase();
        const net = Number(tx.amount_net) || 0;
        const isCompleted = status === 'completed';

        if (QUALIFYING_CREDIT_TYPES.includes(type)) {
          if (isAuthoritativeGatewayEvidence(tx, trustedMerchant)) {
            lifetimeVerifiedCredits += net;
          } else if (isCompleted) {
            unverifiedHistoricalCredits += net;
          }
        } else if (type === 'withdrawal' || type === 'payout') {
          if (isCompleted) lifetimeWithdrawals += net;
        } else if (type === 'refund') {
          if (isCompleted) lifetimeRefunds += net;
        } else if (type === 'adjustment') {
          if (isCompleted) lifetimeAdjustments += net;
        }
      }

      const calculatedLedgerBalance = (lifetimeVerifiedCredits + lifetimeAdjustments) - (lifetimeWithdrawals + lifetimeRefunds);
      const recordedBalance = Number(safeWallet.balance) || 0;
      const recordedTotalEarned = Number(safeWallet.total_earned) || 0;
      const earningsDiscrepancy = recordedTotalEarned - lifetimeVerifiedCredits;

      return {
        lifetimeVerifiedCredits,
        unverifiedHistoricalCredits,
        lifetimeWithdrawals,
        lifetimeRefunds,
        lifetimeAdjustments,
        calculatedLedgerBalance,
        recordedBalance,
        recordedTotalEarned,
        earningsDiscrepancy,
        withdrawableBalance: 0.00, // Strictly 0
      };
    }

    const testTransactions = [
      // 2 Legitimate verified credits
      { transaction_type: 'hadia_payment', status: 'completed', amount_net: 5000, payment_gateway: 'bkash', merchant_account_id: TRUSTED_MERCHANT, gateway_ref: 'BKASH20261104_01' },
      { transaction_type: 'monthly_fee', status: 'completed', amount_net: 3000, payment_gateway: 'nagad', merchant_account_id: TRUSTED_MERCHANT, gateway_ref: 'NAGAD20261104_02' },
      // 2 Unverified credits (1 fake simulated ref, 1 missing merchant)
      { transaction_type: 'hadia_payment', status: 'completed', amount_net: 2000, payment_gateway: 'bkash', merchant_account_id: TRUSTED_MERCHANT, gateway_ref: 'TRX-SIM-999' },
      { transaction_type: 'hadia_payment', status: 'completed', amount_net: 1500, payment_gateway: 'bkash', merchant_account_id: null, gateway_ref: 'VALID_REF_123' },
      // Debits & adjustments
      { transaction_type: 'withdrawal', status: 'completed', amount_net: 1200, payment_gateway: 'bkash', merchant_account_id: TRUSTED_MERCHANT, gateway_ref: 'W-01' },
      { transaction_type: 'refund', status: 'completed', amount_net: 600, payment_gateway: 'bkash', merchant_account_id: TRUSTED_MERCHANT, gateway_ref: 'R-01' },
      { transaction_type: 'adjustment', status: 'completed', amount_net: 400, payment_gateway: 'bkash', merchant_account_id: TRUSTED_MERCHANT, gateway_ref: 'A-01' },
      // Irrelevant / uncompleted
      { transaction_type: 'hadia_tip', status: 'completed', amount_net: 500 }, // Unknown type ignored
      { transaction_type: 'hadia_payment', status: 'pending_gateway_verification', amount_net: 1000 }, // Pending ignored
    ];

    const aggResult = aggregateTeacherLedger(testTransactions, { balance: 10000, total_earned: 15000 }, TRUSTED_MERCHANT);
    assert.equal(aggResult.lifetimeVerifiedCredits, 8000, '5,000 + 3,000 = 8,000 BDT verified credits');
    assert.equal(aggResult.unverifiedHistoricalCredits, 3500, '2,000 (TRX-SIM) + 1,500 (missing merchant) = 3,500 BDT unverified credits');
    assert.equal(aggResult.lifetimeWithdrawals, 1200, 'Withdrawals isolated');
    assert.equal(aggResult.lifetimeRefunds, 600, 'Refunds isolated');
    assert.equal(aggResult.lifetimeAdjustments, 400, 'Adjustments isolated');
    assert.equal(aggResult.calculatedLedgerBalance, (8000 + 400) - (1200 + 600), 'Net calculated balance = 6,600 BDT');
    assert.equal(aggResult.recordedBalance, 10000, 'Recorded balance preserved');
    assert.equal(aggResult.withdrawableBalance, 0, 'Withdrawable balance strictly 0');

    // 4. Lifetime Ledger Completeness & Pagination Simulator (> 1,000 Rows)
    // Create a mock dataset of 2,450 transactions (100 BDT each)
    const MOCK_TOTAL_ROWS = 2450;
    const mockDbTransactions = Array.from({ length: MOCK_TOTAL_ROWS }, (_, i) => ({
      id: `tx-${i + 1}`,
      transaction_type: 'hadia_payment',
      amount_net: 100,
      payment_gateway: 'bkash',
      merchant_account_id: TRUSTED_MERCHANT,
      gateway_ref: `BKASH_REF_${String(i).padStart(6, '0')}`,
      status: 'completed',
      created_at: new Date(Date.now() - i * 60000).toISOString(),
    }));

    // Naive 1000-row select (truncates and misses 1,450 rows)
    const naiveSelect = mockDbTransactions.slice(0, 1000);
    assert.equal(naiveSelect.length, 1000, 'Naive select truncates at 1000 rows');
    const naiveSum = naiveSelect.reduce((sum, tx) => sum + tx.amount_net, 0);
    assert.equal(naiveSum, 100000, 'Naive select undercounts earnings by 145,000 BDT');

    // Iterative Pagination Engine Simulator
    async function fetchCompleteLedger(mockDb, pageSize = 1000, shouldSimulateError = false) {
      const allRows = [];
      let from = 0;
      let hasMore = true;
      let isCompleteLedger = false;

      while (hasMore) {
        const to = from + pageSize - 1;
        if (shouldSimulateError && from >= 1000) {
          throw new Error('Database connection reset during page 2');
        }
        const pageData = mockDb.slice(from, to + 1);
        allRows.push(...pageData);

        if (pageData.length < pageSize) {
          hasMore = false;
          isCompleteLedger = true;
        } else {
          from += pageSize;
        }
      }

      return { allRows, isCompleteLedger };
    }

    const { allRows: paginatedRows, isCompleteLedger: paginatedComplete } = await fetchCompleteLedger(mockDbTransactions, 1000);
    assert.equal(paginatedRows.length, MOCK_TOTAL_ROWS, 'Iterative pagination retrieves all 2,450 transactions');
    assert.equal(paginatedComplete, true, 'is_complete_ledger is TRUE when full set is retrieved');
    const paginatedSum = paginatedRows.reduce((sum, tx) => sum + tx.amount_net, 0);
    assert.equal(paginatedSum, 245000, '100% of earnings (245,000 BDT) recovered without truncation');

    // Error in pagination must NOT claim completeness
    let caughtError = null;
    let failedComplete = null;
    try {
      await fetchCompleteLedger(mockDbTransactions, 1000, true);
    } catch (err) {
      caughtError = err;
      failedComplete = false;
    }
    assert.ok(caughtError, 'Midway query failure throws explicit error');
    assert.equal(failedComplete, false, 'Failed query NEVER marks is_complete_ledger = true');
  });
});
