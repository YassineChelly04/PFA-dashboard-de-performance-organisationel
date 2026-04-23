"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "./AppShell";

export function DashboardChrome({
  searchPlaceholder,
  children,
}: {
  searchPlaceholder: string;
  children: ReactNode;
}) {
  const pathname = usePathname() || "/";
  return (
    <AppShell activePath={pathname} searchPlaceholder={searchPlaceholder}>
      {children}
    </AppShell>
  );
}
