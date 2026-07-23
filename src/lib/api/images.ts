// Destination photos for the slideshow, via free/keyless sources:
//   1. Wikipedia REST summary (a strong lead image for well-known places)
//   2. Openverse (Creative-Commons image search, proxied thumbnails)
// Falls back gracefully to an empty list; the slideshow then shows gradients.

export interface DestinationImage {
  url: string;
  title?: string;
  source?: string;
}

// Reject infobox flags / coats of arms / logos that aren't travel photos.
const NON_PHOTO = /(flag|drapeau|coat.?of.?arms|blason|logo|seal|emblem|armoiries)/i;

async function fromWikipedia(query: string): Promise<DestinationImage[]> {
  try {
    const res = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query
      )}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const src = data?.originalimage?.source || data?.thumbnail?.source;
    if (!src || NON_PHOTO.test(src)) return [];
    return [{ url: src, title: data.title, source: "Wikipedia" }];
  } catch {
    return [];
  }
}

async function fromOpenverse(
  query: string,
  count: number
): Promise<DestinationImage[]> {
  try {
    const res = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
        query
      )}&page_size=${count}&mature=false&license_type=all`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results: unknown[] = data?.results ?? [];
    return results
      .map((r) => {
        const item = r as { thumbnail?: string; url?: string; title?: string };
        return {
          url: item.thumbnail || item.url || "",
          title: item.title,
          source: "Openverse",
        };
      })
      .filter((i) => i.url);
  } catch {
    return [];
  }
}

/** Combined, de-duplicated list of images for a destination. */
export async function getDestinationImages(
  destinationName: string,
  count = 6
): Promise<DestinationImage[]> {
  const [wiki, openverse] = await Promise.all([
    fromWikipedia(destinationName),
    fromOpenverse(`${destinationName} travel landscape`, count),
  ]);
  // Prefer real travel photos (Openverse) for the hero; Wikipedia as backup.
  const seen = new Set<string>();
  const all = [...openverse, ...wiki].filter((img) => {
    if (seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });
  return all.slice(0, count);
}
