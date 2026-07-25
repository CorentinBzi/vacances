import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  arrayUnion,
  type Firestore,
} from "firebase/firestore";
import { DEFAULT_TRIP, type Role, type UserName } from "@/config/appConfig";
import { randomId } from "@/lib/crypto";
import type {
  Availability,
  Comment,
  Database,
  Expense,
  Proposal,
  Trip,
  UserRecord,
} from "./types";

// Firestore backend. Enables real-time sharing across everyone's devices.
// Collections:
//   users/{name}
//   trips/{tripId}
//   trips/{tripId}/availability/{userName}
//   trips/{tripId}/proposals/{proposalId}   (votes map + comments array inline)

export function createFirestoreDb(db: Firestore): Database {
  const tripsCol = collection(db, "trips");
  const availCol = (tripId: string) =>
    collection(db, "trips", tripId, "availability");
  const propsCol = (tripId: string) =>
    collection(db, "trips", tripId, "proposals");
  const expCol = (tripId: string) =>
    collection(db, "trips", tripId, "expenses");

  let seeded = false;
  async function seedDefaultTrip(): Promise<void> {
    if (seeded) return;
    seeded = true;
    const ref = doc(tripsCol, DEFAULT_TRIP.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        name: DEFAULT_TRIP.name,
        createdBy: "system",
        createdAt: Date.now(),
      });
    }
  }

  return {
    backend: "firestore",

    async getUser(name) {
      const snap = await getDoc(doc(db, "users", name));
      return snap.exists() ? (snap.data() as UserRecord) : null;
    },

    async ensureUser(name: UserName, role: Role) {
      const ref = doc(db, "users", name);
      const snap = await getDoc(ref);
      if (snap.exists()) return snap.data() as UserRecord;
      const record: UserRecord = {
        name,
        role,
        passwordHash: null,
        hasCustomPassword: false,
      };
      await setDoc(ref, record);
      return record;
    },

    async setUserPassword(name, passwordHash) {
      await updateDoc(doc(db, "users", name), {
        passwordHash,
        hasCustomPassword: true,
      });
    },

    subscribeTrips(cb) {
      void seedDefaultTrip();
      return onSnapshot(query(tripsCol, orderBy("createdAt", "asc")), (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Trip));
      });
    },

    async createTrip(name, createdBy) {
      const id = randomId("trip");
      const trip: Trip = { id, name, createdBy, createdAt: Date.now() };
      await setDoc(doc(tripsCol, id), {
        name,
        createdBy,
        createdAt: trip.createdAt,
      });
      return trip;
    },

    subscribeAvailability(tripId, cb) {
      return onSnapshot(availCol(tripId), (snap) => {
        cb(snap.docs.map((d) => d.data() as Availability));
      });
    },

    async getAvailability(tripId, userName) {
      const snap = await getDoc(doc(availCol(tripId), userName));
      return snap.exists() ? (snap.data() as Availability) : null;
    },

    async setAvailability(tripId, userName, unavailableDates) {
      await setDoc(doc(availCol(tripId), userName), {
        userName,
        unavailableDates,
        submitted: true,
        updatedAt: Date.now(),
      });
    },

    subscribeProposals(tripId, cb) {
      return onSnapshot(
        query(propsCol(tripId), orderBy("createdAt", "desc")),
        (snap) => {
          cb(
            snap.docs.map((d) => {
              const data = d.data() as Proposal;
              return {
                ...data,
                id: d.id,
                votes: data.votes ?? {},
                comments: data.comments ?? [],
              };
            })
          );
        }
      );
    },

    async createProposal(tripId, proposal) {
      const id = randomId("prop");
      const full: Proposal = {
        ...proposal,
        id,
        createdAt: Date.now(),
        votes: {},
        comments: [],
      };
      const { id: _id, ...data } = full;
      void _id;
      await setDoc(doc(propsCol(tripId), id), data);
      return full;
    },

    async toggleVote(tripId, proposalId, userName) {
      const ref = doc(propsCol(tripId), proposalId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const votes = { ...(snap.data().votes ?? {}) } as Record<string, boolean>;
        if (votes[userName]) delete votes[userName];
        else votes[userName] = true;
        tx.update(ref, { votes });
      });
    },

    async addComment(tripId, proposalId, author, text) {
      const comment: Comment = {
        id: randomId("c"),
        author,
        text,
        createdAt: Date.now(),
      };
      await updateDoc(doc(propsCol(tripId), proposalId), {
        comments: arrayUnion(comment),
      });
    },

    async updateProposal(tripId, proposalId, patch) {
      await updateDoc(doc(propsCol(tripId), proposalId), {
        title: patch.title,
        destination: patch.destination,
        items: patch.items,
        // deleteField clears dates that were removed during editing.
        startDate: patch.startDate ?? deleteField(),
        endDate: patch.endDate ?? deleteField(),
      });
    },

    async deleteProposal(tripId, proposalId) {
      await deleteDoc(doc(propsCol(tripId), proposalId));
    },

    async editComment(tripId, proposalId, commentId, text) {
      const ref = doc(propsCol(tripId), proposalId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const comments = ((snap.data().comments ?? []) as Comment[]).map((c) =>
          c.id === commentId ? { ...c, text } : c
        );
        tx.update(ref, { comments });
      });
    },

    async deleteComment(tripId, proposalId, commentId) {
      const ref = doc(propsCol(tripId), proposalId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) return;
        const comments = ((snap.data().comments ?? []) as Comment[]).filter(
          (c) => c.id !== commentId
        );
        tx.update(ref, { comments });
      });
    },

    subscribeExpenses(tripId, cb) {
      return onSnapshot(
        query(expCol(tripId), orderBy("createdAt", "desc")),
        (snap) => {
          cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Expense));
        }
      );
    },

    async addExpense(tripId, expense) {
      const id = randomId("exp");
      await setDoc(doc(expCol(tripId), id), {
        ...expense,
        createdAt: Date.now(),
      });
    },

    async updateExpense(tripId, expenseId, patch) {
      await updateDoc(doc(expCol(tripId), expenseId), {
        label: patch.label,
        amount: patch.amount,
        paidBy: patch.paidBy,
        participants: patch.participants,
      });
    },

    async deleteExpense(tripId, expenseId) {
      await deleteDoc(doc(expCol(tripId), expenseId));
    },
  };
}
