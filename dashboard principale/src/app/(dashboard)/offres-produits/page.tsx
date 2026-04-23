import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { DonutChart } from "@/components/charts/DonutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Card } from "@/components/ui/Card";
import { offerClusterCounts } from "@/lib/buckets";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatIntFr, formatPct1 } from "@/lib/format";
import { topNCounts } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function OffresProduitsPage({
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

  const offerCounts = topNCounts(filtered, (r) => r.offer, 8).map((x) => ({
    label: x.key,
    value: x.count,
  }));

  const productCounts = topNCounts(filtered, (r) => r.productType, 8).map((x) => ({
    label: x.key,
    value: x.count,
  }));

  const clusters = offerClusterCounts(filtered);
  const clusterTotal = clusters.reduce((sum, c) => sum + c.count, 0) || 1;
  const uniqueOffers = new Set(filtered.map((r) => r.offer).filter((v): v is string => Boolean(v))).size;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="CATALOGUE"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Derniers 30 jours"
          title="Offres & Produits"
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
            OFFRES DISTINCTES
          </div>
          <div className="mt-2 text-4xl font-black text-tt-blue">{formatIntFr(uniqueOffers)}</div>
          <div className="mt-3 text-sm text-gray-500">Après filtres actifs</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">TOTAL LIGNES</div>
          <div className="mt-2 text-4xl font-black text-tt-navy">{formatIntFr(filtered.length)}</div>
          <div className="mt-3 text-sm text-gray-500">Base analytics courante</div>
        </Card>
        <Card className="p-6">
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">OFFRE MAJEURE</div>
          <div className="mt-2 text-2xl font-black text-tt-navy">
            {offerCounts[0]?.label ?? "—"}
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {offerCounts[0] ? `${formatIntFr(offerCounts[0].value)} occurrences` : "Aucune donnée"}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Top offres (volume)</div>
          <div className="mt-4">
            <HorizontalBarChart data={offerCounts} />
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Top produits (volume)</div>
          <div className="mt-4">
            <HorizontalBarChart data={productCounts} barColor="#5F2EE5" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Répartition par cluster d&apos;offres</div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
            <DonutChart
              centerLabel="TOTAL"
              centerValue={formatIntFr(clusterTotal)}
              data={clusters.map((c) => ({ name: c.cluster, value: c.count }))}
            />
            <div className="space-y-3 text-sm">
              {clusters.map((c) => (
                <div key={c.cluster} className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-gray-800">{c.cluster}</div>
                  <div className="font-extrabold text-gray-900">
                    {formatIntFr(c.count)} ({formatPct1((c.count / clusterTotal) * 100)})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-lg font-extrabold text-tt-navy">Signal opérationnel</div>
          <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 ring-1 ring-sky-100">
            Les clusters combinent le type d&apos;offre et la famille d&apos;intervention pour
            prioriser les actions techniques et client.
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {clusters.slice(0, 3).map((c) => (
              <div key={c.cluster} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="font-extrabold text-gray-900">{c.cluster}</div>
                <div className="mt-2 text-gray-600">
                  Réseau: <span className="font-semibold">{formatIntFr(c.breakdown["Technique Réseau"])}</span>{" "}
                  • Local: <span className="font-semibold">{formatIntFr(c.breakdown["Technique Local"])}</span>{" "}
                  • Service: <span className="font-semibold">{formatIntFr(c.breakdown["Service / Client"])}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
