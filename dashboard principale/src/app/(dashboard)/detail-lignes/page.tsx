import { DashboardDataUnavailableState } from "@/components/DashboardDataUnavailableState";
import { PageHeader } from "@/components/PageHeader";
import { OfferSelect, PeriodSelect, RegionSelect } from "@/components/QueryControls";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { distinctOffers, distinctRegions } from "@/lib/catalog";
import { loadDashboardIncidentsSafely } from "@/lib/dashboardData";
import { applyFilters, parseDashboardFilters } from "@/lib/filters";
import { formatHours1, formatIntFr } from "@/lib/format";
import { isClosed } from "@/lib/normalize";

export const dynamic = "force-dynamic";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function DetailLignesPage({
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
  const filtered = applyFilters(all, filters)
    .slice()
    .sort((a, b) => b.openAt.getTime() - a.openAt.getTime());

  const rows = filtered.slice(0, 80);
  const regions = distinctRegions(all);
  const offers = distinctOffers(all);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          kicker="DATASET"
          primaryActionLabel="Exporter Rapport"
          secondaryActionLabel="Derniers 30 jours"
          title="Détail lignes"
        />
        <div className="flex flex-wrap gap-3">
          <PeriodSelect value={filters.period} />
          <RegionSelect regions={regions} value={filters.region} />
          <OfferSelect offers={offers} value={filters.offer} />
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-lg font-extrabold text-tt-navy">Lignes détaillées</div>
            <div className="mt-1 text-sm text-gray-500">
              80 dernières entrées triées par date d&apos;ouverture
            </div>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-2 text-xs font-extrabold text-sky-900 ring-1 ring-sky-100">
            Total filtré: {formatIntFr(filtered.length)}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1200px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[11px] font-extrabold tracking-wider text-gray-500">
                <th className="border-b border-gray-200 px-3 py-3">OUVERTURE</th>
                <th className="border-b border-gray-200 px-3 py-3">STATUT</th>
                <th className="border-b border-gray-200 px-3 py-3">RÉGION</th>
                <th className="border-b border-gray-200 px-3 py-3">OFFRE</th>
                <th className="border-b border-gray-200 px-3 py-3">CODE RÉSOLUTION</th>
                <th className="border-b border-gray-200 px-3 py-3">DURÉE (h)</th>
                <th className="border-b border-gray-200 px-3 py-3">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={`${r.openAt.toISOString()}-${idx}`} className="text-sm">
                  <td className="border-b border-gray-100 px-3 py-3 text-gray-800">
                    {dateTimeFormatter.format(r.openAt)}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3">
                    <Badge tone={isClosed(r.status) ? "good" : "info"}>
                      {isClosed(r.status) ? "Clôturé" : "En cours"}
                    </Badge>
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 text-gray-700">{r.region ?? "—"}</td>
                  <td className="border-b border-gray-100 px-3 py-3 text-gray-700">{r.offer ?? "—"}</td>
                  <td className="border-b border-gray-100 px-3 py-3 font-semibold text-gray-900">
                    {r.resolutionCode ?? "—"}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                    {r.durationHours === null ? "—" : formatHours1(r.durationHours)}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 text-gray-700">
                    <div className="max-w-[420px] truncate">{r.briefDescription ?? "—"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
