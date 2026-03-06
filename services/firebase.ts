import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdBXrlDg4KcOkCHX7nP5GWqKZcgHQV0mw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "planalimentacionia.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "planalimentacionia",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "planalimentacionia.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "152267083333",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:152267083333:web:4d7b86a538a8baf3479d2c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-W2F9G87Z5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
