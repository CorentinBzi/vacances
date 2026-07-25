import type { Expense } from "@/lib/db";

// Pure helpers for the shared-expenses ("Tricount") feature: turn a list of
// expenses into per-person balances and a minimal set of reimbursements.

const round2 = (n: number) => Math.round(n * 100) / 100;
const EPS = 0.005;

export interface Balance {
  name: string;
  /** Total this person paid. */
  paid: number;
  /** Total of this person's shares. */
  share: number;
  /** paid - share. Positive = they are owed money; negative = they owe. */
  net: number;
}

export function totalSpent(expenses: Expense[]): number {
  return round2(
    expenses.reduce((sum, e) => sum + (e.amount > 0 ? e.amount : 0), 0)
  );
}

export function computeBalances(expenses: Expense[]): Balance[] {
  const paid = new Map<string, number>();
  const share = new Map<string, number>();
  const bump = (m: Map<string, number>, k: string, v: number) =>
    m.set(k, (m.get(k) ?? 0) + v);

  for (const e of expenses) {
    if (e.amount <= 0 || e.participants.length === 0) continue;
    bump(paid, e.paidBy, e.amount);
    const per = e.amount / e.participants.length;
    for (const p of e.participants) bump(share, p, per);
  }

  const names = new Set<string>([...paid.keys(), ...share.keys()]);
  return [...names]
    .map((name) => {
      const p = round2(paid.get(name) ?? 0);
      const s = round2(share.get(name) ?? 0);
      return { name, paid: p, share: s, net: round2(p - s) };
    })
    .sort((a, b) => b.net - a.net);
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

/** Greedy minimal reimbursements: match biggest debtor with biggest creditor. */
export function computeSettlements(balances: Balance[]): Settlement[] {
  const debtors = balances
    .filter((b) => b.net < -EPS)
    .map((b) => ({ name: b.name, amt: -b.net }))
    .sort((a, b) => b.amt - a.amt);
  const creditors = balances
    .filter((b) => b.net > EPS)
    .map((b) => ({ name: b.name, amt: b.net }))
    .sort((a, b) => b.amt - a.amt);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay > EPS) {
      settlements.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: round2(pay),
      });
    }
    debtors[i].amt = round2(debtors[i].amt - pay);
    creditors[j].amt = round2(creditors[j].amt - pay);
    if (debtors[i].amt <= EPS) i++;
    if (creditors[j].amt <= EPS) j++;
  }
  return settlements;
}
