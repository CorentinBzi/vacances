import { useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Expense } from "@/lib/db";

export interface ExpenseDraft {
  label: string;
  amount: number;
  paidBy: string;
  participants: string[];
}

export function ExpenseForm({
  members,
  currentUser,
  initial,
  saving = false,
  onSubmit,
  onCancel,
}: {
  members: string[];
  currentUser: string;
  initial?: Expense;
  saving?: boolean;
  onSubmit: (draft: ExpenseDraft) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [paidBy, setPaidBy] = useState(initial?.paidBy ?? currentUser);
  const [participants, setParticipants] = useState<string[]>(
    initial?.participants ?? [...members]
  );

  const numAmount = Number(amount);
  const valid =
    label.trim().length > 0 && numAmount > 0 && participants.length > 0;

  function toggle(name: string) {
    setParticipants((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  }

  const perHead =
    participants.length > 0 && numAmount > 0
      ? (numAmount / participants.length).toFixed(2)
      : null;

  return (
    <div className="rounded-2xl border border-linen bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Intitulé *
          </span>
          <Input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. Courses, Essence, Airbnb…"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-soft">
            Montant (€) *
          </span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="sm:w-32"
          />
        </label>
      </div>

      <div className="mt-3">
        <span className="mb-1 block text-xs font-medium text-ink-soft">
          Payé par
        </span>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaidBy(m)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition",
                paidBy === m
                  ? "bg-azure text-white ring-azure"
                  : "bg-white text-ink-soft ring-linen hover:ring-azure"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-ink-soft">
            Partagé entre ({participants.length})
          </span>
          <button
            type="button"
            onClick={() =>
              setParticipants(
                participants.length === members.length ? [] : [...members]
              )
            }
            className="text-xs font-medium text-azure hover:underline"
          >
            {participants.length === members.length ? "Aucun" : "Tous"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const on = participants.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggle(m)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition",
                  on
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-300"
                    : "bg-white text-ink-soft/60 ring-linen line-through"
                )}
              >
                {on && <Check className="h-3.5 w-3.5" />} {m}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-ink-soft">
          {perHead ? `≈ ${perHead} € par personne` : " "}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" /> Annuler
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                label: label.trim(),
                amount: numAmount,
                paidBy,
                participants,
              })
            }
            disabled={!valid || saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {initial ? "Enregistrer" : "Ajouter la dépense"}
          </Button>
        </div>
      </div>
    </div>
  );
}
