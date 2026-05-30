import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxZQF5OO5-znaipaPYeFcjOARjFXO1_gc",
  authDomain: "mastersabba-games.firebaseapp.com",
  projectId: "mastersabba-games",
  storageBucket: "mastersabba-games.firebasestorage.app",
  messagingSenderId: "254141019232",
  appId: "1:254141019232:web:29702c03b91f8a76677f05",
  measurementId: "G-775DFWZ6PC"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta i moduli pronti per essere usati nell'index.html
export const auth = getAuth(app);
export const db = getFirestore(app);
