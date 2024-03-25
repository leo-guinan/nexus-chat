-- CreateTable
CREATE TABLE "_ContextToTask" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContextToTask_AB_unique" ON "_ContextToTask"("A", "B");

-- CreateIndex
CREATE INDEX "_ContextToTask_B_index" ON "_ContextToTask"("B");

-- AddForeignKey
ALTER TABLE "_ContextToTask" ADD CONSTRAINT "_ContextToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Context"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContextToTask" ADD CONSTRAINT "_ContextToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
