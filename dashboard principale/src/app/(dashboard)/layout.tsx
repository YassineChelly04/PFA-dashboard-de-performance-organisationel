import type { ReactNode } from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { DashboardChrome } from "@/components/DashboardChrome";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-tt-bg text-sm text-gray-600">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Chargement
        </div>
      }
    >
      <DashboardChrome searchPlaceholder="Rechercher des données, rapports ou équipes...">
        {children}
      </DashboardChrome>
    </Suspense>
  );
}
