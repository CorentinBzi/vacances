import {
  AVAILABILITY_WINDOW,
  DEFAULT_TRIP,
  type Role,
  type UserName,
} from "@/config/appConfig";
import { genToken, randomId } from "@/lib/crypto";
import type {
  Availability,
  Comment,
  Database,
  Expense,
  Proposal,
  Trip,
  Unsubscribe,
  UserRecord,
} from "./types";

// A dependency-free backend backed by localStorage. Data lives only in the
// current browser (NOT shared across devices) — good for local dev and as a
// graceful fallback before Firebase is configured.

const PREFIX = "vac:";
const key = (suffix: string) => PREFIX + suffix;

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function read<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(k: string, value: T): void {
  localStorage.setItem(k, JSON.stringify(value));
  notify(k);
}

function notify(k: string): void {
  listeners.get(k)?.forEach((fn) => fn());
}

function subscribe(k: string, fn: Listener): Unsubscribe {
  if (!listeners.has(k)) listeners.set(k, new Set());
  listeners.get(k)!.add(fn);
  return () => listeners.get(k)?.delete(fn);
}

// Keep tabs in sync: a write in another tab fires a "storage" event.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.startsWith(PREFIX)) notify(e.key);
  });
}

function seed(): void {
  const trips = read<Trip[]>(key("trips"), []);
  if (trips.length === 0) {
    write<Trip[]>(key("trips"), [
      {
        id: DEFAULT_TRIP.id,
        name: DEFAULT_TRIP.name,
        createdBy: "system",
        createdAt: Date.now(),
        windowStart: AVAILABILITY_WINDOW.start,
        windowEnd: AVAILABILITY_WINDOW.end,
      },
    ]);
  }
}

export const localDb: Database = {
  backend: "local",

  async getUser(name) {
    const users = read<Record<string, UserRecord>>(key("users"), {});
    return users[name] ?? null;
  },

  async ensureUser(name: UserName, role: Role) {
    const users = read<Record<string, UserRecord>>(key("users"), {});
    if (!users[name]) {
      const record: UserRecord = {
        name,
        role,
        passwordHash: null,
        hasCustomPassword: false,
        unlockedTrips: [],
      };
      write(key("users"), { ...users, [name]: record });
      return record;
    }
    return users[name];
  },

  async setUserPassword(name, passwordHash) {
    const users = read<Record<string, UserRecord>>(key("users"), {});
    const existing = users[name];
    if (!existing) return;
    write(key("users"), {
      ...users,
      [name]: { ...existing, passwordHash, hasCustomPassword: true },
    });
  },

  subscribeUser(name, cb) {
    const k = key("users");
    const emit = () =>
      cb(read<Record<string, UserRecord>>(k, {})[name] ?? null);
    emit();
    return subscribe(k, emit);
  },

  async unlockTrip(name, tripId) {
    const users = read<Record<string, UserRecord>>(key("users"), {});
    const existing = users[name];
    if (!existing) return;
    const unlockedTrips = [...(existing.unlockedTrips ?? [])];
    if (!unlockedTrips.includes(tripId)) unlockedTrips.push(tripId);
    write(key("users"), { ...users, [name]: { ...existing, unlockedTrips } });
  },

  subscribeTrips(cb) {
    seed();
    const k = key("trips");
    const emit = () => cb(read<Trip[]>(k, []));
    emit();
    return subscribe(k, emit);
  },

  async createTrip(name, createdBy, windowStart, windowEnd) {
    const k = key("trips");
    const trips = read<Trip[]>(k, []);
    const trip: Trip = {
      id: randomId("trip"),
      name,
      createdBy,
      createdAt: Date.now(),
      token: genToken(),
      windowStart,
      windowEnd,
    };
    write(k, [...trips, trip]);
    return trip;
  },

  async findTripByToken(token) {
    const trips = read<Trip[]>(key("trips"), []);
    return trips.find((t) => t.token === token) ?? null;
  },

  subscribeAvailability(tripId, cb) {
    const k = key(`availability:${tripId}`);
    const emit = () =>
      cb(Object.values(read<Record<string, Availability>>(k, {})));
    emit();
    return subscribe(k, emit);
  },

  async getAvailability(tripId, userName) {
    const k = key(`availability:${tripId}`);
    const map = read<Record<string, Availability>>(k, {});
    return map[userName] ?? null;
  },

  async setAvailability(tripId, userName, unavailableDates) {
    const k = key(`availability:${tripId}`);
    const map = read<Record<string, Availability>>(k, {});
    write(k, {
      ...map,
      [userName]: {
        userName,
        unavailableDates,
        submitted: true,
        updatedAt: Date.now(),
      },
    });
  },

  subscribeProposals(tripId, cb) {
    const k = key(`proposals:${tripId}`);
    const emit = () =>
      cb(
        [...read<Proposal[]>(k, [])].sort((a, b) => b.createdAt - a.createdAt)
      );
    emit();
    return subscribe(k, emit);
  },

  async createProposal(tripId, proposal) {
    const k = key(`proposals:${tripId}`);
    const list = read<Proposal[]>(k, []);
    const full: Proposal = {
      ...proposal,
      id: randomId("prop"),
      createdAt: Date.now(),
      votes: {},
      comments: [],
    };
    write(k, [full, ...list]);
    return full;
  },

  async toggleVote(tripId, proposalId, userName) {
    const k = key(`proposals:${tripId}`);
    const list = read<Proposal[]>(k, []);
    write(
      k,
      list.map((p) => {
        if (p.id !== proposalId) return p;
        const votes = { ...p.votes };
        if (votes[userName]) delete votes[userName];
        else votes[userName] = true;
        return { ...p, votes };
      })
    );
  },

  async addComment(tripId, proposalId, author, text) {
    const k = key(`proposals:${tripId}`);
    const list = read<Proposal[]>(k, []);
    const comment: Comment = {
      id: randomId("c"),
      author,
      text,
      createdAt: Date.now(),
    };
    write(
      k,
      list.map((p) =>
        p.id === proposalId ? { ...p, comments: [...p.comments, comment] } : p
      )
    );
  },

  async updateProposal(tripId, proposalId, patch) {
    const k = key(`proposals:${tripId}`);
    const list = read<Proposal[]>(k, []);
    write(
      k,
      list.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              title: patch.title,
              destination: patch.destination,
              items: patch.items,
              startDate: patch.startDate,
              endDate: patch.endDate,
            }
          : p
      )
    );
  },

  async deleteProposal(tripId, proposalId) {
    const k = key(`proposals:${tripId}`);
    const list = read<Proposal[]>(k, []);
    write(
      k,
      list.filter((p) => p.id !== proposalId)
    );
  },

  async editComment(tripId, proposalId, commentId, text) {
    const k = key(`proposals:${tripId}`);
    const list = read<Proposal[]>(k, []);
    write(
      k,
      list.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId ? { ...c, text } : c
              ),
            }
          : p
      )
    );
  },

  async deleteComment(tripId, proposalId, commentId) {
    const k = key(`proposals:${tripId}`);
    const list = read<Proposal[]>(k, []);
    write(
      k,
      list.map((p) =>
        p.id === proposalId
          ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
          : p
      )
    );
  },

  subscribeExpenses(tripId, cb) {
    const k = key(`expenses:${tripId}`);
    const emit = () =>
      cb([...read<Expense[]>(k, [])].sort((a, b) => b.createdAt - a.createdAt));
    emit();
    return subscribe(k, emit);
  },

  async addExpense(tripId, expense) {
    const k = key(`expenses:${tripId}`);
    const list = read<Expense[]>(k, []);
    const full: Expense = {
      ...expense,
      id: randomId("exp"),
      createdAt: Date.now(),
    };
    write(k, [full, ...list]);
  },

  async updateExpense(tripId, expenseId, patch) {
    const k = key(`expenses:${tripId}`);
    const list = read<Expense[]>(k, []);
    write(
      k,
      list.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              label: patch.label,
              amount: patch.amount,
              paidBy: patch.paidBy,
              participants: patch.participants,
            }
          : e
      )
    );
  },

  async deleteExpense(tripId, expenseId) {
    const k = key(`expenses:${tripId}`);
    const list = read<Expense[]>(k, []);
    write(
      k,
      list.filter((e) => e.id !== expenseId)
    );
  },
};
