import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc",
  authDomain: "selena-events-dashboard.firebaseapp.com",
  projectId: "selena-events-dashboard",
  storageBucket: "selena-events-dashboard.firebasestorage.app",
  messagingSenderId: "535842804912",
  appId: "1:535842804912:web:7464adf97bcdf456131775",
  measurementId: "G-6CXF223NQE"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Export for use in other modules
export { app, db, auth, storage };

