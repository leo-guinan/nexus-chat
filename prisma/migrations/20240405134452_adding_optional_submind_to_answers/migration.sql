-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "submindId" INTEGER;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_submindId_fkey" FOREIGN KEY ("submindId") REFERENCES "Submind"("id") ON DELETE SET NULL ON UPDATE CASCADE;
