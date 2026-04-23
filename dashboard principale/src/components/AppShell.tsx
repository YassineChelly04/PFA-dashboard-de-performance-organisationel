import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  activePath,
  searchPlaceholder,
  children,
}: {
  activePath: string;
  searchPlaceholder: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-tt-bg">
      <Sidebar activePath={activePath} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar searchPlaceholder={searchPlaceholder} />
        <main className="min-h-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
