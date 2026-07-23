import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Sparkles, X, Loader2, MapPin } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/config/appConfig";
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-lagoon-600">
              Bonjour {user?.name} 👋
            </p>
            <h1 className="font-display text-4xl font-bold text-slate-900">
              Nos voyages
            </h1>
            <p className="mt-1 text-slate-500">
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4"
          >
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
          </motion.div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/trip/${trip.id}`}
                className="group relative block overflow-hidden rounded-3xl border border-white/70 bg-white shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-lagoon-500 via-cyan-400 to-sunset-400">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-20%,rgba(255,255,255,0.5),transparent_50%)]" />
                  <Sparkles className="absolute right-4 top-4 h-6 w-6 text-white/80" />
                  <MapPin className="absolute bottom-3 left-4 h-7 w-7 text-white drop-shadow" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-slate-900 group-hover:text-lagoon-600">
                    {trip.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" /> Oct – Déc 2026
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            Aucun voyage pour l'instant.
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
