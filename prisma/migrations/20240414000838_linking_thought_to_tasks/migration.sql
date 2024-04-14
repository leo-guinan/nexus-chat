-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "thoughtId" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "Thought"("id") ON DELETE SET NULL ON UPDATE CASCADE;
