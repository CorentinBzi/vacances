import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Wallet,
  Pencil,
  Trash2,
  ArrowRight,
  Users,
  PartyPopper,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ExpenseForm, type ExpenseDraft } from "@/components/ExpenseForm";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAME, GUEST_NAMES, isAdmin } from "@/config/appConfig";
import { db, type Expense } from "@/lib/db";
import {
  computeBalances,
  computeSettlements,
  totalSpent,
} from "@/lib/expenses";
import { cn } from "@/lib/utils";

const MEMBERS = [ADMIN_NAME, ...GUEST_NAMES];
const eur = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-azure to-gold text-xs font-bold text-white">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

type FormMode = "closed" | "add" | { edit: Expense };

export function ExpensesPage() {
  const { tripId = "" } = useParams();
  const { user } = useAuth();
  const userName = user?.name ?? "";

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mode, setMode] = useState<FormMode>("closed");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => db.subscribeExpenses(tripId, setExpenses), [tripId]);

  const balances = useMemo(() => computeBalances(expenses), [expenses]);
  const settlements = useMemo(() => computeSettlements(balances), [balances]);
  const total = useMemo(() => totalSpent(expenses), [expenses]);

  async function save(draft: ExpenseDraft) {
    setSaving(true);
    try {
      if (mode !== "closed" && mode !== "add") {
        await db.updateExpense(tripId, mode.edit.id, draft);
      } else {
        await db.addExpense(tripId, { ...draft, createdBy: userName });
      }
      setMode("closed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout wide>
      <Link
        to={`/trip/${tripId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au voyage
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.2em] text-coral">
            <Wallet className="h-4 w-4" /> Cagnotte partagée
          </p>
          <h1 className="font-display text-4xl font-extrabold text-ink">
            Dépenses
          </h1>
          <p className="mt-1 text-ink-soft">
            Qui a payé quoi — on calcule les comptes et qui rembourse qui.
          </p>
        </div>
        <div className="rounded-2xl bg-white/70 px-5 py-3 text-right ring-1 ring-linen">
          <div className="text-xs text-ink-soft">Total dépensé</div>
          <div className="font-display text-2xl font-bold text-ink">
            {eur(total)} €
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: add + list */}
        <div className="space-y-4">
          {mode === "add" ? (
            <ExpenseForm
              members={MEMBERS}
              currentUser={userName}
              saving={saving}
              onSubmit={save}
              onCancel={() => setMode("closed")}
            />
          ) : (
            mode === "closed" && (
              <Button onClick={() => setMode("add")}>
                <Plus className="h-4 w-4" /> Ajouter une dépense
              </Button>
            )
          )}

          {expenses.length === 0 && mode === "closed" && (
            <div className="rounded-3xl border border-dashed border-linen bg-white/50 p-12 text-center text-ink-soft">
              Aucune dépense pour l'instant. Ajoute la première pour lancer les
              comptes 💸
            </div>
          )}

          <ul className="space-y-3">
            {expenses.map((e) => {
              const canManage = e.createdBy === userName || isAdmin(userName);
              const editing =
                mode !== "closed" && mode !== "add" && mode.edit.id === e.id;
              if (editing) {
                return (
                  <li key={e.id}>
                    <ExpenseForm
                      members={MEMBERS}
                      currentUser={userName}
                      initial={e}
                      saving={saving}
                      onSubmit={save}
                      onCancel={() => setMode("closed")}
                    />
                  </li>
                );
              }
              return (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative flex items-center gap-3 rounded-2xl border border-linen bg-white p-4 shadow-sm"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-azure/10 text-azure">
                    <Wallet className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{e.label}</p>
                    <p className="truncate text-xs text-ink-soft">
                      Payé par <strong className="text-ink">{e.paidBy}</strong> ·
                      partagé entre {e.participants.length}
                      {e.participants.length < MEMBERS.length
                        ? ` (${e.participants.join(", ")})`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-lg font-bold text-ink">
                    {eur(e.amount)} €
                  </span>
                  {canManage && (
                    <div className="flex shrink-0 gap-1 opacity-60 transition group-hover:opacity-100">
                      <button
                        type="button"
                        title="Modifier"
                        onClick={() => setMode({ edit: e })}
                        className="rounded-lg p-1.5 text-ink-soft hover:bg-azure/10 hover:text-azure"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        onClick={() => setConfirmId(e.id)}
                        className="rounded-lg p-1.5 text-ink-soft hover:bg-coral/10 hover:text-coral"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {confirmId === e.id && (
                    <div className="absolute right-4 z-10 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-linen">
                      Supprimer&nbsp;?
                      <button
                        onClick={async () => {
                          await db.deleteExpense(tripId, e.id);
                          setConfirmId(null);
                        }}
                        className="rounded-md bg-coral px-2 py-0.5 font-semibold text-white"
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-md px-2 py-0.5 font-medium text-ink-soft ring-1 ring-linen"
                      >
                        Non
                      </button>
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Right: balances + settlement */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-ink">
              <Users className="h-5 w-5 text-azure" /> Soldes
            </h2>
            {balances.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Les soldes apparaîtront ici.
              </p>
            ) : (
              <ul className="space-y-2">
                {balances.map((b) => (
                  <li key={b.name} className="flex items-center gap-3">
                    <Avatar name={b.name} />
                    <span className="flex-1 font-medium text-ink">{b.name}</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-sm font-semibold",
                        b.net > 0.005
                          ? "bg-emerald-50 text-emerald-700"
                          : b.net < -0.005
                            ? "bg-coral/10 text-coral"
                            : "bg-slate-100 text-ink-soft"
                      )}
                    >
                      {b.net > 0.005
                        ? `+${eur(b.net)} €`
                        : b.net < -0.005
                          ? `${eur(b.net)} €`
                          : "à jour"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-ink-soft">
              Vert = on te doit · Rouge = tu dois
            </p>
          </section>

          <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-emerald-800">
              <PartyPopper className="h-5 w-5" /> Qui rembourse qui
            </h2>
            {settlements.length === 0 ? (
              <p className="text-sm text-emerald-700/80">
                {balances.length === 0
                  ? "Ajoute des dépenses pour voir les remboursements."
                  : "Tout est équilibré, personne ne doit rien ✅"}
              </p>
            ) : (
              <ul className="space-y-2">
                {settlements.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-emerald-100"
                  >
                    <span className="font-semibold text-ink">{s.from}</span>
                    <ArrowRight className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-ink">{s.to}</span>
                    <span className="ml-auto font-display font-bold text-emerald-700">
                      {eur(s.amount)} €
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </AppLayout>
  );
}
