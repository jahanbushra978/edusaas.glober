-- ==============================================================================
-- Migration: 20260901_ai_assistant_fee_engine.sql
-- Description: Hardened PostgreSQL Atomic Fee Payment RPC for AI Assistant & Gateways
-- ==============================================================================

-- 1. Create fee_payments table if not exists
CREATE TABLE IF NOT EXISTS public.fee_payments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    fee_id BIGINT,
    month VARCHAR(20),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    transaction_id VARCHAR(100),
    collected_by_user_id BIGINT,
    collector_name VARCHAR(150),
    operation_id VARCHAR(100),
    idempotency_key VARCHAR(150) UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON public.fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_fee_id ON public.fee_payments(fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_operation_id ON public.fee_payments(operation_id);

-- 2. Hardened Security Definer Atomic RPC Function
CREATE OR REPLACE FUNCTION public.process_fee_payment_atomic(
    p_student_id INT,
    p_fee_id INT DEFAULT NULL,
    p_month TEXT DEFAULT NULL,
    p_operation_id TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL,
    p_collector_user_id INT DEFAULT NULL,
    p_collector_name TEXT DEFAULT NULL,
    p_payment_method TEXT DEFAULT 'Cash',
    p_transaction_id TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_fee RECORD;
    v_student RECORD;
    v_paid_amount NUMERIC(12, 2) := 0;
    v_actual_fee_id BIGINT := p_fee_id;
    v_existing_payment RECORD;
BEGIN
    -- 1. Idempotency Check: Prevent duplicate payments for same key
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, amount, fee_id INTO v_existing_payment 
        FROM public.fee_payments 
        WHERE idempotency_key = p_idempotency_key;
        
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'is_duplicate', true,
                'fee_id', v_existing_payment.fee_id,
                'paid_amount', v_existing_payment.amount,
                'message', 'Payment already processed with this idempotency key.'
            );
        END IF;
    END IF;

    -- 2. Verify Student Exists
    SELECT id, full_name_bn, full_name_en, branch_id, class_name, roll_number, is_active
    INTO v_student
    FROM public.students
    WHERE id = p_student_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student with ID % not found', p_student_id;
    END IF;

    -- 3. Lock & Fetch Fee Record if fee_id provided, otherwise locate by student_id & month
    IF v_actual_fee_id IS NOT NULL THEN
        SELECT * INTO v_fee
        FROM public.student_fees
        WHERE id = v_actual_fee_id
        FOR UPDATE;
    ELSIF p_month IS NOT NULL THEN
        SELECT * INTO v_fee
        FROM public.student_fees
        WHERE student_id = p_student_id AND month = p_month
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE;
        
        IF FOUND THEN
            v_actual_fee_id := v_fee.id;
        END IF;
    END IF;

    -- 4. Calculate Amount Deterministically
    IF v_fee.id IS NOT NULL THEN
        IF v_fee.status = 'paid' OR v_fee.due_amount <= 0 THEN
            RAISE EXCEPTION 'Fee invoice % is already marked as paid', v_fee.id;
        END IF;
        
        v_paid_amount := COALESCE(v_fee.due_amount, v_fee.total_amount, 0);
        
        -- Update the fee record
        UPDATE public.student_fees
        SET status = 'paid',
            paid_amount = COALESCE(paid_amount, 0) + v_paid_amount,
            due_amount = 0,
            payment_date = CURRENT_DATE,
            payment_method = p_payment_method,
            updated_date = NOW()
        WHERE id = v_fee.id;
    ELSE
        -- If no existing fee invoice exists for this month, calculate standard 1000 or derive
        v_paid_amount := 1000;
        
        INSERT INTO public.student_fees (
            student_id,
            branch_id,
            month,
            total_amount,
            paid_amount,
            due_amount,
            status,
            payment_date,
            payment_method,
            created_date,
            updated_date
        ) VALUES (
            p_student_id,
            v_student.branch_id,
            COALESCE(p_month, to_char(CURRENT_DATE, 'YYYY-MM')),
            v_paid_amount,
            v_paid_amount,
            0,
            'paid',
            CURRENT_DATE,
            p_payment_method,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_actual_fee_id;
    END IF;

    -- 5. Insert Payment Ledger Record
    INSERT INTO public.fee_payments (
        student_id,
        fee_id,
        month,
        amount,
        payment_method,
        transaction_id,
        collected_by_user_id,
        collector_name,
        operation_id,
        idempotency_key,
        notes,
        created_at
    ) VALUES (
        p_student_id,
        v_actual_fee_id,
        COALESCE(p_month, to_char(CURRENT_DATE, 'YYYY-MM')),
        v_paid_amount,
        p_payment_method,
        p_transaction_id,
        p_collector_user_id,
        p_collector_name,
        p_operation_id,
        p_idempotency_key,
        p_notes,
        NOW()
    );

    -- 6. Insert Audit Log if audit_logs table exists
    BEGIN
        INSERT INTO public.audit_logs (
            operation_id,
            request_source,
            user_id,
            action,
            branch_id,
            details,
            created_at
        ) VALUES (
            p_operation_id,
            'AI_ASSISTANT',
            p_collector_user_id,
            'FEE_COLLECTION',
            v_student.branch_id,
            jsonb_build_object('student_id', p_student_id, 'fee_id', v_actual_fee_id, 'amount', v_paid_amount),
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        -- Non-blocking if audit_logs table not yet created
        NULL;
    END;

    RETURN jsonb_build_object(
        'success', true,
        'fee_id', v_actual_fee_id,
        'paid_amount', v_paid_amount,
        'operation_id', p_operation_id
    );
END;
$$;

-- 3. Security Privilege Grants
REVOKE ALL ON FUNCTION public.process_fee_payment_atomic FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_fee_payment_atomic TO service_role, authenticated;
