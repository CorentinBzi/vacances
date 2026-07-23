import { ExternalLink, MapPin, Clock, Wallet } from "lucide-react";
import { ITEM_TYPES } from "@/lib/items";
import type { ProposalItem } from "@/lib/db";

function fmt(dt?: string): string | null {
  if (!dt) return null;
  return new Date(dt).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Chronological itinerary; each element links out for booking. */
export function Timeline({ items }: { items: ProposalItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
        Aucune étape n'a été ajoutée à ce voyage.
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
      {items.map((item) => {
        const meta = ITEM_TYPES[item.type];
        const Icon = meta.icon;
        const start = fmt(item.startDateTime);
        const end = fmt(item.endDateTime);
        return (
          <li key={item.id} className="relative">
            <span
              className={`absolute -left-[2.05rem] grid h-8 w-8 place-items-center rounded-full ring-4 ring-white ${meta.color}`}
            >
              <Icon className="h-4 w-4" />
            </span>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                  <h4 className="mt-1.5 font-semibold text-slate-900">
                    {item.title}
                  </h4>
                </div>
                {item.cost != null && (
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-sm font-medium text-slate-600">
                    <Wallet className="h-3.5 w-3.5" /> {item.cost} €
                  </span>
                )}
              </div>

              {item.description && (
                <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                {start && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {start}
                    {end ? ` → ${end}` : ""}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="line-clamp-1 max-w-[16rem]">
                      {item.location}
                    </span>
                  </span>
                )}
              </div>

              {item.bookingUrl && (
                <a
                  href={item.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Réserver / voir
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
