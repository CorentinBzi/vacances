import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck2,
  CalendarClock,
  Compass,
  Plus,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { AvailabilityPicker } from "@/components/calendar/AvailabilityPicker";
import { AvailabilityHeatmap } from "@/components/calendar/AvailabilityHeatmap";
import { ProposalCard } from "@/components/ProposalCard";
import { useAuth } from "@/context/AuthContext";
import { db, type Availability, type Proposal, type Trip } from "@/lib/db";

export function TripPage() {
  const { tripId = "" } = useParams();
  const { user } = useAuth();
  const userName = user?.name ?? "";

  const [trips, setTrips] = useState<Trip[]>([]);
  const [rows, setRows] = useState<Availability[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myAvail, setMyAvail] = useState<Availability | null>(null);
  const [loadedMine, setLoadedMine] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => db.subscribeTrips(setTrips), []);
  useEffect(() => db.subscribeAvailability(tripId, setRows), [tripId]);
  useEffect(() => db.subscribeProposals(tripId, setProposals), [tripId]);

  useEffect(() => {
    let alive = true;
    db.getAvailability(tripId, userName).then((a) => {
      if (alive) {
        setMyAvail(a);
        setLoadedMine(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [tripId, userName]);

  const trip = useMemo(
    () => trips.find((t) => t.id === tripId),
    [trips, tripId]
  );

  async function saveAvailability(dates: string[]) {
    setSaving(true);
    try {
      await db.setAvailability(tripId, userName, dates);
      setMyAvail({
        userName,
        unavailableDates: dates,
        submitted: true,
        updatedAt: Date.now(),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const needsAvailability = loadedMine && (!myAvail?.submitted || editing);

  // Merge my just-saved availability into the shared rows for immediate heatmap
  // feedback (covers the local backend and avoids a flash before the snapshot).
  const heatmapRows = useMemo(() => {
    const map = new Map(rows.map((r) => [r.userName, r]));
    if (myAvail?.submitted) map.set(userName, myAvail);
    return [...map.values()];
  }, [rows, myAvail, userName]);

  if (!loadedMine) {
    return (
      <AppLayout>
        <div className="animate-pulse py-20 text-center text-slate-400">
          Chargement du voyage…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout wide>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Tous les voyages
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-lagoon-600">
            <Compass className="h-4 w-4" /> Planification
          </p>
          <h1 className="font-display text-4xl font-bold text-slate-900">
            {trip?.name ?? "Voyage"}
          </h1>
        </div>
        {!needsAvailability && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              <CalendarClock className="h-4 w-4" /> Modifier mes dispos
            </Button>
            <Link to={`/trip/${tripId}/new`}>
              <Button>
                <Plus className="h-4 w-4" /> Proposer un voyage
              </Button>
            </Link>
          </div>
        )}
      </div>

      {needsAvailability ? (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lagoon-500/10 text-lagoon-600">
              <CalendarClock className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Tes indisponibilités
              </h2>
              <p className="text-sm text-slate-500">
                Mi-octobre → fin décembre 2026. Marque les jours où tu ne peux
                pas, on en déduit les meilleures dates pour tous.
              </p>
            </div>
          </div>
          <AvailabilityPicker
            initial={myAvail?.unavailableDates ?? []}
            saving={saving}
            onSubmit={saveAvailability}
          />
        </motion.section>
      ) : (
        <>
          {/* Aggregated availability */}
          <section className="mt-8 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg">
            <div className="mb-5 flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-emerald-600" />
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Calendrier des disponibilités
              </h2>
            </div>
            <AvailabilityHeatmap rows={heatmapRows} />
          </section>

          {/* Proposals */}
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-slate-900">
                <Sparkles className="h-5 w-5 text-sunset-500" /> Voyages proposés
              </h2>
              <Link to={`/trip/${tripId}/new`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" /> Proposer
                </Button>
              </Link>
            </div>

            {proposals.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
                <p className="text-slate-500">
                  Aucune proposition pour l'instant. Sois le premier à imaginer
                  l'aventure ! 🌍
                </p>
                <Link to={`/trip/${tripId}/new`} className="mt-4 inline-block">
                  <Button>
                    <Plus className="h-4 w-4" /> Créer une proposition
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {proposals.map((p) => (
                  <ProposalCard
                    key={p.id}
                    tripId={tripId}
                    proposal={p}
                    currentUser={userName}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}
