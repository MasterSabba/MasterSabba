(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBxZQF5OO5-znaipaPYeFcjOARjFXO1_gc",
        authDomain: "mastersabba-games.firebaseapp.com",
        databaseURL: "https://mastersabba-games-default-rtdb.firebaseio.com",
        projectId: "mastersabba-games",
        storageBucket: "mastersabba-games.firebasestorage.app",
        messagingSenderId: "254141019232",
        appId: "1:254141019232:web:29702c03b91f8a76677f05"
    };

    if (!window.firebase) {
        console.warn("Firebase non caricato: score-hub.js richiede firebase-app.js, firebase-auth.js e firebase-database.js.");
        return;
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.database();

    window.MasterSabbaScore = {
        auth,
        db,

        getCurrentUser() {
            return auth.currentUser;
        },

        onAuthReady(callback) {
            return auth.onAuthStateChanged(callback);
        },

        async awardPoints({ gameId, points, win = false, gameCount = 1 }) {
            if (!gameId) {
                throw new Error("gameId richiesto.");
            }

            const user = auth.currentUser;
            if (!user) {
                return { success: false, reason: "NOT_AUTHENTICATED" };
            }

            if (!Number.isFinite(points) || points < 0 || points > 1000) {
                throw new Error("Punti non validi.");
            }

            const uid = user.uid;
            const userRef = db.ref(`users/${uid}`);
            const snapshot = await userRef.once("value");
            const current = snapshot.val() || {};

            const totalXP = Number(current.totalXP || 0) + Number(points);
            const gamesPlayed = Number(current.gamesPlayed || 0) + Number(gameCount);
            const gameScores = current.gameScores || {};
            const currentGame = gameScores[gameId] || {};

            const updates = {};
            updates[`users/${uid}/totalXP`] = totalXP;
            updates[`users/${uid}/gamesPlayed`] = gamesPlayed;
            updates[`users/${uid}/lastActivityAt`] = firebase.database.ServerValue.TIMESTAMP;
            updates[`users/${uid}/gameScores/${gameId}/points`] = Number(currentGame.points || 0) + Number(points);
            updates[`users/${uid}/gameScores/${gameId}/wins`] = Number(currentGame.wins || 0) + (win ? 1 : 0);
            updates[`users/${uid}/gameScores/${gameId}/gamesPlayed`] = Number(currentGame.gamesPlayed || 0) + Number(gameCount);
            updates[`users/${uid}/gameScores/${gameId}/lastPlayedAt`] = firebase.database.ServerValue.TIMESTAMP;

            await db.ref().update(updates);

            return {
                success: true,
                uid,
                gameId,
                points,
                totalXP,
                gamesPlayed
            };
        }
    };
})();
