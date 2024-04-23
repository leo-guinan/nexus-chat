-- CreateEnum
CREATE TYPE "PreloSubmindRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "PreloSubmindRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "investor" TEXT,
    "firm" TEXT,
    "thesis" TEXT,
    "location" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "crunchbase" TEXT,
    "angellist" TEXT,
    "interviewTranscript" TEXT,
    "status" "PreloSubmindRequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "PreloSubmindRequest_pkey" PRIMARY KEY ("id")
);
