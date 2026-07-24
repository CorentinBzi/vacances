// Destination photos for the slideshow, via free/keyless sources.
//
// Primary source: the images actually used on the destination's Wikipedia
// article (Wikimedia "media-list"), which are almost always relevant cityscapes
// and landmarks. Openverse is only a last-resort fallback because its broad
// Creative-Commons search often returns unrelated (or awkward) photos.

export interface DestinationImage {
  url: string;
  title?: string;
  source?: string;
}

const WIKI_LANGS = ["fr", "en"] as const;

// Reject flags, coats of arms, logos, maps, icons, diagrams — not travel photos.
const NON_PHOTO =
  /(flag|drapeau|coat.?of.?arms|blason|armoiries|logo|seal|emblem|icon|\bmap\b|carte|plan|localisation|location_map|orthographic|\.svg)/i;

function https(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

/** Resolve the canonical Wikipedia title + a hero image for a query. */
async function wikipediaSummary(
  lang: string,
  query: string
): Promise<{ title: string | null; hero: DestinationImage | null }> {
  try {
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query
      )}`
    );
    if (!res.ok) return { title: null, hero: null };
    const data = await res.json();
    const title: string | null = data?.titles?.canonical ?? data?.title ?? null;
    const src = data?.originalimage?.source || data?.thumbnail?.source;
    const hero =
      src && !NON_PHOTO.test(src)
        ? { url: src, title: data.title, source: "Wikipedia" }
        : null;
    return { title, hero };
  } catch {
    return { title: null, hero: null };
  }
}

interface MediaItem {
  type?: string;
  title?: string;
  srcset?: { src: string; scale?: string }[];
}

/** Photos used on a Wikipedia article — relevant to the place by construction. */
async function wikipediaMedia(
  lang: string,
  title: string,
  count: number
): Promise<DestinationImage[]> {
  try {
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(
        title
      )}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: MediaItem[] = data?.items ?? [];
    const out: DestinationImage[] = [];
    for (const it of items) {
      if (it.type !== "image" || !it.srcset?.length) continue;
      const best = it.srcset[it.srcset.length - 1]?.src;
      if (!best) continue;
      const url = https(best);
      if (NON_PHOTO.test(it.title || "") || NON_PHOTO.test(url)) continue;
      out.push({
        url,
        title: it.title?.replace(/^(File|Fichier):/, ""),
        source: "Wikipedia",
      });
      if (out.length >= count) break;
    }
    return out;
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
      )}&page_size=${count}&mature=false&category=photograph`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results: unknown[] = data?.results ?? [];
    return results
      .map((r) => {
        const item = r as { thumbnail?: string; url?: string; title?: string };
        return { url: item.thumbnail || item.url || "", title: item.title, source: "Openverse" };
      })
      .filter((i) => i.url);
  } catch {
    return [];
  }
}

/** Combined, de-duplicated list of relevant images for a destination. */
export async function getDestinationImages(
  destinationName: string,
  count = 6
): Promise<DestinationImage[]> {
  const collected: DestinationImage[] = [];

  // Try French then English Wikipedia: hero + article media.
  for (const lang of WIKI_LANGS) {
    const { title, hero } = await wikipediaSummary(lang, destinationName);
    if (hero) collected.push(hero);
    if (title) {
      const media = await wikipediaMedia(lang, title, count + 2);
      collected.push(...media);
    }
    if (collected.length >= count) break;
  }

  // Fallback only if Wikipedia yielded too little.
  if (collected.length < 2) {
    collected.push(
      ...(await fromOpenverse(`${destinationName} city`, count))
    );
  }

  const seen = new Set<string>();
  return collected
    .filter((img) => {
      if (!img.url || seen.has(img.url)) return false;
      seen.add(img.url);
      return true;
    })
    .slice(0, count);
}
