import { GEMINI_PROXY_URL } from "@/config/appConfig";
import type { ItemType } from "@/lib/db";

// Talks to the Cloudflare Worker (never to Gemini directly — the key stays on
// the server). See worker/ for the proxy.

export interface SuggestedActivity {
  title: string;
  type: ItemType;
  description: string;
  estimatedCost?: number;
}

export const aiSuggestionsEnabled = GEMINI_PROXY_URL.length > 0;

const VALID_TYPES: ItemType[] = ["activity", "place", "food", "other"];

export async function suggestActivities(input: {
  destination: string;
  country?: string;
  startDate: string;
  endDate: string;
}): Promise<SuggestedActivity[]> {
  if (!GEMINI_PROXY_URL) throw new Error("Suggestions IA non configurées.");

  const res = await fetch(GEMINI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await res.json().catch(() => ({}))) as {
    activities?: unknown;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);

  const list = Array.isArray(data.activities) ? data.activities : [];
  return list
    .map((a) => a as Partial<SuggestedActivity>)
    .filter(
      (a): a is SuggestedActivity =>
        typeof a.title === "string" &&
        typeof a.description === "string" &&
        typeof a.type === "string" &&
        VALID_TYPES.includes(a.type as ItemType)
    );
}
