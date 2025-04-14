let currentFamilyId = null;

document.addEventListener("DOMContentLoaded", function () {
    fetchFamilies();
    document.getElementById("generate-report").addEventListener("click", generateReport);
});

function fetchFamilies() {
    fetch("/api/families")
        .then(response => response.json())
        .then(data => {
            const familiesList = document.getElementById("families-list");
            familiesList.innerHTML = "";

            data.forEach(family => {
                const li = document.createElement("li");
                li.textContent = family.family;
                li.onclick = () => selectFamily(family.family, li);
                familiesList.appendChild(li);
            });
        });
}

function selectFamily(familyId, element) {
    currentFamilyId = familyId;

    document.querySelectorAll("#families-list li").forEach(li => li.classList.remove("selected-family"));
    element.classList.add("selected-family");

    fetchControls(familyId);
    hideControlDetails();
}

function fetchControls(familyId) {
    fetch(`/api/controls/${familyId}`)
        .then(response => response.json())
        .then(data => {
            const controlsList = document.getElementById("controls-list");
            controlsList.innerHTML = "";

            data.forEach(control => {
                const li = document.createElement("li");
                li.textContent = `${control.number} - ${control.title}`;
                li.onclick = () => fetchControlDetails(control.number, control.title, familyId);
                controlsList.appendChild(li);
            });
        });
}

function fetchControlDetails(controlId, controlTitle, family) {
    document.getElementById("control-details").classList.add("visible");
    document.getElementById("selected-control-title").textContent = `${controlId} - ${family}`;
    document.getElementById("selected-sub-control-title").textContent = `${controlTitle} - Sub-Control of ${family}`;

    fetch(`/api/statements/${controlId}`).then(res => res.json()).then(statements => {
        document.getElementById("statements-content").innerHTML = statements.length
            ? "<ul>" + statements.map(s => `<li>${s}</li>`).join("") + "</ul>"
            : "<p>No statements available.</p>";
    });

    fetch(`/api/supplemental_guidance/${controlId}`).then(res => res.json()).then(guidance => {
        document.getElementById("guidance-content").innerHTML = guidance.length
            ? "<ul>" + guidance.map(g => `<li>${g}</li>`).join("") + "</ul>"
            : "<p>No supplemental guidance available.</p>";
    });
}

function hideControlDetails() {
    document.getElementById("control-details").classList.remove("visible");
}

function generateReport() {
    if (!currentFamilyId) {
        alert("Please select a control family first.");
        return;
    }

    fetch(`/api/generate_report?family=${currentFamilyId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("report-content").innerHTML = data.map(r =>
                `<li><strong>${r.control_id}:</strong> ${r.title} - Score: ${r.score}</li>`).join("");

            document.getElementById("recommendation-content").innerHTML = data.map(r =>
                `<li>${r.recommendation}</li>`).join("");
        });
}
