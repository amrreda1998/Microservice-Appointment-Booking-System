/*
  Warnings:

  - Added the required column `fullname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consultationFee" DECIMAL(10,2),
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
ADD COLUMN     "speciality" TEXT;
