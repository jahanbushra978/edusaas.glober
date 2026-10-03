import { createSupabaseAdminClient } from "../../supabase-admin";
import { calculateExactPayable, generateSignedOperationToken } from "../fee-engine";

/**
 * 🟢 LOW RISK: Reads due fees for the logged-in student/guardian.
 */
export async function getMyDueFees(args, context) {
  const { studentId, userId } = context.scope;
  const targetId = studentId || userId;

  if (!targetId) {
    return { ok: false, message: "No active student linked to this session." };
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const payable = await calculateExactPayable({ studentId: targetId, month: currentMonth });

  return {
    ok: true,
    month: currentMonth,
    studentName: payable.studentName,
    totalMonthlyFee: payable.totalFee,
    paidAmount: payable.paidAmount,
    currentDue: payable.dueAmount,
    status: payable.isAlreadyPaid ? "PAID" : "UNPAID",
  };
}

/**
 * 🔴 HIGH RISK: Student Fee Collection.
 * Strictly requires Interactive Confirmation with Cryptographically Signed Operation Token.
 * Amount is NEVER accepted from AI/Client parameters — derived directly from DB.
 */
export async function collectStudentFee(args, context) {
  const { userId, branchId, isSuperAdmin } = context.scope;
  const targetStudentId = args?.studentId || args?.student_id;
  const targetMonth = args?.month || new Date().toISOString().slice(0, 7);

  if (!targetStudentId) {
    return {
      ok: false,
      message: "Please specify the student ID to collect fees for.",
    };
  }

  // 1. Calculate Exact Payable Deterministically from DB
  let payable;
  try {
    payable = await calculateExactPayable({
      studentId: targetStudentId,
      month: targetMonth,
      feeId: args?.feeId || args?.fee_id,
    });
  } catch (err) {
    return { ok: false, message: err.message };
  }

  // 2. Branch Scope Verification (Branch Admins cannot collect for other branches)
  if (!isSuperAdmin && branchId && String(payable.branchId) !== String(branchId)) {
    return {
      ok: false,
      message: `Unauthorized: This student belongs to branch '${payable.branchName || payable.branchId}', which is outside your assigned branch scope.`,
    };
  }

  if (payable.isAlreadyPaid) {
    return {
      ok: false,
      message: `Student ${payable.studentName} has already paid the fee for month ${targetMonth} (Due: 0 BDT).`,
    };
  }

  // 3. Generate Cryptographically Signed Operation Token (HMAC SHA-256)
  const tokenData = await generateSignedOperationToken({
    userId,
    studentId: payable.studentId,
    feeId: payable.feeId,
    branchId: payable.branchId,
    actionType: "FEE_COLLECTION",
    month: payable.month,
    payableAmount: payable.dueAmount,
  });

  // 4. Return Confirmation Action Payload
  return {
    ok: true,
    requires_confirmation: true,
    action_type: "FEE_COLLECTION",
    operation_id: tokenData.operationId,
    signed_token: tokenData.signedToken,
    expires_at: tokenData.expiresAt,
    confirmation_details: {
      student_id: payable.studentId,
      student_name: payable.studentName,
      roll_number: payable.rollNumber,
      class_name: payable.className,
      branch_name: payable.branchName,
      month: payable.month,
      payable_amount: payable.dueAmount,
      currency: "BDT",
    },
    message: `Payment confirmation required for ${payable.studentName} (${payable.className}) for month ${payable.month}. Payable Amount: ৳${payable.dueAmount}. Please confirm to proceed.`,
  };
}

/**
 * 🔴 HIGH RISK: Reverse Payment Ledger (Correction Request).
 * Requires Interactive Confirmation.
 */
export async function reversePaymentLedger(args, context) {
  const { userId, branchId, isSuperAdmin } = context.scope;
  const paymentId = args?.paymentId || args?.payment_id;

  if (!paymentId) {
    return { ok: false, message: "Please provide the Payment ID to reverse." };
  }

  const supabase = createSupabaseAdminClient();
  const { data: payment, error } = await supabase
    .from("fee_payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (error || !payment) {
    return { ok: false, message: "Payment record not found." };
  }

  if (!isSuperAdmin && branchId && String(payment.branch_id) !== String(branchId)) {
    return { ok: false, message: "Unauthorized: Cross-branch payment reversal is denied." };
  }

  const tokenData = await generateSignedOperationToken({
    userId,
    studentId: payment.student_id,
    feeId: payment.invoice_id,
    branchId: payment.branch_id,
    actionType: "PAYMENT_REVERSAL",
    month: payment.month,
    payableAmount: payment.amount,
  });

  return {
    ok: true,
    requires_confirmation: true,
    action_type: "PAYMENT_REVERSAL",
    operation_id: tokenData.operationId,
    signed_token: tokenData.signedToken,
    confirmation_details: {
      payment_id: payment.id,
      student_id: payment.student_id,
      amount: payment.amount,
      month: payment.month,
    },
    message: `Reversal confirmation required for Payment #${payment.id} (Amount: ৳${payment.amount}).`,
  };
}

/**
 * 🔴 HIGH RISK: Request Student Deactivation (Soft Archive only, Hard Delete Forbidden).
 */
export async function requestStudentDeactivation(args, context) {
  const { userId, branchId, isSuperAdmin } = context.scope;
  const studentId = args?.studentId || args?.student_id;

  if (!studentId) {
    return { ok: false, message: "Student ID is required." };
  }

  const supabase = createSupabaseAdminClient();
  const { data: student } = await supabase.from("students").select("id, name, name_bn, branch_id").eq("id", studentId).single();

  if (!student) {
    return { ok: false, message: "Student not found." };
  }

  if (!isSuperAdmin && branchId && String(student.branch_id) !== String(branchId)) {
    return { ok: false, message: "Cross-branch student deactivation is not permitted." };
  }

  const tokenData = await generateSignedOperationToken({
    userId,
    studentId: student.id,
    branchId: student.branch_id,
    actionType: "STUDENT_DEACTIVATION",
  });

  return {
    ok: true,
    requires_confirmation: true,
    action_type: "STUDENT_DEACTIVATION",
    operation_id: tokenData.operationId,
    signed_token: tokenData.signedToken,
    confirmation_details: {
      student_id: student.id,
      student_name: student.name_bn || student.name,
      action: "Soft Archive / Deactivate",
    },
    message: `Confirmation required to deactivate student ${student.name_bn || student.name} (ID: ${student.id}). Note: Records will be archived, not permanently deleted.`,
  };
}
