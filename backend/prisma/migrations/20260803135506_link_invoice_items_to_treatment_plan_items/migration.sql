/*
  Warnings:

  - A unique constraint covering the columns `[treatmentPlanItemId]` on the table `InvoiceItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "treatmentPlanItemId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem_treatmentPlanItemId_key" ON "InvoiceItem"("treatmentPlanItemId");

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_treatmentPlanItemId_fkey" FOREIGN KEY ("treatmentPlanItemId") REFERENCES "TreatmentPlanItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
