import { NextResponse } from "next/server";

import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { generateGroqText } from "@/lib/ai/groq";
import {
  buildParetoReportPayload,
  filtersForScope,
  normalizeRequestedFilters,
  paretoReportRequestSchema,
} from "@/lib/ai/paretoReport";
import { buildParetoSystemPrompt, buildParetoUserPrompt } from "@/lib/ai/paretoPrompt";

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export async function POST(request: Request) {
  const parsedBody = paretoReportRequestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "Paramètres invalides. Vérifiez la portée (mensuel, annuel, global).",
        details: parsedBody.error.flatten(),
      },
      { status: 400 },
    );
  }

  const dataSource = await loadDashboardIncidentsSafely();
  if (!dataSource.ok) {
    return NextResponse.json(
      { error: "Source de données indisponible pour générer le rapport Pareto." },
      { status: 503 },
    );
  }

  const baseFilters = normalizeRequestedFilters(parsedBody.data.filters);
  const appliedFilters = filtersForScope(baseFilters, parsedBody.data.scope);
  const payload = buildParetoReportPayload(dataSource.data, parsedBody.data.scope, appliedFilters);

  if (payload.totals.totalReclamations === 0) {
    return NextResponse.json({
      scope: payload.scope,
      generatedAt: payload.generatedAt,
      model: null,
      reportText:
        "Aucune réclamation trouvée pour la portée sélectionnée. Ajustez les filtres région/offre ou changez la portée du rapport.",
      metrics: payload,
    });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Configuration manquante: GROQ_API_KEY n'est pas défini côté serveur." },
      { status: 500 },
    );
  }

  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  let reportText: string;
  try {
    reportText = await generateGroqText({
      apiKey,
      model,
      messages: [
        { role: "system", content: buildParetoSystemPrompt() },
        { role: "user", content: buildParetoUserPrompt(payload) },
      ],
      temperature: 0.15,
      maxTokens: 1500,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue Groq.";
    return NextResponse.json(
      { error: `Génération du rapport IA impossible: ${message}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    scope: payload.scope,
    generatedAt: payload.generatedAt,
    model,
    reportText,
    metrics: payload,
  });
}

