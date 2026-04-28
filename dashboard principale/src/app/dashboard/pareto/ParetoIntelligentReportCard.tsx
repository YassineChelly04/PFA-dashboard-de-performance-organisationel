"use client";

import { Copy, Sparkles } from "lucide-react";
import { useState } from "react";

import type { DashboardFilters } from "@/lib/model";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Scope = "mensuel" | "annuel" | "global";

type ReportApiResponse = {
  reportText: string;
  generatedAt: string;
  model: string | null;
};

export function ParetoIntelligentReportCard({ filters }: { filters: DashboardFilters }) {
  const [scope, setScope] = useState<Scope>("mensuel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportApiResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    const response = await fetch("/api/pareto/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, filters }),
    });

    const payload = (await response.json().catch(() => null)) as
      | (ReportApiResponse & { error?: string })
      | null;

    if (!response.ok) {
      setReport(null);
      setLoading(false);
      setError(payload?.error ?? "Impossible de générer le rapport Pareto intelligent.");
      return;
    }

    if (!payload?.reportText) {
      setReport(null);
      setLoading(false);
      setError("Réponse incomplète de l'API de génération.");
      return;
    }

    setReport({
      reportText: payload.reportText,
      generatedAt: payload.generatedAt,
      model: payload.model ?? null,
    });
    setLoading(false);
  };

  const copyReport = async () => {
    if (!report?.reportText) return;
    await navigator.clipboard.writeText(report.reportText);
    setCopied(true);
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-lg font-extrabold text-tt-navy">Rapport Pareto intelligent</div>
          <div className="mt-1 text-sm text-gray-500">
            Génération IA professionnelle alignée Tunisie Telecom (mensuel, annuel, global).
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wide text-gray-500" htmlFor="pareto-scope">
            Portée
          </label>
          <select
            id="pareto-scope"
            value={scope}
            onChange={(event) => setScope(event.target.value as Scope)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
          >
            <option value="mensuel">Mensuel</option>
            <option value="annuel">Annuel</option>
            <option value="global">Global</option>
          </select>

          <Button className="rounded-2xl" type="button" variant="primary" onClick={generateReport} disabled={loading}>
            <Sparkles className="h-4 w-4" />
            {loading ? "Génération..." : "Générer le rapport"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              Généré le {new Date(report.generatedAt).toLocaleString("fr-FR")}
              {report.model ? ` • modèle ${report.model}` : ""}
            </div>
            <Button className="rounded-2xl" type="button" variant="secondary" onClick={copyReport}>
              <Copy className="h-4 w-4" />
              {copied ? "Copié" : "Copier"}
            </Button>
          </div>
          <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-800">
            {report.reportText}
          </pre>
        </div>
      ) : null}
    </Card>
  );
}

