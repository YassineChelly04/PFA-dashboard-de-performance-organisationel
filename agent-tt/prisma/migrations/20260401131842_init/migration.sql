-- CreateTable
CREATE TABLE "Technicien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "region" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dLigne" TEXT NOT NULL,
    "referenceExtranet" TEXT,
    "refHPSM" TEXT,
    "nom" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "offre" TEXT NOT NULL,
    "debitADSL" TEXT NOT NULL,
    "fsiadsl" TEXT NOT NULL,
    "typeClient" TEXT NOT NULL DEFAULT 'Résidentiel',
    "downtimeStart" DATETIME,
    "openTimeHPSM" DATETIME,
    "problemStatus" TEXT NOT NULL DEFAULT 'Ouvert',
    "briefDescription" TEXT,
    "actionFSI" TEXT,
    "attenuationLigne" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "technicienId" TEXT NOT NULL,
    "productType" TEXT,
    "resolutionCode" TEXT,
    "resolutionObservation" TEXT,
    "closeTime" DATETIME,
    "resolutionDuration" TEXT,
    "status" TEXT NOT NULL DEFAULT 'En cours',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Intervention_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Intervention_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "Technicien" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Technicien_employeeId_key" ON "Technicien"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_dLigne_key" ON "Client"("dLigne");
