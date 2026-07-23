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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Météo…
      </span>
    );
  }

  if (!estimate) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-400">
        Météo indispo
      </span>
    );
  }

  if (compact) {
    return (
      <span
        title={`${estimate.label} · pluie ~${estimate.precipMm} mm/j`}
        className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700"
      >
        {estimate.emoji} {estimate.tempMax}° / {estimate.tempMin}°
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-sky-100 to-cyan-50 px-3 py-2 ring-1 ring-sky-200">
      <span className="text-2xl">{estimate.emoji}</span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-slate-800">
          {estimate.tempMax}° / {estimate.tempMin}°C
        </div>
        <div className="text-xs text-slate-500">
          {estimate.label} · ~{estimate.precipMm} mm pluie/j
        </div>
      </div>
    </div>
  );
}
