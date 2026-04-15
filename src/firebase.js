import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCN3xRfRZqbUIuI_a_AZdsPpwnpDCATu4E",
  authDomain: "parking-slot-com.firebaseapp.com",
  projectId: "parking-slot-com",
  storageBucket: "parking-slot-com.firebasestorage.app",
  messagingSenderId: "137559382468",
  appId: "1:137559382468:web:4f292616aed9bfd9316c91"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // 🔥 NEW