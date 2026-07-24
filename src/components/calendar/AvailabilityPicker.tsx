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
                "flex h-9 w-full items-center justify-center rounded-xl text-sm font-semibold transition",
                off
                  ? "bg-gradient-to-br from-coral to-gold text-white shadow-sm shadow-coral/25"
                  : "bg-azure/10 text-azure-deep hover:bg-azure/20"
              )}
              title={off ? "Indisponible — cliquer pour rendre dispo" : "Disponible — cliquer pour marquer indispo"}
            >
              <DayNumber iso={iso} />
            </button>
          );
        }}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
        <div className="flex items-center gap-4 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-azure/20 ring-1 ring-azure/30" />
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-gradient-to-br from-coral to-gold" />
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

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft/70">
        <CalendarX2 className="h-3.5 w-3.5" />
        Astuce : colore les jours où tu ne peux pas. Tu pourras modifier plus
        tard.
      </p>
    </div>
  );
}
