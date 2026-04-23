import { PageHeader } from "@/components/PageHeader";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { DonutChart } from "@/components/charts/DonutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadIncidents } from "@/lib/excel/loadWorkbook";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatDays1FromHours, formatIntFr } from "@/lib/format";
import { groupMeanHours, mean, topNCounts } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const all = await loadIncidents();
  const filters = parseDashboardFilters(sp);
  const filtered = applyFilters(all, filters);

  const durations = filtered.map((r) => r.durationHours).filter((v): v is number => v !== null);
  const avgHours = mean(durations) ?? 0;
  const maxHours = durations.length ? Math.max(...durations) : 0;
  const minHours = durations.length ? Math.min(...durations) : 0;

  const regions = distinctRegions(all);
  const offers = distinctOffers(all);

  const regionChart = groupMeanHours(filtered, (r) => r.region)
    .slice(0, 12)
    .map((x) => ({
      label: x.key,
      value: x.meanHours / 24,
    }));

  const offerMeans = groupMeanHours(filtered, (r) => r.offer).filter((x) => x.meanHours > 0);
  const offerTop = offerMeans.slice(0, 4);
  const donut = offerTop.map((x) => ({
    name: x.key,
    value: Math.round((x.meanHours / 24) * 10) / 10,
  }));

  const families = topNCounts(filtered, (r) => r.productType, 3).map((x) => ({
    label: x.key,
    value: x.count,
  }));
  const avgFamilyCount = mean(families.map((f) => f.value)) ?? 0;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="PERFORMANCE OVERVIEW"
          primaryActionLabel="Exporter PDF"
          secondaryActionLabel="Derniers 30 jours"
          title="Efficacité du Réseau & Service"
        />
        <div className="flex flex-wrap gap-3">
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            TEMPS MOYEN DE RÉSOLUTION
          </div>
          <div className="mt-2 text-4xl font-black text-tt-blue">
            {formatDays1FromHours(avgHours)} jours
          </div>
          <div className="mt-3 text-sm font-semibold text-emerald-700">
            ↓ -12% vs mois dernier <span className="text-gray-400">(placeholder visuel)</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            TEMPS MAXIMUM RELEVÉ
          </div>
          <div className="mt-2 text-4xl font-black text-rose-600">
            {formatDays1FromHours(maxHours)} jours
          </div>
          <div className="mt-3 text-sm font-semibold text-rose-700">
            Seuil critique dépassé <span className="text-gray-400">(règle data: max observé)</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            TEMPS MINIMUM
          </div>
          <div className="mt-2 text-4xl font-black text-tt-blue">
            {formatDays1FromHours(minHours)} jours
          </div>
          <div className="mt-3 text-sm font-semibold text-tt-blue">
            Excellence opérationnelle <span className="text-gray-400">(min observé)</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Temps moyen par région</div>
          <div className="mt-4">
            <HorizontalBarChart data={regionChart} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Temps par offre</div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <DonutChart
              centerLabel="GLOBAL"
              centerValue={`${formatDays1FromHours(avgHours)}j`}
              data={donut.map((d) => ({ name: d.name, value: d.value }))}
            />
            <div className="space-y-2 text-sm">
              {donut.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3">
                  <div className="truncate font-semibold text-gray-800">{d.name}</div>
                  <div className="font-extrabold text-gray-900">{d.value}j</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-lg font-extrabold text-tt-navy">
          Temps par type d&apos;intervention (famille TT)
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Top 3 product_type par volume (proxy de familles)
        </div>
        <div className="mt-4">
          <VerticalBarChart
            averageLabel={`${formatIntFr(avgFamilyCount)} MOYENNE`}
            averageY={avgFamilyCount}
            data={families.map((f) => ({ label: f.label, value: f.value }))}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-3 bg-tt-navy p-7 text-white lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm font-extrabold">Objectif Annuel : 3.5j</div>
          <div className="mt-2 text-sm text-white/80">
            Écart actuel basé sur la moyenne filtrée:{" "}
            <span className="font-extrabold text-white">
              {formatDays1FromHours(avgHours)}j
            </span>{" "}
            (données: {formatIntFr(filtered.length)} lignes)
          </div>
        </div>
        <button
          className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-tt-navy shadow-sm"
          type="button"
        >
          Lancer Plan d&apos;Action
        </button>
      </Card>
    </div>
  );
}
