import { PageHeader } from "@/components/PageHeader";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { serviceBucket } from "@/lib/buckets";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadIncidents } from "@/lib/excel/loadWorkbook";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatIntFr } from "@/lib/format";
import { topNCounts } from "@/lib/metrics";
import { isClosed } from "@/lib/normalize";

export const dynamic = "force-dynamic";

export default async function ActionsFSIPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const all = await loadIncidents();
  const filters = parseDashboardFilters(sp);
  const filtered = applyFilters(all, filters);

  const regions = distinctRegions(all);
  const offers = distinctOffers(all);

  const actions = topNCounts(filtered, (r) => serviceBucket(r.productType), 3).map((x) => ({
    label: x.key,
    value: x.count,
  }));

  const unresolved = filtered.filter((r) => !isClosed(r.status));
  const unresolvedMotifs = topNCounts(unresolved, (r) => r.briefDescription, 8).map((x) => ({
    label: x.key,
    value: x.count,
  }));

  const totalActions = actions.reduce((sum, x) => sum + x.value, 0);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="PILOTAGE FOURNISSEUR"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Derniers 30 jours"
          title="Actions FSI"
        />
        <div className="flex flex-wrap gap-3">
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">TICKETS OUVERTS</div>
          <div className="mt-2 text-4xl font-black text-tt-blue">{formatIntFr(unresolved.length)}</div>
          <div className="mt-3 text-sm text-gray-500">À traiter côté opérationnel</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">
            ACTION FSI PRIORITAIRE
          </div>
          <div className="mt-2 text-2xl font-black text-tt-navy">{actions[0]?.label ?? "—"}</div>
          <div className="mt-3 text-sm text-gray-500">
            {actions[0] ? `${formatIntFr(actions[0].value)} cas` : "Aucune donnée"}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">ACTIONS QUALIFIÉES</div>
          <div className="mt-2 text-4xl font-black text-tt-navy">{formatIntFr(totalActions)}</div>
          <div className="mt-3 text-sm text-gray-500">Répartition par famille d&apos;intervention</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Backlog FSI par type d&apos;action</div>
          <div className="mt-4">
            <HorizontalBarChart data={actions} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Motifs ouverts les plus fréquents</div>
          <div className="mt-4">
            <HorizontalBarChart data={unresolvedMotifs} barColor="#5F2EE5" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-lg font-extrabold text-tt-navy">Recommandations d&apos;exécution</div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {actions.map((x) => (
            <div key={x.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="text-sm font-extrabold text-tt-navy">{x.label}</div>
              <div className="mt-2 text-sm text-gray-600">
                Charge estimée: <span className="font-semibold">{formatIntFr(x.value)}</span> tickets
              </div>
              <div className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-900 ring-1 ring-sky-100">
                Recommandation: renforcer l&apos;équipe dédiée sur ce flux pour réduire le backlog ouvert.
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
