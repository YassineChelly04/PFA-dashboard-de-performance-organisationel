import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { DonutChart } from "@/components/charts/DonutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { serviceBucket, type ServiceBucket } from "@/lib/buckets";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatDays1FromHours, formatIntFr } from "@/lib/format";
import { groupMeanHours, mean } from "@/lib/metrics";

export const dynamic = "force-dynamic";

const FAMILY_ORDER: ServiceBucket[] = ["Technique Réseau", "Technique Local", "Service / Client"];

export default async function PerformancePage({
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

  const familyAggregates = new Map<
    ServiceBucket,
    { volume: number; durationCount: number; durationSumHours: number }
  >(
    FAMILY_ORDER.map((family) => [
      family,
      {
        volume: 0,
        durationCount: 0,
        durationSumHours: 0,
      },
    ]),
  );

  for (const row of filtered) {
    const family = serviceBucket(row.productType);
    const entry = familyAggregates.get(family);
    if (!entry) continue;
    entry.volume += 1;
    if (row.durationHours !== null) {
      entry.durationCount += 1;
      entry.durationSumHours += row.durationHours;
    }
  }

  const familyStats = [...familyAggregates.entries()]
    .map(([family, values]) => ({
      family,
      meanHours: values.durationCount > 0 ? values.durationSumHours / values.durationCount : 0,
      volume: values.volume,
      durationCount: values.durationCount,
    }))
    .sort((a, b) => b.meanHours - a.meanHours || b.volume - a.volume);

  const familyDurationChart = familyStats.map((item) => ({
    label: item.family,
    value: Number((item.meanHours / 24).toFixed(1)),
  }));
  const improvementAxis = familyStats.find((item) => item.durationCount > 0) ?? null;

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
        <div className="mt-2 text-sm text-gray-500">Classement des 3 familles TT par délai moyen</div>
        <div className="mt-4">
          <HorizontalBarChart data={familyDurationChart} barColor="#5F2EE5" />
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {familyStats.map((item) => (
            <div key={item.family} className="flex items-center justify-between gap-3">
              <div className="font-semibold text-gray-800">{item.family}</div>
              <div className="text-right font-extrabold text-gray-900">
                {formatDays1FromHours(item.meanHours)}j • {formatIntFr(item.volume)} interventions
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-100">
          Axe prioritaire à améliorer:{" "}
          <span className="font-extrabold">
            {improvementAxis
              ? `${improvementAxis.family} (${formatDays1FromHours(improvementAxis.meanHours)}j)`
              : "Aucune donnée de délai disponible"}
          </span>
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
