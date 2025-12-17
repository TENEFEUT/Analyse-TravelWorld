/*
  Warnings:

  - Added the required column `updatedAt` to the `ImmigrationCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visaType` to the `ImmigrationCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('FRENCH', 'ENGLISH', 'SPANISH', 'CHINESE', 'ARABIC', 'GERMAN', 'PORTUGUESE', 'OTHER');

-- CreateEnum
CREATE TYPE "LanguageLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'NATIVE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'PASSPORT', 'BIRTH_CERTIFICATE', 'DIPLOMA', 'TRANSCRIPT', 'WORK_CERTIFICATE', 'PROOF_OF_FUNDS', 'LANGUAGE_CERTIFICATE', 'MOTIVATION_LETTER', 'CV', 'PHOTOS', 'OTHER');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VisaType" AS ENUM ('STUDENT', 'WORK', 'TOURIST', 'BUSINESS', 'PERMANENT_RESIDENCE', 'FAMILY_REUNION', 'ASYLUM', 'REFUGEE');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PENDING_VALIDATION', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('SCREENSHOT', 'CREDENTIALS', 'DOCUMENT', 'CERTIFICATE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CaseStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "CaseStatus" ADD VALUE 'DOCUMENTS_REVIEW';
ALTER TYPE "CaseStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "CaseStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "ImmigrationCase" DROP CONSTRAINT "ImmigrationCase_userId_fkey";

-- AlterTable
ALTER TABLE "ImmigrationCase" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visaType" "VisaType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "currentCountry" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maritalStatus" "MaritalStatus",
    "numberOfChildren" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrently" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrently" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageSkill" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "level" "LanguageLevel" NOT NULL,
    "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
    "certificateName" TEXT,
    "score" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LanguageSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "educationId" TEXT,
    "caseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeasibilityAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "analysisNotes" TEXT,
    "aiAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "FeasibilityAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryRecommendation" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "visaType" "VisaType" NOT NULL,
    "score" INTEGER NOT NULL,
    "reasoning" TEXT NOT NULL,
    "requirements" TEXT[],
    "estimatedDuration" TEXT,
    "estimatedCost" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CountryRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStep" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "requiresProof" BOOLEAN NOT NULL DEFAULT false,
    "proofType" "ProofType",
    "proofUrl" TEXT,
    "proofNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureTemplate" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "visaType" "VisaType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredDocuments" "DocumentType"[],
    "estimatedDuration" TEXT NOT NULL,
    "estimatedCost" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateStep" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "requiresProof" BOOLEAN NOT NULL DEFAULT false,
    "proofType" "ProofType",
    "estimatedDays" INTEGER,

    CONSTRAINT "TemplateStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStep_caseId_stepNumber_key" ON "CaseStep"("caseId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateStep_templateId_stepNumber_key" ON "TemplateStep"("templateId", "stepNumber");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageSkill" ADD CONSTRAINT "LanguageSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "Education"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ImmigrationCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeasibilityAnalysis" ADD CONSTRAINT "FeasibilityAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryRecommendation" ADD CONSTRAINT "CountryRecommendation_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "FeasibilityAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmigrationCase" ADD CONSTRAINT "ImmigrationCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStep" ADD CONSTRAINT "CaseStep_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "ImmigrationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateStep" ADD CONSTRAINT "TemplateStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProcedureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
