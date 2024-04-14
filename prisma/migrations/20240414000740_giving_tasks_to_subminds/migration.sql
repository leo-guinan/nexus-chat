-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "submindId" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_submindId_fkey" FOREIGN KEY ("submindId") REFERENCES "Submind"("id") ON DELETE SET NULL ON UPDATE CASCADE;
