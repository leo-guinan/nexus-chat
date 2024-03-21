-- CreateTable
CREATE TABLE "Intent" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentUUID" TEXT NOT NULL,

    CONSTRAINT "Intent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IntentToThought" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Intent_documentUUID_key" ON "Intent"("documentUUID");

-- CreateIndex
CREATE UNIQUE INDEX "_IntentToThought_AB_unique" ON "_IntentToThought"("A", "B");

-- CreateIndex
CREATE INDEX "_IntentToThought_B_index" ON "_IntentToThought"("B");

-- AddForeignKey
ALTER TABLE "Intent" ADD CONSTRAINT "Intent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IntentToThought" ADD CONSTRAINT "_IntentToThought_A_fkey" FOREIGN KEY ("A") REFERENCES "Intent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IntentToThought" ADD CONSTRAINT "_IntentToThought_B_fkey" FOREIGN KEY ("B") REFERENCES "Thought"("id") ON DELETE CASCADE ON UPDATE CASCADE;
