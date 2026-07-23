import { firestore, isFirebaseConfigured } from "@/lib/firebase";
import { createFirestoreDb } from "./firestore";
import { localDb } from "./local";
import type { Database } from "./types";

// Pick the backend once at module load: Firestore when configured, else local.
export const db: Database =
  isFirebaseConfigured && firestore
    ? createFirestoreDb(firestore)
    : localDb;

export const usingSharedBackend = db.backend === "firestore";

export * from "./types";
