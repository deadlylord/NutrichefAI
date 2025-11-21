import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDdBXrlDg4KcOkCHX7nP5GWqKZcgHQV0mw",
  authDomain: "planalimentacionia.firebaseapp.com",
  projectId: "planalimentacionia",
  storageBucket: "planalimentacionia.firebasestorage.app",
  messagingSenderId: "152267083333",
  appId: "1:152267083333:web:4d7b86a538a8baf3479d2c",
  measurementId: "G-W2F9G87Z5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
