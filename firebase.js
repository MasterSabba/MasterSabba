// 1. La tua configurazione ufficiale di Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxZQF5OO5-znaipaPYeFcjOARjFXO1_gc",
    authDomain: "mastersabba-games.firebaseapp.com",
    projectId: "mastersabba-games",
    storageBucket: "mastersabba-games.firebasestorage.app",
    messagingSenderId: "254141019232",
    appId: "1:254141019232:web:29702c03b91f8a76677f05",
    measurementId: "G-775DFWZ6PC"
};

// Inizializzazione moduli Firebase (Stile Compat per script standard)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
firebase.analytics(); // Attiva il tracciamento delle visite se inserito nell'HTML

// 2. Ascoltatore dello Stato di Autenticazione (Rileva se l'utente è dentro o fuori)
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Utente Loggato
        window.hubCurrentUser = user.displayName || "Giocatore";
        
        // Recupera i punteggi del giocatore dal Cloud
        await syncUserScoresFromCloud(user.uid);
    } else {
        // Utente Sloggato
        window.hubCurrentUser = null;
        window.hubCachedScores = {};
    }
    
    // Sincronizza i punteggi globali di tutti e aggiorna l'interfaccia grafica
    await fetchGlobalLeaderboards();
    if (window.updateAuthUI) window.updateAuthUI();
});

// 3. Gestione Registrazione e Login (Sovrascrive il fallback del Blocco 1)
window.handleHubAuth = async function(mode) {
    if (mode === 'register') {
        const username = prompt("Scegli il tuo Username per la classifica:");
        if (!username || username.trim() === "") return alert("Username obbligatorio!");
        
        const email = prompt("Inserisci la tua Email:");
        const password = prompt("Scegli una Password (minimo 6 caratteri):");
        if (!email || !password) return;

        try {
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            // Salva l'username nel profilo Firebase dell'utente
            await cred.user.updateProfile({ displayName: username.trim() });
            
            // Crea il documento dell'utente nel Database dei Punteggi
            await db.collection("users").doc(cred.user.uid).set({
                username: username.trim(),
                scores: {}
            });
            
            alert(`Benvenuto ${username}! Registrazione completata con successo. 🎉`);
            location.reload();
        } catch (error) {
            alert("Errore durante la registrazione: " + error.message);
        }
    } 
    
    if (mode === 'login') {
        const email = prompt("Inserisci la tua Email:");
        const password = prompt("Inserisci la tua Password:");
        if (!email || !password) return;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert("Accesso effettuato! Ben tornato.");
        } catch (error) {
            alert("Errore di accesso: " + error.message);
        }
    }
};

// 4. Gestione Logout
window.handleHubLogout = function() {
    if (confirm("Vuoi davvero uscire?")) {
        auth.signOut().then(() => {
            alert("Sessione chiusa.");
            location.reload();
        });
    }
};

// 5. Funzione Cloud per SALVARE i Punteggi (Chiamala dai tuoi giochi singoli!)
window.saveScoreToCloud = async function(gameName, score) {
    const user = auth.currentUser;
    if (!user) {
        // Se non è loggato, salva solo in locale
        localStorage.setItem(`points_${gameName.toLowerCase()}`, score);
        return;
    }

    try {
        const userDocRef = db.collection("users").doc(user.uid);
        
        // Aggiorna il record nel Cloud solo se il nuovo punteggio è maggiore di quello vecchio
        await db.runTransaction(async (transaction) => {
            const sfDoc = await transaction.get(userDocRef);
            if (!sfDoc.exists) return;

            let currentScores = sfDoc.data().scores || {};
            let previousScore = currentScores[gameName] || 0;

            if (score > previousScore) {
                currentScores[gameName] = score;
                transaction.update(userDocRef, { scores: currentScores });
                window.hubCachedScores[gameName] = score;
            }
        });
    } catch (e) {
        console.error("Errore salvataggio Cloud score: ", e);
    }
};

// Helper interno: Sincronizza i dati del singolo utente appena effettua l'accesso
async function syncUserScoresFromCloud(uid) {
    try {
        const doc = await db.collection("users").doc(uid).get();
        if (doc.exists && doc.data().scores) {
            window.hubCachedScores = doc.data().scores;
            // Scrive anche nel localStorage locale per sicurezza e fluidità offline
            Object.keys(window.hubCachedScores).forEach(game => {
                localStorage.setItem(`points_${game.toLowerCase()}`, window.hubCachedScores[game]);
            });
        }
    } catch (error) {
        console.error("Errore syncUserScoresFromCloud:", error);
    }
}

// Helper interno: Scarica i punteggi di TUTTI gli iscritti per generare la classifica dinamica
async function fetchGlobalLeaderboards() {
    try {
        const snapshot = await db.collection("users").get();
        
        // Predispone i rivali globali aggiornati dal cloud
        let updatedRivals = {
            "MasterMurder": [], "MasterVerbum": [], "MasterSudoku": [], "MasterKey": [],
            "MasterWordle": [], "MasterKittens": [], "MasterUno": [], "MasterBlock": [],
            "MasterTris": [], "MasterPassword": [], "MasterChess": []
        };

        snapshot.forEach(doc => {
            const data = doc.data();
            const username = data.username;
            const scores = data.scores || {};

            if (username) {
                Object.keys(updatedRivals).forEach(game => {
                    if (scores[game] !== undefined && scores[game] > 0) {
                        updatedRivals[game].push({ n: username, s: scores[game] });
                    }
                });
            }
        });

        // Ordina le classifiche scaricate e inserisce i bot di fallback se ci sono meno di 3 giocatori veri
        Object.keys(updatedRivals).forEach(game => {
            updatedRivals[game].sort((a, b) => b.s - a.s);

            const fallbacks = window.globalRivals[game] || [];
            if (updatedRivals[game].length < 3) {
                fallbacks.forEach(bot => {
                    if (!updatedRivals[game].some(p => p.n.toLowerCase() === bot.n.toLowerCase())) {
                        updatedRivals[game].push(bot);
                    }
                });
                updatedRivals[game].sort((a, b) => b.s - a.s);
            }
        });

        // Sovrascrive la variabile globale usata dal Blocco 1
        window.globalRivals = updatedRivals;
        
        // Rilancia la costruzione visiva della leaderboard
        if (window.buildLeaderboards) window.buildLeaderboards();

    } catch (error) {
        console.error("Errore nel recupero della classifica globale cloud:", error);
    }
}
