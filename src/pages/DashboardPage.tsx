import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  X,
  Loader2,
  MapPin,
  KeyRound,
  Globe2,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { DreamVacationIllustration } from "@/components/DreamVacationIllustration";
import { GlobeWeather } from "@/components/ui/cobe-globe-weather";
import { TripTokenBar } from "@/components/TripTokenBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  isAdmin,
  DEFAULT_TRIP,
  AVAILABILITY_WINDOW,
  MAX_WINDOW_DAYS,
  tripWindow,
} from "@/config/appConfig";
import { canonicalToken } from "@/lib/crypto";
import { formatWindowShort, daysBetween } from "@/lib/dates";
import { db, type Trip } from "@/lib/db";

export function DashboardPage() {
  const { user, canSeeTrip, unlockTrip } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [winStart, setWinStart] = useState<string>(AVAILABILITY_WINDOW.start);
  const [winEnd, setWinEnd] = useState<string>(AVAILABILITY_WINDOW.end);
  const [createError, setCreateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [joinMsg, setJoinMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const admin = isAdmin(user?.name);

  useEffect(() => db.subscribeTrips(setTrips), []);

  const visibleTrips = useMemo(
    () => trips.filter((t) => canSeeTrip(t.id)),
    [trips, canSeeTrip]
  );

  function resetCreateForm() {
    setNewName("");
    setWinStart(AVAILABILITY_WINDOW.start);
    setWinEnd(AVAILABILITY_WINDOW.end);
    setCreateError(null);
  }

  function openCreate() {
    resetCreateForm();
    setCreating(true);
  }

  function cancelCreate() {
    resetCreateForm();
    setCreating(false);
  }

  async function createTrip() {
    const name = newName.trim();
    if (!name || !user) return;
    setCreateError(null);
    if (!winStart || !winEnd) {
      setCreateError("Choisis une date de début et de fin.");
      return;
    }
    if (winEnd < winStart) {
      setCreateError("La date de fin doit suivre la date de début.");
      return;
    }
    if (daysBetween(winStart, winEnd) > MAX_WINDOW_DAYS) {
      setCreateError("La période est trop longue (1 an maximum).");
      return;
    }
    setSaving(true);
    try {
      await db.createTrip(name, user.name, winStart, winEnd);
      resetCreateForm();
      setCreating(false);
    } finally {
      setSaving(false);
    }
  }

  async function joinByToken(e: FormEvent) {
    e.preventDefault();
    const canon = canonicalToken(tokenInput);
    if (!canon) {
      setJoinMsg({ ok: false, text: "Format de token invalide." });
      return;
    }
    const match = trips.find((t) => t.token === canon);
    if (!match) {
      setJoinMsg({ ok: false, text: "Aucun voyage ne correspond à ce token." });
      return;
    }
    await unlockTrip(match.id);
    setTokenInput("");
    setJoinMsg({ ok: true, text: `Voyage « ${match.name} » ajouté ✅` });
  }

  return (
    <AppLayout>
      {/* Decorative travel globe behind the page — auto-rotating, non-interactive */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <div className="w-[min(92vw,720px)] translate-y-6 opacity-70 sm:opacity-[0.78]">
          <GlobeWeather speed={0.0022} />
        </div>
      </div>

      <div className="relative z-10 reveal reveal-1">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-coral">
              Bonjour {user?.name} 👋
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">
              Nos voyages
            </h1>
            <p className="mt-1 text-ink-soft">
              Choisis un voyage à planifier avec la bande.
            </p>
          </div>
          {admin && !creating && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Nouveau voyage
            </Button>
          )}
        </div>

        {admin && creating && (
          <div className="mt-6 rounded-2xl border border-linen bg-white/70 p-4 backdrop-blur">
            <div className="flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-soft">
                  Nom du voyage
                </span>
                <Input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createTrip();
                  }}
                  placeholder="Ex. Roadtrip Italie"
                  className="w-56"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-soft">
                  Du
                </span>
                <Input
                  type="date"
                  value={winStart}
                  onChange={(e) => {
                    setWinStart(e.target.value);
                    setCreateError(null);
                  }}
                  className="w-40"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-soft">
                  Au
                </span>
                <Input
                  type="date"
                  value={winEnd}
                  min={winStart}
                  onChange={(e) => {
                    setWinEnd(e.target.value);
                    setCreateError(null);
                  }}
                  className="w-40"
                />
              </label>
              <Button onClick={createTrip} disabled={saving || !newName.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
              </Button>
              <Button variant="ghost" onClick={cancelCreate}>
                <X className="h-4 w-4" /> Annuler
              </Button>
            </div>
            {createError && (
              <p className="mt-2 text-sm text-coral">{createError}</p>
            )}
            <p className="mt-2 text-xs text-ink-soft">
              La fenêtre de dates sur laquelle la bande renseignera ses
              disponibilités.
            </p>
          </div>
        )}

        {/* Join a trip with a token */}
        <form
          onSubmit={joinByToken}
          className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-linen bg-white/70 p-3 backdrop-blur"
        >
          <span className="flex items-center gap-1.5 pl-1 text-sm font-medium text-ink-soft">
            <KeyRound className="h-4 w-4 text-azure" /> Rejoindre un voyage
          </span>
          <Input
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setJoinMsg(null);
            }}
            placeholder="Token (ex. K7P2-9RMB)"
            className="max-w-[12rem] font-mono uppercase tracking-wider"
          />
          <Button type="submit" variant="outline" disabled={!tokenInput.trim()}>
            Rejoindre
          </Button>
          {joinMsg && (
            <span
              className={`text-sm ${joinMsg.ok ? "text-emerald-600" : "text-coral"}`}
            >
              {joinMsg.text}
            </span>
          )}
        </form>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTrips.map((trip, i) => {
            const isDefault = trip.id === DEFAULT_TRIP.id;
            return (
              <div
                key={trip.id}
                className={`reveal reveal-${Math.min(i + 1, 4)} group flex flex-col overflow-hidden rounded-3xl border border-linen bg-card shadow-lg shadow-azure/5 transition-transform duration-300 hover:-translate-y-1`}
              >
                <Link to={`/trip/${trip.id}`} className="block">
                  <div className="relative h-36 overflow-hidden">
                    {isDefault ? (
                      <DreamVacationIllustration />
                    ) : (
                      <div className="relative h-full w-full bg-gradient-to-br from-azure via-[#3aa7db] to-gold">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgba(255,255,255,0.5),transparent_55%)]" />
                        <MapPin className="absolute bottom-3 left-4 h-7 w-7 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
                      <CalendarDays className="mr-1 inline h-3.5 w-3.5" />{" "}
                      {formatWindowShort(
                        tripWindow(trip).start,
                        tripWindow(trip).end
                      )}
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-bold text-ink group-hover:text-azure">
                      {trip.name}
                    </h3>
                  </div>
                </Link>

                {/* Admin: token to share (or "public" for the default trip) */}
                {admin &&
                  (isDefault ? (
                    <div className="flex items-center gap-1.5 border-t border-linen bg-azure/5 px-4 py-3 text-xs font-medium text-ink-soft">
                      <Globe2 className="h-3.5 w-3.5 text-azure" /> Public —
                      visible par tous
                    </div>
                  ) : trip.token ? (
                    <TripTokenBar token={trip.token} tripId={trip.id} />
                  ) : null)}
              </div>
            );
          })}
        </div>

        {visibleTrips.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-linen bg-white/40 p-10 text-center text-ink-soft">
            Aucun voyage visible. Entre un token ci-dessus pour rejoindre un
            voyage 🔑
          </div>
        )}
      </div>
    </AppLayout>
  );
}
