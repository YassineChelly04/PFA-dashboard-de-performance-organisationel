CREATE TABLE "Technicien" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technicien_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "dLigne" TEXT NOT NULL,
    "referenceExtranet" TEXT,
    "refHPSM" TEXT,
    "nom" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "offre" TEXT NOT NULL,
    "debitADSL" TEXT NOT NULL,
    "fsiadsl" TEXT NOT NULL,
    "typeClient" TEXT NOT NULL DEFAULT 'Résidentiel',
    "downtimeStart" TIMESTAMP(3),
    "openTimeHPSM" TIMESTAMP(3),
    "problemStatus" TEXT NOT NULL DEFAULT 'Ouvert',
    "briefDescription" TEXT,
    "actionFSI" TEXT,
    "attenuationLigne" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "technicienId" TEXT NOT NULL,
    "productType" TEXT,
    "resolutionCode" TEXT,
    "resolutionObservation" TEXT,
    "closeTime" TIMESTAMP(3),
    "resolutionDuration" TEXT,
    "status" TEXT NOT NULL DEFAULT 'En cours',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Technicien_employeeId_key" ON "Technicien"("employeeId");
CREATE UNIQUE INDEX "Client_dLigne_key" ON "Client"("dLigne");
CREATE INDEX "Intervention_clientId_idx" ON "Intervention"("clientId");
CREATE INDEX "Intervention_technicienId_idx" ON "Intervention"("technicienId");

ALTER TABLE "Intervention"
ADD CONSTRAINT "Intervention_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Intervention"
ADD CONSTRAINT "Intervention_technicienId_fkey"
FOREIGN KEY ("technicienId") REFERENCES "Technicien"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
