import type { ReactNode } from "react";
import { formatDayNumber, WEEKDAY_LABELS, type MonthGrid } from "@/lib/dates";

/** Renders Monday-first month grids as frosted cards; `renderDay` draws each day. */
export function MonthCalendar({
  months,
  renderDay,
}: {
  months: MonthGrid[];
  renderDay: (iso: string) => ReactNode;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {months.map((month) => (
        <div
          key={month.key}
          className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur"
        >
          <h4 className="mb-3 text-center font-display text-lg font-bold text-ink">
            {month.label}
          </h4>
          <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
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
