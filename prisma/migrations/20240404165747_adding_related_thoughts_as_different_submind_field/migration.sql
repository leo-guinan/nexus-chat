-- CreateTable
CREATE TABLE "_SubmindRelatedThoughts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SubmindRelatedThoughts_AB_unique" ON "_SubmindRelatedThoughts"("A", "B");

-- CreateIndex
CREATE INDEX "_SubmindRelatedThoughts_B_index" ON "_SubmindRelatedThoughts"("B");

-- AddForeignKey
ALTER TABLE "_SubmindRelatedThoughts" ADD CONSTRAINT "_SubmindRelatedThoughts_A_fkey" FOREIGN KEY ("A") REFERENCES "Submind"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubmindRelatedThoughts" ADD CONSTRAINT "_SubmindRelatedThoughts_B_fkey" FOREIGN KEY ("B") REFERENCES "Thought"("id") ON DELETE CASCADE ON UPDATE CASCADE;
