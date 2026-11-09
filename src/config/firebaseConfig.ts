// Firebase configuration.
//
// The API key is NEVER written in this file (the repo is public): it comes from
// VITE_FIREBASE_API_KEY — a GitHub Actions secret for the deployed site, or a
// git-ignored .env.local for local development. Without it the app runs on
// localStorage only. The other values identify the project and are not secrets.
//
// HOW TO GET THIS (see README.md "Activer le partage Firebase" for screenshots):
//   1. https://console.firebase.google.com  ->  Add project (free "Spark" plan).
//   2. Build > Firestore Database > Create database > Start in *production* mode.
//   3. Project settings (gear) > "Your apps" > Web (</>) > register app.
//   4. Copy the firebaseConfig values (the apiKey goes into the secret, see above).
//   5. Firestore > Rules: paste the rules from README.md, Publish.
//
// You can also provide these via .env (VITE_FIREBASE_*) instead of editing here.

const env = import.meta.env;

// NOTE: use `||` (not `??`) so that empty-string env vars — which is what
// GitHub Actions injects when the optional VITE_FIREBASE_* secrets are unset —
// fall back to the literal defaults below. `??` would keep the empty string.
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN || "dream-vacation-2026.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "dream-vacation-2026",
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    "dream-vacation-2026.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "199519345519",
  appId:
    env.VITE_FIREBASE_APP_ID || "1:199519345519:web:ddd06a9ba55f407e7a269a",
};

/** True when enough config is present to initialise Firebase. */
export const isFirebaseConfigured =
  firebaseConfig.apiKey.length > 0 && firebaseConfig.projectId.length > 0;
