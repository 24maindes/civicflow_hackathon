// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyB72IUqfi0iBLZfkMYlYejToOaL13wB2wc",
  authDomain: "civicflow-17d38.firebaseapp.com",
  projectId: "civicflow-17d38"
});

const db = firebase.firestore();

// DOM
const modal = document.getElementById("mappingModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModalBtn");
const form = document.getElementById("mappingForm");
const tableBody = document.getElementById("mappingTableBody");

// Open modal
openBtn.onclick = () => modal.style.display = "flex";

// Close modal
closeBtn.onclick = () => modal.style.display = "none";

// Close when clicking outside
window.onclick = e => {
  if (e.target === modal) modal.style.display = "none";
};

// Load mappings (unique category → department)
db.collection("grievances").onSnapshot(snapshot => {
  tableBody.innerHTML = "";
  const seen = {};

  snapshot.forEach(doc => {
    const d = doc.data();
    if (!seen[d.category]) {
      seen[d.category] = d.department;
      tableBody.innerHTML += `
        <tr>
          <td>${d.category}</td>
          <td>${d.department}</td>
        </tr>`;
    }
  });
});

// Save mapping + update all related grievances
form.addEventListener("submit", async e => {
  e.preventDefault();

  const category = document.getElementById("category").value.trim();
  const department = document.getElementById("department").value.trim();

  const snapshot = await db.collection("grievances")
    .where("category", "==", category)
    .get();

  const batch = db.batch();

  snapshot.forEach(doc => {
    batch.update(doc.ref, { department });
  });

  await batch.commit();

  alert("Department updated for all related grievances ✔");
  form.reset();
  modal.style.display = "none";
});
