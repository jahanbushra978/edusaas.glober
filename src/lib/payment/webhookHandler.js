import { createSupabaseAdminClient } from "../supabase-admin";
import { getPaymentGatewayAdapter } from "./gatewayAdapter";

/**
 * Handles incoming payment gateway webhooks idempotently
 */
export async function handlePaymentWebhook({ gateway, payload, signature }) {
  const adapter = getPaymentGatewayAdapter(gateway);
  const isValid = await adapter.verifySignature(payload, signature);

  if (!isValid) {
    return { ok: false, status: 400, message: "Invalid payment webhook signature." };
  }

  const supabase = createSupabaseAdminClient();
  const studentId = payload.student_id || payload.studentId;
  const invoiceId = payload.invoice_id || payload.invoiceId || payload.fee_id;
  const month = payload.month || new Date().toISOString().slice(0, 7);
  const transactionId = payload.trxID || payload.transaction_id || payload.paymentID || `GW-${Date.now()}`;
  const idempotencyKey = `WH-${gateway}-${transactionId}`;
  const operationId = `OP-WH-${Date.now().toString(36).toUpperCase()}`;

  // 1. Try atomic PostgreSQL RPC first
  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc("process_fee_payment_atomic", {
      p_student_id: Number(studentId),
      p_fee_id: invoiceId ? Number(invoiceId) : null,
      p_month: month,
      p_operation_id: operationId,
      p_idempotency_key: idempotencyKey,
      p_payment_method: gateway.toUpperCase(),
      p_transaction_id: transactionId,
      p_notes: `Automated Gateway Payment via ${gateway.toUpperCase()}`,
    });

    if (!rpcError && rpcResult) {
      return { ok: true, data: rpcResult };
    }
  } catch (err) {
    console.warn("RPC webhook fallback activated:", err?.message);
  }

  // 2. Application-Level Resilient Fallback Update
  try {
    // Check if duplicate transaction
    const { data: existingPayment } = await supabase
      .from("fee_payments")
      .select("id")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingPayment) {
      return { ok: true, is_duplicate: true, message: "Webhook already processed." };
    }

    // Update student_fees
    if (studentId) {
      await supabase
        .from("student_fees")
        .update({
          status: "paid",
          paid_amount: payload.amount || 1000,
          due_amount: 0,
          payment_method: gateway.toUpperCase(),
          transaction_id: transactionId,
          payment_date: new Date().toISOString().slice(0, 10),
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId)
        .eq("month", month);

      // Record in fee_payments
      await supabase.from("fee_payments").insert({
        student_id: studentId,
        invoice_id: invoiceId || null,
        month,
        amount: payload.amount || 1000,
        payment_method: gateway.toUpperCase(),
        transaction_id: transactionId,
        operation_id: operationId,
        idempotency_key: idempotencyKey,
        status: "completed",
        notes: `Webhook from ${gateway}`,
      });
    }

    return { ok: true, operationId, transactionId };
  } catch (fallbackErr) {
    return { ok: false, status: 500, message: fallbackErr.message };
  }
}
