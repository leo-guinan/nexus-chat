-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "researchId" INTEGER;

-- CreateTable
CREATE TABLE "Research" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "submindId" INTEGER NOT NULL,
    "respondToId" INTEGER NOT NULL,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuestionToResearch" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionToResearch_AB_unique" ON "_QuestionToResearch"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestionToResearch_B_index" ON "_QuestionToResearch"("B");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_submindId_fkey" FOREIGN KEY ("submindId") REFERENCES "Submind"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_respondToId_fkey" FOREIGN KEY ("respondToId") REFERENCES "Thought"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToResearch" ADD CONSTRAINT "_QuestionToResearch_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionToResearch" ADD CONSTRAINT "_QuestionToResearch_B_fkey" FOREIGN KEY ("B") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;
