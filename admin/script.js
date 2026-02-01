// Keep your existing imports exactly as they are
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your current config is correct
const firebaseConfig = {
  apiKey: "AIzaSyB72IUqfi0iBLZfkMYlYejToOaL13wB2wc",
  authDomain: "civicflow-17d38.firebaseapp.com",
  projectId: "civicflow-17d38",
  storageBucket: "civicflow-17d38.firebasestorage.app",
  messagingSenderId: "1040325288838",
  appId: "1:1040325288838:web:6bf24f9147a62beee38207"
};

// --- INITIALIZATION BLOCK ---
// This MUST stay here at the top level to be accessible by all functions below
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialized here for use in onAuthStateChanged
const db = getFirestore(app);

// 1. FIXED REDIRECT: Points to the signup folder
onAuthStateChanged(auth, (user) => {
  if (!user) {
    if (!window.location.pathname.includes("SignIn_Page")) {
      window.location.href = "../SignIn_Page/index.html";
    }
  }
});

// 2. FIXED BUTTONS (Existing Logic Unchanged)
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("mappingModal");
  const openBtn = document.getElementById("openModalBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const mappingForm = document.getElementById("mappingForm");

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  if (mappingForm) {
    mappingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const category = document.getElementById("category").value.trim();
      const department = document.getElementById("department").value.trim();

      try {
        const q = query(collection(db, "grievances"), where("category", "==", category));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);

        const slaDate = new Date();
        slaDate.setDate(slaDate.getDate() + 7);

        querySnapshot.forEach((doc) => {
          batch.update(doc.ref, {
            department: department,
            sla_deadline: slaDate.toDateString(),
            status: "Assigned"
          });
        });

        await batch.commit();
        alert("Mapping successful!");
        modal.style.display = "none";
        mappingForm.reset();
      } catch (err) {
        alert("Error: " + err.message);
      }
    });
  }
});

// 3. TABLE SYNC (Existing Logic Unchanged)
const tableBody = document.getElementById("mappingTableBody");
onSnapshot(collection(db, "grievances"), (snapshot) => {
  if (tableBody) {
    tableBody.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.category}</td>
        <td>${data.department || "Pending"}</td>
        <td>${data.sla_deadline || "TBD"}</td>
        <td><strong>${data.status || "Open"}</strong></td>
      `;
      tableBody.appendChild(row);
    });
  }
});