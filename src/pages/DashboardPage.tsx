import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Plus, X, Loader2, MapPin } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { DreamVacationIllustration } from "@/components/DreamVacationIllustration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, DEFAULT_TRIP } from "@/config/appConfig";
import { db, type Trip } from "@/lib/db";

export function DashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const admin = isAdmin(user?.name);

  useEffect(() => db.subscribeTrips(setTrips), []);

  async function createTrip() {
    const name = newName.trim();
    if (!name || !user) return;
    setSaving(true);
    try {
      await db.createTrip(name, user.name);
      setNewName("");
      setCreating(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="reveal reveal-1">
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
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Nouveau voyage
            </Button>
          )}
        </div>

        {admin && creating && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-linen bg-white/70 p-4 backdrop-blur">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTrip()}
              placeholder="Nom du voyage (ex. Roadtrip Italie)"
              className="max-w-xs"
            />
            <Button onClick={createTrip} disabled={saving || !newName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
            </Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              <X className="h-4 w-4" /> Annuler
            </Button>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, i) => {
            const isDefault = trip.id === DEFAULT_TRIP.id;
            return (
              <Link
                key={trip.id}
                to={`/trip/${trip.id}`}
                className={`reveal reveal-${Math.min(i + 1, 4)} group flex flex-col overflow-hidden rounded-3xl border border-linen bg-card shadow-lg shadow-azure/5 transition-transform duration-300 hover:-translate-y-1`}
              >
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
                    <CalendarDays className="mr-1 inline h-3.5 w-3.5" /> Oct – Déc
                    2026
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-bold text-ink group-hover:text-azure">
                    {trip.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {trips.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-linen p-10 text-center text-ink-soft">
            Aucun voyage pour l'instant.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
