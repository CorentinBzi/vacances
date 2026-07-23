import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { GradientShell } from "@/components/GradientShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const MIN_LENGTH = 6;

export function ChangePasswordPage() {
  const { onboarding, changePassword } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const name = onboarding?.name ?? "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < MIN_LENGTH) {
      setError(`Le mot de passe doit faire au moins ${MIN_LENGTH} caractères.`);
      return;
    }
    if (pw !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await changePassword(pw);
      navigate("/", { replace: true });
    } catch (err) {
      setError("Impossible d'enregistrer le mot de passe.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientShell>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-lagoon-500/10 px-3 py-1 text-sm font-medium text-lagoon-600">
        <ShieldCheck className="h-4 w-4" /> Salut {name} 👋
      </div>
      <h1 className="font-display text-3xl font-bold text-slate-900">
        Crée ton mot de passe
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Choisis un mot de passe personnel pour te reconnecter plus tard avec ton
        prénom.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Nouveau mot de passe
          </span>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Au moins 6 caractères"
              autoComplete="new-password"
              className="pl-9"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Confirme le mot de passe
          </span>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Retape le mot de passe"
              autoComplete="new-password"
              className="pl-9"
            />
          </div>
        </label>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
            </>
          ) : (
            "Valider et embarquer"
          )}
        </Button>
      </form>
    </GradientShell>
  );
}
