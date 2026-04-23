"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Search,
  LogOut,
  Home,
  Settings,
  Bell,
  HelpCircle,
  Moon,
  MapPin,
  ArrowRight,
  User,
} from "lucide-react";
import MultiStepActionForm from "@/components/MultiStepActionForm";

interface LigneData {
  dligne: string;
  status: string;
  offre: string;
  debit: string;
  debitMax: string;
  region: string;
  zone: string;
  isActive: boolean;
  referenceExtranet?: string;
  actionFSI?: string;
  actionAlreadyFilled?: boolean;
  downtimeStart?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lineFound, setLineFound] = useState(false);
  const [lineData, setLineData] = useState<LigneData>({
    dligne: "",
    status: "En attente de recherche",
    offre: "-",
    debit: "-",
    debitMax: "-",
    region: "-",
    zone: "-",
    isActive: false,
    actionAlreadyFilled: false,
  });
  const [metrics, setMetrics] = useState({
    latency: 0,
    snr: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Veuillez entrer un numéro DLigne (ex: DL-007716)");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/ligne?dl=${encodeURIComponent(searchQuery.trim())}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la recherche");
      }

      if (!result.found) {
        toast.error(`Ligne ${searchQuery} non trouvée`);
        setLineFound(false);
        setLineData({
          dligne: searchQuery,
          status: "Non trouvé",
          offre: "-",
          debit: "-",
          debitMax: "-",
          region: "-",
          zone: "-",
          isActive: false,
          actionAlreadyFilled: false,
        });
        setMetrics({ latency: 0, snr: 0 });
      } else {
        const data = result.data;
        setLineFound(true);
        setLineData({
          dligne: data.dLigne,
          status: data.problemStatus || "Actif",
          offre: data.offre || "ADSL",
          debit: data.debitADSL || "-",
          debitMax: "Up to 100",
          region: data.region || "-",
          zone: data.fsiADSL || "-",
          isActive: data.problemStatus !== "Clôturé",
          referenceExtranet: data.referenceExtranet,
          actionFSI: data.actionFSI,
          actionAlreadyFilled: result.actionAlreadyFilled,
          downtimeStart: data.downtimeStart,
        });
        setMetrics({
          latency: Math.floor(Math.random() * 20) + 8,
          snr: Math.floor(Math.random() * 10) + 15,
        });
        toast.success(`Ligne ${data.dLigne} trouvée`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la recherche";
      console.error("Search error:", error);
      toast.error(message);
      setLineFound(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleActionSaved = () => {
    setLineData((prev) => ({
      ...prev,
      actionAlreadyFilled: true,
    }));
  };

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur de synchronisation");
      }

      const { created, updated, total } = result.summary;
      toast.success(
        `Synchronisation terminée: ${created} créées, ${updated} mises à jour, ${total} lignes traitées.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur de synchronisation";
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

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
      {/* Left Sidebar */}
      <aside className="w-[280px] bg-white border-r border-[#e5e7eb] flex flex-col min-h-screen shrink-0 px-4 py-6">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-2">
          <Image src="/logo-tt.png" alt="Tunisie Telecom" width={96} height={48} className="h-12 w-auto" />
          <div className="leading-tight">
            <h2 className="text-[#0a277a] font-extrabold text-[15px]">Tunisie Telecom</h2>
            <p className="text-[#6b7280] text-[12px] mt-0.5">Performance</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-[#e5e7eb] flex items-center gap-4 px-8 py-4 shrink-0">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
              <input
                type="search"
                placeholder="Search orders or tickets..."
                className="w-full rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] py-3 pl-11 pr-4 text-sm text-[#374151] outline-none ring-[#1E2F97]/20 placeholder:text-[#9ca3af] focus:ring-4"
              />
            </div>
          </div>

          {/* Right Icons */}
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
            {/* User Info */}
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

        {/* Page Content */}
        <main className="flex-1 px-6 xl:px-[15%] py-5 overflow-auto">
          {/* Blue Header Section */}
          <div className="relative overflow-hidden bg-[#1E2F97] rounded-[22px] p-8 mb-6 min-h-[213px]">
            <Image
              src="/cable.png"
              alt="Cable background"
              fill
              className="object-cover object-center opacity-50 mix-blend-screen"
              priority
            />
            <div className="absolute inset-0 bg-[#1E2F97]/55"></div>
            <div className="relative z-10">
                <h1 className="text-white text-[29px] font-bold mb-3 font-[var(--font-plus-jakarta-sans)]">
                  Accueil
                </h1>
                <p className="text-white/70 text-[14px] leading-6 mb-6 max-w-[570px] font-[var(--font-manrope)]">
                  Entrez le numéro de la ligne fixe ou mobile pour accéder aux détails techniques et aux actions de maintenance.
                </p>

                <div className="mb-4">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-2 rounded-[14px] border border-white/15 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 font-[var(--font-plus-jakarta-sans)]"
                  >
                    {isSyncing ? "Synchronisation..." : "Synchroniser Excel -> base"}
                  </button>
                </div>

                {/* Search Input */}
                <div className="flex gap-3 max-w-[560px]">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Entrez la DLigne (ex: DL-007716)"
                      className="w-full pl-12 pr-4 py-3.5 bg-white rounded-[14px] text-[14px] text-[#1f2937] placeholder-[#9ca3af] focus:ring-2 focus:ring-white/30 outline-none shadow-sm font-[var(--font-plus-jakarta-sans)]"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-6 py-3.5 bg-[#5F2EE5] hover:bg-[#5227cf] text-white font-medium rounded-[14px] transition-all flex items-center gap-2 disabled:opacity-50 text-[14px] shadow-sm font-[var(--font-plus-jakarta-sans)]"
                  >
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Suivant
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-4 xl:gap-6 mb-6">
            {/* Left Column - Line Details */}
            <div className="space-y-4 xl:space-y-6">
              {/* Détails de l'Abonnement Card */}
              <div className="bg-white rounded-[22px] shadow-[0_1px_6px_rgba(15,23,42,0.08)] overflow-hidden">
                <div className="flex">
                  {/* Blue Left Border */}
                  <div className="w-1 bg-[#70F8E8]"></div>
                  
                  <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[16px] font-semibold text-[#00157C] font-[var(--font-plus-jakarta-sans)]">
                        Détails de l&apos;Abonnement
                      </h2>
                      {lineData.isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6EDEC] text-[#19BAAC] rounded-full text-[12px] font-medium">
                          <span className="w-1.5 h-1.5 bg-[#19BAAC] rounded-full"></span>
                          LIGNE ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-x-10 gap-y-5 mb-5">
                      <div>
                        <p className="text-[11px] text-[#7a7e8c] uppercase tracking-wide mb-1 font-[var(--font-plus-jakarta-sans)]">DLIGNE</p>
                        <p className="text-[15px] font-semibold text-[#222222]">{lineData.dligne}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#7a7e8c] uppercase tracking-wide mb-1 font-[var(--font-plus-jakarta-sans)]">STATUS</p>
                        <p className="text-[15px] font-semibold text-[#19BAAC]">{lineData.status}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#7a7e8c] uppercase tracking-wide mb-1 font-[var(--font-plus-jakarta-sans)]">OFFRE</p>
                        <p className="text-[15px] font-semibold text-[#222222]">{lineData.offre}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#7a7e8c] uppercase tracking-wide mb-1 font-[var(--font-plus-jakarta-sans)]">DÉBIT</p>
                        <p className="text-[15px] font-semibold text-[#5F2EE5]">
                          {lineData.debit} <span className="font-normal text-[#6b7280]">({lineData.debitMax})</span>
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#e5e7eb] pt-4">
                      <p className="text-[11px] text-[#7a7e8c] uppercase tracking-wide mb-1 font-[var(--font-plus-jakarta-sans)]">RÉGION & ZONE</p>
                      <div className="flex items-center gap-2 text-[15px] text-[#222222]">
                        <MapPin size={16} className="text-[#00157C]" />
                        <span className="font-semibold">{lineData.region}, {lineData.zone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Latency Card */}
                <div className="bg-[#F2F3F7] rounded-[22px] shadow-[0_1px_6px_rgba(15,23,42,0.08)] p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[45px] bg-white flex items-center justify-center shadow-sm">
                      <Image src="/latency.svg" alt="Latency" width={28} height={28} />
                    </div>
                    <div>
                      <p className="text-[12px] text-[#6b7280] font-[var(--font-plus-jakarta-sans)] font-bold">Latency</p>
                      <p className="text-[22px] font-bold text-[#00157C]">
                        <span className="font-bold">{metrics.latency}</span> <span className="text-[14px] font-bold">ms</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* SNR Card */}
                <div className="bg-[#F2F3F7] rounded-[22px] shadow-[0_1px_6px_rgba(15,23,42,0.08)] p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-[45px] bg-white flex items-center justify-center shadow-sm">
                      <Image src="/sni.svg" alt="SNR" width={28} height={28} />
                    </div>
                    <div>
                      <p className="text-[12px] text-[#6b7280] font-[var(--font-plus-jakarta-sans)] font-bold">SNR Margin</p>
                      <p className="text-[22px] font-bold text-[#5F2EE5]">
                        <span className="font-bold">{metrics.snr}</span> <span className="text-[14px] font-bold">dB</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Action Form */}
            <div>
              <div className="bg-white rounded-[22px] shadow-[0_1px_6px_rgba(15,23,42,0.08)] p-6 h-full">
                <h2 className="text-[18px] font-bold text-[#00157C] mb-1 font-[family-name:var(--font-montserrat)]">
                  Action faite par Fournisseur
                </h2>
                <p className="text-[13px] text-[#6b7280] mb-5 font-[family-name:var(--font-manrope)]">
                  Répondez aux questions de diagnostic pour enregistrer l&apos;intervention.
                </p>

                <MultiStepActionForm 
                  dlNumber={lineData.dligne}
                  actionAlreadyFilled={lineData.actionAlreadyFilled || false}
                  existingAction={lineData.actionFSI}
                  downtimeStart={lineData.downtimeStart}
                  onActionSaved={handleActionSaved}
                  lineFound={lineFound}
                />
              </div>
            </div>
          </div>

          {/* Bottom Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Historique */}
            <div className="bg-[#F2F3F7] rounded-[22px] shadow-[0_1px_6px_rgba(15,23,42,0.08)] p-6 text-center">
              <div className="w-11 h-11 rounded-[45px] bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Image src="/history.svg" alt="Historique" width={28} height={28} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#00157C] mb-2 font-[var(--font-plus-jakarta-sans)]">Historique</h3>
              <p className="text-[13px] text-[#6b7280] mb-4 font-[var(--font-manrope)]">
                Voir les 12 dernières interventions sur cette ligne.
              </p>
              <button className="text-[#00157C] text-[13px] font-medium hover:opacity-80 transition-colors">
                Consulter
              </button>
            </div>

            {/* Géolocalisation */}
            <div className="bg-[#F2F3F7] rounded-[22px] shadow-[0_1px_6px_rgba(15,23,42,0.08)] p-6 text-center">
              <div className="w-11 h-11 rounded-[45px] bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Image src="/geo.svg" alt="Géolocalisation" width={28} height={28} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#19BAAC] mb-2 font-[var(--font-plus-jakarta-sans)]">Géolocalisation</h3>
              <p className="text-[13px] text-[#6b7280] mb-4 font-[var(--font-manrope)]">
                Localiser l&apos;armoire de rue (SR) correspondante.
              </p>
              <button className="text-[#19BAAC] text-[13px] font-medium hover:opacity-80 transition-colors">
                Ouvrir Carte
              </button>
            </div>

            {/* Assistance */}
            <div className="bg-[#F2F3F7] rounded-[22px] shadow-[0_1px_6px_rgba(15,23,42,0.08)] p-6 text-center">
              <div className="w-11 h-11 rounded-[45px] bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Image src="/help.svg" alt="Assistance" width={28} height={28} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#5F2EE5] mb-2 font-[var(--font-plus-jakarta-sans)]">Assistance</h3>
              <p className="text-[13px] text-[#6b7280] mb-4 font-[var(--font-manrope)]">
                Contacter le support technique TT dédié fournisseurs.
              </p>
              <button className="text-[#5F2EE5] text-[13px] font-medium hover:opacity-80 transition-colors">
                Appeler Support
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
