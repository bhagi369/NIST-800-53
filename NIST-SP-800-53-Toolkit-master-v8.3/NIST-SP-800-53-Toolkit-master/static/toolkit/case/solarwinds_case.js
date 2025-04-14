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
    if (typeof generateAssessment === 'function') generateAssessment();
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
      if (typeof generateAssessment === 'function') generateAssessment();
    }, 100);
  } else {
    caseSummary.innerHTML = "";
  }
}
