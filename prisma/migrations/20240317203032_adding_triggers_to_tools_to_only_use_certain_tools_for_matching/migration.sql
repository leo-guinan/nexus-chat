-- AlterEnum
ALTER TYPE "Trigger" ADD VALUE 'THOUGHT';

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "triggers" "Trigger"[];
