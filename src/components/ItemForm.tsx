import { useState } from "react";
import { LinkIcon, Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { ITEM_TYPE_LIST, suggestBookingUrl } from "@/lib/items";
import { AVAILABILITY_WINDOW } from "@/config/appConfig";
import { randomId } from "@/lib/crypto";
import type { ItemType, ProposalItem } from "@/lib/db";
import { cn } from "@/lib/utils";

const MIN_DT = `${AVAILABILITY_WINDOW.start}T00:00`;
const MAX_DT = `${AVAILABILITY_WINDOW.end}T23:59`;

const emptyDraft = () => ({
  type: "activity" as ItemType,
  title: "",
  description: "",
  location: "",
  lat: undefined as number | undefined,
  lon: undefined as number | undefined,
  startDateTime: "",
  endDateTime: "",
  bookingUrl: "",
  cost: "",
});

/** Compact builder for a single trip element; calls onAdd then resets. */
export function ItemForm({
  destinationName,
  onAdd,
}: {
  destinationName: string;
  onAdd: (item: ProposalItem) => void;
}) {
  const [draft, setDraft] = useState(emptyDraft());
  const [bookingTouched, setBookingTouched] = useState(false);

  function set<K extends keyof ReturnType<typeof emptyDraft>>(
    key: K,
    val: ReturnType<typeof emptyDraft>[K]
  ) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  const suggestedBooking = suggestBookingUrl(
    draft.type,
    draft.location || draft.title,
    destinationName
  );

  function add() {
    if (!draft.title.trim()) return;
    const item: ProposalItem = {
      id: randomId("item"),
      type: draft.type,
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      location: draft.location.trim() || undefined,
      lat: draft.lat,
      lon: draft.lon,
      startDateTime: draft.startDateTime || undefined,
      endDateTime: draft.endDateTime || undefined,
      bookingUrl: (bookingTouched ? draft.bookingUrl : suggestedBooking) || undefined,
      cost: draft.cost ? Number(draft.cost) : undefined,
    };
    onAdd(item);
    setDraft(emptyDraft());
    setBookingTouched(false);
  }

  return (
    <div className="rounded-2xl border border-linen bg-white/80 p-4">
      {/* Type chips */}
      <div className="flex flex-wrap gap-2">
        {ITEM_TYPE_LIST.map((meta) => {
          const active = draft.type === meta.type;
          const Icon = meta.icon;
          return (
            <button
              key={meta.type}
              type="button"
              onClick={() => set("type", meta.type)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition",
                active
                  ? "bg-ink text-white ring-ink"
                  : cn(meta.color, meta.ring, "hover:brightness-95")
              )}
            >
              <Icon className="h-4 w-4" /> {meta.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Titre de l'étape *
          </span>
          <Input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex. Vol Paris → Lisbonne, Airbnb centre, Surf…"
          />
        </label>

        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Lieu (optionnel)
          </span>
          <PlaceSearchInput
            value={draft.location}
            placeholder="Adresse, quartier, aéroport…"
            onSelect={(p) => {
              set("location", p.displayName);
              set("lat", p.lat);
              set("lon", p.lon);
            }}
            onClear={() => {
              set("location", "");
              set("lat", undefined);
              set("lon", undefined);
            }}
          />
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Début
          </span>
          <Input
            type="datetime-local"
            min={MIN_DT}
            max={MAX_DT}
            value={draft.startDateTime}
            onChange={(e) => set("startDateTime", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Fin (optionnel)
          </span>
          <Input
            type="datetime-local"
            min={draft.startDateTime || MIN_DT}
            max={MAX_DT}
            value={draft.endDateTime}
            onChange={(e) => set("endDateTime", e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Coût estimé (€, optionnel)
          </span>
          <Input
            type="number"
            min="0"
            value={draft.cost}
            onChange={(e) => set("cost", e.target.value)}
            placeholder="Ex. 120"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Lien de réservation
          </span>
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
            <Input
              value={bookingTouched ? draft.bookingUrl : suggestedBooking}
              onChange={(e) => {
                setBookingTouched(true);
                set("bookingUrl", e.target.value);
              }}
              placeholder="https://…"
              className="pl-9"
            />
          </div>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Note (optionnel)
          </span>
          <Input
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Détail, référence, remarque…"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-ink-soft">
          <Sparkles className="h-3.5 w-3.5" /> Le lien est pré-rempli selon le
          type — tu peux le remplacer.
        </span>
        <Button type="button" onClick={add} disabled={!draft.title.trim()}>
          <Plus className="h-4 w-4" /> Ajouter l'étape
        </Button>
      </div>
    </div>
  );
}
