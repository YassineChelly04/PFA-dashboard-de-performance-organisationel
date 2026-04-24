import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { ParetoComboChart } from "@/components/charts/ParetoComboChart";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatIntFr, formatPct1 } from "@/lib/format";
import { paretoFromCounts, topNCounts } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function ResolutionsTTPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const incidents = await loadDashboardIncidentsSafely();
  if (!incidents.ok) {
    return <DashboardDataUnavailableState />;
  }

  const all = incidents.data;
  const filters = parseDashboardFilters(sp);
  const filtered = applyFilters(all, filters);

  const regions = distinctRegions(all);
  const offers = distinctOffers(all);

  const counts = topNCounts(filtered, (r) => r.resolutionCode, 12);
  const pareto = paretoFromCounts(counts.slice(0, 8));
  const total = filtered.length || 1;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="QUALITÉ"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Derniers 30 jours"
          title="Résolutions TT"
        />
        <div className="flex flex-wrap gap-3">
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">CODES DISTINCTS</div>
          <div className="mt-2 text-4xl font-black text-tt-blue">{formatIntFr(counts.length)}</div>
          <div className="mt-3 text-sm text-gray-500">Top catégories dans le filtre</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">CODE PRINCIPAL</div>
          <div className="mt-2 text-2xl font-black text-tt-navy">{counts[0]?.key ?? "—"}</div>
          <div className="mt-3 text-sm text-gray-500">
            {counts[0] ? `${formatIntFr(counts[0].count)} occurrences` : "Aucune donnée"}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">VOLUME ANALYSÉ</div>
          <div className="mt-2 text-4xl font-black text-tt-navy">{formatIntFr(filtered.length)}</div>
          <div className="mt-3 text-sm text-gray-500">Réclamations filtrées</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-lg font-extrabold text-tt-navy">Pareto des codes de résolution</div>
        <div className="mt-4">
          <ParetoComboChart
            data={pareto.map((x) => ({
              label: x.key,
              volume: x.count,
              cumPct: x.cumPct,
            }))}
            showCumulative
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-lg font-extrabold text-tt-navy">Détail des codes</div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[880px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[11px] font-extrabold tracking-wider text-gray-500">
                <th className="border-b border-gray-200 px-3 py-3">CODE</th>
                <th className="border-b border-gray-200 px-3 py-3">VOLUME</th>
                <th className="border-b border-gray-200 px-3 py-3">PART</th>
                <th className="border-b border-gray-200 px-3 py-3">CUMUL PARETO</th>
              </tr>
            </thead>
            <tbody>
              {pareto.map((x) => (
                <tr key={x.key} className="text-sm">
                  <td className="border-b border-gray-100 px-3 py-3 font-semibold text-gray-900">
                    {x.key}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 font-extrabold text-gray-900">
                    {formatIntFr(x.count)}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                    {formatPct1((x.count / total) * 100)}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                    {formatPct1(x.cumPct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
