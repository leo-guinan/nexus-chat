/*
  Warnings:

  - A unique constraint covering the columns `[url,slug]` on the table `Tool` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Tool_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tool_url_slug_key" ON "Tool"("url", "slug");
