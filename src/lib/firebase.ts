import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
export const db = getFirestore(app);
export const storage = getStorage(app);
