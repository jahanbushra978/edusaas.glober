-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "approverSignature" TEXT,
ADD COLUMN     "buyerSignature" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "duaMessage" TEXT,
ADD COLUMN     "signature" TEXT;

-- CreateTable
CREATE TABLE "MealRoster" (
    "id" TEXT NOT NULL,
    "mosqueId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "dayName" TEXT NOT NULL,
    "householdName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "mealType" TEXT NOT NULL DEFAULT 'BOTH',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaktabStudent" (
    "id" TEXT NOT NULL,
    "mosqueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "batch" TEXT NOT NULL DEFAULT 'Morning',
    "progressLevel" TEXT NOT NULL DEFAULT 'Qaida',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaktabStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaktabAttendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "sabaqRating" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaktabAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealRoster_mosqueId_date_idx" ON "MealRoster"("mosqueId", "date");

-- CreateIndex
CREATE INDEX "MaktabStudent_mosqueId_idx" ON "MaktabStudent"("mosqueId");

-- CreateIndex
CREATE UNIQUE INDEX "MaktabAttendance_studentId_date_key" ON "MaktabAttendance"("studentId", "date");

-- AddForeignKey
ALTER TABLE "MealRoster" ADD CONSTRAINT "MealRoster_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaktabStudent" ADD CONSTRAINT "MaktabStudent_mosqueId_fkey" FOREIGN KEY ("mosqueId") REFERENCES "Mosque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaktabAttendance" ADD CONSTRAINT "MaktabAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "MaktabStudent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
