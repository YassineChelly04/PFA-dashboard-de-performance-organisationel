import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { MonthlyComboChart } from "@/components/charts/MonthlyComboChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatHours1, formatIntFr, formatPct1 } from "@/lib/format";
import {
  SLA_TARGET_HOURS,
  URGENT_TICKET_THRESHOLD_HOURS,
  mean,
  monthlyInterventionTrend,
  resolutionRate,
  slaComplianceRate,
  statusSplit,
  topNCounts,
} from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function VueGlobalePage({
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

  const avgHours =
    mean(filtered.map((r) => r.durationHours).filter((v): v is number => v !== null)) ?? 0;
  const rate = resolutionRate(filtered) ?? 0;
  const slaRate = slaComplianceRate(filtered);
  const slaMeasured = filtered.filter(
    (r): r is (typeof filtered)[number] & { durationHours: number } =>
      r.durationHours !== null && Number.isFinite(r.durationHours),
  );
  const slaCompliantCount = slaMeasured.filter((r) => r.durationHours <= SLA_TARGET_HOURS).length;
  const split = statusSplit(filtered);

  const trends = monthlyInterventionTrend(filtered)
    .slice(-6)
    .map((x) => ({
      label: x.label,
      reseau: x.reseau,
      locale: x.locale,
      logiqueClient: x.logiqueClient,
    }));

  const regionsTop = topNCounts(filtered, (r) => r.region, 6).map((x) => ({
    label: x.key,
    value: x.count,
  }));

  const offersTop = topNCounts(filtered, (r) => r.offer, 6).map((x) => ({
    label: x.key,
    value: x.count,
  }));

  const statusData = [
    { name: "Traité", value: split.treated },
    { name: "En cours", value: split.inProgress },
    { name: "Urgent", value: split.urgent },
  ].filter((x) => x.value > 0);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="TABLEAU DE BORD GLOBAL"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Derniers 30 jours"
          title="Vue globale"
        />
        <div className="flex flex-wrap gap-3">
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">TOTAL INCIDENTS</div>
          <div className="mt-2 text-4xl font-black text-tt-blue">{formatIntFr(filtered.length)}</div>
          <div className="mt-3 text-sm text-gray-500">Volume sur le périmètre filtré</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">TAUX DE RÉSOLUTION</div>
          <div className="mt-2 text-4xl font-black text-emerald-600">{formatPct1(rate)}</div>
          <div className="mt-3 text-sm text-gray-500">Incidents clôturés vs total</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">DÉLAI MOYEN</div>
          <div className="mt-2 text-4xl font-black text-tt-navy">{formatHours1(avgHours)}h</div>
          <div className="mt-3 text-sm text-gray-500">Temps moyen de traitement</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">CONFORMITÉ SLA</div>
          <div className="mt-2 text-4xl font-black text-violet-700">
            {slaRate === null ? "n/a" : formatPct1(slaRate)}
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Cible ≤ {formatHours1(SLA_TARGET_HOURS)}h ({formatIntFr(slaCompliantCount)}/
            {formatIntFr(slaMeasured.length)} tickets)
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Tendance mensuelle des interventions</div>
          <div className="mt-4">
            <MonthlyComboChart data={trends} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Statut global des tickets</div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <DonutChart
              centerLabel="TOTAL"
              centerValue={formatIntFr(filtered.length)}
              data={statusData}
            />
            <div className="space-y-2 text-sm">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-gray-800">{d.name}</div>
                  <div className="font-extrabold text-gray-900">{formatIntFr(d.value)}</div>
                </div>
              ))}
              <div className="pt-2 text-xs text-gray-500">
                Urgent = ticket avec délai {">="} {formatHours1(URGENT_TICKET_THRESHOLD_HOURS)}h
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Top régions</div>
          <div className="mt-4">
            <HorizontalBarChart data={regionsTop} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Top offres</div>
          <div className="mt-4">
            <HorizontalBarChart data={offersTop} barColor="#5F2EE5" />
          </div>
        </Card>
      </div>
    </div>
  );
}
