-- CreateEnum
CREATE TYPE "SubmindSchedule" AS ENUM ('DAILY', 'EIGHT_HOUR', 'FOUR_HOUR', 'INSTANT');

-- AlterTable
ALTER TABLE "Submind" ADD COLUMN     "schedule" "SubmindSchedule" NOT NULL DEFAULT 'DAILY';
