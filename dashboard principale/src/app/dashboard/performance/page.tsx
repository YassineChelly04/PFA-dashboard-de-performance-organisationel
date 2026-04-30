import Link from "next/link";
import { ArrowRight, ShieldAlert, Sparkles, Wrench } from "lucide-react";

import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { DonutChart } from "@/components/charts/DonutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { clusterOffer, serviceBucket, type OfferCluster, type ServiceBucket } from "@/lib/buckets";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatDays1FromHours, formatIntFr } from "@/lib/format";
import { groupMeanHours, mean } from "@/lib/metrics";

export const dynamic = "force-dynamic";

const FAMILY_ORDER: ServiceBucket[] = ["Technique Réseau", "Technique Local", "Service / Client"];
const OFFER_TYPE_ORDER: OfferCluster[] = ["ADSL", "VDSL", "FIBRE", "AUTRES / DATA"];

const OFFER_TYPE_LABEL: Record<OfferCluster, string> = {
  ADSL: "ADSL",
  VDSL: "VDSL",
  FIBRE: "FIBRE (FTTH)",
  "AUTRES / DATA": "AUTRES / DATA / BUSINESS",
};

function buildDashboardHref(
  sp: Record<string, string | string[] | undefined>,
  pathname: string,
  extras?: Record<string, string>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) {
      if (value[0]) params.set(key, value[0]);
      continue;
    }
    if (value) params.set(key, value);
  }
  for (const [key, value] of Object.entries(extras ?? {})) {
    params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

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

  const offerTypeAggregate = new Map<OfferCluster, { durationCount: number; durationSumHours: number; volume: number }>(
    OFFER_TYPE_ORDER.map((type) => [type, { durationCount: 0, durationSumHours: 0, volume: 0 }]),
  );
  for (const row of filtered) {
    const type = clusterOffer(row.offer);
    if (!type) continue;
    const entry = offerTypeAggregate.get(type);
    if (!entry) continue;
    entry.volume += 1;
    if (row.durationHours !== null) {
      entry.durationCount += 1;
      entry.durationSumHours += row.durationHours;
    }
  }
  const offerTypeStats = OFFER_TYPE_ORDER.map((type) => {
    const item = offerTypeAggregate.get(type) ?? { durationCount: 0, durationSumHours: 0, volume: 0 };
    const meanHours = item.durationCount ? item.durationSumHours / item.durationCount : 0;
    return {
      type,
      label: OFFER_TYPE_LABEL[type],
      meanHours,
      meanDays: Number((meanHours / 24).toFixed(1)),
      volume: item.volume,
      durationCount: item.durationCount,
    };
  }).filter((item) => item.volume > 0);

  const donut = offerTypeStats.map((x) => ({
    name: x.label,
    value: x.meanDays,
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
  const priorityOfferType = offerTypeStats
    .filter((item) => item.durationCount > 0)
    .sort((a, b) => b.meanHours - a.meanHours)[0];
  const actionPlanHref = `${buildDashboardHref(sp, "/dashboard/performance")}#plan-action`;
  const followActionsHref = buildDashboardHref(sp, "/dashboard/actions-fsi");

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
          <div className="text-lg font-extrabold text-tt-navy">Temps par offre (regroupé par type)</div>
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

      <Card className="flex flex-col gap-4 bg-gradient-to-r from-tt-navy to-sky-900 p-7 text-white lg:flex-row lg:items-center lg:justify-between">
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
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-tt-navy shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          href={actionPlanHref}
        >
          <Sparkles className="h-4 w-4" />
          Lancer Plan d&apos;Action
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <div id="plan-action">
        <Card className="p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-lg font-extrabold text-tt-navy">Plan d&apos;action performance</div>
            <div className="text-sm text-gray-500">Priorités générées automatiquement depuis les données filtrées.</div>
          </div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-extrabold text-tt-blue"
            href={followActionsHref}
          >
            Suivre l&apos;exécution côté opérations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-rose-700">
              <ShieldAlert className="h-4 w-4" />
              Priorité 1
            </div>
            <div className="mt-2 text-sm font-bold text-rose-900">
              Réduire le délai sur{" "}
              {priorityOfferType
                ? `${priorityOfferType.label} (${formatDays1FromHours(priorityOfferType.meanHours)}j)`
                : "le type le plus critique"}
            </div>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-700">
              <Wrench className="h-4 w-4" />
              Priorité 2
            </div>
            <div className="mt-2 text-sm font-bold text-sky-900">
              Cibler la famille {improvementAxis ? improvementAxis.family : "avec le plus grand retard"} pour un sprint de
              correction.
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-emerald-700">
              <Sparkles className="h-4 w-4" />
              Priorité 3
            </div>
            <div className="mt-2 text-sm font-bold text-emerald-900">
              Stabiliser la cible &lt; 3.5j via suivi hebdomadaire des {formatIntFr(filtered.length)} tickets filtrés.
            </div>
          </div>
        </div>
        </Card>
      </div>
    </div>
  );
}
