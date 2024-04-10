-- CreateTable
CREATE TABLE "_SubmindPendingThoughts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SubmindPendingThoughts_AB_unique" ON "_SubmindPendingThoughts"("A", "B");

-- CreateIndex
CREATE INDEX "_SubmindPendingThoughts_B_index" ON "_SubmindPendingThoughts"("B");

-- AddForeignKey
ALTER TABLE "_SubmindPendingThoughts" ADD CONSTRAINT "_SubmindPendingThoughts_A_fkey" FOREIGN KEY ("A") REFERENCES "Submind"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubmindPendingThoughts" ADD CONSTRAINT "_SubmindPendingThoughts_B_fkey" FOREIGN KEY ("B") REFERENCES "Thought"("id") ON DELETE CASCADE ON UPDATE CASCADE;
