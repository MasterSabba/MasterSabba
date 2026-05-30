// Importiamo le funzioni core di Firebase v11
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";

// La tua configurazione ufficiale
const firebaseConfig = {
    apiKey: "AIzaSyBxZQF5OO5-znaipaPYeFcjOARjFXO1_gc",
    authDomain: "mastersabba-games.firebaseapp.com",
    projectId: "mastersabba-games",
    storageBucket: "mastersabba-games.firebasestorage.app",
    messagingSenderId: "254141019232",
    appId: "1:254141019232:web:29702c03b91f8a76677f05",
    measurementId: "G-775DFWZ6PC"
};

// Inizializzazione dell'app
const app = initializeApp(firebaseConfig);

// Esportiamo i moduli così che il tuo HTML possa fare: import { auth, db } from "./firebase.js";
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
