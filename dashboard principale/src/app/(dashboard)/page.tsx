import { Check, Clock, ExternalLink, MessageCircle, MoreHorizontal, Wrench } from "lucide-react";

import { DonutChart } from "@/components/charts/DonutChart";
import { MonthlyComboChart } from "@/components/charts/MonthlyComboChart";
import { KpiTopBorderCard } from "@/components/KpiCards";
import { PageHeader } from "@/components/PageHeader";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { compareToPreviousPeriod } from "@/lib/compare";
import { loadIncidents } from "@/lib/excel/loadWorkbook";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import {
  formatDays1FromHours,
  formatIntFr,
  formatPct1,
  formatSignedPct1,
} from "@/lib/format";
import { mean, monthlyInterventionTrend, resolutionRate, statusSplit } from "@/lib/metrics";
import { isClosed } from "@/lib/normalize";

export const dynamic = "force-dynamic";

export default async function VueGlobalePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const all = await loadIncidents();
  const filters = parseDashboardFilters(sp);
  const filtered = applyFilters(all, filters);

  const cmp = compareToPreviousPeriod(all, filters);
  const prevCount = cmp?.previous.length ?? null;
  const deltaCountPct =
    cmp && prevCount && prevCount > 0 ? ((filtered.length - prevCount) / prevCount) * 100 : null;

  const avgHours =
    mean(filtered.map((r) => r.durationHours).filter((v): v is number => v !== null)) ?? 0;

  const rr = resolutionRate(filtered) ?? 0;
  const split = statusSplit(filtered);

  const monthly = monthlyInterventionTrend(filtered).slice(-7);

  const regions = distinctRegions(all);
  const offers = distinctOffers(all);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="NAVIGATION"
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

      <div className="grid gap-4 lg:grid-cols-5">
        <KpiTopBorderCard
          footer={
            deltaCountPct === null ? (
              <span>Comparaison période indisponible (période = Tout)</span>
            ) : (
              <span>
                {deltaCountPct >= 0 ? "Hausse" : "Baisse"} vs période précédente:{" "}
                <span className="font-semibold text-emerald-700">
                  {formatSignedPct1(deltaCountPct)}
                </span>
              </span>
            )
          }
          rightSlot={
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-50 text-tt-blue ring-1 ring-sky-100">
              <MessageCircle className="h-5 w-5" />
            </div>
          }
          title="TOTAL RÉCLAMATIONS"
          topColor="blue"
          value={formatIntFr(filtered.length)}
        />

        <KpiTopBorderCard
          footer={<span>Basé sur `problem_status`</span>}
          rightSlot={
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Check className="h-5 w-5" />
            </div>
          }
          title="TAUX RÉSOLUTION"
          topColor="green"
          value={formatPct1(rr)}
        />

        <KpiTopBorderCard
          footer={<span>Moyenne TT_resolution_duration</span>}
          rightSlot={
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-50 text-tt-blue ring-1 ring-sky-100">
              <Clock className="h-5 w-5" />
            </div>
          }
          title="DÉLAI MOYEN"
          topColor="gray"
          value={`${formatDays1FromHours(avgHours)}j`}
        />

        <KpiTopBorderCard
          footer={<span>Statut Ouvert (problem_status)</span>}
          rightSlot={
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <MoreHorizontal className="h-5 w-5" />
            </div>
          }
          title="EN ATTENTE"
          topColor="red"
          value={formatIntFr(split.inProgress)}
        />

        <KpiTopBorderCard
          footer={<span>Volume (même jeu de données)</span>}
          rightSlot={
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gray-50 text-gray-900 ring-1 ring-gray-200">
              <Wrench className="h-5 w-5" />
            </div>
          }
          title="INTERVENTIONS"
          topColor="gray"
          value={formatIntFr(filtered.length)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-extrabold text-tt-navy">Interventions Mensuelles</div>
              <div className="mt-1 text-sm text-gray-500">
                Analyse comparative par type d&apos;intervention (heuristique `product_type`)
              </div>
            </div>
          </div>
          <div className="mt-4">
            <MonthlyComboChart
              data={monthly.map((m) => ({
                label: m.label,
                technique: m.technique,
                commercial: m.commercial,
              }))}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Statut des réclamations</div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <DonutChart
              centerLabel="TOTAL"
              centerValue={formatIntFr(filtered.length)}
              data={[
                { name: "Traitées", value: split.treated },
                { name: "En cours", value: split.inProgress },
                { name: "Urgentes", value: split.urgent },
              ]}
            />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Traitées
                </div>
                <div className="font-extrabold text-gray-900">{formatIntFr(split.treated)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  En cours
                </div>
                <div className="font-extrabold text-gray-900">{formatIntFr(split.inProgress)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Urgentes
                </div>
                <div className="font-extrabold text-gray-900">{formatIntFr(split.urgent)}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="text-lg font-extrabold text-tt-navy">Densité Régionale</div>
            <Button className="rounded-2xl" type="button" variant="ghost">
              <ExternalLink className="h-4 w-4" />
              Voir carte complète
            </Button>
          </div>
          <div className="mt-4 h-[260px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ring-1 ring-white/10">
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="max-w-md rounded-2xl bg-white/10 p-5 text-white ring-1 ring-white/15 backdrop-blur">
                <div className="text-sm font-semibold text-white/80">Carte (placeholder)</div>
                <div className="mt-2 text-lg font-black">SOUSSE : PIC D&apos;ACTIVITÉ</div>
                <div className="mt-2 text-sm text-white/75">
                  Visualisation raster non incluse dans les exports Figma fournis — hotspot basé sur
                  les volumes régionaux du fichier.
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Interventions Récentes</div>
          <div className="mt-4 space-y-3">
            {filtered
              .slice()
              .sort((a, b) => b.openAt.getTime() - a.openAt.getTime())
              .slice(0, 3)
              .map((r, idx) => {
                const urgent = (r.durationHours ?? 0) > avgHours * 2;
                const status = urgent ? "URGENT" : isClosed(r.status) ? "RÉGLÉ" : "EN COURS";
                const tone =
                  status === "RÉGLÉ" ? "good" : status === "EN COURS" ? "info" : "bad";
                const bar =
                  status === "RÉGLÉ" ? "bg-emerald-500" : status === "EN COURS" ? "bg-blue-600" : "bg-rose-500";
                return (
                  <div
                    key={`${r.openAt.toISOString()}-${idx}`}
                    className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className={`w-1 rounded-full ${bar}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="truncate font-extrabold text-gray-900">
                          {r.briefDescription ?? "Réclamation"}
                        </div>
                        <Badge tone={tone}>{status}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {r.region ? `RÉGION: ${r.region}` : "RÉGION: —"} •{" "}
                        {r.offer ? `OFFRE: ${r.offer}` : "OFFRE: —"}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
}
