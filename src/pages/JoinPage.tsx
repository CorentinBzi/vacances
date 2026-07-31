import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, KeyRound, AlertTriangle } from "lucide-react";
import { GradientShell } from "@/components/GradientShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { canonicalToken } from "@/lib/crypto";
import { db } from "@/lib/db";

/** /join/:token — unlock a trip from an invite link, then open it. */
export function JoinPage() {
  const { token = "" } = useParams();
  const { unlockTrip } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let alive = true;
    (async () => {
      const canon = canonicalToken(token);
      if (!canon) {
        if (alive) setStatus("error");
        return;
      }
      const trip = await db.findTripByToken(canon);
      if (!trip) {
        if (alive) setStatus("error");
        return;
      }
      await unlockTrip(trip.id);
      if (alive) navigate(`/trip/${trip.id}`, { replace: true });
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <GradientShell>
      {status === "loading" ? (
        <div className="py-6 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-azure/10 text-azure">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl font-bold text-ink">
            On t'ouvre le voyage…
          </h1>
          <p className="mt-2 flex items-center justify-center gap-2 text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" /> Un instant
          </p>
        </div>
      ) : (
        <div className="py-6 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-coral/10 text-coral">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl font-bold text-ink">
            Lien invalide
          </h1>
          <p className="mt-2 text-ink-soft">
            Ce token ne correspond à aucun voyage. Demande un nouveau lien à
            l'organisateur.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      )}
    </GradientShell>
  );
}
