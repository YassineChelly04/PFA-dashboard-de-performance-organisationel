import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "bad" | "info";
}) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : tone === "bad"
        ? "bg-rose-50 text-rose-700 ring-rose-100"
        : tone === "info"
          ? "bg-sky-50 text-sky-800 ring-sky-100"
          : "bg-gray-50 text-gray-700 ring-gray-100";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneClass,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
