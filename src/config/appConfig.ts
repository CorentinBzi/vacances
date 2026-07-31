// Static application configuration shared across the app.
//
// SECURITY NOTE: this is a static site (GitHub Pages), so anything here ships to
// the browser. Passwords are stored as SHA-256 hashes so the plaintext is not in
// the bundle, but a determined visitor could still brute-force a weak password.
// This is "friends-level" access control, not real security — do not reuse these
// passwords anywhere sensitive.

export const ADMIN_NAME = "Coco" as const;

export const GUEST_NAMES = ["Julien", "Maël", "Willy", "Kev", "Rémi"] as const;

export type GuestName = (typeof GUEST_NAMES)[number];
export type UserName = typeof ADMIN_NAME | GuestName;

export type Role = "admin" | "guest";

// SHA-256 hashes of the shared entry passwords.
export const ADMIN_PASSWORD_HASH =
  "7f25961b3c0425d5c9c4d5f5a8d76cc825111232bedd4b04aeba67eca57b5bfd";
export const GUEST_PASSWORD_HASH =
  "b698b1a6410e93c8013bcd923ef8c9dea49f5cf54dad58bcd31f14536feb6ac9";

// The trip page that always exists. Admin can create additional ones.
export const DEFAULT_TRIP = {
  id: "dream-vacation-2026",
  name: "Dream Vacation 2026",
} as const;

// Default planning window (mid-October to end of December 2026, inclusive).
// Used for the default trip and as the fallback for trips without their own.
export const AVAILABILITY_WINDOW = {
  start: "2026-10-15",
  end: "2026-12-31",
} as const;

// Guard rail: a trip's chosen window can't be longer than this (keeps the
// availability calendars and day-stat computations reasonable).
export const MAX_WINDOW_DAYS = 366;

/**
 * Effective planning window for a trip. Falls back to AVAILABILITY_WINDOW when
 * the trip has no window of its own (legacy trips / not-yet-loaded). Takes a
 * structural param (not the Trip type) to avoid an import cycle with lib/db.
 */
export function tripWindow(
  trip?: { windowStart?: string; windowEnd?: string } | null
): { start: string; end: string } {
  return {
    start: trip?.windowStart ?? AVAILABILITY_WINDOW.start,
    end: trip?.windowEnd ?? AVAILABILITY_WINDOW.end,
  };
}

// URL of the Cloudflare Worker that proxies Gemini (activity suggestions).
// NOT a secret — just the Worker endpoint. Empty until deployed; the AI
// suggestions UI stays hidden until this is set. Fill after `wrangler deploy`
// (or via VITE_GEMINI_PROXY_URL at build time).
export const GEMINI_PROXY_URL =
  import.meta.env.VITE_GEMINI_PROXY_URL ||
  "https://vacances-gemini.corentinbzi.workers.dev";

export function isAdmin(name: string | null | undefined): boolean {
  return name === ADMIN_NAME;
}

export function isGuestName(name: string): name is GuestName {
  return (GUEST_NAMES as readonly string[]).includes(name);
}
