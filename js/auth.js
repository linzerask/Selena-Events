import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// type="module" implies defer, so the DOM is already parsed when this runs.
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const keepLoggedIn = document.getElementById('keep-logged-in');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

// Handle authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, hide login overlay
        if (loginOverlay) {
            loginOverlay.style.opacity = '0';
            setTimeout(() => {
                loginOverlay.classList.add('hidden');
            }, 300);
        }
    } else {
        // User is signed out, show login overlay
        if (loginOverlay) {
            loginOverlay.classList.remove('hidden');
            setTimeout(() => {
                loginOverlay.style.opacity = '1';
            }, 10);
        }
    }
});

// Handle Login Submit
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        const rememberMe = keepLoggedIn.checked;

        try {
            loginError.classList.add('hidden');
            
            // Set persistence based on checkbox
            const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistenceType);
            
            // Attempt to sign in
            await signInWithEmailAndPassword(auth, email, password);
            
            // Clear form on success
            loginForm.reset();
            
        } catch (error) {
            console.error("Login error:", error);
            loginError.classList.remove('hidden');
            
            // Handle common Firebase Auth errors
            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    loginError.textContent = 'Falsche E-Mail-Adresse oder falsches Passwort.';
                    break;
                case 'auth/too-many-requests':
                    loginError.textContent = 'Zu viele fehlgeschlagene Versuche. Bitte versuchen Sie es später erneut.';
                    break;
                default:
                    loginError.textContent = 'Ein Fehler ist aufgetreten: ' + error.message;
            }
        }
    });
}

// Handle Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
            alert("Fehler beim Abmelden.");
        }
    });
}

