import type { ReactNode } from "react";
import { formatDayNumber, WEEKDAY_LABELS, type MonthGrid } from "@/lib/dates";

/** Renders Monday-first month grids; each real day is drawn by `renderDay`. */
export function MonthCalendar({
  months,
  renderDay,
}: {
  months: MonthGrid[];
  renderDay: (iso: string) => ReactNode;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {months.map((month) => (
        <div key={month.key} className="rounded-2xl bg-white/70 p-4 ring-1 ring-slate-100">
          <h4 className="mb-3 text-center font-display text-lg font-semibold text-slate-800">
            {month.label}
          </h4>
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {month.cells.map((iso, i) =>
              iso ? (
                <div key={iso}>{renderDay(iso)}</div>
              ) : (
                <div key={`pad-${month.key}-${i}`} />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Small helper to render a day number consistently. */
export function DayNumber({ iso }: { iso: string }) {
  return <>{formatDayNumber(iso)}</>;
}
