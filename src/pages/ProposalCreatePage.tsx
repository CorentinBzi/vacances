import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  MapPinned,
  Trash2,
  Save,
  GripVertical,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { ItemForm } from "@/components/ItemForm";
import { useAuth } from "@/context/AuthContext";
import { AVAILABILITY_WINDOW } from "@/config/appConfig";
import { ITEM_TYPES } from "@/lib/items";
import { db, type Destination, type ProposalItem } from "@/lib/db";
import type { PlaceResult } from "@/lib/api/places";

function sortItems(items: ProposalItem[]): ProposalItem[] {
  return [...items].sort((a, b) => {
    if (!a.startDateTime) return 1;
    if (!b.startDateTime) return -1;
    return a.startDateTime.localeCompare(b.startDateTime);
  });
}

export function ProposalCreatePage() {
  const { tripId = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickDestination(p: PlaceResult) {
    setDestination({
      name: p.name,
      displayName: p.displayName,
      country: p.country,
      lat: p.lat,
      lon: p.lon,
    });
    if (!title) setTitle(`Escapade à ${p.name}`);
  }

  async function save() {
    setError(null);
    if (!destination) {
      setError("Choisis d'abord une destination.");
      return;
    }
    if (!title.trim()) {
      setError("Donne un titre à ta proposition.");
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      const proposal = await db.createProposal(tripId, {
        title: title.trim(),
        createdBy: user.name,
        destination,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        items: sortItems(items),
      });
      navigate(`/trip/${tripId}/proposal/${proposal.id}`, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Échec de l'enregistrement. Réessaie.");
    } finally {
      setSaving(false);
    }
  }

  const sorted = sortItems(items);
  const total = items.reduce((sum, it) => sum + (it.cost ?? 0), 0);

  return (
    <AppLayout>
      <Link
        to={`/trip/${tripId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au voyage
      </Link>

      <h1 className="font-display text-4xl font-bold text-slate-900">
        Proposer un voyage ✨
      </h1>
      <p className="mt-1 text-slate-500">
        Choisis une destination, ajoute les étapes (transport, logement,
        activités…) — ta proposition sera visible par toute la bande.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: builder */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-slate-900">
              <MapPinned className="h-5 w-5 text-lagoon-500" /> Destination
            </h2>
            <PlaceSearchInput
              value={destination?.name}
              placeholder="Ville, région ou pays de rêve…"
              onSelect={pickDestination}
              onClear={() => setDestination(null)}
            />
            {destination && (
              <p className="mt-2 text-xs text-slate-400">
                📍 {destination.displayName}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-slate-500">
                  Titre de la proposition
                </span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Roadtrip surf au Portugal"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">
                  Date de début
                </span>
                <Input
                  type="date"
                  min={AVAILABILITY_WINDOW.start}
                  max={AVAILABILITY_WINDOW.end}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">
                  Date de fin
                </span>
                <Input
                  type="date"
                  min={startDate || AVAILABILITY_WINDOW.start}
                  max={AVAILABILITY_WINDOW.end}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg">
            <h2 className="mb-4 font-display text-xl font-bold text-slate-900">
              Ajouter une étape
            </h2>
            <ItemForm
              destinationName={destination?.name ?? ""}
              onAdd={(item) => setItems((prev) => [...prev, item])}
            />
          </section>
        </div>

        {/* Right: itinerary preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Ton itinéraire
              </h2>
              <span className="text-sm text-slate-400">
                {items.length} étape(s)
              </span>
            </div>

            {sorted.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                Ajoute des étapes pour construire le voyage.
              </p>
            ) : (
              <ul className="space-y-2">
                {sorted.map((it) => {
                  const meta = ITEM_TYPES[it.type];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={it.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3"
                    >
                      <GripVertical className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {it.title}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {it.startDateTime
                            ? new Date(it.startDateTime).toLocaleString("fr-FR", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "Sans horaire"}
                          {it.cost ? ` · ${it.cost} €` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setItems((prev) => prev.filter((x) => x.id !== it.id))
                        }
                        className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {total > 0 && (
              <p className="mt-3 text-right text-sm font-semibold text-slate-600">
                Total estimé : {total} €
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}

            <Button
              onClick={save}
              disabled={saving}
              size="lg"
              className="mt-5 w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publication…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Publier la proposition
                </>
              )}
            </Button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
