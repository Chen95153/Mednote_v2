
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDj1IdjKsPsC0UKQeUtP8v3sCPo4IRQdt0",
  authDomain: "web-app-8b273.firebaseapp.com",
  projectId: "web-app-8b273",
  storageBucket: "web-app-8b273.firebasestorage.app",
  messagingSenderId: "512346814244",
  appId: "1:512346814244:web:a8322ebf02727a508ae5b1",
  measurementId: "G-B9H3XP1PNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const functions = getFunctions(app);
