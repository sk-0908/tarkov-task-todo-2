-- CreateTable
CREATE TABLE "search_index" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "altNames" TEXT,
    "trader" TEXT,
    "map" TEXT,
    "content" TEXT,
    "language" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "search_index_kind_idx" ON "search_index"("kind");

-- CreateIndex
CREATE INDEX "search_index_language_idx" ON "search_index"("language");

-- CreateIndex
CREATE INDEX "search_index_docId_kind_idx" ON "search_index"("docId", "kind");
