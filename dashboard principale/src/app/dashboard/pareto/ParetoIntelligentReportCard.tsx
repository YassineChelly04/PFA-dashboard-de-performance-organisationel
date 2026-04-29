"use client";

import Image from "next/image";
import { Copy, Printer, Sparkles } from "lucide-react";
import { useState } from "react";

import type { DashboardFilters } from "@/lib/model";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ParetoReportPayload } from "@/lib/ai/paretoReport";
import { formatHours1, formatIntFr, formatPct1, formatSignedPct1 } from "@/lib/format";

type Scope = "mensuel" | "annuel" | "global";

type ReportApiResponse = {
  reportText: string;
  generatedAt: string;
  model: string | null;
  metrics?: ParetoReportPayload;
};

type ReportSection = {
  title: string;
  bullets: string[];
  paragraphs: string[];
};

function scopeLabel(scope: Scope): string {
  if (scope === "annuel") return "Annuel";
  if (scope === "global") return "Global";
  return "Mensuel";
}

function normalizeTitle(line: string): string {
  return line.replace(/^#+\s*/, "").replace(/:$/, "").trim();
}

function parseReportSections(text: string): ReportSection[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sectionStarts = /^(synth[eè]se ex[eé]cutive|constat chiffr[eé]|causes prioritaires|risques op[eé]rationnels|plan d['’]action)/i;
  const headingLike = /^#{1,6}\s+.+|^[A-ZÀ-Ü][^:]{2,90}:$/;
  const bulletLike = /^([-*•]\s+|\d+\.\s+)/;

  const sections: ReportSection[] = [];
  let current: ReportSection = { title: "Analyse", bullets: [], paragraphs: [] };

  for (const line of lines) {
    if (sectionStarts.test(line) || headingLike.test(line)) {
      if (current.bullets.length || current.paragraphs.length) sections.push(current);
      current = { title: normalizeTitle(line), bullets: [], paragraphs: [] };
      continue;
    }

    if (bulletLike.test(line)) {
      current.bullets.push(line.replace(bulletLike, "").trim());
      continue;
    }

    current.paragraphs.push(line);
  }

  if (current.bullets.length || current.paragraphs.length) sections.push(current);
  return sections;
}

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

  const printReport = () => {
    window.print();
  };

  const sections = report ? parseReportSections(report.reportText) : [];

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
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-2xl" type="button" variant="secondary" onClick={printReport}>
                <Printer className="h-4 w-4" />
                Imprimer / PDF
              </Button>
              <Button className="rounded-2xl" type="button" variant="secondary" onClick={copyReport}>
                <Copy className="h-4 w-4" />
                {copied ? "Copié" : "Copier le texte"}
              </Button>
            </div>
          </div>

          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
            <header className="bg-gradient-to-r from-sky-900 to-tt-blue px-6 py-5 text-white">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/95 px-2 py-1">
                    <Image src="/LOGO_TT.png" alt="Tunisie Telecom" width={110} height={56} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Rapport qualité opérationnelle
                    </div>
                    <div className="text-xl font-black">Rapport Pareto — Réclamations & Résolutions</div>
                  </div>
                </div>
                <div className="text-right text-sm text-white/90">
                  <div className="font-bold">Portée: {scopeLabel(scope)}</div>
                  <div>Émis le {new Date(report.generatedAt).toLocaleString("fr-FR")}</div>
                  <div className="text-xs text-white/80">Direction Qualité & Performance — Tunisie Telecom</div>
                </div>
              </div>
            </header>

            <div className="space-y-6 p-6">
              {report.metrics ? (
                <section>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Indicateurs exécutifs
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
                        TOTAL RÉCLAMATIONS
                      </div>
                      <div className="mt-1 text-2xl font-black text-gray-900">
                        {formatIntFr(report.metrics.totals.totalReclamations)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Variation:{" "}
                        {report.metrics.totals.variationVolumePct === null
                          ? "n/a"
                          : formatSignedPct1(report.metrics.totals.variationVolumePct)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
                        TAUX DE TRAITEMENT
                      </div>
                      <div className="mt-1 text-2xl font-black text-gray-900">
                        {formatPct1(report.metrics.totals.tauxTraitementPct)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Tickets traités: {formatIntFr(report.metrics.totals.traitees)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
                        DÉLAI MOYEN
                      </div>
                      <div className="mt-1 text-2xl font-black text-gray-900">
                        {formatHours1(report.metrics.totals.delaiMoyenHeures)}h
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Variation:{" "}
                        {report.metrics.totals.variationDelaiPct === null
                          ? "n/a"
                          : formatSignedPct1(report.metrics.totals.variationDelaiPct)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
                        ALERTES URGENTES
                      </div>
                      <div className="mt-1 text-2xl font-black text-rose-600">
                        {formatIntFr(report.metrics.totals.urgentes)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">Niveau de vigilance élevé</div>
                    </div>
                  </div>
                </section>
              ) : null}

              {report.metrics?.topResolutionCodes?.length ? (
                <section>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Top causes prioritaires (Pareto)
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-[760px] w-full border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-[11px] font-extrabold tracking-wider text-gray-500">
                          <th className="border-b border-gray-200 px-3 py-3">CODE</th>
                          <th className="border-b border-gray-200 px-3 py-3">VOLUME</th>
                          <th className="border-b border-gray-200 px-3 py-3">FRÉQUENCE</th>
                          <th className="border-b border-gray-200 px-3 py-3">CUMUL</th>
                          <th className="border-b border-gray-200 px-3 py-3">DÉLAI MOYEN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.metrics.topResolutionCodes.slice(0, 6).map((row) => (
                          <tr key={row.code}>
                            <td className="border-b border-gray-100 px-3 py-3 font-semibold text-gray-900">
                              {row.code}
                            </td>
                            <td className="border-b border-gray-100 px-3 py-3 font-extrabold text-gray-900">
                              {formatIntFr(row.volume)}
                            </td>
                            <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                              {formatPct1(row.frequencePct)}
                            </td>
                            <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                              {formatPct1(row.cumulPct)}
                            </td>
                            <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                              {formatHours1(row.delaiMoyenHeures)}h
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              <section className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Analyse narrative experte
                </div>
                <div className="space-y-4">
                  {sections.length ? (
                    sections.map((section, index) => (
                      <section key={`${section.title}-${index}`} className="rounded-xl border border-gray-200 p-4">
                        <h3 className="text-base font-black text-tt-navy">{section.title}</h3>
                        {section.paragraphs.length ? (
                          <div className="mt-2 space-y-2 text-sm leading-6 text-gray-700">
                            {section.paragraphs.map((paragraph, pIdx) => (
                              <p key={pIdx}>{paragraph}</p>
                            ))}
                          </div>
                        ) : null}
                        {section.bullets.length ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700">
                            {section.bullets.map((bullet, bIdx) => (
                              <li key={bIdx}>{bullet}</li>
                            ))}
                          </ul>
                        ) : null}
                      </section>
                    ))
                  ) : (
                    <div className="rounded-xl border border-gray-200 p-4 text-sm leading-6 text-gray-700">
                      {report.reportText}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <footer className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex flex-col gap-3 text-xs text-gray-600 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <Image src="/LOGO_TT.png" alt="Tunisie Telecom" width={52} height={26} />
                  <span className="font-semibold">Tunisie Telecom — Direction Qualité & Performance</span>
                </div>
                <div className="text-right">
                  <div>Rapport généré automatiquement, validable par analyste qualité senior.</div>
                  <div className="font-semibold">Document interne — usage professionnel</div>
                </div>
              </div>
            </footer>
          </article>
        </div>
      ) : null}
    </Card>
  );
}

