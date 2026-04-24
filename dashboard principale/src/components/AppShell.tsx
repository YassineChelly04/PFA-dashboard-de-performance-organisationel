"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activePath]);

  return (
    <div className="flex min-h-screen bg-tt-bg">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      <button
        type="button"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-gray-200 bg-white p-2 text-gray-700 shadow-lg lg:hidden"
        aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0 lg:z-auto`}
      >
        <Sidebar activePath={activePath} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar searchPlaceholder={searchPlaceholder} />
        <main className="min-h-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
