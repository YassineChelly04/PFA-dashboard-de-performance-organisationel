import { DatabaseZap, RefreshCcw } from "lucide-react";
import Link from "next/link";

export function DashboardDataUnavailableState() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[900px] items-center justify-center px-6 py-16">
      <div className="w-full rounded-[32px] border border-amber-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <DatabaseZap className="h-7 w-7" />
        </div>
        <div className="mt-6 text-3xl font-black tracking-[-0.03em] text-tt-navy">
          Source de donnees indisponible
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
          Ce dashboard est bien deploye, mais sa source de donnees locale n&apos;est pas disponible
          sur Vercel. Il faut brancher une base de donnees ou une autre source de production a la
          place du fichier Excel local.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-tt-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
            href="/"
          >
            <RefreshCcw className="h-4 w-4" />
            Recharger
          </Link>
        </div>
      </div>
    </div>
  );
}
