import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_NAME,
  ADMIN_PASSWORD_HASH,
  DEFAULT_TRIP,
  GUEST_PASSWORD_HASH,
  isGuestName,
  type GuestName,
  type Role,
  type UserName,
} from "@/config/appConfig";
import { sha256 } from "@/lib/crypto";
import { db } from "@/lib/db";

export interface AuthUser {
  name: UserName;
  role: Role;
}

/** Transient onboarding state for a guest between login and dashboard. */
export interface Onboarding {
  stage: "select-name" | "change-password";
  name?: GuestName;
}

export type LoginResult =
  | { ok: true; next: "dashboard" | "select-name" }
  | { ok: false; error: string };

interface AuthContextValue {
  user: AuthUser | null;
  onboarding: Onboarding | null;
  ready: boolean;
  /** Trip ids this user has unlocked with a share token. */
  unlockedTrips: string[];
  /** True once the unlocked-trips list has loaded (avoids access flicker). */
  accessReady: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  selectGuestName: (name: GuestName) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  /** Whether the current user may see a given trip. */
  canSeeTrip: (tripId: string) => boolean;
  /** Persist that the user unlocked a trip (adds it to their list). */
  unlockTrip: (tripId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "vac:session";
const ONBOARDING_KEY = "vac:onboarding";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [ready, setReady] = useState(false);
  const [unlockedTrips, setUnlockedTrips] = useState<string[]>([]);
  const [accessReady, setAccessReady] = useState(true);

  // Keep the user's unlocked-trips list live from their record.
  useEffect(() => {
    if (!user) {
      setUnlockedTrips([]);
      setAccessReady(true);
      return;
    }
    setAccessReady(false);
    return db.subscribeUser(user.name, (record) => {
      setUnlockedTrips(record?.unlockedTrips ?? []);
      setAccessReady(true);
    });
  }, [user?.name]);

  function canSeeTrip(tripId: string): boolean {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (tripId === DEFAULT_TRIP.id) return true; // default trip stays public
    return unlockedTrips.includes(tripId);
  }

  async function unlockTrip(tripId: string): Promise<void> {
    if (!user) return;
    await db.unlockTrip(user.name, tripId);
    setUnlockedTrips((prev) =>
      prev.includes(tripId) ? prev : [...prev, tripId]
    );
  }

  // Restore any persisted session on load.
  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setUser(JSON.parse(s));
      const o = sessionStorage.getItem(ONBOARDING_KEY);
      if (o) setOnboarding(JSON.parse(o));
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  function persistUser(next: AuthUser | null) {
    setUser(next);
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  }

  function persistOnboarding(next: Onboarding | null) {
    setOnboarding(next);
    if (next) sessionStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(ONBOARDING_KEY);
  }

  async function login(username: string, password: string): Promise<LoginResult> {
    const name = username.trim();
    const hash = await sha256(password);

    // 1. Admin — whoever holds the admin password is Coco; no password change.
    if (hash === ADMIN_PASSWORD_HASH) {
      await db.ensureUser(ADMIN_NAME, "admin");
      persistOnboarding(null);
      persistUser({ name: ADMIN_NAME, role: "admin" });
      return { ok: true, next: "dashboard" };
    }

    // 2. Returning guest — their own name + personal password.
    if (isGuestName(name)) {
      const record = await db.getUser(name);
      if (record?.hasCustomPassword && record.passwordHash === hash) {
        persistOnboarding(null);
        persistUser({ name, role: "guest" });
        return { ok: true, next: "dashboard" };
      }
    }

    // 3. First-time guest — shared guest password, then choose a name.
    if (hash === GUEST_PASSWORD_HASH) {
      persistUser(null);
      persistOnboarding({ stage: "select-name" });
      return { ok: true, next: "select-name" };
    }

    return { ok: false, error: "Nom ou mot de passe incorrect." };
  }

  async function selectGuestName(name: GuestName): Promise<void> {
    await db.ensureUser(name, "guest");
    persistOnboarding({ stage: "change-password", name });
  }

  async function changePassword(newPassword: string): Promise<void> {
    const name = onboarding?.name;
    if (!name) throw new Error("Aucun invité sélectionné.");
    const hash = await sha256(newPassword);
    await db.setUserPassword(name, hash);
    persistOnboarding(null);
    persistUser({ name, role: "guest" });
  }

  function logout() {
    persistOnboarding(null);
    persistUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      onboarding,
      ready,
      unlockedTrips,
      accessReady,
      login,
      selectGuestName,
      changePassword,
      logout,
      canSeeTrip,
      unlockTrip,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, onboarding, ready, unlockedTrips, accessReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
