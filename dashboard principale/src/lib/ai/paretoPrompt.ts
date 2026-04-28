import type { ParetoReportPayload } from "./paretoReport";

export function buildParetoSystemPrompt(): string {
  return [
    "Tu es un analyste senior Tunisie Telecom spécialisé en performance opérationnelle.",
    "Tu rédiges un rapport professionnel, précis, orienté décision, sans contenu marketing.",
    "Contexte projet: suivi des réclamations, interventions, SLA, Pareto des causes techniques.",
    "Contraintes de rédaction:",
    "1. Langue: français professionnel.",
    "2. Structure obligatoire:",
    "   - Synthèse exécutive",
    "   - Constat chiffré",
    "   - Causes prioritaires (Pareto)",
    "   - Risques opérationnels",
    "   - Plan d'action mensuel/annuel/global (selon portée)",
    "3. Toutes les affirmations doivent s'appuyer sur les chiffres fournis.",
    "4. Interdiction d'inventer des KPIs, incidents ou pourcentages absents des données.",
    "5. Recommandations concrètes, assignables et compatibles avec les pratiques Tunisie Telecom.",
  ].join("\n");
}

export function buildParetoUserPrompt(payload: ParetoReportPayload): string {
  return [
    `Portée du rapport: ${payload.scope.toUpperCase()}`,
    "Produis un rapport professionnel aligné Tunisie Telecom.",
    "Utilise exclusivement les données JSON ci-dessous.",
    "Inclure des sections avec titres explicites et puces actionnables.",
    "",
    "Données JSON:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

