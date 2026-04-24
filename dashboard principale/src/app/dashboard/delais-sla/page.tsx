import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatDays1FromHours, formatPct1 } from "@/lib/format";
import { groupMeanHours, mean, quantile } from "@/lib/metrics";

export const dynamic = "force-dynamic";

const SLA_HOURS = 96;

export default async function DelaisSLAPage({
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

  const durations = filtered
    .map((r) => r.durationHours)
    .filter((v): v is number => v !== null && Number.isFinite(v));

  const avg = mean(durations) ?? 0;
  const p50 = quantile(durations, 0.5) ?? 0;
  const p90 = quantile(durations, 0.9) ?? 0;
  const p95 = quantile(durations, 0.95) ?? 0;
  const compliance = durations.length
    ? (durations.filter((d) => d <= SLA_HOURS).length / durations.length) * 100
    : 0;

  const byRegion = groupMeanHours(filtered, (r) => r.region)
    .slice(0, 8)
    .map((x) => ({ label: x.key, value: Number((x.meanHours / 24).toFixed(1)) }));

  const byResolution = groupMeanHours(filtered, (r) => r.resolutionCode)
    .slice(0, 8)
    .map((x) => ({ label: x.key, value: Number((x.meanHours / 24).toFixed(1)) }));

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="SLA"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Derniers 30 jours"
          title="Délais SLA"
        />
        <div className="flex flex-wrap gap-3">
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">SLA RESPECTÉ</div>
          <div className="mt-2 text-4xl font-black text-tt-blue">{formatPct1(compliance)}</div>
          <div className="mt-3 text-sm text-gray-500">Seuil: &le; 4 jours</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">MOYENNE</div>
          <div className="mt-2 text-4xl font-black text-tt-navy">{formatDays1FromHours(avg)}j</div>
          <div className="mt-3 text-sm text-gray-500">Durée moyenne de résolution</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">P90</div>
          <div className="mt-2 text-4xl font-black text-tt-navy">{formatDays1FromHours(p90)}j</div>
          <div className="mt-3 text-sm text-gray-500">90% des tickets en dessous</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">P95</div>
          <div className="mt-2 text-4xl font-black text-tt-navy">{formatDays1FromHours(p95)}j</div>
          <div className="mt-3 text-sm text-gray-500">Long tail opérationnel</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Délai moyen par région (jours)</div>
          <div className="mt-4">
            <HorizontalBarChart data={byRegion} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">
            Délai moyen par code de résolution (jours)
          </div>
          <div className="mt-4">
            <HorizontalBarChart data={byResolution} barColor="#5F2EE5" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-lg font-extrabold text-tt-navy">Distribution des délais</div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-100">
            <div className="font-extrabold">Médiane (P50)</div>
            <div className="mt-1">{formatDays1FromHours(p50)}j</div>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900 ring-1 ring-indigo-100">
            <div className="font-extrabold">P90</div>
            <div className="mt-1">{formatDays1FromHours(p90)}j</div>
          </div>
          <div className="rounded-2xl bg-violet-50 p-4 text-sm text-violet-900 ring-1 ring-violet-100">
            <div className="font-extrabold">P95</div>
            <div className="mt-1">{formatDays1FromHours(p95)}j</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
