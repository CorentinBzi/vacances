import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { GradientShell } from "@/components/GradientShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { GUEST_NAMES, type GuestName } from "@/config/appConfig";
import { db } from "@/lib/db";

const AVATAR: Record<GuestName, string> = {
  Julien: "🏄",
  Maël: "🎿",
  Willy: "🎸",
  Kev: "🍹",
  Rémi: "📷",
};

export function NameSelectPage() {
  const { selectGuestName } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<GuestName | null>(null);
  const [loading, setLoading] = useState(false);
  const [taken, setTaken] = useState<Record<string, boolean>>({});

  // Show which names already have a personal password (already set up).
  useEffect(() => {
    let alive = true;
    Promise.all(
      GUEST_NAMES.map(async (n) => [n, (await db.getUser(n))?.hasCustomPassword ?? false] as const)
    ).then((rows) => {
      if (alive) setTaken(Object.fromEntries(rows));
    });
    return () => {
      alive = false;
    };
  }, []);

  async function confirm() {
    if (!selected) return;
    setLoading(true);
    try {
      await selectGuestName(selected);
      navigate("/change-password", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientShell>
      <h1 className="font-display text-3xl font-bold text-ink">
        Qui es-tu&nbsp;? 🧳
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Choisis ton prénom pour rejoindre le voyage.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GUEST_NAMES.map((name) => {
          const active = selected === name;
          return (
            <motion.button
              key={name}
              type="button"
              onClick={() => setSelected(name)}
              whileTap={{ scale: 0.96 }}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition ${
                active
                  ? "border-azure bg-azure/10 shadow-lg shadow-azure/20"
                  : "border-linen bg-white/70 hover:border-azure/50"
              }`}
            >
              <span className="text-3xl">{AVATAR[name]}</span>
              <span className="font-semibold text-ink">{name}</span>
              {taken[name] && (
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-coral">
                  déjà configuré
                </span>
              )}
              {active && (
                <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-azure text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {selected && taken[selected] && (
        <p className="mt-4 rounded-xl bg-gold/10 px-3 py-2 text-xs text-coral">
          ⚠️ {selected} a déjà un mot de passe. Continuer réinitialisera son mot
          de passe personnel.
        </p>
      )}

      <Button
        onClick={confirm}
        size="lg"
        disabled={!selected || loading}
        className="mt-6 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Un instant…
          </>
        ) : (
          "Continuer"
        )}
      </Button>
    </GradientShell>
  );
}
