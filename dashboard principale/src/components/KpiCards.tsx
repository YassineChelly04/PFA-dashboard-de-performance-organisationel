import type { ReactNode } from "react";

import { Card } from "./ui/Card";

export function KpiTopBorderCard({
  title,
  value,
  footer,
  topColor,
  rightSlot,
}: {
  title: string;
  value: ReactNode;
  footer?: ReactNode;
  topColor: "blue" | "green" | "red" | "gray";
  rightSlot?: ReactNode;
}) {
  const border =
    topColor === "blue"
      ? "border-t-blue-600"
      : topColor === "green"
        ? "border-t-emerald-500"
        : topColor === "red"
          ? "border-t-rose-500"
          : "border-t-gray-400";

  return (
    <Card className={`border-t-4 ${border} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-wider text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{value}</div>
        </div>
        {rightSlot}
      </div>
      {footer ? <div className="mt-3 text-xs text-gray-500">{footer}</div> : null}
    </Card>
  );
}
