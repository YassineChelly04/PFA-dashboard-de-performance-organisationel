"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function setParam(
  params: URLSearchParams,
  key: string,
  value: string | null,
): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  if (!value) next.delete(key);
  else next.set(key, value);
  return next;
}

export function PeriodSelect({
  value,
}: {
  value: "30d" | "90d" | "365d" | "all";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = useMemo(
    () =>
      [
        { value: "30d", label: "Derniers 30 jours" },
        { value: "90d", label: "Derniers 90 jours" },
        { value: "365d", label: "Derniers 365 jours" },
        { value: "all", label: "Tout" },
      ] as const,
    [],
  );

  return (
    <select
      className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm"
      value={value}
      onChange={(e) => {
        const next = setParam(searchParams, "period", e.target.value);
        router.push(`${pathname}?${next.toString()}`);
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function RegionSelect({
  value,
  regions,
}: {
  value: string | null;
  regions: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        const next = setParam(searchParams, "region", v ? v : null);
        router.push(`${pathname}?${next.toString()}`);
      }}
    >
      <option value="">Toutes les régions</option>
      <option value="grand-tunis">Grand Tunis</option>
      {regions.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

export function OfferSelect({
  value,
  offers,
}: {
  value: string | null;
  offers: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        const next = setParam(searchParams, "offer", v ? v : null);
        router.push(`${pathname}?${next.toString()}`);
      }}
    >
      <option value="">Toutes les offres</option>
      {offers.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function MonthSelect({
  value,
  months,
}: {
  value: string | null;
  months: { key: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        const next = setParam(searchParams, "month", v ? v : null);
        router.push(`${pathname}?${next.toString()}`);
      }}
    >
      <option value="">Mois (auto)</option>
      {months.map((m) => (
        <option key={m.key} value={m.key}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
