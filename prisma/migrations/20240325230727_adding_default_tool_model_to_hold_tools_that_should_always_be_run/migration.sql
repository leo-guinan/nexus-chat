-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "defaultToolId" INTEGER;

-- CreateTable
CREATE TABLE "DefaultTool" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toolId" INTEGER NOT NULL,

    CONSTRAINT "DefaultTool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultTool_toolId_key" ON "DefaultTool"("toolId");

-- AddForeignKey
ALTER TABLE "DefaultTool" ADD CONSTRAINT "DefaultTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
