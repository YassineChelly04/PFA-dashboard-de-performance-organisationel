import { Download } from "lucide-react";

import { DonutChart } from "@/components/charts/DonutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { compareToPreviousPeriod } from "@/lib/compare";
import { loadIncidents } from "@/lib/excel/loadWorkbook";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatHours1, formatIntFr, formatPct1, formatSignedPct1 } from "@/lib/format";
import { isClosed } from "@/lib/normalize";
import { mean, topNCounts } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function InterventionsPage({
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

  const resolutionPct =
    filtered.length > 0
      ? (filtered.filter((r) => isClosed(r.status)).length / filtered.length) * 100
      : 0;

  const family = topNCounts(filtered, (r) => r.productType, 3);
  const totalFamily = family.reduce((s, x) => s + x.count, 0) || 1;
  const donut = family.map((x) => ({
    name: x.key,
    value: x.count,
  }));

  const offersRank = topNCounts(filtered, (r) => r.offer, 5).map((x) => ({
    label: x.key,
    value: x.count,
  }));

  const regions = distinctRegions(all);
  const offers = distinctOffers(all);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-4xl font-black text-tt-navy">Interventions</div>
          <div className="mt-2 text-sm text-gray-500">
            Données filtrées: {formatIntFr(filtered.length)} lignes
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              className="w-[280px] rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm"
              placeholder="Rechercher..."
            />
          </div>
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-t-4 border-t-tt-navy p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            TOTAL INTERVENTIONS
          </div>
          <div className="mt-2 text-4xl font-black text-gray-900">{formatIntFr(filtered.length)}</div>
          <div className="mt-3 text-sm font-semibold text-emerald-700">
            {deltaCountPct === null ? (
              <span>Tendance: n/a</span>
            ) : (
              <span>
                {deltaCountPct >= 0 ? "↑" : "↓"} {formatSignedPct1(Math.abs(deltaCountPct))}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">Mise à jour: calcul live (Excel)</div>
        </Card>

        <Card className="border-t-4 border-t-rose-500 p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">DÉLAI MOYEN</div>
          <div className="mt-2 text-4xl font-black text-gray-900">{formatHours1(avgHours)}h</div>
          <div className="mt-3 text-xs text-gray-500">SLA Target: 4.0h (mock)</div>
        </Card>

        <Card className="border-t-4 border-t-emerald-500 p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            TAUX DE RÉSOLUTION
          </div>
          <div className="mt-2 text-4xl font-black text-gray-900">{formatPct1(resolutionPct)}</div>
          <div className="mt-3 text-xs text-gray-500">Performance Excellence</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">
            Répartition par Famille d&apos;Intervention
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <DonutChart
              centerLabel="TOTAL VOLUME"
              centerValue={formatIntFr(totalFamily)}
              data={donut.map((d) => ({ name: d.name, value: d.value }))}
            />
            <div className="space-y-2 text-sm">
              {family.map((d) => (
                <div key={d.key} className="flex items-center justify-between gap-3">
                  <div className="truncate font-semibold text-gray-800">{d.key}</div>
                  <div className="font-extrabold text-gray-900">
                    {Math.round((d.count / totalFamily) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="text-lg font-extrabold text-tt-navy">
              Classement des Solutions par Produit
            </div>
            <div className="rounded-2xl bg-gray-100 p-1 text-xs font-extrabold text-gray-700">
              <span className="rounded-2xl px-3 py-1">HEBDOMADAIRE</span>
              <span className="rounded-2xl bg-tt-navy px-3 py-1 text-white">MENSUEL</span>
            </div>
          </div>
          <div className="mt-4">
            <HorizontalBarChart data={offersRank} />
          </div>
          <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm text-sky-950 ring-1 ring-sky-100">
            Insight Opérationnel: volume Fibre (FTTH) dans le top des offres filtrées.
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-extrabold text-tt-navy">Codes de Résolution (Actions TT)</div>
            <div className="mt-1 text-sm text-gray-500">
              Analyse de la fréquence des actions correctives (resolution_code)
            </div>
          </div>
          <Button className="rounded-2xl" type="button" variant="secondary">
            <Download className="h-4 w-4" />
            Exporter les données
          </Button>
        </div>
        <div className="mt-4">
          <HorizontalBarChart
            barColor="#93C5FD"
            data={topNCounts(filtered, (r) => r.resolutionCode, 7).map((x) => ({
              label: x.key,
              value: x.count,
            }))}
          />
        </div>
      </Card>
    </div>
  );
}
