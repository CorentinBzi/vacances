import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, MapPinned, Trash2, Save, GripVertical } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { DateRangePicker } from "@/components/calendar/DateRangePicker";
import { ItemForm } from "@/components/ItemForm";
import { AiActivitySuggestions } from "@/components/AiActivitySuggestions";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/config/appConfig";
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
  const { tripId = "", proposalId } = useParams();
  const isEdit = Boolean(proposalId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!isEdit);
  const initedRef = useRef(false);

  // Edit mode: load the existing proposal once, enforce ownership, pre-fill.
  useEffect(() => {
    if (!isEdit) return;
    return db.subscribeProposals(tripId, (list) => {
      if (initedRef.current) return;
      const p = list.find((x) => x.id === proposalId);
      if (!p) return;
      if (p.createdBy !== user?.name && !isAdmin(user?.name)) {
        navigate(`/trip/${tripId}/proposal/${proposalId}`, { replace: true });
        return;
      }
      initedRef.current = true;
      setDestination(p.destination);
      setTitle(p.title);
      setStartDate(p.startDate);
      setEndDate(p.endDate);
      setItems(p.items);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, tripId, proposalId, user?.name]);

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
      if (isEdit && proposalId) {
        await db.updateProposal(tripId, proposalId, {
          title: title.trim(),
          destination,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          items: sortItems(items),
        });
        navigate(`/trip/${tripId}/proposal/${proposalId}`, { replace: true });
      } else {
        const proposal = await db.createProposal(tripId, {
          title: title.trim(),
          createdBy: user.name,
          destination,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          items: sortItems(items),
        });
        navigate(`/trip/${tripId}/proposal/${proposal.id}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Échec de l'enregistrement. Réessaie.");
    } finally {
      setSaving(false);
    }
  }

  const sorted = sortItems(items);
  const total = items.reduce((sum, it) => sum + (it.cost ?? 0), 0);

  if (isEdit && !loaded) {
    return (
      <AppLayout>
        <div className="animate-pulse py-20 text-center text-ink-soft">
          Chargement de la proposition…
        </div>
      </AppLayout>
    );
  }

  const backTo = isEdit
    ? `/trip/${tripId}/proposal/${proposalId}`
    : `/trip/${tripId}`;

  return (
    <AppLayout>
      <Link
        to={backTo}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />{" "}
        {isEdit ? "Retour à la proposition" : "Retour au voyage"}
      </Link>

      <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">
        {isEdit ? "Édition" : "Nouvelle proposition"}
      </p>
      <h1 className="mt-1 font-display text-4xl font-extrabold text-ink">
        {isEdit ? "Modifier la proposition ✏️" : "Proposer un voyage ✨"}
      </h1>
      <p className="mt-1 text-ink-soft">
        Choisis une destination, ajoute les étapes (transport, logement,
        activités…) — ta proposition sera visible par toute la bande.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: builder */}
        <div className="space-y-6">
          <section className="relative z-30 rounded-3xl border border-linen bg-card/80 p-6 shadow-lg shadow-azure/5 backdrop-blur">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
              <MapPinned className="h-5 w-5 text-azure" /> Destination
            </h2>
            <PlaceSearchInput
              value={destination?.name}
              placeholder="Ville, région ou pays de rêve…"
              onSelect={pickDestination}
              onClear={() => setDestination(null)}
            />
            {destination && (
              <p className="mt-2 text-xs text-ink-soft">
                📍 {destination.displayName}
              </p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-ink-soft">
                  Titre de la proposition
                </span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Roadtrip surf au Portugal"
                />
              </label>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-ink-soft">
                  Dates du voyage (optionnel)
                </span>
                <DateRangePicker
                  start={startDate}
                  end={endDate}
                  onChange={(s, e) => {
                    setStartDate(s);
                    setEndDate(e);
                  }}
                />
              </div>
            </div>
          </section>

          <AiActivitySuggestions
            destination={destination}
            startDate={startDate}
            endDate={endDate}
            onAdd={(item) => setItems((prev) => [...prev, item])}
          />

          <section className="rounded-3xl border border-linen bg-card/80 p-6 shadow-lg shadow-azure/5 backdrop-blur">
            <h2 className="mb-4 font-display text-xl font-bold text-ink">
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
          <section className="rounded-3xl border border-linen bg-card/80 p-6 shadow-lg shadow-azure/5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink">
                Ton itinéraire
              </h2>
              <span className="text-sm text-ink-soft">
                {items.length} étape(s)
              </span>
            </div>

            {sorted.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-linen p-8 text-center text-sm text-ink-soft">
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
                      className="flex items-start gap-3 rounded-xl border border-linen bg-white p-3"
                    >
                      <GripVertical className="mt-1 h-4 w-4 shrink-0 text-ink-soft/40" />
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {it.title}
                        </p>
                        <p className="truncate text-xs text-ink-soft">
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
                        className="rounded-lg p-1 text-ink-soft/60 hover:bg-coral/10 hover:text-coral"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {total > 0 && (
              <p className="mt-3 text-right text-sm font-semibold text-ink">
                Total estimé : {total} €
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral">
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
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {isEdit ? "Enregistrement…" : "Publication…"}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />{" "}
                  {isEdit ? "Enregistrer les modifications" : "Publier la proposition"}
                </>
              )}
            </Button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
