import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Firebase Configuration (Keep your existing config)
const firebaseConfig = {
  apiKey: "AIzaSyB72IUqfi0iBLZfkMYlYejToOaL13wB2wc",
  authDomain: "civicflow-17d38.firebaseapp.com",
  projectId: "civicflow-17d38",
  storageBucket: "civicflow-17d38.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. Auth Guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.warn("User not authenticated.");
    // window.location.href = "login.html"; 
  }
});

// 4. DOM Elements
const modal = document.getElementById("mappingModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModalBtn");
const form = document.getElementById("mappingForm");
const tableBody = document.getElementById("mappingTableBody");

// --- FIXED BUTTON LOGIC ---
// We use addEventListener because 'onclick' in HTML doesn't see 'type=module' functions
openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});

// 5. Load Mappings (Sync with Firestore)
onSnapshot(collection(db, "grievances"), (snapshot) => {
  tableBody.innerHTML = "";
  const seen = {};

  snapshot.forEach(doc => {
    const d = doc.data();
    // Only show unique categories
    if (d.category && !seen[d.category]) {
      seen[d.category] = d.department;
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${d.category}</td>
          <td>${d.department || 'Unassigned'}</td>
      `;
      tableBody.appendChild(row);
    }
  });
});

// 6. Save Mapping & Update related grievances
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = document.getElementById("category").value.trim();
  const department = document.getElementById("department").value.trim();

  try {
    // 1. Find all documents where the category matches
    const q = query(collection(db, "grievances"), where("category", "==", category));
    const querySnapshot = await getDocs(q);
    
    // 2. Prepare a batch update
    const batch = writeBatch(db);

    if (querySnapshot.empty) {
        alert("No grievances found with that category to update.");
        return;
    }

    querySnapshot.forEach(doc => {
      batch.update(doc.ref, { department: department });
    });

    // 3. Commit the changes
    await batch.commit();

    alert("Department updated for all related grievances ✔");
    form.reset();
    modal.style.display = "none";
  } catch (error) {
    console.error("Error updating department: ", error);
    alert("Error: " + error.message);
  }
});