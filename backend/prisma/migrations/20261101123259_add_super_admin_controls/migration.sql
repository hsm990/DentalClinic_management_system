-- CreateEnum
CREATE TYPE "ClinicPlan" AS ENUM ('TRIAL', 'BASIC', 'PRO');

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_clinicId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "clinicId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "paidUntil" TIMESTAMP(3),
ADD COLUMN     "plan" "ClinicPlan" NOT NULL DEFAULT 'TRIAL';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "convertedClinicId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
