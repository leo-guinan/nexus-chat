-- CreateTable
CREATE TABLE "PitchDeckRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "uuid" TEXT NOT NULL,
    "backendId" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "PitchDeckRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PitchDeckRequest_uuid_key" ON "PitchDeckRequest"("uuid");

-- AddForeignKey
ALTER TABLE "PitchDeckRequest" ADD CONSTRAINT "PitchDeckRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
