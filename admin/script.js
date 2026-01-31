// ---- MOCK DATA (replace with backend later) ----

const dashboardStats = {
    totalGrievances: 150,
    openGrievances: 45,
    slaBreaches: 12,
    escalations: 3
};

const departmentMappings = [
    {
        category: "Road & Transport",
        location: "411001",
        department: "Urban Infra Dept",
        address: "Main City Office",
        sla: 7
    },
    {
        category: "Water Supply",
        location: "411002",
        department: "Water Supply Dept",
        address: "Water Board HQ",
        sla: 2
    },
    {
        category: "Electricity",
        location: "411001",
        department: "Power Dept",
        address: "Electricity Zone 1",
        sla: 1
    },
    {
        category: "Health Services",
        location: "411001",
        department: "Public Health Dept",
        address: "District Hospital",
        sla: 3
    }
];

// ---- Load Stats ----

document.getElementById("totalGrievances").innerText =
    dashboardStats.totalGrievances;

document.getElementById("openGrievances").innerText =
    dashboardStats.openGrievances;

document.getElementById("slaBreaches").innerText =
    dashboardStats.slaBreaches;

document.getElementById("escalations").innerText =
    dashboardStats.escalations;

// ---- Load Table ----

const tableBody = document.getElementById("mappingTableBody");
tableBody.innerHTML = ""; // clear existing rows

departmentMappings.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${item.category}</td>
        <td>${item.location}</td>
        <td>${item.department}</td>
        <td>${item.address}</td>
        <td>${item.sla}</td>
    `;

    tableBody.appendChild(row);
});

// ---- Button Action ----

function addMapping() {
    alert("Add New Mapping clicked!");
}
