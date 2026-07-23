// Place search & geocoding via OpenStreetMap Nominatim (free, no key).
// Please keep requests light (the UI debounces); Nominatim asks for <1 req/s.

export interface PlaceResult {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  country?: string;
  type?: string;
  category?: string;
}

interface NominatimItem {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
  addresstype?: string;
  address?: { country?: string };
}

export async function searchPlaces(
  query: string,
  opts: { limit?: number; signal?: AbortSignal } = {}
): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&q=${encodeURIComponent(q)}&limit=${opts.limit ?? 6}` +
    `&addressdetails=1&accept-language=fr`;

  const res = await fetch(url, {
    signal: opts.signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  const data = (await res.json()) as NominatimItem[];

  return data.map((it) => ({
    id: String(it.place_id),
    name: it.name || it.display_name.split(",")[0],
    displayName: it.display_name,
    lat: Number(it.lat),
    lon: Number(it.lon),
    country: it.address?.country,
    type: it.type || it.addresstype,
    category: it.category,
  }));
}
