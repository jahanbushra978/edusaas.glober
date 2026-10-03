import { createSupabaseAdminClient } from "../supabase-admin";
import { safeCompare } from "../safe-compare";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const TOKEN_TTL_SECONDS = 300; // 5 minutes validity for confirmation token

function encodeBase64Url(input) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input).toString("base64url");
  }
  let binary = "";
  input.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(input) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(input, "base64url"));
  }
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signData(dataStr, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(dataStr));
  return encodeBase64Url(new Uint8Array(sig));
}

function getSecret() {
  return process.env.SUPABASE_JWT_SECRET || process.env.SECRET_KEY || "rahmania-secure-ai-token-secret-2026";
}

/**
 * Deterministically calculates exact payable amount for a student and target month
 * Directly queries Supabase database without relying on untrusted AI inputs.
 */
export async function calculateExactPayable({ studentId, month, feeId = null }) {
  const supabase = createSupabaseAdminClient();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  // 1. Fetch student
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, name, name_bn, roll_number, branch_id, branch_name, class_name, custom_fields")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  // 2. Fetch existing fee record if present
  let feeQuery = supabase
    .from("student_fees")
    .select("*")
    .eq("student_id", studentId)
    .eq("month", currentMonth)
    .or("is_archived.is.null,is_archived.eq.false");

  if (feeId) {
    feeQuery = supabase.from("student_fees").select("*").eq("id", feeId);
  }

  const { data: feeRecords } = await feeQuery;
  const existingFee = feeRecords?.[0] || null;

  let totalFee = 0;
  let paidAmount = 0;
  let dueAmount = 0;

  if (existingFee) {
    totalFee = Number(existingFee.total_fee || existingFee.amount || 0);
    paidAmount = Number(existingFee.paid_amount || 0);
    dueAmount = existingFee.due_amount != null ? Number(existingFee.due_amount) : Math.max(0, totalFee - paidAmount);
  } else {
    // Derive from student setup
    try {
      const parsed = student.custom_fields ? JSON.parse(student.custom_fields) : {};
      totalFee = Number(parsed.fees_setup?.["Monthly Tuition Fee"]) || 0;
    } catch {
      totalFee = 0;
    }
    if (totalFee <= 0) totalFee = 1000; // standard fallback
    dueAmount = totalFee;
  }

  return {
    studentId: student.id,
    studentName: student.name_bn || student.name || "Student",
    rollNumber: student.roll_number,
    branchId: student.branch_id,
    branchName: student.branch_name,
    className: student.class_name,
    month: currentMonth,
    feeId: existingFee?.id || null,
    totalFee,
    paidAmount,
    dueAmount,
    isAlreadyPaid: existingFee?.status === "paid" || dueAmount <= 0,
  };
}

/**
 * Generates a tamper-proof cryptographically signed operation token for sensitive actions
 */
export async function generateSignedOperationToken({
  userId,
  studentId,
  feeId,
  branchId,
  actionType = "FEE_COLLECTION",
  month,
  payableAmount,
}) {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const operationId = `OP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const idempotencyKey = `IDEMP-${studentId}-${month || "current"}-${Date.now()}`;

  const payload = {
    operation_id: operationId,
    idempotency_key: idempotencyKey,
    user_id: userId,
    student_id: studentId,
    fee_id: feeId || null,
    branch_id: branchId,
    action_type: actionType,
    month: month || new Date().toISOString().slice(0, 7),
    payable_amount: payableAmount,
    issued_at: now,
    expires_at: now + TOKEN_TTL_SECONDS,
    nonce: Math.random().toString(36).substring(2, 10),
  };

  const payloadJson = JSON.stringify(payload);
  const encodedPayload = encodeBase64Url(encoder.encode(payloadJson));
  const signature = await signData(encodedPayload, secret);

  return {
    operationId,
    idempotencyKey,
    signedToken: `${encodedPayload}.${signature}`,
    expiresAt: new Date((now + TOKEN_TTL_SECONDS) * 1000).toISOString(),
    payload,
  };
}

/**
 * Verifies a signed operation token's cryptographic integrity and expiration
 */
export async function verifySignedOperationToken(token) {
  if (!token || !token.includes(".")) {
    return { valid: false, error: "Invalid token format" };
  }

  try {
    const secret = getSecret();
    const [encodedPayload, providedSignature] = token.split(".");
    const expectedSignature = await signData(encodedPayload, secret);

    if (!safeCompare(providedSignature, expectedSignature)) {
      return { valid: false, error: "Cryptographic signature verification failed (tampered token)" };
    }

    const payloadJson = decoder.decode(decodeBase64Url(encodedPayload));
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.expires_at || payload.expires_at < now) {
      return { valid: false, error: "Operation confirmation token has expired. Please initiate the request again." };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: err?.message || "Token verification error" };
  }
}

/**
 * Formats an official printable digital receipt payload
 */
export function buildDigitalReceipt({
  receiptNo,
  operationId,
  studentName,
  rollNumber,
  className,
  branchName,
  month,
  amount,
  paymentMethod,
  collectorName,
  transactionId,
  paymentDate,
}) {
  return {
    institution: "Rahmania Institute",
    title: "Official Fee Collection Receipt",
    receiptNo: receiptNo || `REC-${Date.now().toString(36).toUpperCase()}`,
    operationId: operationId || "OP-AUTO",
    date: paymentDate || new Date().toLocaleDateString("en-GB"),
    student: {
      name: studentName,
      roll: rollNumber,
      class: className,
      branch: branchName,
    },
    paymentDetails: {
      month: month,
      amount: Number(amount) || 0,
      currency: "BDT",
      paymentMethod: paymentMethod || "Cash",
      transactionId: transactionId || "N/A",
      collectedBy: collectorName || "System Operator",
      status: "COMPLETED",
    },
    verificationUrl: `https://rahmaniainstitute.org/verify-receipt?op=${operationId}`,
  };
}
