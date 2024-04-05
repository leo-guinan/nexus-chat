-- CreateEnum
CREATE TYPE "SubmindStatus" AS ENUM ('ACTIVE', 'READY', 'COMPLETED');

-- AlterTable
ALTER TABLE "Submind" ADD COLUMN     "status" "SubmindStatus" NOT NULL DEFAULT 'READY';
