// Types for the Fournisseur Interface

export interface LineInfo {
  dligne: string;
  status: "Actif" | "Inactif" | "En attente";
  offre: string;
  debit: string;
}

export interface TechnicalMetrics {
  latency: number;
  snr: number;
  attenuation: number;
}

export interface ActionRecord {
  id: string;
  type: string;
  description: string;
  date: string;
  status: "En cours" | "Terminé" | "Annulé";
}

export interface SupplierSession {
  fstId: string;
  name: string;
  role: "fournisseur";
}
