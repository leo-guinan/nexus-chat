-- CreateTable
CREATE TABLE "EntityId" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityId_pkey" PRIMARY KEY ("id")
);
