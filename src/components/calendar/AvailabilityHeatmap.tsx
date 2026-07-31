import { useMemo } from "react";
import { Trophy, Users } from "lucide-react";
import { MonthCalendar, DayNumber } from "./MonthCalendar";
import {
  computeDayStats,
  enumerateDays,
  findBestWindows,
  formatLongDate,
  groupIntoMonths,
  type AvailabilityRow,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

function heatClass(availableCount: number, submitted: number): string {
  if (submitted === 0) return "bg-white/50 text-ink-soft/50";
  const ratio = availableCount / submitted;
  if (ratio === 1)
    return "bg-gradient-to-br from-azure to-gold text-white shadow-sm shadow-azure/20";
  if (ratio >= 0.75) return "bg-azure/25 text-azure-deep";
  if (ratio >= 0.5) return "bg-gold/25 text-ink";
  if (ratio > 0) return "bg-coral/20 text-coral";
  return "bg-coral/25 text-coral";
}

export function AvailabilityHeatmap({
  rows,
  range,
}: {
  rows: AvailabilityRow[];
  range: { start: string; end: string };
}) {
  const days = useMemo(
    () => enumerateDays(range.start, range.end),
    [range.start, range.end]
  );
  const months = useMemo(() => groupIntoMonths(days), [days]);
  const { stats, submittedCount } = useMemo(
    () => computeDayStats(days, rows),
    [days, rows]
  );
  const bestWindows = useMemo(
    () => findBestWindows(days, stats),
    [days, stats]
  );

  return (
    <div>
      {/* Best windows */}
      <div className="mb-6 rounded-2xl border border-azure/20 bg-azure/5 p-4">
        <div className="flex items-center gap-2 font-display font-bold text-azure-deep">
          <Trophy className="h-5 w-5 text-gold" /> Meilleures fenêtres (tout le
          monde dispo)
        </div>
        {submittedCount === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            Personne n'a encore renseigné ses disponibilités.
          </p>
        ) : bestWindows.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            Aucune date ne convient à tout le monde pour l'instant — visez les
            jours les plus bleus ci-dessous.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {bestWindows.map((w) => (
              <span
                key={w.start}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-azure-deep shadow-sm ring-1 ring-azure/20"
              >
                {w.length === 1
                  ? formatLongDate(w.start)
                  : `${formatLongDate(w.start)} → ${formatLongDate(w.end)}`}{" "}
                · {w.length} j
              </span>
            ))}
          </div>
        )}
      </div>

      <MonthCalendar
        months={months}
        renderDay={(iso) => {
          const s = stats.get(iso);
          const count = s?.availableCount ?? 0;
          const tip =
            submittedCount === 0
              ? "Pas encore de données"
              : s && s.unavailableNames.length > 0
                ? `Indispo : ${s.unavailableNames.join(", ")}`
                : "Tout le monde est dispo ✅";
          return (
            <div
              title={`${formatLongDate(iso)} — ${count}/${submittedCount} dispo. ${tip}`}
              className={cn(
                "flex h-9 w-full cursor-default items-center justify-center rounded-lg text-sm font-medium transition",
                heatClass(count, submittedCount)
              )}
            >
              <DayNumber iso={iso} />
            </div>
          );
        }}
      />

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {submittedCount} participant(s)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-gradient-to-br from-azure to-gold" />{" "}
          Tous dispo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-gold/25" /> Moitié
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-coral/25" /> Peu / pas dispo
        </span>
      </div>
    </div>
  );
}
