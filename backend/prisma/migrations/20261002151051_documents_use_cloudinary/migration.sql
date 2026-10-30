/*
  Warnings:

  - You are about to drop the column `storedPath` on the `PatientDocument` table. All the data in the column will be lost.
  - Added the required column `cloudinaryId` to the `PatientDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resourceType` to the `PatientDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PatientDocument" DROP COLUMN "storedPath",
ADD COLUMN     "cloudinaryId" TEXT NOT NULL,
ADD COLUMN     "resourceType" TEXT NOT NULL;
