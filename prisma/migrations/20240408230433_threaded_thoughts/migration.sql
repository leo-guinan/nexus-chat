-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Thought" ADD CONSTRAINT "Thought_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Thought"("id") ON DELETE SET NULL ON UPDATE CASCADE;
