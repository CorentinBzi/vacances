import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getWeatherEstimate, type WeatherEstimate } from "@/lib/api/weather";

/** Shows the estimated typical weather for a destination during the period. */
export function WeatherBadge({
  lat,
  lon,
  startDate,
  endDate,
  compact = false,
}: {
  lat: number;
  lon: number;
  startDate?: string;
  endDate?: string;
  compact?: boolean;
}) {
  const [estimate, setEstimate] = useState<WeatherEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getWeatherEstimate(lat, lon, startDate, endDate).then((e) => {
      if (alive) {
        setEstimate(e);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [lat, lon, startDate, endDate]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-xs text-ink-soft/60">
        <Loader2 className="h-3 w-3 animate-spin" /> Météo…
      </span>
    );
  }

  if (!estimate) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-xs text-ink-soft/60">
        Météo indispo
      </span>
    );
  }

  if (compact) {
    return (
      <span
        title={`${estimate.label} · pluie ~${estimate.precipMm} mm/j`}
        className="inline-flex items-center gap-1 rounded-full bg-azure/10 px-2.5 py-1 text-xs font-medium text-azure-deep"
      >
        {estimate.emoji} {estimate.tempMax}° / {estimate.tempMin}°
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-azure/10 to-gold/10 px-3 py-2 ring-1 ring-azure/20">
      <span className="text-2xl">{estimate.emoji}</span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-ink">
          {estimate.tempMax}° / {estimate.tempMin}°C
        </div>
        <div className="text-xs text-ink-soft">
          {estimate.label} · ~{estimate.precipMm} mm pluie/j
        </div>
      </div>
    </div>
  );
}
