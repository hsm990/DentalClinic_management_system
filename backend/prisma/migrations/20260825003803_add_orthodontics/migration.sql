-- CreateEnum
CREATE TYPE "OrthodonticCaseStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DISCONTINUED');

-- CreateTable
CREATE TABLE "OrthodonticCase" (
    "id" TEXT NOT NULL,
    "applianceType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "estimatedEndDate" TIMESTAMP(3),
    "status" "OrthodonticCaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrthodonticCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrthodonticVisit" (
    "id" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL,
    "nextVisitDate" TIMESTAMP(3),
    "caseId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrthodonticVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrthodonticCase_patientId_idx" ON "OrthodonticCase"("patientId");

-- CreateIndex
CREATE INDEX "OrthodonticVisit_caseId_idx" ON "OrthodonticVisit"("caseId");

-- AddForeignKey
ALTER TABLE "OrthodonticCase" ADD CONSTRAINT "OrthodonticCase_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrthodonticCase" ADD CONSTRAINT "OrthodonticCase_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrthodonticCase" ADD CONSTRAINT "OrthodonticCase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrthodonticVisit" ADD CONSTRAINT "OrthodonticVisit_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OrthodonticCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrthodonticVisit" ADD CONSTRAINT "OrthodonticVisit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
