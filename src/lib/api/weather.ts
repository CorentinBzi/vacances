// Estimated weather for a destination & period, using Open-Meteo's free
// historical archive (no API key). Since the trip is in the future, we sample a
// representative recent year (same calendar days) to estimate typical weather.

const REPRESENTATIVE_YEAR = 2023;

export interface WeatherEstimate {
  tempMax: number;
  tempMin: number;
  precipMm: number;
  code: number;
  label: string;
  emoji: string;
}

interface ArchiveResponse {
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    weathercode?: number[];
  };
}

function mapYear(iso: string, year: number): string {
  return `${year}${iso.slice(4)}`;
}

function avg(nums: number[]): number {
  const valid = nums.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (valid.length === 0) return NaN;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function mode(nums: number[]): number {
  const counts = new Map<number, number>();
  let best = nums[0] ?? 0;
  let bestC = 0;
  for (const n of nums) {
    const c = (counts.get(n) ?? 0) + 1;
    counts.set(n, c);
    if (c > bestC) {
      bestC = c;
      best = n;
    }
  }
  return best;
}

// WMO weather code -> label + emoji (grouped).
export function describeWeatherCode(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "Ciel dégagé", emoji: "☀️" };
  if (code <= 2) return { label: "Peu nuageux", emoji: "🌤️" };
  if (code === 3) return { label: "Couvert", emoji: "☁️" };
  if (code <= 48) return { label: "Brouillard", emoji: "🌫️" };
  if (code <= 57) return { label: "Bruine", emoji: "🌦️" };
  if (code <= 67) return { label: "Pluie", emoji: "🌧️" };
  if (code <= 77) return { label: "Neige", emoji: "❄️" };
  if (code <= 82) return { label: "Averses", emoji: "🌧️" };
  if (code <= 86) return { label: "Averses de neige", emoji: "🌨️" };
  return { label: "Orage", emoji: "⛈️" };
}

const cache = new Map<string, WeatherEstimate | null>();

export async function getWeatherEstimate(
  lat: number,
  lon: number,
  startISO?: string,
  endISO?: string
): Promise<WeatherEstimate | null> {
  const start = mapYear(startISO ?? "2026-11-10", REPRESENTATIVE_YEAR);
  const end = mapYear(endISO ?? startISO ?? "2026-11-17", REPRESENTATIVE_YEAR);
  const key = `${lat.toFixed(2)},${lon.toFixed(2)},${start},${end}`;
  if (cache.has(key)) return cache.get(key)!;

  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}` +
    `&longitude=${lon}&start_date=${start}&end_date=${end}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ArchiveResponse;
    const d = data.daily;
    if (!d || !d.temperature_2m_max?.length) {
      cache.set(key, null);
      return null;
    }
    const code = mode(d.weathercode ?? [0]);
    const { label, emoji } = describeWeatherCode(code);
    const estimate: WeatherEstimate = {
      tempMax: Math.round(avg(d.temperature_2m_max ?? [])),
      tempMin: Math.round(avg(d.temperature_2m_min ?? [])),
      precipMm: Math.round(avg(d.precipitation_sum ?? [])),
      code,
      label,
      emoji,
    };
    cache.set(key, estimate);
    return estimate;
  } catch (err) {
    console.warn("weather estimate failed", err);
    cache.set(key, null);
    return null;
  }
}
