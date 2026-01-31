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
// Load previous complaints from localStorage
const storedHistory = localStorage.getItem("grievanceHistory");
const grievanceHistory = storedHistory ? JSON.parse(storedHistory) : [];

// Map for quick lookup by ID
const submittedGrievances = {};
grievanceHistory.forEach(g => {
    submittedGrievances[g.id] = g;
});

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

    showHistory(); // show all previous complaints immediately
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

    grievanceInfo.innerHTML = `
        <h3>✅ Grievance Submitted</h3>
        <p><b>Grievance ID:</b> ${grievanceID}</p>
        <p><b>Area:</b> ${area}, ${pincode}</p>
        <p><b>Department:</b> ${dept.department}</p>
        <p><b>Status:</b> Submitted</p>
        <p><b>SLA:</b> ${dept.sla} days</p>
    `;

    showHistory(); // refresh history after submission
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
