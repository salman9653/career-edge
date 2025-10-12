import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "studio-7218104129-3b176",
  appId: "1:1001326661245:web:62e0ddcdfb2f50fab32b14",
  apiKey: "AIzaSyDdm9kJ_lRd4NiCvB4nrJ7_9OoxQAvouO0",
  authDomain: "studio-7218104129-3b176.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1001326661245",
  storageBucket: "studio-7218104129-3b176.appspot.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
