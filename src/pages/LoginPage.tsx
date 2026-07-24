import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Lock, User, Loader2 } from "lucide-react";
import { SkyBackdrop } from "@/components/SkyBackdrop";
import { DreamVacationIllustration } from "@/components/DreamVacationIllustration";
import { Polaroid } from "@/components/ui/polaroid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { usingSharedBackend } from "@/lib/db";
import { LOGIN_POLAROIDS } from "@/data/polaroids";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(username, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate(result.next === "select-name" ? "/select-name" : "/", {
        replace: true,
      });
    } catch (err) {
      setError("Une erreur est survenue. Réessaie.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <SkyBackdrop />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16">
        {/* ---------- Left: brand + postcard + polaroid scrapboard ---------- */}
        <div className="relative hidden lg:block">
          <p className="reveal reveal-1 text-sm font-bold uppercase tracking-[0.28em] text-coral">
            <Plane className="mr-1.5 inline h-4 w-4" /> Entre amis · Édition 2026
          </p>
          <h1 className="reveal reveal-2 mt-4 font-display text-6xl font-extrabold leading-[1.02] text-ink">
            Dream Vacation
            <br />
            <span className="bg-gradient-to-r from-azure to-coral bg-clip-text text-transparent">
              2026
            </span>
          </h1>
          <p className="reveal reveal-3 mt-5 max-w-md text-lg text-ink-soft">
            On choisit les dates, on propose des destinations, on vote. Le voyage
            de rêve se planifie ici,{" "}
            <span className="font-medium text-ink">ensemble</span>.
          </p>

          {/* Postcard illustration + polaroids pinned around it */}
          <div className="reveal reveal-3 relative mt-10 h-[300px]">
            <div className="absolute left-2 top-2 w-[62%] overflow-hidden rounded-3xl border border-white/70 shadow-soft">
              <div className="aspect-[16/9]">
                <DreamVacationIllustration />
              </div>
            </div>
            <Polaroid
              {...LOGIN_POLAROIDS[0]}
              className="absolute right-6 top-0 z-20 w-32"
              style={{ animationDelay: "0s" }}
            />
            <Polaroid
              {...LOGIN_POLAROIDS[2]}
              className="absolute right-24 top-32 z-20 w-32"
              style={{ animationDelay: "1.4s" }}
            />
            <Polaroid
              {...LOGIN_POLAROIDS[1]}
              className="absolute -left-1 bottom-0 z-20 w-32"
              style={{ animationDelay: "2.2s" }}
            />
          </div>
        </div>

        {/* ---------- Right: login card ---------- */}
        <div className="reveal reveal-2 mx-auto w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-6 text-center lg:hidden">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-coral">
              Entre amis · Édition 2026
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">
              Dream Vacation{" "}
              <span className="bg-gradient-to-r from-azure to-coral bg-clip-text text-transparent">
                2026
              </span>
            </h1>
          </div>

          <div className="glass-card rounded-4xl p-8">
            <h2 className="font-display text-2xl font-bold text-ink">
              Bienvenue à bord ✈️
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Connecte-toi pour rejoindre l'aventure.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Nom / Pseudo
                </span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Coco, Julien, Maël…"
                    autoComplete="username"
                    className="pl-9"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Mot de passe
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/60" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    className="pl-9"
                  />
                </div>
              </label>

              {error && (
                <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Connexion…
                  </>
                ) : (
                  "Embarquer"
                )}
              </Button>
            </form>

            <div className="mt-5 space-y-1 rounded-2xl bg-azure/5 p-3 text-xs text-ink-soft">
              <p>
                <strong className="text-ink">Admin&nbsp;:</strong> nom{" "}
                <em>Coco</em> + mot de passe admin.
              </p>
              <p>
                <strong className="text-ink">Invités&nbsp;:</strong> première
                fois → mot de passe invité, puis choisis ton prénom. Ensuite →
                ton prénom + ton mot de passe perso.
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-ink-soft">
            {usingSharedBackend
              ? "🔗 Mode partagé (Firebase) — vos données sont synchronisées."
              : "💾 Mode local — activez Firebase pour partager entre appareils."}
          </p>
        </div>
      </div>
    </div>
  );
}
