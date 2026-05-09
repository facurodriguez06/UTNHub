import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, setLogLevel } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.firebasestorage.app` : undefined);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Se utiliza un patrón Singleton para evitar la inicialización múltiple durante el entorno de desarrollo (HMR) de Next.js
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let firestoreInstance;
if (getApps().length === 0) {
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} else {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const storage = typeof window === "undefined" ? null : getStorage(app);

// Silenciar logs de consola del SDK de Firebase para evitar la pantalla de error roja en Next.js
// cuando se superan las cuotas de lectura gratuitas de Firestore.
if (typeof window !== "undefined") {
  setLogLevel("silent");
}
