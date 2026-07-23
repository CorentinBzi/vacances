import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, Lock, User, Loader2 } from "lucide-react";
import { Globe } from "@/components/ui/globe";
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
    <div className="relative min-h-screen w-full overflow-hidden travel-gradient">
      {/* Soft light bloom */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.25),transparent_40%)]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-2">
        {/* ---------- Left: brand + globe + polaroids ---------- */}
        <div className="relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/30 backdrop-blur">
              <Plane className="h-4 w-4" /> Entre amis · Édition 2026
            </span>
            <h1 className="mt-5 font-display text-6xl font-bold leading-[1.05] text-white drop-shadow-lg">
              Dream
              <br />
              Vacation
              <span className="bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent">
                {" "}
                2026
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-white/85">
              On choisit les dates, on propose des destinations, on vote. Le
              voyage de rêve se planifie ici, ensemble.
            </p>
          </motion.div>

          {/* Globe */}
          <div className="relative mt-6 h-[340px]">
            <Globe className="!max-w-[460px] top-0 opacity-90" />
          </div>

          {/* Floating polaroids */}
          <Polaroid
            {...LOGIN_POLAROIDS[0]}
            className="absolute right-2 top-0 z-20 w-32"
            style={{ animationDelay: "0s" }}
          />
          <Polaroid
            {...LOGIN_POLAROIDS[2]}
            className="absolute -left-2 top-40 z-20 w-32"
            style={{ animationDelay: "1.2s" }}
          />
          <Polaroid
            {...LOGIN_POLAROIDS[1]}
            className="absolute bottom-2 right-10 z-20 w-32"
            style={{ animationDelay: "2.1s" }}
          />
        </div>

        {/* ---------- Right: login card ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="mb-6 text-center lg:hidden">
            <h1 className="font-display text-4xl font-bold text-white drop-shadow">
              Dream Vacation 2026
            </h1>
            <p className="mt-2 text-white/85">Planifions notre voyage de rêve.</p>
          </div>

          <div className="glass rounded-4xl p-8 shadow-2xl shadow-black/20">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Bienvenue à bord ✈️
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Connecte-toi pour rejoindre l'aventure.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nom / Pseudo
                </span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mot de passe
                </span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
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

            <div className="mt-5 space-y-1 rounded-xl bg-slate-50/80 p-3 text-xs text-slate-500">
              <p>
                <strong className="text-slate-700">Admin&nbsp;:</strong> nom{" "}
                <em>Coco</em> + mot de passe admin.
              </p>
              <p>
                <strong className="text-slate-700">Invités&nbsp;:</strong>{" "}
                première fois → mot de passe invité, puis choisis ton prénom.
                Ensuite → ton prénom + ton mot de passe perso.
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-white/70">
            {usingSharedBackend
              ? "🔗 Mode partagé (Firebase) — vos données sont synchronisées."
              : "💾 Mode local — activez Firebase pour partager entre appareils."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
