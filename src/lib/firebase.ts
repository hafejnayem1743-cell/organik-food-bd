import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDpqC6qfNHnlwunjJVRrWAWoNng2P75DhQ",
  authDomain: "organik-food-bd.firebaseapp.com",
  projectId: "organik-food-bd",
  storageBucket: "organik-food-bd.firebasestorage.app",
  messagingSenderId: "1001997267132",
  appId: "1:1001997267132:web:26e937522b9f37ac6760b9",
  measurementId: "G-26C4GE38K8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Prefer a transport that works reliably on restrictive networks. If Firestore
// was already initialized by another module, reuse the existing instance.
let firestore;
try {
  firestore = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch {
  firestore = getFirestore(app);
}
export const db = firestore;
export const storage = getStorage(app);
