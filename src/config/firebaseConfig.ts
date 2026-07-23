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
  apiKey: env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: env.VITE_FIREBASE_APP_ID ?? "",
};

/** True when enough config is present to initialise Firebase. */
export const isFirebaseConfigured =
  firebaseConfig.apiKey.length > 0 && firebaseConfig.projectId.length > 0;
