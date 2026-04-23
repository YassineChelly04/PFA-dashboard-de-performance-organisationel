import { Bell, HelpCircle, Moon, Search } from "lucide-react";

export function Topbar({ searchPlaceholder }: { searchPlaceholder: string }) {
  return (
    <header className="flex items-center gap-4 border-b border-tt-border bg-white px-8 py-4">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none ring-tt-blue/30 placeholder:text-gray-400 focus:ring-4"
          placeholder={searchPlaceholder}
          type="search"
        />
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <button
          className="grid h-11 w-11 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          type="button"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          className="grid h-11 w-11 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          type="button"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <button
          className="grid h-11 w-11 place-items-center rounded-2xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          type="button"
        >
          <Moon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-100 ring-1 ring-black/5" />
        <div className="leading-tight">
          <div className="text-sm font-extrabold text-tt-navy">M. Ben Slama</div>
          <div className="text-xs text-gray-500">Directeur Opérations</div>
        </div>
      </div>
    </header>
  );
}
