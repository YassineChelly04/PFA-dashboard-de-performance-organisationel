import { Bell, HelpCircle, Moon, Search } from "lucide-react";

export function Topbar({ searchPlaceholder }: { searchPlaceholder: string }) {
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-tt-border bg-white px-4 py-3 pl-16 sm:px-6 sm:pl-20 lg:flex-nowrap lg:gap-4 lg:px-8 lg:pl-8">
      <div className="relative order-2 w-full lg:order-1 lg:flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none ring-tt-blue/30 placeholder:text-gray-400 focus:ring-4"
          placeholder={searchPlaceholder}
          type="search"
        />
      </div>

      <div className="order-3 hidden items-center gap-2 md:flex lg:order-2">
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

      <div className="order-1 ml-auto flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 lg:order-3 lg:ml-0">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-100 ring-1 ring-black/5" />
        <div className="hidden leading-tight sm:block">
          <div className="text-sm font-extrabold text-tt-navy">M. Ben Slama</div>
          <div className="text-xs text-gray-500">Directeur Opérations</div>
        </div>
      </div>
    </header>
  );
}
