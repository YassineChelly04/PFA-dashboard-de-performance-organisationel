/*
  Warnings:

  - You are about to drop the column `region` on the `Technicien` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Technicien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Technicien" ("createdAt", "email", "employeeId", "id", "nom", "password", "prenom", "updatedAt") SELECT "createdAt", "email", "employeeId", "id", "nom", "password", "prenom", "updatedAt" FROM "Technicien";
DROP TABLE "Technicien";
ALTER TABLE "new_Technicien" RENAME TO "Technicien";
CREATE UNIQUE INDEX "Technicien_employeeId_key" ON "Technicien"("employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
