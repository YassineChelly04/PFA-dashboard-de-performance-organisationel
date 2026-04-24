import type { ReactNode } from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardChrome } from "@/components/DashboardChrome";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

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
