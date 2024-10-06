-- CreateTable
CREATE TABLE "LedgerMeta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LedgerTemplate" (
    "ledgerId" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "color" TEXT,
    "notes" TEXT,
    "updated" DATETIME NOT NULL,
    CONSTRAINT "LedgerTemplate_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "LedgerMeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "ledgerId" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "color" TEXT,
    "notes" TEXT,
    "multiplier" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "updated" DATETIME NOT NULL,
    "author" TEXT NOT NULL,
    CONSTRAINT "LedgerEntry_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "LedgerMeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UpdateLog" (
    "ledgerId" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "ledgerTemplateId" TEXT,
    "ledgerEntryId" TEXT,
    CONSTRAINT "UpdateLog_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "LedgerMeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UpdateLog_ledgerTemplateId_fkey" FOREIGN KEY ("ledgerTemplateId") REFERENCES "LedgerTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UpdateLog_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "LedgerEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LedgerMeta_id_key" ON "LedgerMeta"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerMeta_slug_key" ON "LedgerMeta"("slug");

-- CreateIndex
CREATE INDEX "LedgerMeta_slug_idx" ON "LedgerMeta"("slug");

-- CreateIndex
CREATE INDEX "LedgerTemplate_ledgerId_idx" ON "LedgerTemplate"("ledgerId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerTemplate_ledgerId_id_key" ON "LedgerTemplate"("ledgerId", "id");

-- CreateIndex
CREATE INDEX "LedgerEntry_ledgerId_idx" ON "LedgerEntry"("ledgerId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_ledgerId_id_key" ON "LedgerEntry"("ledgerId", "id");

-- CreateIndex
CREATE INDEX "UpdateLog_ledgerId_timestamp_idx" ON "UpdateLog"("ledgerId", "timestamp");

