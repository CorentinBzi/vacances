import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { canonicalToken } from "@/lib/crypto";
import { db } from "@/lib/db";

/** Shown when the user hasn't unlocked a private trip. On the right token,
 *  unlocks it — the parent then re-renders with access granted. */
export function PrivateTripGate({ tripId }: { tripId: string }) {
  const { unlockTrip } = useAuth();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const canon = canonicalToken(token);
    if (!canon) {
      setError("Format de token invalide.");
      return;
    }
    setChecking(true);
    try {
      const trip = await db.findTripByToken(canon);
      if (trip && trip.id === tripId) {
        await unlockTrip(tripId);
      } else {
        setError("Ce token ne correspond pas à ce voyage.");
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto mt-10 max-w-md rounded-3xl border border-linen bg-white/80 p-8 text-center shadow-lg backdrop-blur">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-azure/10 text-azure">
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="font-display text-2xl font-bold text-ink">
          Ce voyage est privé 🔒
        </h1>
        <p className="mt-2 text-ink-soft">
          Entre le token que l'organisateur t'a envoyé pour accéder à ce voyage.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <Input
            autoFocus
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setError(null);
            }}
            placeholder="Token (ex. K7P2-9RMB)"
            className="text-center font-mono uppercase tracking-widest"
          />
          {error && <p className="text-sm text-coral">{error}</p>}
          <Button type="submit" size="lg" disabled={checking || !token.trim()}>
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Vérification…
              </>
            ) : (
              "Déverrouiller"
            )}
          </Button>
        </form>

        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
      </div>
    </AppLayout>
  );
}
