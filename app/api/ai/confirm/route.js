import { NextResponse } from "next/server";
import { resolveAuthContext } from "../../../../src/lib/ai/auth-context";
import { verifySignedOperationToken, buildDigitalReceipt, calculateExactPayable } from "../../../../src/lib/ai/fee-engine";
import { createSupabaseAdminClient } from "../../../../src/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // 1. Resolve authoritative identity
    const authContext = await resolveAuthContext(request);
    if (!authContext.isAuthenticated) {
      return NextResponse.json({ ok: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await request.json();
    const { signedToken, paymentMethod = "Cash", transactionId = "", notes = "" } = body;

    if (!signedToken) {
      return NextResponse.json({ ok: false, message: "Signed operation token is required." }, { status: 400 });
    }

    // 2. Cryptographically verify operation token
    const tokenCheck = await verifySignedOperationToken(signedToken);
    if (!tokenCheck.valid) {
      return NextResponse.json({ ok: false, message: tokenCheck.error }, { status: 403 });
    }

    const payload = tokenCheck.payload;
    const { student_id, fee_id, branch_id, action_type, month, idempotency_key, operation_id } = payload;
    const supabase = createSupabaseAdminClient();

    // 3. Re-verify user permission & scope (in case permissions changed)
    if (!authContext.isSuperAdmin && authContext.scope.branchId && String(branch_id) !== String(authContext.scope.branchId)) {
      return NextResponse.json({ ok: false, message: "Branch scope authorization mismatch." }, { status: 403 });
    }

    // 4. Handle Specific Action Types
    if (action_type === "FEE_COLLECTION") {
      // Re-verify invoice status (Concurrency check)
      const currentPayable = await calculateExactPayable({ studentId: student_id, month, feeId: fee_id });
      if (currentPayable.isAlreadyPaid) {
        return NextResponse.json({
          ok: false,
          message: `Invoice for ${currentPayable.studentName} (${month}) is already paid. Double collection prevented.`,
        }, { status: 409 });
      }

      let receiptData;

      // 4a. Execute atomic PostgreSQL RPC
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc("process_fee_payment_atomic", {
          p_student_id: Number(student_id),
          p_fee_id: fee_id ? Number(fee_id) : null,
          p_month: month,
          p_operation_id: operation_id,
          p_idempotency_key: idempotency_key,
          p_collector_user_id: Number(authContext.scope.userId) || null,
          p_collector_name: authContext.user?.name_bn || authContext.user?.name || "System Admin",
          p_payment_method: paymentMethod,
          p_transaction_id: transactionId || `TXN-${Date.now()}`,
          p_notes: notes || "Collected via AI Assistant Confirmation",
        });

        if (!rpcError && rpcResult?.success) {
          receiptData = buildDigitalReceipt({
            receiptNo: `REC-${rpcResult.fee_id || Date.now().toString(36).toUpperCase()}`,
            operationId: operation_id,
            studentName: currentPayable.studentName,
            rollNumber: currentPayable.rollNumber,
            className: currentPayable.className,
            branchName: currentPayable.branchName,
            month: month,
            amount: rpcResult.paid_amount || currentPayable.dueAmount,
            paymentMethod: paymentMethod,
            collectorName: authContext.user?.name_bn || authContext.user?.name,
            transactionId: transactionId || `TXN-${Date.now()}`,
            paymentDate: new Date().toISOString().slice(0, 10),
          });

          return NextResponse.json({
            ok: true,
            message: `Payment of ৳${rpcResult.paid_amount || currentPayable.dueAmount} recorded successfully.`,
            operationId: operation_id,
            receipt: receiptData,
          });
        }
      } catch (rpcErr) {
        console.warn("RPC execution fallback:", rpcErr?.message);
      }

      // 4b. Resilient Application-Level Fallback (Direct Supabase update with audit log)
      const paidAmount = currentPayable.dueAmount || currentPayable.totalFee || 1000;
      const today = new Date().toISOString().slice(0, 10);
      let finalFeeId = fee_id;

      if (fee_id) {
        await supabase
          .from("student_fees")
          .update({
            status: "paid",
            paid_amount: paidAmount,
            due_amount: 0,
            payment_method: paymentMethod,
            transaction_id: transactionId || `TXN-${Date.now()}`,
            payment_date: today,
            notes: notes || "Collected via AI Assistant Fallback",
            updated_at: new Date().toISOString(),
          })
          .eq("id", fee_id);
      } else {
        const { data: newFee } = await supabase
          .from("student_fees")
          .insert({
            student_id,
            month,
            total_fee: paidAmount,
            paid_amount: paidAmount,
            due_amount: 0,
            amount: paidAmount,
            payment_method: paymentMethod,
            transaction_id: transactionId || `TXN-${Date.now()}`,
            payment_date: today,
            status: "paid",
            notes: notes || "Collected via AI Assistant Fallback",
            student_name: currentPayable.studentName,
            roll_number: currentPayable.rollNumber,
            branch_name: currentPayable.branchName,
            class_name: currentPayable.className,
          })
          .select()
          .single();

        finalFeeId = newFee?.id;
      }

      // Insert fee_payments record
      await supabase.from("fee_payments").insert({
        student_id,
        invoice_id: finalFeeId,
        month,
        amount: paidAmount,
        payment_method: paymentMethod,
        transaction_id: transactionId || `TXN-${Date.now()}`,
        collected_by_user_id: authContext.scope.userId,
        collected_by_name: authContext.user?.name_bn || authContext.user?.name,
        branch_id: currentPayable.branchId,
        operation_id: operation_id,
        idempotency_key: idempotency_key,
        status: "completed",
        notes: notes || "AI Assistant Operation",
      });

      // Insert Audit Log
      await supabase.from("audit_logs").insert({
        operation_id: operation_id,
        request_source: "AI_ASSISTANT",
        user_id: authContext.scope.userId,
        user_role: authContext.role,
        action: "FEE_COLLECTION",
        branch_id: currentPayable.branchId,
        target_id: String(student_id),
        details: { fee_id: finalFeeId, month, amount: paidAmount, paymentMethod },
      });

      receiptData = buildDigitalReceipt({
        receiptNo: `REC-${finalFeeId || Date.now().toString(36).toUpperCase()}`,
        operationId: operation_id,
        studentName: currentPayable.studentName,
        rollNumber: currentPayable.rollNumber,
        className: currentPayable.className,
        branchName: currentPayable.branchName,
        month: month,
        amount: paidAmount,
        paymentMethod: paymentMethod,
        collectorName: authContext.user?.name_bn || authContext.user?.name,
        transactionId: transactionId || `TXN-${Date.now()}`,
        paymentDate: today,
      });

      return NextResponse.json({
        ok: true,
        message: `Payment of ৳${paidAmount} recorded successfully.`,
        operationId: operation_id,
        receipt: receiptData,
      });
    }

    if (action_type === "STUDENT_DEACTIVATION") {
      await supabase
        .from("students")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("id", student_id);

      await supabase.from("audit_logs").insert({
        operation_id: operation_id,
        request_source: "AI_ASSISTANT",
        user_id: authContext.scope.userId,
        user_role: authContext.role,
        action: "STUDENT_DEACTIVATION",
        branch_id: branch_id,
        target_id: String(student_id),
      });

      return NextResponse.json({
        ok: true,
        message: `Student #${student_id} deactivated and moved to archive successfully.`,
      });
    }

    return NextResponse.json({ ok: false, message: `Unknown action type ${action_type}` }, { status: 400 });
  } catch (err) {
    console.error("AI Confirm Route Error:", err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
