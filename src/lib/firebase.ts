import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBzgYzCOz4ZZAt87E538dmVTPHIrSCgKmQ",
  authDomain: "dharmi-ayurveda-d1434.firebaseapp.com",
  projectId: "dharmi-ayurveda-d1434",
  storageBucket: "dharmi-ayurveda-d1434.firebasestorage.app",
  messagingSenderId: "840867442437",
  appId: "1:840867442437:web:0a7b0193b42fb17432d16c",
  measurementId: "G-X7ZF2X2M73",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
