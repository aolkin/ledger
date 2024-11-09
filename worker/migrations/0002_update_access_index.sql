-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LedgerAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ledgerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    CONSTRAINT "LedgerAccess_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "LedgerMeta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LedgerAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LedgerAccess" ("id", "ledgerId", "level", "userId") SELECT "id", "ledgerId", "level", "userId" FROM "LedgerAccess";
DROP TABLE "LedgerAccess";
ALTER TABLE "new_LedgerAccess" RENAME TO "LedgerAccess";
CREATE UNIQUE INDEX "LedgerAccess_ledgerId_userId_key" ON "LedgerAccess"("ledgerId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

