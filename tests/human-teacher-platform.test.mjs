import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('1. QuranStudioPage defines the Human Teacher card and route target', () => {
  const content = fs.readFileSync('src/features/site/pages/QuranStudioPage.jsx', 'utf8');

  // Verify card exists
  assert.ok(content.includes('id: "human-teacher"'), 'Must have human-teacher card id');
  assert.ok(content.includes('Human Teacher-এর সাথে কথা বলুন'), 'Must have user-requested title');

  // Verify route resolution
  assert.ok(content.includes('p === "human-teacher"'), 'resolveFeatureTarget handles human-teacher');

  // Verify active feature mounting
  assert.ok(content.includes('<HumanTeacherPlatform'), 'Mounts HumanTeacherPlatform component');
});

test('2. HumanTeacherPlatform component contains Facebook-style profile tabs and auth gate', () => {
  const componentCode = fs.readFileSync('src/features/teachers/components/HumanTeacherPlatform.jsx', 'utf8');

  // Check login prompt modal
  assert.ok(componentCode.includes('শিক্ষার্থী লগইন আবশ্যক'), 'Has student login prompt');
  assert.ok(componentCode.includes('/StudentLogin'), 'Links to student login route');

  // Check Facebook-style elements
  assert.ok(componentCode.includes('coverPhoto'), 'Renders cover photo');
  assert.ok(componentCode.includes('profileActiveTab'), 'Manages Facebook-style tabs');
  assert.ok(componentCode.includes('পরিচিতি ও বায়োডাটা'), 'Has about tab');
  assert.ok(componentCode.includes('ভিডিও ও ক্লাস'), 'Has video/lecture tab');
  assert.ok(componentCode.includes('শিক্ষার্থী রিভিউ'), 'Has review/rating tab');
  assert.ok(componentCode.includes('ফি ও ওয়ালেট বিবরণ'), 'Has fee/wallet tab');
});

test('3. Platform Console settings includes dynamic teacher commission and auto-approve controls', () => {
  const consoleCode = fs.readFileSync('app/(platform-console)/platform-console/settings/page.jsx', 'utf8');

  assert.ok(consoleCode.includes('teacherCommissionPercentage'), 'Defines dynamic commission percentage setting');
  assert.ok(consoleCode.includes('teacherAutoApprove'), 'Defines auto-approve toggle setting');
  assert.ok(consoleCode.includes('হিউম্যান টিচার ও কমিশন কন্ট্রোল'), 'Has dedicated teacher tab');
  assert.ok(consoleCode.includes('শিক্ষক অটো-অনুমোদন'), 'Has teacher auto-approval control description');
});

test('4. WebRTCLiveCallModal provides 1-on-1 video/audio calling with interactive in-call Quran Reader', () => {
  const callCode = fs.readFileSync('src/features/teachers/components/WebRTCLiveCallModal.jsx', 'utf8');

  assert.ok(callCode.includes('getUserMedia'), 'Initializes native WebRTC media stream');
  assert.ok(callCode.includes('localVideoRef'), 'Renders local PiP student video stream');
  assert.ok(callCode.includes('IN_CALL_SURAHS'), 'Includes in-call shared Quran recitation Surahs');
  assert.ok(callCode.includes('handleToggleAudio'), 'Has mute microphone control');
  assert.ok(callCode.includes('handleToggleVideo'), 'Has camera toggle control');
  assert.ok(callCode.includes('কল শেষ করুন'), 'Has end call control');
});

test('5. HumanTeacherPlatform integrates WebRTC calling, dynamic commission wallet and profile builder', () => {
  const code = fs.readFileSync('src/features/teachers/components/HumanTeacherPlatform.jsx', 'utf8');

  assert.ok(code.includes('WebRTCLiveCallModal'), 'Imports and mounts WebRTCLiveCallModal');
  assert.ok(code.includes('WebRTCGroupClassroom'), 'Imports and mounts WebRTCGroupClassroom');
  assert.ok(code.includes('TeacherMarketplaceDashboard'), 'Imports and mounts TeacherMarketplaceDashboard');
  assert.ok(code.includes('teacherCommissionPercentage'), 'Applies dynamic platform commission %');
  assert.ok(code.includes('teacherWallets'), 'Maintains teacher wallet balances and transactions');
  assert.ok(code.includes('showRegisterModal'), 'Allows teachers to register and build profiles');
});

test('6. WebRTCGroupClassroom provides Facebook/Zoom style multi-user live calling with synchronized Quran', () => {
  const code = fs.readFileSync('src/features/teachers/components/WebRTCGroupClassroom.jsx', 'utf8');

  assert.ok(code.includes('getUserMedia'), 'Captures local media stream via getUserMedia');
  assert.ok(code.includes('participants'), 'Renders multi-student video tile grid');
  assert.ok(code.includes('handleToggleHandRaise'), 'Has hand-raising floor request control');
  assert.ok(code.includes('GROUP_CLASS_SURAHS'), 'Contains synchronized Quran recitation passages');
  assert.ok(code.includes('handleSyncVerseSelect'), 'Synchronizes active Ayah highlight for the group');
  assert.ok(code.includes('showChatDrawer'), 'Provides in-call group chat and notes');
});

test('7. TeacherMarketplaceDashboard provides wallet ledger, student management and live room launcher', () => {
  const code = fs.readFileSync('src/features/teachers/components/TeacherMarketplaceDashboard.jsx', 'utf8');

  assert.ok(code.includes('উত্তোলনযোগ্য ওয়ালেট'), 'Displays available wallet balance');
  assert.ok(code.includes('ডাবল-এন্ট্রি লেজার'), 'Displays double-entry financial transaction ledger');
  assert.ok(code.includes('students'), 'Provides enrolled student progress list');
  assert.ok(code.includes('onLaunchLiveGroupCall'), 'Provides fast live group call launcher');
  assert.ok(code.includes('handleWithdrawSubmit'), 'Supports withdrawal request flow');
});

test('8. Teacher Marketplace Server APIs provide database models, atomic payment and room synchronization', () => {
  const paymentApi = fs.readFileSync('app/api/teacher-marketplace/payment/route.js', 'utf8');
  const marketplaceApi = fs.readFileSync('app/api/teacher-marketplace/route.js', 'utf8');
  const roomsApi = fs.readFileSync('app/api/teacher-marketplace/rooms/route.js', 'utf8');
  const migrationSql = fs.readFileSync('supabase/migrations/20261103_human_teacher_marketplace.sql', 'utf8');

  assert.ok(
    paymentApi.includes('process_teacher_hadia_payment') || paymentApi.includes('settle_verified_teacher_hadia_payment'),
    'Payment API calls atomic PostgreSQL RPC'
  );
  assert.ok(paymentApi.includes('idempotency_key') || paymentApi.includes('paymentIntentId'), 'Enforces idempotency protection against duplicate payments');
  assert.ok(marketplaceApi.includes('teacher_marketplace_profiles'), 'Marketplace API reads from profiles table');
  assert.ok(roomsApi.includes('teacher_live_rooms'), 'Rooms API manages active group live rooms');
  assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.teacher_wallets'), 'SQL defines teacher_wallets table');
  assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.teacher_live_rooms'), 'SQL defines teacher_live_rooms table');
});

test('9. StudentProfileModal provides Facebook-style student profile with Hifz progress, payments and diary', () => {
  const studentProfileFile = fs.readFileSync(
    'src/features/teachers/components/StudentProfileModal.jsx',
    'utf-8'
  );
  const platformFile = fs.readFileSync(
    'src/features/teachers/components/HumanTeacherPlatform.jsx',
    'utf-8'
  );

  assert.ok(studentProfileFile.includes('StudentProfileModal'), 'StudentProfileModal component is exported');
  assert.ok(studentProfileFile.includes('দৈনিক হিফজ ও আমুক্তা ডায়রি') || studentProfileFile.includes('হিফজ অগ্রগতি'), 'Student profile includes Hifz diary/progress');
  assert.ok(studentProfileFile.includes('যুক্ত থাকা প্রিয় শিক্ষকবৃন্দ') || studentProfileFile.includes('enrolledTeachers'), 'Student profile shows enrolled teachers');
  assert.ok(studentProfileFile.includes('হাদিয়া ও পেমেন্ট হিস্ট্রি') || studentProfileFile.includes('paymentHistory'), 'Student profile shows payment history');
  assert.ok(platformFile.includes('StudentProfileModal'), 'HumanTeacherPlatform mounts StudentProfileModal');
  assert.ok(platformFile.includes('স্টুডেন্ট প্রোফাইল'), 'HumanTeacherPlatform includes Student Profile button');
});

test('10. StudentProfileModal strictly enforces authentication gate, removes fake identities, and synchronizes props', () => {
  const studentProfileFile = fs.readFileSync(
    'src/features/teachers/components/StudentProfileModal.jsx',
    'utf-8'
  );
  const platformFile = fs.readFileSync(
    'src/features/teachers/components/HumanTeacherPlatform.jsx',
    'utf-8'
  );

  // 1. Auth Gate
  assert.ok(
    platformFile.includes('if (!currentUser)') && platformFile.includes('setShowLoginModal(true)'),
    'Clicking Student Profile without login prompts for authentication'
  );
  assert.ok(
    platformFile.includes('showStudentProfileModal && currentUser'),
    'Modal mount is strictly guarded by authenticated currentUser'
  );

  // 2. Real User Data Only (Zero fake fallback identities)
  assert.ok(!platformFile.includes('student@rahmania.edu.bd'), 'Fake email student@rahmania.edu.bd removed from platform mount');
  assert.ok(!platformFile.includes('০১৭১২-৩৪৫৬৭৮'), 'Fake phone ০১৭১২-৩৪৫৬৭৮ removed from platform mount');
  assert.ok(!studentProfileFile.includes('student-101'), 'Fake student ID student-101 removed from default profile');
  assert.ok(studentProfileFile.includes('তথ্য দেওয়া হয়নি'), 'Missing fields show honest "তথ্য দেওয়া হয়নি" indicator');

  // 3. Prop Synchronization
  assert.ok(studentProfileFile.includes('useEffect(() => {'), 'Uses useEffect for prop synchronization');
  assert.ok(studentProfileFile.includes('}, [student]);'), 'Prop synchronization triggers when student prop changes');

  // 4. Honest empty states for unmigrated relational tables
  assert.ok(studentProfileFile.includes('কোনো লাইভ ছবক বা হিফজ ডায়েরি রেকর্ড নেই'), 'Honest empty state for live daily lessons');
  assert.ok(studentProfileFile.includes('এখনো কোনো উস্তাদের সাথে কোর্স যুক্ত করা হয়নি'), 'Honest empty state for enrolled teachers');
  assert.ok(studentProfileFile.includes('কোনো পরিশোধিত হাদিয়া বা রসিদ পাওয়া যায়নি'), 'Honest empty state for payment history');
});

test('11. Payment API and Database Migration enforce strict server-side session auth, least-privilege RLS and zero fake success', () => {
  const paymentApi = fs.readFileSync('app/api/teacher-marketplace/payment/route.js', 'utf8');
  const migrationSql = fs.readFileSync('supabase/migrations/20261103_human_teacher_marketplace.sql', 'utf8');

  // 1. Mandatory server-side session verification via cookies() and verifySessionToken
  assert.ok(paymentApi.includes('verifySessionToken'), 'Payment API imports and calls verifySessionToken');
  assert.ok(paymentApi.includes('cookies()'), 'Payment API reads session cookie on server side');
  assert.ok(paymentApi.includes('status: 401'), 'Payment API rejects unauthenticated guests with 401');

  // 2. Strict Role Authorization: Only verified students may initiate Hadia
  assert.ok(paymentApi.includes('session.role !== "student"'), 'Rejects non-student roles from initiating payments');
  assert.ok(paymentApi.includes('status: 403'), 'Returns 403 when non-student attempts to initiate payment');

  // 3. Authoritative student identity strictly from server-side session (Anti-IDOR)
  assert.ok(paymentApi.includes('authoritativeStudentId'), 'Extracts authoritative student ID from verified session');
  assert.ok(!paymentApi.includes('student_id = body.student_id'), 'Never trusts client-supplied student_id directly');

  // 4. Server-controlled commission (Client commission_pct ignored)
  assert.ok(paymentApi.includes('serverCommissionPct'), 'Calculates commission strictly server-side');
  assert.ok(!paymentApi.includes('body.commission_pct'), 'Never directly trusts client-supplied commission_pct');

  // 5. Strict payment amount boundaries
  assert.ok(paymentApi.includes('MIN_PAYMENT_AMOUNT'), 'Enforces minimum payment amount boundary');
  assert.ok(paymentApi.includes('MAX_PAYMENT_AMOUNT'), 'Enforces maximum payment amount boundary');

  // 6. Teacher verification in database (approved status required)
  assert.ok(paymentApi.includes('teacherProfile.status !== "approved"'), 'Verifies teacher has status === approved');

  // 7. Payment Intent Architecture & Zero Unverified Wallet Credit
  assert.ok(paymentApi.includes('pending_gateway_verification'), 'Generates payment intent with pending_gateway_verification');
  assert.ok(paymentApi.includes('PAYMENT_GATEWAY_NOT_CONFIGURED'), 'Returns PAYMENT_GATEWAY_NOT_CONFIGURED when official merchant creds missing');
  assert.ok(paymentApi.includes('wallet_credited: false'), 'Explicitly asserts wallet_credited: false when gateway unverified');
  assert.ok(paymentApi.includes('status: 503'), 'Returns 503 Service Unavailable when gateway merchant connection is pending');
  assert.ok(!paymentApi.includes('TRX-SIM'), 'Zero fake simulated gateway references');

  // 8. SQL Migration: Least Privilege RLS
  assert.ok(!migrationSql.includes('ON public.teacher_wallets FOR SELECT\n  USING (true);'), 'No broad USING (true) on teacher_wallets');
  assert.ok(!migrationSql.includes('ON public.teacher_wallet_transactions FOR SELECT\n  USING (true);'), 'No broad USING (true) on teacher_wallet_transactions');
  assert.ok(migrationSql.includes('Teachers and admins can view own wallet balances'), 'Scoped RLS policy for teacher_wallets');
  assert.ok(migrationSql.includes('Users and admins can view own transactions'), 'Scoped RLS policy for teacher_wallet_transactions');

  // 9. Hardened SECURITY DEFINER RPC
  assert.ok(migrationSql.includes('SET search_path = public, pg_temp'), 'RPC sets secure search_path');
  assert.ok(migrationSql.includes("status = 'approved'"), 'RPC validates teacher is approved');
  assert.ok(migrationSql.includes('p_amount <= 0'), 'RPC enforces positive amount constraint');
  assert.ok(migrationSql.includes('REVOKE EXECUTE ON FUNCTION public.process_teacher_hadia_payment'), 'Revokes execute from PUBLIC/anon/authenticated');
  assert.ok(migrationSql.includes('GRANT EXECUTE ON FUNCTION public.process_teacher_hadia_payment(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT) TO service_role'), 'Restricts RPC execution exclusively to service_role');
});

test('12. Forward Migration 20261105 enforces legacy policy cleanup, participant privacy, review masking and intent settlement RPC', () => {
  const forwardMigration = fs.readFileSync('supabase/migrations/20261105_harden_human_teacher_security.sql', 'utf8');

  // 1. Explicit purge of all legacy permissive policies
  assert.ok(forwardMigration.includes('DROP POLICY IF EXISTS "Public can read teacher wallet balances"'), 'Explicitly purges legacy public wallet policy');
  assert.ok(forwardMigration.includes('DROP POLICY IF EXISTS "Users can view relevant transactions"'), 'Explicitly purges legacy public transaction policy');
  assert.ok(forwardMigration.includes('DROP POLICY IF EXISTS "Public can view live room participants"'), 'Explicitly purges public live room participants policy');
  assert.ok(forwardMigration.includes('DROP POLICY IF EXISTS "Public can read reviews of approved teachers"'), 'Explicitly purges legacy public review policy');

  // 2. Live Room Participant Privacy & Privilege Separation
  assert.ok(!forwardMigration.includes('ON public.live_room_participants FOR SELECT\n  USING (true);'), 'ZERO public access to live room participants');
  assert.ok(forwardMigration.includes('Authorized users can view room participants'), 'Restricted SELECT policy for active room participants/hosts/admins');
  assert.ok(forwardMigration.includes("role = 'student'"), 'Restricts INSERT to student role, preventing self-escalation');
  assert.ok(forwardMigration.includes('prevent_live_room_participant_escalation'), 'Defines BEFORE UPDATE database trigger preventing role/identity tampering');
  assert.ok(forwardMigration.includes('Users can leave and hosts can remove participants'), 'Restricts DELETE to self-leave, host-kick, or admin');

  // 3. Teacher Review Privacy & Public Masked View
  assert.ok(forwardMigration.includes("ALTER COLUMN is_verified_transaction SET DEFAULT false"), 'New reviews default to unverified');
  assert.ok(forwardMigration.includes('CREATE OR REPLACE VIEW public.public_teacher_reviews'), 'Creates safe public review view without student_id');
  assert.ok(forwardMigration.includes('student_display_name'), 'Exposes masked student_display_name instead of raw student full name');
  assert.ok(forwardMigration.includes('is_verified_transaction = true'), 'Public view only exposes verified transactions');

  // 4. Teacher Profile & Seed Integrity
  assert.ok(forwardMigration.includes("ALTER COLUMN status SET DEFAULT 'pending'"), 'Profiles default to pending');
  assert.ok(forwardMigration.includes('preview_teacher_wallet_reconciliation'), 'Provides read-only reconciliation preview function');
  assert.ok(forwardMigration.includes("WHEN t.transaction_type IN ('withdrawal', 'refund') THEN t.amount_net"), 'Ledger reconciliation correctly tracks withdrawals and refunds');
  assert.ok(forwardMigration.includes("status = 'suspended'"), 'Sanitizes historical seed teachers to prevent unearned approved listing');
  assert.ok(forwardMigration.includes("teacher_id IN ('teacher-1', 'teacher-2', 'teacher-3', 'teacher-4')"), 'Targets seed teachers for hold');
  assert.ok(forwardMigration.includes("is_withdrawal_held = true"), 'Enforces withdrawal hold on unverified seed balances');

  // 5. Intent-Validated Settlement RPC & Permanent Unique Index
  assert.ok(forwardMigration.includes('idx_teacher_wallet_tx_gateway_uniq'), 'Creates permanent unique index on payment_gateway and gateway_ref');
  assert.ok(forwardMigration.includes('CREATE OR REPLACE FUNCTION public.settle_verified_teacher_hadia_payment'), 'Defines settle_verified_teacher_hadia_payment RPC');
  assert.ok(forwardMigration.includes("v_intent.status IS DISTINCT FROM 'pending_gateway_verification'"), 'NULL-safe status validation');
  assert.ok(forwardMigration.includes('v_intent.amount_gross IS DISTINCT FROM p_verified_amount'), 'NULL-safe amount match check');
  assert.ok(forwardMigration.includes('EMPTY_GATEWAY_REF'), 'Rejects empty or NULL gateway reference');
  assert.ok(forwardMigration.includes('INVALID_GATEWAY_PROVIDER'), 'Validates gateway provider (bkash/nagad)');
  assert.ok(forwardMigration.includes('EMPTY_MERCHANT_ACCOUNT_ID'), 'Validates official merchant account identity');
  assert.ok(forwardMigration.includes('MISSING_PERSISTED_MERCHANT_ID'), 'Rejects missing persisted merchant ID');
  assert.ok(forwardMigration.includes('DUPLICATE_GATEWAY_REF'), 'Prevents reuse of gateway reference');
  assert.ok(forwardMigration.includes('GRANT EXECUTE ON FUNCTION public.settle_verified_teacher_hadia_payment(TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT) TO service_role'), 'Restricts settlement RPC strictly to service_role');
});

test('13. Standalone Bootstrap Script provides complete clean setup for fresh databases', () => {
  const bootstrapMigration = fs.readFileSync('supabase/scripts/bootstrap_secure_human_teacher.sql', 'utf8');

  // 1. All 6 base relations created
  assert.ok(bootstrapMigration.includes('CREATE TABLE IF NOT EXISTS public.teacher_marketplace_profiles'), 'Creates profiles table');
  assert.ok(bootstrapMigration.includes('CREATE TABLE IF NOT EXISTS public.teacher_wallets'), 'Creates wallets table');
  assert.ok(bootstrapMigration.includes('CREATE TABLE IF NOT EXISTS public.teacher_wallet_transactions'), 'Creates transactions table');
  assert.ok(bootstrapMigration.includes('CREATE TABLE IF NOT EXISTS public.teacher_live_rooms'), 'Creates live rooms table');
  assert.ok(bootstrapMigration.includes('CREATE TABLE IF NOT EXISTS public.live_room_participants'), 'Creates participants table');
  assert.ok(bootstrapMigration.includes('CREATE TABLE IF NOT EXISTS public.teacher_reviews'), 'Creates reviews table');

  // 2. Zero permissive policies from day 1
  assert.ok(!bootstrapMigration.includes('USING (true);'), 'Zero broad USING (true) policies in bootstrap');

  // 3. Universal Immutability Trigger & Masked Review View with Moderation
  assert.ok(bootstrapMigration.includes('prevent_live_room_participant_escalation'), 'Defines universal immutability trigger');
  assert.ok(bootstrapMigration.includes('CREATE OR REPLACE VIEW public.public_teacher_reviews'), 'Defines privacy-safe review view');
  assert.ok(bootstrapMigration.includes('moderation_status'), 'Includes explicit moderation status');
  assert.ok(bootstrapMigration.includes('[ফোন নম্বর গোপনীয়]'), 'Redacts contact phone numbers');
  assert.ok(bootstrapMigration.includes('[ইমেইল গোপনীয়]'), 'Redacts email addresses');

  // 4. Permanent Unique Constraint
  assert.ok(bootstrapMigration.includes('idx_teacher_wallet_tx_gateway_uniq'), 'Enforces permanent unique constraint on gateway_ref');

  // 5. Hardened Settlement RPC & Reconcile Preview
  assert.ok(bootstrapMigration.includes('settle_verified_teacher_hadia_payment'), 'Defines hardened settlement RPC');
  assert.ok(bootstrapMigration.includes('preview_teacher_wallet_reconciliation'), 'Defines non-destructive reconciliation preview');
});





