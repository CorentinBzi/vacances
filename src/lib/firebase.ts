import { initializeApp, type FirebaseApp } from "firebase/app";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { firebaseConfig, isFirebaseConfigured } from "@/config/firebaseConfig";

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  // ignoreUndefinedProperties: proposals/items carry many optional fields left
  // as `undefined`; Firestore rejects undefined values otherwise. This drops
  // them silently (localStorage already ignored them via JSON.stringify).
  firestore = initializeFirestore(app, { ignoreUndefinedProperties: true });
  // Sign in anonymously so Firestore rules can require an authenticated
  // session (request.auth != null). Harmless if Anonymous auth is disabled —
  // it just logs a warning and, with open rules, the app still works.
  signInAnonymously(getAuth(app)).catch((err) =>
    console.warn(
      "Firebase anonymous sign-in failed (enable it in Authentication > Sign-in method):",
      err?.code ?? err
    )
  );
}

export { app, firestore, isFirebaseConfigured };
