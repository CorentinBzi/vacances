import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { firebaseConfig, isFirebaseConfigured } from "@/config/firebaseConfig";

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  firestore = getFirestore(app);
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
