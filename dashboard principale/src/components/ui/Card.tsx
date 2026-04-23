import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl bg-white shadow-card ring-1 ring-black/5",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {children}
    </div>
  );
}
