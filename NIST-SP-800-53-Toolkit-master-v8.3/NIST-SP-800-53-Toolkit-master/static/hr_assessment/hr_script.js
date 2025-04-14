document.addEventListener("DOMContentLoaded", function () {
    loadHrFamilies();
});

const hrFamilies = ["ACCESS CONTROL", "IDENTIFICATION AND AUTHENTICATION", "AUDIT AND ACCOUNTABILITY", "SYSTEM AND COMMUNICATIONS PROTECTION", "RISK ASSESSMENT", "CONFIGURATION MANAGEMENT"];

function loadHrFamilies() {
    fetch("/api/families")
        .then(response => response.json())
        .then(allFamilies => {
            const familiesList = document.getElementById("families-list");
            familiesList.innerHTML = "";

            allFamilies
                .filter(f => hrFamilies.includes(f.family))
                .forEach(family => {
                    const li = document.createElement("li");
                    li.textContent = family.family;
                    li.onclick = () => loadControls(family.family);
                    familiesList.appendChild(li);
                });
        });
}

function loadControls(family) {
    document.getElementById("selected-family").textContent = family;
    document.getElementById("controls-section").style.display = "block";

    fetch(`/api/controls/${encodeURIComponent(family)}`)
        .then(response => response.json())
        .then(data => {
            const controlsList = document.getElementById("controls-list");
            controlsList.innerHTML = "";

            data.forEach(control => {
                const li = document.createElement("li");
                li.textContent = `${control.number}: ${control.title}`;
                li.onclick = () => showControlDetails(control);
                controlsList.appendChild(li);
            });
        });
}

function showControlDetails(control) {
    document.getElementById("control-id").textContent = control.number;
    document.getElementById("control-description").textContent = control.title;
    document.getElementById("control-details").style.display = "block";
}

function addToChecklist() {
    const controlId = document.getElementById("control-id").textContent;
    const description = document.getElementById("control-description").textContent;
    const status = document.getElementById("implementation-status").value;

    const row = `<tr><td>${controlId}</td><td>${description}</td><td>${status}</td></tr>`;
    document.getElementById("checklist-table").innerHTML += row;
}

function generateHrReport() {
    fetch("/api/hr_generate_report")
        .then(response => response.json())
        .then(data => {
            document.getElementById("hr-security-report").innerText =
                `HR Security Risk: ${data.risk_category} (Score: ${data.risk_score}/10)`;
        });
}

function compareHrAssessment() {
    const form = document.getElementById("hr-checklist-form");
    const formData = new FormData(form);

    let selectedControls = [];

    formData.forEach((value, key) => {
        if (value === "implemented") {
            selectedControls.push(key);
        }
    });

    fetch("/api/hr_comparison_report", {
        method: "POST",
        body: JSON.stringify({ selectedControls }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.length) {
            console.error("No comparison data received.");
            document.getElementById("hr-comparison-report").innerHTML = "<li>Error: No valid comparison data.</li>";
            return;
        }

        const reportContent = document.getElementById("hr-comparison-report");
        reportContent.innerHTML = data.map(r => `
            <li>
                <strong>${r.control_id}:</strong>
                Baseline Score: ${r.baseline_score} |
                Implemented Score: ${r.user_score} |
                Gap: ${r.gap}
            </li>
        `).join("");
    })
    .catch(error => console.error("Failed to fetch HR comparison report:", error));
}
