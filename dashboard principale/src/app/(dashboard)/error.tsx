"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDataUnavailable = error.message.includes("DASHBOARD_DATA_UNAVAILABLE");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[820px] items-center justify-center px-6 py-16">
      <div className="w-full rounded-[32px] border border-amber-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="mt-6 text-3xl font-black tracking-[-0.03em] text-tt-navy">
          {isDataUnavailable ? "Source de donnees indisponible" : "Erreur de chargement"}
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
          {isDataUnavailable
            ? "Le dashboard est deploye sans acces a sa source de donnees. Sur Vercel, il faut utiliser une base de donnees ou une autre source de production au lieu du fichier Excel local."
            : "Une erreur serveur a interrompu le chargement du dashboard. Verifiez les logs applicatifs puis rechargez la page."}
        </p>
        {error.digest ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            Digest: {error.digest}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="rounded-2xl" onClick={reset} type="button" variant="primary">
            <RotateCcw className="h-4 w-4" />
            Recharger
          </Button>
        </div>
      </div>
    </div>
  );
}
