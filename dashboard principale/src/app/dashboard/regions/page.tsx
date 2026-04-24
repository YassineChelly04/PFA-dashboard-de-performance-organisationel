import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { DonutChart } from "@/components/charts/DonutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatDays1FromHours, formatIntFr } from "@/lib/format";
import { groupMeanHours, topNCounts } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function RegionsPage({
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

  const regionVolume = topNCounts(filtered, (r) => r.region, 10).map((x) => ({
    label: x.key,
    value: x.count,
  }));

  const regionDelayHours = groupMeanHours(filtered, (r) => r.region);
  const regionDelay = regionDelayHours
    .slice(0, 10)
    .map((x) => ({
      label: x.key,
      value: Number((x.meanHours / 24).toFixed(1)),
    }));
  const delayByRegion = new Map(regionDelayHours.map((x) => [x.key, x.meanHours]));

  const busiest = regionVolume[0];
  const slowest = regionDelay[0];
  const totalForDonut = regionVolume.slice(0, 4).reduce((sum, x) => sum + x.value, 0);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="TERRITOIRE"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Derniers 30 jours"
          title="Régions"
        />
        <div className="flex flex-wrap gap-3">
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">RÉGIONS ACTIVES</div>
          <div className="mt-2 text-4xl font-black text-tt-blue">{formatIntFr(regionVolume.length)}</div>
          <div className="mt-3 text-sm text-gray-500">Avec au moins une réclamation</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">RÉGION LA PLUS CHARGÉE</div>
          <div className="mt-2 text-2xl font-black text-tt-navy">{busiest?.label ?? "—"}</div>
          <div className="mt-3 text-sm text-gray-500">
            {busiest ? `${formatIntFr(busiest.value)} tickets` : "Aucune donnée"}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">DÉLAI LE PLUS LONG</div>
          <div className="mt-2 text-2xl font-black text-tt-navy">{slowest?.label ?? "—"}</div>
          <div className="mt-3 text-sm text-gray-500">
            {slowest ? `${formatIntFr(slowest.value)}j` : "Aucune donnée"}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Volume par région</div>
          <div className="mt-4">
            <HorizontalBarChart data={regionVolume} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Délai moyen par région (jours)</div>
          <div className="mt-4">
            <HorizontalBarChart data={regionDelay} barColor="#5F2EE5" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-lg font-extrabold text-tt-navy">Top régions (part de charge)</div>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <DonutChart
            centerLabel="TOP 4"
            centerValue={formatIntFr(totalForDonut)}
            data={regionVolume.slice(0, 4).map((x) => ({ name: x.label, value: x.value }))}
          />
          <div className="space-y-3 text-sm">
            {regionVolume.slice(0, 6).map((x) => (
              <div key={x.label} className="flex items-center justify-between gap-3">
                <div className="font-semibold text-gray-800">{x.label}</div>
                <div className="text-right font-extrabold text-gray-900">
                  {formatIntFr(x.value)} •{" "}
                  {formatDays1FromHours(delayByRegion.get(x.label) ?? 0)}
                  j
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
