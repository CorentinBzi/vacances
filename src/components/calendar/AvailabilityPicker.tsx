import { useMemo, useState } from "react";
import { CalendarX2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthCalendar, DayNumber } from "./MonthCalendar";
import { AVAILABILITY_WINDOW } from "@/config/appConfig";
import { enumerateDays, groupIntoMonths } from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * Lets a user mark the days they are NOT available during the window.
 * Click a day to toggle it. Everything not marked is treated as available.
 */
export function AvailabilityPicker({
  initial = [],
  saving = false,
  onSubmit,
}: {
  initial?: string[];
  saving?: boolean;
  onSubmit: (unavailableDates: string[]) => void;
}) {
  const days = useMemo(
    () => enumerateDays(AVAILABILITY_WINDOW.start, AVAILABILITY_WINDOW.end),
    []
  );
  const months = useMemo(() => groupIntoMonths(days), [days]);
  const [unavailable, setUnavailable] = useState<Set<string>>(
    () => new Set(initial)
  );

  function toggle(iso: string) {
    setUnavailable((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });
  }

  return (
    <div>
      <MonthCalendar
        months={months}
        renderDay={(iso) => {
          const off = unavailable.has(iso);
          return (
            <button
              type="button"
              onClick={() => toggle(iso)}
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition",
                off
                  ? "bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              )}
              title={off ? "Indisponible — cliquer pour rendre dispo" : "Disponible — cliquer pour marquer indispo"}
            >
              <DayNumber iso={iso} />
            </button>
          );
        }}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 ring-1 ring-slate-100">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-emerald-100 ring-1 ring-emerald-300" />
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-rose-500" />
            Indisponible ({unavailable.size})
          </span>
        </div>
        <Button
          onClick={() => onSubmit([...unavailable])}
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Valider mes disponibilités
            </>
          )}
        </Button>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <CalendarX2 className="h-3.5 w-3.5" />
        Astuce : marque en rouge les jours où tu ne peux pas. Tu pourras
        modifier plus tard.
      </p>
    </div>
  );
}
