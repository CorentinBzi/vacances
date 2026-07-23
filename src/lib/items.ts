import {
  Plane,
  BedDouble,
  Ticket,
  MapPin,
  UtensilsCrossed,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ItemType } from "@/lib/db";

export interface ItemTypeMeta {
  type: ItemType;
  label: string;
  icon: LucideIcon;
  color: string; // tailwind text/bg accent
  ring: string;
  emoji: string;
}

export const ITEM_TYPES: Record<ItemType, ItemTypeMeta> = {
  transport: {
    type: "transport",
    label: "Transport",
    icon: Plane,
    color: "text-sky-600 bg-sky-50",
    ring: "ring-sky-200",
    emoji: "✈️",
  },
  lodging: {
    type: "lodging",
    label: "Logement",
    icon: BedDouble,
    color: "text-violet-600 bg-violet-50",
    ring: "ring-violet-200",
    emoji: "🏨",
  },
  activity: {
    type: "activity",
    label: "Activité",
    icon: Ticket,
    color: "text-emerald-600 bg-emerald-50",
    ring: "ring-emerald-200",
    emoji: "🎟️",
  },
  place: {
    type: "place",
    label: "Lieu / Visite",
    icon: MapPin,
    color: "text-rose-600 bg-rose-50",
    ring: "ring-rose-200",
    emoji: "📍",
  },
  food: {
    type: "food",
    label: "Restaurant",
    icon: UtensilsCrossed,
    color: "text-amber-600 bg-amber-50",
    ring: "ring-amber-200",
    emoji: "🍽️",
  },
  other: {
    type: "other",
    label: "Autre",
    icon: Sparkles,
    color: "text-slate-600 bg-slate-50",
    ring: "ring-slate-200",
    emoji: "✨",
  },
};

export const ITEM_TYPE_LIST = Object.values(ITEM_TYPES);

/** Suggest a sensible booking/search URL for an item, so users can reserve. */
export function suggestBookingUrl(
  type: ItemType,
  query: string,
  destination?: string
): string {
  const q = encodeURIComponent(query || destination || "");
  const dest = encodeURIComponent(destination || query || "");
  switch (type) {
    case "transport":
      return `https://www.google.com/travel/flights?q=${q}`;
    case "lodging":
      return `https://www.booking.com/searchresults.html?ss=${q}`;
    case "activity":
      return `https://www.getyourguide.com/s/?q=${q}`;
    case "food":
      return `https://www.google.com/maps/search/?api=1&query=${q}`;
    case "place":
    default:
      return `https://www.google.com/maps/search/?api=1&query=${q || dest}`;
  }
}
