"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  Bell,
  HelpCircle,
  Home,
  LogOut,
  Moon,
  Search,
  Settings,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleLogout = async () => {
    toast.success("Déconnexion...");
    await signOut({ redirect: false });
    router.push("/");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-4 border-[#1e3a6e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden">
      <aside className="w-[280px] bg-white border-r border-[#e5e7eb] flex flex-col min-h-screen shrink-0 px-4 py-6">
        <div className="flex items-center gap-3 px-2">
          <Image src="/logo-tt.png" alt="Tunisie Telecom" width={96} height={48} className="h-12 w-auto" />
          <div className="leading-tight">
            <h2 className="text-[#0a277a] font-extrabold text-[15px]">Tunisie Telecom</h2>
            <p className="text-[#6b7280] text-[12px] mt-0.5">Performance</p>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-2">
          <div className="text-[11px] font-bold tracking-wider text-[#9ca3af] mb-2">NAVIGATION</div>
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                className={[
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                  pathname === "/dashboard"
                    ? "bg-gradient-to-r from-[#1E2F97] to-[#5F2EE5] text-white shadow-[0_10px_24px_rgba(95,46,229,0.24)]"
                    : "text-[#374151] hover:bg-[#f9fafb]",
                ].join(" ")}
              >
                <Home size={18} className={pathname === "/dashboard" ? "text-white" : "text-[#6b7280]"} />
                Accueil
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className={[
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                  pathname === "/settings"
                    ? "bg-gradient-to-r from-[#1E2F97] to-[#5F2EE5] text-white shadow-[0_10px_24px_rgba(95,46,229,0.24)]"
                    : "text-[#374151] hover:bg-[#f9fafb]",
                ].join(" ")}
              >
                <Settings size={18} className={pathname === "/settings" ? "text-white" : "text-[#6b7280]"} />
                Settings
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors"
              >
                <LogOut size={18} className="text-[#6b7280]" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#e5e7eb] flex items-center gap-4 px-8 py-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
            <input
              type="search"
              placeholder="Search settings..."
              className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-11 pr-4 text-sm text-[#374151] outline-none ring-[#1E2F97]/20 placeholder:text-[#9ca3af] focus:ring-4"
            />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button className="grid h-11 w-11 place-items-center rounded-2xl border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb] transition-colors">
              <Bell size={20} />
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-2xl border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb] transition-colors">
              <HelpCircle size={20} />
            </button>
            <button className="grid h-11 w-11 place-items-center rounded-2xl border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb] transition-colors">
              <Moon size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#e5e7eb] bg-white px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#e5e7eb] to-[#f3f4f6] ring-1 ring-black/5 flex items-center justify-center">
                <User size={16} className="text-[#0891b2]" />
              </div>
              <div className="text-right">
                <p className="text-[14px] font-extrabold text-[#0a277a]">Tunis Technoparc</p>
                <p className="text-[12px] text-[#6b7280]">FOURNISSEUR OFFICIEL</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white border border-[#e5e7eb] rounded-[22px] p-6">
              <h1 className="text-[30px] font-bold text-[#0a277a] font-[var(--font-plus-jakarta-sans)]">Settings</h1>
              <p className="text-[#6b7280] mt-2 text-[14px]">
                Gérez les préférences du portail fournisseur et les informations du compte.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white border border-[#e5e7eb] rounded-[22px] p-6">
                <h2 className="text-[18px] font-bold text-[#0a277a]">Profil</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-[12px] text-[#6b7280] mb-1">Nom affiché</label>
                    <input
                      readOnly
                      value="Tunis Technoparc"
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[14px] text-[#374151]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#6b7280] mb-1">Rôle</label>
                    <input
                      readOnly
                      value="FOURNISSEUR OFFICIEL"
                      className="w-full rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[14px] text-[#374151]"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white border border-[#e5e7eb] rounded-[22px] p-6">
                <h2 className="text-[18px] font-bold text-[#0a277a]">Préférences</h2>
                <div className="mt-4 space-y-3 text-[14px] text-[#374151]">
                  <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
                    <span>Notifications email</span>
                    <span className="text-[#10b981] font-semibold">Activé</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
                    <span>Alertes critiques</span>
                    <span className="text-[#10b981] font-semibold">Activé</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3">
                    <span>Langue</span>
                    <span className="text-[#0a277a] font-semibold">Français</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
