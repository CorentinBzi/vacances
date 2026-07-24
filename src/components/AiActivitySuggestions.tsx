import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Plus, Check, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ITEM_TYPES, suggestBookingUrl } from "@/lib/items";
import { randomId } from "@/lib/crypto";
import {
  aiSuggestionsEnabled,
  suggestActivities,
  type SuggestedActivity,
} from "@/lib/api/activities";
import type { Destination, ProposalItem } from "@/lib/db";

export function AiActivitySuggestions({
  destination,
  startDate,
  endDate,
  onAdd,
}: {
  destination: Destination | null;
  startDate?: string;
  endDate?: string;
  onAdd: (item: ProposalItem) => void;
}) {
  const [suggestions, setSuggestions] = useState<SuggestedActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  if (!aiSuggestionsEnabled) return null;

  const ready = Boolean(destination && startDate && endDate);

  async function fetchSuggestions() {
    if (!destination || !startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const list = await suggestActivities({
        destination: destination.name,
        country: destination.country,
        startDate,
        endDate,
      });
      setSuggestions(list);
      setAdded(new Set());
      if (list.length === 0) setError("Aucune suggestion cette fois-ci.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de contacter l'IA."
      );
    } finally {
      setLoading(false);
    }
  }

  function add(s: SuggestedActivity) {
    if (!destination) return;
    const item: ProposalItem = {
      id: randomId("item"),
      type: s.type,
      title: s.title,
      description: s.description || undefined,
      location: destination.name,
      bookingUrl: suggestBookingUrl(s.type, s.title, destination.name),
      cost: s.estimatedCost != null ? s.estimatedCost : undefined,
    };
    onAdd(item);
    setAdded((prev) => new Set(prev).add(s.title));
  }

  return (
    <section className="rounded-3xl border border-azure/20 bg-gradient-to-br from-azure/5 to-gold/5 p-6 shadow-lg shadow-azure/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
            <Sparkles className="h-5 w-5 text-gold" /> Idées d'activités
            <span className="rounded-full bg-azure/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-azure-deep">
              IA
            </span>
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {ready
              ? "Laisse Gemini proposer des activités pour ta destination et tes dates."
              : "Renseigne la destination et les dates du voyage pour obtenir des idées."}
          </p>
        </div>
        {ready && (
          <Button
            onClick={fetchSuggestions}
            disabled={loading}
            variant={suggestions.length ? "outline" : "primary"}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Gemini réfléchit…
              </>
            ) : suggestions.length ? (
              <>
                <RefreshCw className="h-4 w-4" /> Régénérer
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Proposer des activités
              </>
            )}
          </Button>
        )}
        {!ready && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-ink-soft">
            <Lock className="h-3.5 w-3.5" /> En attente
          </span>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 grid gap-3 sm:grid-cols-2"
          >
            {suggestions.map((s, i) => {
              const meta = ITEM_TYPES[s.type] ?? ITEM_TYPES.other;
              const Icon = meta.icon;
              const isAdded = added.has(s.title);
              return (
                <motion.div
                  key={`${s.title}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col rounded-2xl border border-linen bg-white p-4"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{s.title}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {s.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-soft">
                      {s.estimatedCost != null
                        ? s.estimatedCost > 0
                          ? `≈ ${s.estimatedCost} €`
                          : "Gratuit"
                        : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => add(s)}
                      disabled={isAdded}
                      className={
                        isAdded
                          ? "inline-flex items-center gap-1 rounded-full bg-azure/10 px-3 py-1.5 text-xs font-semibold text-azure-deep"
                          : "inline-flex items-center gap-1 rounded-full bg-azure px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-azure-deep"
                      }
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Ajouté
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" /> Ajouter
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {suggestions.length > 0 && (
        <p className="mt-3 text-center text-[11px] text-ink-soft/70">
          Suggestions générées par Gemini · à vérifier avant réservation.
        </p>
      )}
    </section>
  );
}
