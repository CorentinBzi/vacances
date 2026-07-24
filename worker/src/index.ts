/**
 * Secure Gemini proxy (Cloudflare Worker).
 *
 * The site (static, public) can't safely hold the Gemini key, so it calls this
 * Worker instead. The key lives only here, as an encrypted secret. The Worker
 * restricts callers by Origin (CORS), validates input, and asks Gemini for a
 * short list of activities suited to a destination and travel dates.
 */

export interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  ALLOWED_ORIGINS: string;
}

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_BODY = 4_000; // bytes — the request is tiny; reject anything larger.

interface SuggestBody {
  destination?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
}

function pickOrigin(req: Request, env: Env): string {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  return allowed.includes(origin) ? origin : allowed[0] ?? "*";
}

function cors(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validate(body: SuggestBody): string | null {
  const dest = body.destination?.trim() ?? "";
  if (dest.length < 2 || dest.length > 120) return "Destination invalide.";
  if (!body.startDate || !ISO_DATE.test(body.startDate))
    return "Date de début invalide.";
  if (!body.endDate || !ISO_DATE.test(body.endDate))
    return "Date de fin invalide.";
  if (body.endDate < body.startDate)
    return "La date de fin précède la date de début.";
  return null;
}

const RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      type: {
        type: "STRING",
        enum: ["activity", "place", "food", "other"],
      },
      description: { type: "STRING" },
      estimatedCost: { type: "NUMBER" },
    },
    required: ["title", "type", "description"],
  },
};

function buildPrompt(body: SuggestBody): string {
  const where = body.country
    ? `${body.destination} (${body.country})`
    : body.destination;
  return [
    `Propose 6 idées d'activités variées et concrètes à faire à ${where}`,
    `pour un séjour du ${body.startDate} au ${body.endDate},`,
    `en tenant compte de la saison et de la météo probable à cette période.`,
    `Mélange les types : visites/lieux (place), activités (activity),`,
    `restaurants ou spécialités (food), et éventuellement autre (other).`,
    `Sois spécifique à la destination (lieux réels, quartiers, plats typiques),`,
    `évite les généralités. Descriptions courtes (une phrase).`,
    `estimatedCost = prix indicatif par personne en euros (0 si gratuit).`,
    `Réponds en français.`,
  ].join(" ");
}

async function callGemini(env: Env, prompt: string): Promise<unknown[]> {
  const res = await fetch(
    `${GEMINI_BASE}/${env.GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "Tu es un concierge de voyage. Réponds uniquement en JSON valide conforme au schéma.",
            },
          ],
        },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : [];
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = pickOrigin(req, env);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (req.method !== "POST") {
      return json({ error: "Méthode non autorisée." }, 405, origin);
    }
    if (!env.GEMINI_API_KEY) {
      return json({ error: "Proxy non configuré (clé manquante)." }, 500, origin);
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY) {
      return json({ error: "Requête trop volumineuse." }, 413, origin);
    }

    let body: SuggestBody;
    try {
      body = JSON.parse(raw) as SuggestBody;
    } catch {
      return json({ error: "JSON invalide." }, 400, origin);
    }

    const invalid = validate(body);
    if (invalid) return json({ error: invalid }, 400, origin);

    try {
      const activities = await callGemini(env, buildPrompt(body));
      return json({ activities }, 200, origin);
    } catch (err) {
      return json(
        { error: "Gemini indisponible.", detail: String(err).slice(0, 200) },
        502,
        origin
      );
    }
  },
};
