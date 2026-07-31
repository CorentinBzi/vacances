// SHA-256 hashing via the Web Crypto API (available in any secure context:
// https:// and localhost). Used to avoid storing plaintext passwords.

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Short, URL-safe random id. */
export function randomId(prefix = ""): string {
  const rnd =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return prefix ? `${prefix}_${rnd}` : rnd;
}

// Human-friendly share token: 8 chars from an unambiguous alphabet (no O/0,
// I/1/L), grouped as XXXX-XXXX. ~31^8 combinations — plenty for a friend group.
const TOKEN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function genToken(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(
    bytes,
    (b) => TOKEN_ALPHABET[b % TOKEN_ALPHABET.length]
  );
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}`;
}

/** Normalise user-typed tokens (case, spaces, dashes) for comparison. */
export function normalizeToken(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, "");
}

/** Turn raw user/URL input into the canonical "XXXX-XXXX" form, or null. */
export function canonicalToken(input: string): string | null {
  const n = normalizeToken(input);
  if (n.length !== 8) return null;
  return `${n.slice(0, 4)}-${n.slice(4)}`;
}
