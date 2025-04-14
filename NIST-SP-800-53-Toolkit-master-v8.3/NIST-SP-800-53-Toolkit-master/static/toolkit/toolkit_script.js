//import { applySolarWindsCaseStudy } from './cases/solarwinds_case.js';

window.addEventListener("DOMContentLoaded", () => {
  fetchControls();
  document.getElementById("caseSelector").addEventListener("change", loadCaseStudy);
});
async function fetchControls() {
    const response = await fetch('/api/controls');
    const data = await response.json();
    const controlsList = document.getElementById('controls-list');
    controlsList.innerHTML = '';
    data.forEach(control => {
        const li = document.createElement('li');
li.innerHTML = `<span>${control.control_id}: ${control.title} (${control.family})</span>
                <input type="checkbox" value="${control.control_id}" data-family="${control.family}">`;

        controlsList.appendChild(li);
    });
}



function submitCompliance() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const selected = Array.from(checkboxes).filter(cb => cb.checked);

    const scorePerControl = 2;
    const maxScore = checkboxes.length * scorePerControl;
    const userScore = selected.length * scorePerControl;
    const percent = ((userScore / maxScore) * 100).toFixed(1);

    document.getElementById('compliance-score').innerText = `${percent}%`;

    // Category-wise breakdown
    const categoryMap = {};

    selected.forEach(cb => {
        const family = cb.getAttribute('data-family');
        if (!categoryMap[family]) categoryMap[family] = 0;
        categoryMap[family]++;
    });

    const breakdownDiv = document.getElementById('category-breakdown');
    breakdownDiv.innerHTML = '';

    for (const [family, count] of Object.entries(categoryMap)) {
        const total = Array.from(checkboxes).filter(cb => cb.getAttribute('data-family') === family).length;
        const catPercent = ((count / total) * 100).toFixed(1);
        breakdownDiv.innerHTML += `<p><strong>${family}:</strong> ${count} / ${total} (${catPercent}%)</p>`;
    }
}

async function checkCompliance() {
    const selectedControls = Array.from(document.querySelectorAll('input[type=checkbox]:checked'))
        .map(input => input.value);
    const response = await fetch('/api/compliance_check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controls: selectedControls })
    });
    const result = await response.json();
    document.getElementById('compliance-score').innerText = `Compliance Score: ${result.compliance_score}%`;
}

async function generateAssessment() {
    const selectedControls = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                                  .map(cb => cb.value);

    const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedControls })
    });

    const result = await response.json();
    const outputDiv = document.getElementById('assessment-result');

    outputDiv.innerHTML = `
      <h3>🛡 Risk Category: <span style="color:${getColor(result.risk_category)}">${result.risk_category}</span></h3>
      <p>📊 Risk Score: ${result.risk_score} / ${result.max_possible_score}</p>
    `;

}

//case study-solarwinds


function getColor(category) {
    switch (category) {
        case 'High': return 'red';
        case 'Medium': return 'orange';
        case 'Low': return 'green';
        default: return 'gray';
    }
}

async function generateReport() {
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    const selectedControls = checkboxes.filter(cb => cb.checked).map(cb => cb.value);

    if (selectedControls.length === 0) {
        alert("Please select at least one control to generate a report.");
        return;
    }

    // 1. Get all control details
    const response = await fetch('/api/controls');
    const allControls = await response.json();

    const reportControls = allControls.filter(ctrl =>
        selectedControls.includes(ctrl.control_id)
    );

    // 2. Get Risk Assessment
    const riskResponse = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedControls })
    });

    const riskResult = await riskResponse.json();
    const riskCategory = riskResult.risk_category;
    const riskScore = riskResult.risk_score;

    // 3. Build CSV content
    let csvContent = "Control ID,Family,Title\n";
    reportControls.forEach(ctrl => {
        csvContent += `"${ctrl.control_id}","${ctrl.family}","${ctrl.title}"\n`;
    });

    csvContent += `\nCompliance Score:,${((selectedControls.length * 2) / (checkboxes.length * 2) * 100).toFixed(1)}%\n`;
    csvContent += `Risk Score:,${riskScore}/10\n`;
    csvContent += `Risk Category:,${riskCategory}\n`;

    // 4. Download CSV
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "compliance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Load predefined case study
function loadCaseStudy() {
  const selected = document.getElementById('caseSelector').value;
  const caseSummary = document.getElementById('caseSummary');

  if (selected === "healthcare") {
    const predefinedControls = [
      "AC-1", "AC-2", "AC-17", "AU-2", "AU-6", "IA-2", "IA-5", "SC-12"
    ];
    const checkboxes = document.querySelectorAll('input[type=checkbox]');
    let selectedCount = 0;

    checkboxes.forEach(cb => {
      cb.checked = predefinedControls.includes(cb.value);
      if (cb.checked) selectedCount++;
    });

    caseSummary.innerHTML = `
      <div class="case-summary-box">
        <h4>PIA Memorial Hospital Case Study</h4>
        <p><strong>Focus:</strong> Access Control, Audit Logging, Authentication, and System Communication Security</p>
        <p><strong>${selectedCount}</strong> controls automatically selected based on hospital needs.</p>
        <p><em>Running toolkit assessment...</em></p>
      </div>
    `;

    if (typeof submitCompliance === 'function') submitCompliance();
    //if (typeof generateAssessment === 'function') generateAssessment();
  } else if (selected === "solarwinds") {
    const predefinedControls = ["CM-8", "SI-7", "RA-5"];

    // Poll every 100ms until checklist controls are available
    const waitForChecklist = setInterval(() => {
      const checkboxes = document.querySelectorAll('input[type=checkbox]');
      if (!checkboxes.length) return;

      clearInterval(waitForChecklist);

      let selectedCount = 0;
      checkboxes.forEach(cb => {
        cb.checked = predefinedControls.includes(cb.value);
        if (cb.checked) selectedCount++;
      });

      caseSummary.innerHTML = `
        <div class="case-summary-box">
          <h4>SolarWinds Supply Chain Attack</h4>
          <p><strong>Failure:</strong> Insecure software supply chain and monitoring gaps.</p>
          <p><strong>${selectedCount}</strong> relevant controls auto-selected.</p>
          <p><strong>Impact:</strong> 18,000+ organizations compromised, 9-month dwell time.</p>
          <p><strong>Controls Affected:</strong> CM-8, SI-7, RA-5</p>
        </div>
      `;

      if (typeof submitCompliance === 'function') submitCompliance();
      //if (typeof generateAssessment === 'function') generateAssessment();
    }, 100);
  } else {
    caseSummary.innerHTML = "";
  }
}



//search filter
data.forEach(control => {
  const li = document.createElement("li");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = control.control_id;
  checkbox.id = control.control_id;

  const label = document.createElement("label");
  label.htmlFor = control.control_id;
  label.textContent = `${control.control_id}: ${control.title}`;

  li.appendChild(checkbox);
  li.appendChild(label);
  controlsList.appendChild(li);
});

// ✅ Add search box above checklist
const searchBox = document.createElement('input');
searchBox.type = 'text';
searchBox.placeholder = 'Search controls...';
searchBox.id = 'checklistSearch';
searchBox.className = 'checklist-search-box';
controlsList.parentNode.insertBefore(searchBox, controlsList);

searchBox.addEventListener('input', function () {
  const filter = this.value.toLowerCase();
  const items = controlsList.querySelectorAll('li');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(filter) ? '' : 'none';
  });
});

// 🟡 Show notice when user changes controls
document.querySelectorAll('input[type=checkbox]').forEach(cb => {
  cb.addEventListener('change', () => {
    document.getElementById('assessment-result').innerHTML = `
      <p style="color: #999;"><em>🕵️‍♀️ Controls changed — click <strong>"Run Assessment"</strong> again to update results.</em></p>
    `;
  });
});



fetchControls();
