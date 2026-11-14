-- Database-level integrity rules (Prisma cannot express these in the schema).
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_period_format" CHECK ("period" IS NULL OR "period" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
ALTER TABLE "MonthlyDue" ADD CONSTRAINT "MonthlyDue_period_format" CHECK ("period" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
ALTER TABLE "MonthlyDue" ADD CONSTRAINT "MonthlyDue_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_amount_positive" CHECK ("amount" > 0);

-- Audit log is append-only: no UPDATE or DELETE, even from application code.
CREATE OR REPLACE FUNCTION audit_log_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AuditLog_no_update_delete"
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION audit_log_immutable();

-- Posted payments are never deleted through normal operation.
CREATE OR REPLACE FUNCTION payment_no_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Payments cannot be deleted; create a reversal instead';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Payment_no_delete"
BEFORE DELETE ON "Payment"
FOR EACH ROW EXECUTE FUNCTION payment_no_delete();
