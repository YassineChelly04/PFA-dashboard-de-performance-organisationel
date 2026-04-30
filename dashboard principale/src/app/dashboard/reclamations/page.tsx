import Link from "next/link";
import { Database, Network, Wifi, WifiOff } from "lucide-react";

import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { ParetoMiniChart } from "@/components/charts/ParetoMiniChart";
import { MonthSelect, OfferSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { offerClusterCounts, type OfferCluster } from "@/lib/buckets";
import { distinctMonths, distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatHours1, formatIntFr, formatPct1 } from "@/lib/format";
import { mean, paretoFromCounts, topNCounts } from "@/lib/metrics";

export const dynamic = "force-dynamic";

function clusterIcon(cluster: OfferCluster) {
  if (cluster === "ADSL") return Wifi;
  if (cluster === "VDSL") return Network;
  if (cluster === "FIBRE") return WifiOff;
  return Database;
}

function readSingleParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function ReclamationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const showCompleteStats = readSingleParam(sp.stats) === "complete";
  const topProblemsLimit = showCompleteStats ? 10 : 3;
  const toggleStatsHref = (() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (Array.isArray(value)) {
        if (value[0]) params.set(key, value[0]);
        continue;
      }
      if (value) params.set(key, value);
    }

    if (showCompleteStats) params.delete("stats");
    else params.set("stats", "complete");

    const qs = params.toString();
    return qs ? `/dashboard/reclamations?${qs}` : "/dashboard/reclamations";
  })();

  const incidents = await loadDashboardIncidentsSafely();
  if (!incidents.ok) {
    return <DashboardDataUnavailableState />;
  }

  const all = incidents.data;
  const base = parseDashboardFilters(sp);

  const filters = {
    ...base,
    // Figma defaults for this screen
    region: base.region ?? "grand-tunis",
    month: base.month ?? "2025-10",
  };

  const filtered = applyFilters(all, filters);

  const regions = distinctRegions(all);
  const offers = distinctOffers(all);
  const months = distinctMonths(all);

  const topProblems = topNCounts(filtered, (r) => r.briefDescription, topProblemsLimit);
  const total = filtered.length || 1;

  const clusters = offerClusterCounts(filtered);

  const paretoCounts = topNCounts(filtered, (r) => r.resolutionCode, 4);
  const pareto = paretoFromCounts(paretoCounts).map((p) => ({
    label: p.key,
    volume: p.count,
    cumPct: p.cumPct,
  }));

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="ANALYSE APPROFONDIE"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Filtrer"
          title="Détail des Réclamations"
        />

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white px-3 py-2 text-xs font-extrabold text-gray-600 ring-1 ring-gray-200">
            Filtres
          </div>
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
          <MonthSelect months={months} value={filters.month} />
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-lg font-extrabold text-tt-navy">
              Top {topProblemsLimit} des Problèmes (Description)
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Fréquence d&apos;occurrence par motif de réclamation (brief_description)
            </div>
          </div>
          <div className="rounded-full bg-sky-50 px-4 py-2 text-xs font-extrabold text-sky-900 ring-1 ring-sky-100">
            VOLUME TOTAL: {formatIntFr(filtered.length)}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {topProblems.map((p) => {
            const pct = (p.count / total) * 100;
            const width = Math.max(8, pct * 3); // visual emphasis; chart fidelity is secondary to ranking
            return (
              <div key={p.key} className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-gray-900">{p.key}</div>
                  <div className="mt-2 h-3 w-full rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full bg-tt-navy"
                      style={{ width: `${width}px`, maxWidth: "100%" }}
                    />
                  </div>
                </div>
                <div className="text-right text-sm font-extrabold text-gray-900">
                  {formatIntFr(p.count)}{" "}
                  <span className="text-gray-500">({formatPct1(pct)})</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link className="text-xs font-extrabold tracking-wider text-tt-blue" href={toggleStatsHref}>
            {showCompleteStats ? "AFFICHER LE RÉSUMÉ" : "AFFICHER LES STATISTIQUES COMPLÈTES"}
          </Link>
        </div>
      </Card>

      <div>
        <div className="mb-4 text-lg font-extrabold text-tt-navy">Répartition Détaillée par Offre</div>
        <div className="grid gap-4 lg:grid-cols-4">
          {clusters.map((c) => (
            <Card key={c.cluster} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-extrabold text-gray-900">
                  {c.cluster}{" "}
                  <span className="text-gray-500">({formatIntFr(c.count)})</span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-100 ring-1 ring-gray-200">
                  {(() => {
                    const Icon = clusterIcon(c.cluster);
                    return <Icon className="h-4 w-4 text-tt-navy" />;
                  })()}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {(
                  [
                    ["Technique Réseau", c.breakdown["Technique Réseau"]],
                    ["Technique Local", c.breakdown["Technique Local"]],
                    ["Service / Client", c.breakdown["Service / Client"]],
                  ] as const
                ).map(([label, n]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <div className="text-gray-600">{label}</div>
                    <div className="font-extrabold text-gray-900">{formatIntFr(n)}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-l-4 border-l-rose-500 p-6">
        <div>
          <div className="text-lg font-extrabold text-tt-navy">Analyse de Pareto - Codes de Résolution</div>
          <div className="mt-1 text-sm text-gray-500">
            Identification des causes principales (resolution_code) — cumul sur les top catégories
          </div>
        </div>
        <div className="mt-4">
          <ParetoMiniChart data={pareto} />
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Seuil 80% (data):{" "}
          <span className="font-semibold text-gray-700">
            {(() => {
              const hit = pareto.find((p) => p.cumPct >= 80);
              return hit ? `${formatPct1(hit.cumPct)} @ ${hit.label}` : "n/a";
            })()}
          </span>{" "}
          (moyenne durée filtrée:{" "}
          {formatHours1(
            mean(filtered.map((r) => r.durationHours).filter((v): v is number => v !== null)) ?? 0,
          )}
          )
        </div>
      </Card>
    </div>
  );
}
