// Firebase configuration.
//
// The app runs on localStorage until you fill this in. Once you paste your real
// Firebase project config here, the app automatically switches to Firestore and
// data is shared in real time across everyone's devices.
//
// HOW TO GET THIS (see README.md "Activer le partage Firebase" for screenshots):
//   1. https://console.firebase.google.com  ->  Add project (free "Spark" plan).
//   2. Build > Firestore Database > Create database > Start in *production* mode.
//   3. Project settings (gear) > "Your apps" > Web (</>) > register app.
//   4. Copy the firebaseConfig values into the object below.
//   5. Firestore > Rules: paste the rules from README.md, Publish.
//
// You can also provide these via .env (VITE_FIREBASE_*) instead of editing here.

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "AIzaSyB7Xc3Ymu7yqd_1eJnd9YLlkl6fl1_n5Ug",
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN ?? "dream-vacation-2026.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "dream-vacation-2026",
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ??
    "dream-vacation-2026.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "199519345519",
  appId:
    env.VITE_FIREBASE_APP_ID ??
    "1:199519345519:web:ddd06a9ba55f407e7a269a",
};

/** True when enough config is present to initialise Firebase. */
export const isFirebaseConfigured =
  firebaseConfig.apiKey.length > 0 && firebaseConfig.projectId.length > 0;
