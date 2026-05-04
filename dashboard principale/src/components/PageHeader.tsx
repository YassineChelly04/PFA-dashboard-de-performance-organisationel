import { CalendarDays } from "lucide-react";

import { Button } from "./ui/Button";

export function PageHeader({
  kicker,
  title,
  secondaryActionLabel,
}: {
  kicker: string;
  title: string;
  primaryActionLabel?: string;
  secondaryActionLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-xs font-extrabold tracking-wider text-tt-blue">{kicker}</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-tt-navy md:text-4xl">
          {title}
        </h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button className="rounded-2xl" type="button" variant="secondary">
          <CalendarDays className="h-4 w-4" />
          {secondaryActionLabel}
        </Button>
      </div>
    </div>
  );
}
