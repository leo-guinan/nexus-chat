-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContextToTool" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ContextToTool_AB_unique" ON "_ContextToTool"("A", "B");

-- CreateIndex
CREATE INDEX "_ContextToTool_B_index" ON "_ContextToTool"("B");

-- AddForeignKey
ALTER TABLE "_ContextToTool" ADD CONSTRAINT "_ContextToTool_A_fkey" FOREIGN KEY ("A") REFERENCES "Context"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContextToTool" ADD CONSTRAINT "_ContextToTool_B_fkey" FOREIGN KEY ("B") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
