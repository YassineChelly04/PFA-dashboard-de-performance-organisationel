import { PageHeader } from "@/components/PageHeader";
import { ParetoComboChart } from "@/components/charts/ParetoComboChart";
import { ParetoModeToggle } from "@/components/ModeToggle";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { compareToPreviousPeriod } from "@/lib/compare";
import { loadIncidents } from "@/lib/excel/loadWorkbook";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatHours1, formatIntFr, formatPct1, formatSignedPct1 } from "@/lib/format";
import { groupMeanHours, mean, paretoFromCounts, statusSplit, topNCounts } from "@/lib/metrics";

export const dynamic = "force-dynamic";

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ParetoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const modeRaw = firstParam(sp.mode);
  const mode: "cum" | "log" = modeRaw === "log" ? "log" : "cum";

  const all = await loadIncidents();
  const filters = parseDashboardFilters(sp);
  const filtered = applyFilters(all, filters);

  const regions = distinctRegions(all);
  const offers = distinctOffers(all);

  const total = filtered.length;
  const avgHours =
    mean(filtered.map((r) => r.durationHours).filter((v): v is number => v !== null)) ?? 0;

  const cmp = compareToPreviousPeriod(all, filters);
  const prev = cmp?.previous ?? [];
  const prevAvgHours =
    mean(prev.map((r) => r.durationHours).filter((v): v is number => v !== null)) ?? null;

  const prevCount = prev.length;
  const deltaCountPct =
    cmp && prevCount > 0 ? ((total - prevCount) / prevCount) * 100 : null;
  const deltaAvgPct =
    cmp && prevAvgHours && prevAvgHours > 0
      ? ((avgHours - prevAvgHours) / prevAvgHours) * 100
      : null;

  const split = statusSplit(filtered);

  // 0..10 "satisfaction" proxy from resolution rate + delay pressure
  const rr = total ? (split.treated / total) * 100 : 0;
  const satisfaction = Math.max(
    0,
    Math.min(10, rr / 10 + (avgHours < 120 ? 0.7 : avgHours < 200 ? 0.0 : -0.7)),
  );

  const paretoCounts = topNCounts(filtered, (r) => r.resolutionCode, 8);
  const paretoFull = paretoFromCounts(paretoCounts);
  const chartData = paretoFull.map((p) => ({
    label: p.key,
    volume: p.count,
    cumPct: mode === "cum" ? p.cumPct : 0,
  }));

  const offersRank = topNCounts(filtered, (r) => r.offer, 5);
  const maxOffer = offersRank[0]?.count ?? 1;

  const tableRows = paretoFull.slice(0, 4);
  const meansByCode = new Map(
    groupMeanHours(filtered, (r) => r.resolutionCode).map((x) => [x.key, x.meanHours]),
  );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="ANALYSE"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Derniers 30 jours"
          title="Pareto"
        />
        <div className="flex flex-wrap gap-3">
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            TOTAL RÉCLAMATIONS
          </div>
          <div className="mt-2 text-3xl font-black text-gray-900">{formatIntFr(total)}</div>
          <div
            className={[
              "mt-3 text-sm font-semibold",
              deltaCountPct === null ? "text-gray-500" : deltaCountPct >= 0 ? "text-rose-600" : "text-emerald-700",
            ].join(" ")}
          >
            {deltaCountPct === null ? (
              <span>Tendance: n/a (période = Tout)</span>
            ) : (
              <span>
                {deltaCountPct >= 0 ? "↑" : "↓"}{" "}
                {formatSignedPct1(Math.abs(deltaCountPct))} vs période précédente
              </span>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">DÉLAI RÉSOLUTION</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{formatHours1(avgHours)}h</div>
          <div
            className={[
              "mt-3 text-sm font-semibold",
              deltaAvgPct === null ? "text-gray-500" : deltaAvgPct >= 0 ? "text-rose-600" : "text-emerald-700",
            ].join(" ")}
          >
            {deltaAvgPct === null ? (
              <span>Tendance: n/a</span>
            ) : (
              <span>
                {deltaAvgPct >= 0 ? "↑" : "↓"}{" "}
                {formatSignedPct1(Math.abs(deltaAvgPct))} vs période précédente
              </span>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            INDICE DE SATISFACTION
          </div>
          <div className="mt-2 text-3xl font-black text-gray-900">
            {satisfaction.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
            /10
          </div>
          <div className="mt-3 text-sm text-gray-600">Neutre</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            ALERTES HAUTE PRIORITÉ
          </div>
          <div className="mt-2 text-3xl font-black text-rose-600">{formatIntFr(split.urgent)}</div>
          <div className="mt-3 text-sm font-semibold text-rose-700">Critique</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-lg font-extrabold text-tt-navy">
                Analyse de Pareto : Codes de Résolution
              </div>
              <div className="mt-1 text-sm text-gray-500">
                80% des réclamations proviennent de 20% des catégories techniques.
              </div>
            </div>
            <ParetoModeToggle value={mode} />
          </div>
          <div className="mt-4">
            <ParetoComboChart
              showCumulative={mode === "cum"}
              data={chartData.map((d) => ({
                label: d.label,
                volume: d.volume,
                cumPct: d.cumPct,
              }))}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Classement des meilleures offres</div>
          <div className="mt-4 space-y-4">
            {offersRank.map((o) => {
              const pct = (o.count / maxOffer) * 100;
              return (
                <div key={o.key} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate font-extrabold text-gray-900">{o.key}</div>
                    <div className="font-extrabold text-gray-900">{formatIntFr(o.count)}</div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-tt-blue" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-500">Volume d&apos;interventions (proxy)</div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-2xl bg-sky-50 p-4 text-sm text-sky-950 ring-1 ring-sky-100">
            Info: le ranking est basé sur le volume Offre dans la période filtrée.
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="text-lg font-extrabold text-tt-navy">Détails des Données</div>
          <div className="flex flex-wrap gap-2">
            <Button className="rounded-2xl" type="button" variant="secondary">
              Filtrer
            </Button>
            <Button className="rounded-2xl" type="button" variant="secondary">
              Colonnes
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[900px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[11px] font-extrabold tracking-wider text-gray-500">
                <th className="border-b border-gray-200 px-3 py-3">CODE RÉSOLUTION</th>
                <th className="border-b border-gray-200 px-3 py-3">RÉCLAMATIONS (N)</th>
                <th className="border-b border-gray-200 px-3 py-3">FRÉQUENCE (%)</th>
                <th className="border-b border-gray-200 px-3 py-3">CUMUL (%)</th>
                <th className="border-b border-gray-200 px-3 py-3">CONFORMITÉ SLA</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                const freq = (row.count / (total || 1)) * 100;
                const meanH = meansByCode.get(row.key) ?? avgHours;
                const ratio = avgHours > 0 ? meanH / avgHours : 1;
                const label =
                  ratio > 1.15 ? "Sous Objectif" : ratio > 0.95 ? "En Cours" : "Excellent";
                const tone = ratio > 1.15 ? "bad" : ratio > 0.95 ? "info" : "good";
                return (
                  <tr key={row.key} className="text-sm">
                    <td className="border-b border-gray-100 px-3 py-3 font-semibold text-gray-900">
                      {row.key}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3 font-extrabold text-gray-900">
                      {formatIntFr(row.count)}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                      {formatPct1(freq)}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                      {formatPct1(row.cumPct)}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-3">
                      <Badge tone={tone}>{label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
