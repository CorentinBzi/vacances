import { useMemo } from "react";
import { Trophy, Users } from "lucide-react";
import { MonthCalendar, DayNumber } from "./MonthCalendar";
import { AVAILABILITY_WINDOW } from "@/config/appConfig";
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
  if (submitted === 0) return "bg-slate-100 text-slate-400";
  const ratio = availableCount / submitted;
  if (ratio === 1) return "bg-emerald-500 text-white ring-1 ring-emerald-600";
  if (ratio >= 0.75) return "bg-emerald-200 text-emerald-800";
  if (ratio >= 0.5) return "bg-amber-200 text-amber-800";
  if (ratio > 0) return "bg-orange-200 text-orange-800";
  return "bg-rose-200 text-rose-800";
}

export function AvailabilityHeatmap({ rows }: { rows: AvailabilityRow[] }) {
  const days = useMemo(
    () => enumerateDays(AVAILABILITY_WINDOW.start, AVAILABILITY_WINDOW.end),
    []
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
      <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <div className="flex items-center gap-2 font-semibold text-emerald-800">
          <Trophy className="h-5 w-5" /> Meilleures fenêtres (tout le monde
          dispo)
        </div>
        {submittedCount === 0 ? (
          <p className="mt-2 text-sm text-emerald-700/80">
            Personne n'a encore renseigné ses disponibilités.
          </p>
        ) : bestWindows.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-700/80">
            Aucune date ne convient à tout le monde pour l'instant — vise les
            jours les plus verts ci-dessous.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {bestWindows.map((w) => (
              <span
                key={w.start}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-200"
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
      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> {submittedCount} participant(s)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-emerald-500" /> Tous dispo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-amber-200" /> Moitié
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-rose-200" /> Peu / pas dispo
        </span>
      </div>
    </div>
  );
}
