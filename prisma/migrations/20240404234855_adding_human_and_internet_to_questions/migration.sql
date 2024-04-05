-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "forHuman" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "forInternet" BOOLEAN NOT NULL DEFAULT false;
