ALTER TABLE "Mosque" ADD COLUMN "voucherSeq" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "reminderSteps" JSONB;

ALTER TABLE "Expense"
  ADD COLUMN "submittedAt" TIMESTAMP(3),
  ADD COLUMN "decidedById" TEXT,
  ADD COLUMN "decidedAt" TIMESTAMP(3),
  ADD COLUMN "decisionReason" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "paymentRef" TEXT,
  ADD COLUMN "overdueAt" TIMESTAMP(3);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "mosqueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReminderEvent" (
    "id" TEXT NOT NULL,
    "mosqueId" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "recipients" INTEGER NOT NULL,
    "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReminderEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "Notification_mosqueId_idx" ON "Notification"("mosqueId");
CREATE UNIQUE INDEX "ReminderEvent_expenseId_step_key" ON "ReminderEvent"("expenseId", "step");

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReminderEvent" ADD CONSTRAINT "ReminderEvent_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReminderEvent" ADD CONSTRAINT "ReminderEvent_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Posted expenses are never deleted through normal operation.
CREATE OR REPLACE FUNCTION expense_no_delete() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Expenses cannot be deleted; cancel or reverse instead';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "Expense_no_delete" BEFORE DELETE ON "Expense" FOR EACH ROW EXECUTE FUNCTION expense_no_delete();
