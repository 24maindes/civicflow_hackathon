// Firebase CDN imports (same versions you are using)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyB72IUqfi0iBLZfkMYlYejToOaL13wB2wc",
  authDomain: "civicflow-17d38.firebaseapp.com",
  projectId: "civicflow-17d38",
  storageBucket: "civicflow-17d38.firebasestorage.app",
  messagingSenderId: "1040325288838",
  appId: "1:1040325288838:web:6bf24f9147a62beee38207"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export for reuse
export { app, auth, db };
