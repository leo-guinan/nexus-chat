-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preloSubmindId" INTEGER;

-- CreateTable
CREATE TABLE "PreloSubmind" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "PreloSubmind_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreloQuestion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "content" TEXT NOT NULL,
    "error" TEXT,
    "answerId" INTEGER,
    "fastMode" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PreloQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreloAnswer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "content" TEXT,
    "requestId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "PreloAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreloClient" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "clientId" INTEGER,
    "preloSubmindId" INTEGER NOT NULL,

    CONSTRAINT "PreloClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreloAnswer_questionId_key" ON "PreloAnswer"("questionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preloSubmindId_fkey" FOREIGN KEY ("preloSubmindId") REFERENCES "PreloSubmind"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreloAnswer" ADD CONSTRAINT "PreloAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PreloQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreloClient" ADD CONSTRAINT "PreloClient_preloSubmindId_fkey" FOREIGN KEY ("preloSubmindId") REFERENCES "PreloSubmind"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
