// ---------- FIREBASE CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyB72IUqfi0iBLZfkMYlYejToOaL13wB2wc",
  authDomain: "civicflow-17d38.firebaseapp.com",
  projectId: "civicflow-17d38",
  storageBucket: "civicflow-17d38.firebasestorage.app",
  messagingSenderId: "1040325288838",
  appId: "1:1040325288838:web:6bf24f9147a62beee38207"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------- ELEMENTS ----------
const submitChoice = document.getElementById("submitChoice");
const trackChoice = document.getElementById("trackChoice");

const formContainer = document.querySelector(".form-container");
const trackContainer = document.querySelector(".track-container");

const form = document.getElementById("grievanceForm");
const grievanceInfo = document.getElementById("grievanceInfo");
const historyBox = document.getElementById("historyBox");

const trackBtn = document.getElementById("trackBtn");
const trackIdInput = document.getElementById("trackId");
const trackResult = document.getElementById("trackResult");

// ---------- INITIAL STATE ----------
formContainer.style.display = "none";
trackContainer.style.display = "none";
historyBox.style.display = "none";

// ---------- DATA ----------
const storedHistory = localStorage.getItem("grievanceHistory");
const grievanceHistory = storedHistory ? JSON.parse(storedHistory) : [];

const submittedGrievances = {};
grievanceHistory.forEach(g => submittedGrievances[g.id] = g);

let grievanceCounter = grievanceHistory.length > 0 
    ? parseInt(grievanceHistory[grievanceHistory.length - 1].id.replace("GRV", "")) 
    : 1023;

const departmentMapping = {
    "Road & Transport": { department: "Urban Infra Dept", sla: 7 },
    "Water Supply": { department: "Water Supply Dept", sla: 2 },
    "Electricity": { department: "Power Dept", sla: 1 },
    "Health Services": { department: "Public Health Dept", sla: 3 },
    "Garbage Management": { department: "Sanitation Dept", sla: 2 },
    "Education Services": { department: "Education Dept", sla: 5 },
    "Gas Services": { department: "Gas Supply Dept", sla: 1 },
    "Public safety": { department: "Police Dept", sla: 1 }
};

// ---------- USER CHOICE ----------
submitChoice.addEventListener("click", () => {
    formContainer.style.display = "block";
    trackContainer.style.display = "none";
    historyBox.style.display = "block";
    showHistory();
});

trackChoice.addEventListener("click", () => {
    trackContainer.style.display = "block";
    formContainer.style.display = "none";
    historyBox.style.display = "none";
});

// ---------- SUBMIT GRIEVANCE ----------
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const category = document.getElementById("category").value;
    const pincode = document.getElementById("pincode").value;
    const area = document.getElementById("area").value;
    const description = document.getElementById("description").value;

    if (!category || !pincode || !area || !description) {
        alert("Please fill all fields!");
        return;
    }

    grievanceCounter++;
    const grievanceID = "GRV" + grievanceCounter;
    const dept = departmentMapping[category];

    const grievanceObj = {
        id: grievanceID,
        category,
        pincode,
        area,
        description,
        department: dept.department,
        status: "Submitted",
        sla: dept.sla + " days"
    };

    submittedGrievances[grievanceID] = grievanceObj;
    grievanceHistory.push(grievanceObj);

    // Save updated history to LocalStorage
    localStorage.setItem("grievanceHistory", JSON.stringify(grievanceHistory));

    // --- BACKEND INTEGRATION (Silent) ---
    // We get the current user and their role from the "users" collection 
    // without stopping the UI flow.
    const user = firebase.auth().currentUser;
    const grievanceData = {
        ...grievanceObj,
        createdAt: new Date(),
        userId: user ? user.uid : "anonymous",
        userEmail: user ? user.email : "anonymous"
    };

    if (user) {
        db.collection("users").doc(user.uid).get().then(doc => {
            const role = doc.exists ? doc.data().role : "Citizen";
            db.collection("grievances").add({ ...grievanceData, role: role });
        });
    } else {
        db.collection("grievances").add(grievanceData);
    }
    // ------------------------------------

    grievanceInfo.innerHTML = `
        <h3>✅ Grievance Submitted</h3>
        <p><b>Grievance ID:</b> ${grievanceID}</p>
        <p><b>Area:</b> ${area}, ${pincode}</p>
        <p><b>Department:</b> ${dept.department}</p>
        <p><b>Status:</b> Submitted</p>
        <p><b>SLA:</b> ${dept.sla} days</p>
    `;

    showHistory();
    form.reset();
});

// ---------- SHOW HISTORY ----------
function showHistory() {
    let historyHTML = `<h3>📜 Previous Complaints</h3>`;

    if (grievanceHistory.length === 0) {
        historyHTML += `<p>No previous complaints found.</p>`;
    } else {
        grievanceHistory.forEach((g, index) => {
            historyHTML += `
                <p>
                    <b>${index + 1}. ${g.id}</b><br>
                    📂 ${g.category}<br>
                    📍 ${g.area}, ${g.pincode}<br>
                    🏢 ${g.department}<br>
                    ⏳ ${g.status}
                </p>
                <hr>
            `;
        });
    }

    historyBox.innerHTML = historyHTML;
}

// ---------- TRACK GRIEVANCE ----------
trackBtn.addEventListener("click", () => {
    const id = trackIdInput.value.trim();

    if (!id) {
        trackResult.innerHTML = "⚠️ Please enter Grievance ID";
        return;
    }

    if (submittedGrievances[id]) {
        const g = submittedGrievances[id];
        trackResult.innerHTML = `
            🆔 <b>${id}</b><br>
            📂 Category: ${g.category}<br>
            📍 Location: ${g.area}, ${g.pincode}<br>
            🏢 Department: ${g.department}<br>
            ⏳ Status: <b>${g.status}</b><br>
            ⏰ SLA: ${g.sla}
        `;
    } else {
        trackResult.innerHTML = "❌ No grievance found with this ID!";
    }
});