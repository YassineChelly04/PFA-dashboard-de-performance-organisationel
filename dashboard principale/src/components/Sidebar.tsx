import Link from "next/link";
import Image from "next/image";

import {
  BarChart3,
  BriefcaseBusiness,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Globe2,
  Layers,
  LayoutDashboard,
  LineChart,
  MapPin,
  Megaphone,
  Wrench,
} from "lucide-react";

const navItemClass = (active: boolean) =>
  [
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
    active
      ? "bg-gradient-to-r from-tt-blue to-tt-accent text-white shadow-[0_10px_24px_rgba(95,46,229,0.24)]"
      : "text-gray-700 hover:bg-gray-50",
  ].join(" ");

function isActive(activePath: string, href: string): boolean {
  if (href === "/") return activePath === "/";
  return activePath === href || activePath.startsWith(`${href}/`);
}

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="flex h-full w-[280px] flex-col gap-6 overflow-y-auto border-r border-tt-border bg-white px-4 py-6">
      <div className="flex items-center gap-3 px-2">
        <Image alt="Tunisie Telecom" className="h-12 w-auto" height={48} src="/logo-tt.png" width={96} />
        <div className="leading-tight">
          <div className="text-sm font-extrabold text-tt-navy">Tunisie Telecom</div>
          <div className="text-xs text-gray-500">Performance</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="px-2 text-[11px] font-bold tracking-wider text-gray-400">
            NAVIGATION
          </div>
          <div className="mt-2 space-y-1">
            <Link className={navItemClass(isActive(activePath, "/"))} href="/">
              <LayoutDashboard className="h-4 w-4" />
              Vue globale
            </Link>
            <Link className={navItemClass(isActive(activePath, "/reclamations"))} href="/reclamations">
              <Megaphone className="h-4 w-4" />
              <span className="flex-1">Réclamations</span>
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-extrabold text-white">
                247
              </span>
            </Link>
            <Link className={navItemClass(isActive(activePath, "/interventions"))} href="/interventions">
              <Wrench className="h-4 w-4" />
              Interventions
            </Link>
            <Link className={navItemClass(isActive(activePath, "/performance"))} href="/performance">
              <BarChart3 className="h-4 w-4" />
              Performance
            </Link>
            <Link className={navItemClass(isActive(activePath, "/offres-produits"))} href="/offres-produits">
              <Layers className="h-4 w-4" />
              Offres & Produits
            </Link>
            <Link className={navItemClass(isActive(activePath, "/regions"))} href="/regions">
              <MapPin className="h-4 w-4" />
              Régions
            </Link>
            <Link className={navItemClass(isActive(activePath, "/resolutions-tt"))} href="/resolutions-tt">
              <GitBranch className="h-4 w-4" />
              Résolutions TT
            </Link>
            <Link className={navItemClass(isActive(activePath, "/actions-fsi"))} href="/actions-fsi">
              <BriefcaseBusiness className="h-4 w-4" />
              Actions FSI
            </Link>
          </div>
        </div>

        <div>
          <div className="px-2 text-[11px] font-bold tracking-wider text-gray-400">ANALYSE</div>
          <div className="mt-2 space-y-1">
            <Link className={navItemClass(isActive(activePath, "/pareto"))} href="/pareto">
              <LineChart className="h-4 w-4" />
              Pareto
            </Link>
            <Link className={navItemClass(isActive(activePath, "/delais-sla"))} href="/delais-sla">
              <BarChart3 className="h-4 w-4" />
              Délais SLA
            </Link>
            <Link className={navItemClass(isActive(activePath, "/detail-lignes"))} href="/detail-lignes">
              <FileText className="h-4 w-4" />
              Détail lignes
            </Link>
          </div>
        </div>

        <div>
          <div className="px-2 text-[11px] font-bold tracking-wider text-gray-400">EXPORT</div>
          <div className="mt-2 space-y-1">
            <button className={navItemClass(false)} type="button">
              <FileText className="h-4 w-4" />
              Rapport PDF
            </button>
            <button className={navItemClass(false)} type="button">
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto px-2 text-xs text-gray-400">
        Données: <span className="font-semibold text-gray-600">all-data.xlsx</span>
      </div>
    </aside>
  );
}
