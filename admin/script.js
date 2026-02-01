// ✅ IMPORT SHARED FIREBASE INSTANCES (ONLY SOURCE OF INITIALIZATION)
import { auth, db } from "../firebase.js"; // adjust path if needed

// ✅ KEEP FIREBASE FEATURE IMPORTS (NO initializeApp, NO getAuth, NO getFirestore)
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

 //--------------------------------------------------
// 1. AUTH REDIRECT (LOGIC UNCHANGED)
// --------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    if (!window.location.pathname.includes("SignIn_Page")) {
      window.location.href = "../SignIn_Page/index.html";
    }
  }
});

  
// --------------------------------------------------
// 2. MODAL + FORM LOGIC (UNCHANGED)
// --------------------------------------------------
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
        const q = query(
          collection(db, "grievances"),
          where("category", "==", category)
        );

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

// --------------------------------------------------
// 3. REAL-TIME TABLE SYNC (UNCHANGED)
// --------------------------------------------------
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
