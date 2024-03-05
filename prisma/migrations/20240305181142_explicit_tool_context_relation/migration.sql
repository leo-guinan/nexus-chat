/*
  Warnings:

  - You are about to drop the `_ContextToTool` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Trigger" AS ENUM ('SCHEDULED', 'ACTION', 'EVENT');

-- DropForeignKey
ALTER TABLE "_ContextToTool" DROP CONSTRAINT "_ContextToTool_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContextToTool" DROP CONSTRAINT "_ContextToTool_B_fkey";

-- DropTable
DROP TABLE "_ContextToTool";

-- CreateTable
CREATE TABLE "ToolToContext" (
    "id" SERIAL NOT NULL,
    "toolId" INTEGER NOT NULL,
    "contextId" INTEGER NOT NULL,

    CONSTRAINT "ToolToContext_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ToolToContext" ADD CONSTRAINT "ToolToContext_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolToContext" ADD CONSTRAINT "ToolToContext_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "Context"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
