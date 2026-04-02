// Mock data for the Fournisseur Interface

import { LineInfo, TechnicalMetrics, ActionRecord } from "@/types";

export const mockLineInfo: LineInfo = {
  dligne: "71 234 567",
  status: "Actif",
  offre: "VDSL Premium Plus",
  debit: "50 Mbps",
};

export const mockTechnicalMetrics: TechnicalMetrics = {
  latency: 12,
  snr: 18.5,
  attenuation: 15,
};

export const mockActionHistory: ActionRecord[] = [
  {
    id: "ACT-001",
    type: "Diagnostic",
    description: "Vérification de la ligne",
    date: "2024-03-28",
    status: "Terminé",
  },
  {
    id: "ACT-002",
    type: "Intervention",
    description: "Remplacement du modem",
    date: "2024-03-30",
    status: "En cours",
  },
];

export const actionTypes = [
  "Maintenance Préventive",
  "Diagnostic",
  "Intervention technique",
  "Remplacement équipement",
  "Configuration",
  "Escalade",
  "Clôture",
];
