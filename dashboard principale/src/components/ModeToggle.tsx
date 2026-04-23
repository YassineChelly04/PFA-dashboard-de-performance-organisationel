"use client";

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

export function ParetoModeToggle({ value }: { value: "cum" | "log" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="inline-flex rounded-2xl bg-gray-100 p-1 text-xs font-extrabold text-gray-700">
      <button
        className={[
          "rounded-2xl px-4 py-2 transition",
          value === "log" ? "bg-white shadow-sm" : "text-gray-600",
        ].join(" ")}
        type="button"
        onClick={() => {
          const next = setParam(searchParams, "mode", "log");
          router.push(`${pathname}?${next.toString()}`);
        }}
      >
        Logique
      </button>
      <button
        className={[
          "rounded-2xl px-4 py-2 transition",
          value === "cum" ? "bg-white shadow-sm" : "text-gray-600",
        ].join(" ")}
        type="button"
        onClick={() => {
          const next = setParam(searchParams, "mode", "cum");
          router.push(`${pathname}?${next.toString()}`);
        }}
      >
        Cumulative
      </button>
    </div>
  );
}
