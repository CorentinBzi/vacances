import { useMemo, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, X } from "lucide-react";
import { AVAILABILITY_WINDOW } from "@/config/appConfig";
import {
  enumerateDays,
  formatDayNumber,
  formatLongDate,
  groupIntoMonths,
  WEEKDAY_LABELS,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * Glassy start→end date picker constrained to the planning window.
 * Selected endpoints get the coral→gold "sunset" pill; nights in between glow
 * azure. Replaces the OS-native date inputs so the calendar matches the app.
 */
export function DateRangePicker({
  start,
  end,
  onChange,
}: {
  start?: string;
  end?: string;
  onChange: (start?: string, end?: string) => void;
}) {
  const months = useMemo(
    () =>
      groupIntoMonths(
        enumerateDays(AVAILABILITY_WINDOW.start, AVAILABILITY_WINDOW.end)
      ),
    []
  );
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(() => {
    const i = months.findIndex((m) => start && start.startsWith(m.key));
    return i >= 0 ? i : 0;
  });

  const month = months[index];
  const nights =
    start && end
      ? Math.round(
          (new Date(end + "T00:00:00Z").getTime() -
            new Date(start + "T00:00:00Z").getTime()) /
            86_400_000
        )
      : null;

  function pick(iso: string) {
    if (!start || (start && end)) {
      onChange(iso, undefined);
    } else if (iso < start) {
      onChange(iso, undefined);
    } else {
      onChange(start, iso);
    }
  }

  function dayClass(iso: string): string {
    const base =
      "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition";
    if (iso === start || iso === end)
      return cn(
        base,
        "bg-gradient-to-br from-coral to-gold text-white shadow-sm shadow-coral/25"
      );
    if (start && end && iso > start && iso < end)
      return cn(base, "bg-azure/20 text-azure-deep");
    return cn(base, "text-ink hover:bg-azure/10");
  }

  const label =
    start && end
      ? `${formatLongDate(start)} → ${formatLongDate(end)}`
      : start
        ? `${formatLongDate(start)} → …`
        : "Choisir les dates";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-linen bg-white/90 px-4 text-left text-sm text-ink shadow-sm transition hover:border-azure"
      >
        <CalendarRange className="h-4 w-4 text-azure" />
        <span className={cn(!start && "text-ink-soft/60")}>{label}</span>
        {(start || end) && (
          <X
            className="ml-auto h-4 w-4 text-ink-soft/60 hover:text-coral"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined, undefined);
            }}
          />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[3.25rem] z-40 w-[320px] rounded-3xl border border-linen bg-white/95 p-4 shadow-2xl shadow-azure/10 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-lg font-bold text-ink">
              {month.label}
            </p>
            <div className="flex items-center gap-2">
              {nights !== null && nights > 0 && (
                <span className="text-xs font-medium text-ink-soft">
                  {nights} nuit{nights > 1 ? "s" : ""}
                </span>
              )}
              <button
                type="button"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="grid h-7 w-7 place-items-center rounded-full border border-linen text-ink-soft transition hover:border-azure disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={index === months.length - 1}
                onClick={() =>
                  setIndex((i) => Math.min(months.length - 1, i + 1))
                }
                className="grid h-7 w-7 place-items-center rounded-full border border-linen text-ink-soft transition hover:border-azure disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {month.cells.map((iso, i) =>
              iso ? (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pick(iso)}
                  className={dayClass(iso)}
                >
                  {formatDayNumber(iso)}
                </button>
              ) : (
                <div key={`pad-${i}`} className="h-9 w-9" />
              )
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onChange(undefined, undefined)}
              className="text-xs font-medium text-ink-soft hover:text-coral"
            >
              Effacer
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-azure px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-azure-deep"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
