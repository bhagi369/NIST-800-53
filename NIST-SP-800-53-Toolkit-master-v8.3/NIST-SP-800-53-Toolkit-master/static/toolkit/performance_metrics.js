// performance_metrics.js (Real-Time Score Tracking)

const performanceMetrics = [
  { category: "Functionality", score: 0, notes: "" },
  { category: "UI / Usability", score: 0, notes: "" },
  { category: "Scoring Accuracy", score: 0, notes: "" },
  { category: "Real-world Case Use", score: 0, notes: "" },
  { category: "Reporting & Export", score: 0, notes: "" },
  { category: "Extensibility", score: 0, notes: "" }
];

function renderPerformanceBoard() {
  const container = document.getElementById("performanceMetrics");
  if (!container) return;

  const table = document.createElement("table");
  table.className = "metrics-table";

  const header = document.createElement("tr");
  header.innerHTML = "<th>Category</th><th>Score (0-10)</th><th>Notes</th>";
  table.appendChild(header);

  performanceMetrics.forEach((metric, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${metric.category}</td>
      <td><input type="number" min="0" max="10" value="${metric.score}" oninput="updateMetricScore(${index}, this.value)"></td>
      <td><input type="text" value="${metric.notes}" oninput="updateMetricNotes(${index}, this.value)"></td>
    `;
    table.appendChild(row);
  });

  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `<td colspan='3' style='text-align:right; padding-top:10px;'>
    <button onclick="calculateTotalScore()" class="btn">Calculate Total Score</button>
    <span id="totalScoreDisplay" style="margin-left:20px; font-weight:bold;"></span>
  </td>`;
  table.appendChild(totalRow);

  container.appendChild(table);

  const summaryDiv = document.createElement("div");
  summaryDiv.id = "scoreSummary";
  summaryDiv.style.marginTop = "15px";
  container.appendChild(summaryDiv);

  const recommendationDiv = document.createElement("div");
  recommendationDiv.id = "performanceRecommendation";
  recommendationDiv.style.marginTop = "10px";
  container.appendChild(recommendationDiv);

  calculateTotalScore(); // initial render
}

function updateMetricScore(index, value) {
  performanceMetrics[index].score = parseInt(value);
  calculateTotalScore();
}

function updateMetricNotes(index, value) {
  performanceMetrics[index].notes = value;
  calculateTotalScore();
}

function calculateTotalScore() {
  const total = performanceMetrics.reduce((sum, m) => sum + (parseInt(m.score) || 0), 0);
  document.getElementById("totalScoreDisplay").textContent = `Total Score: ${total} / 60`;

  const summary = performanceMetrics.map(m => `<li><strong>${m.category}</strong>: ${m.score}/10 — ${m.notes}</li>`).join("");
  document.getElementById("scoreSummary").innerHTML = `<h4>Detailed Breakdown</h4><ul>${summary}</ul>`;

  let recommendation = "";
  if (total >= 56) {
    recommendation = "⭐️ Excellent: Toolkit is highly effective and production-ready.";
  } else if (total >= 52) {
    recommendation = "👍 Good: Solid foundation with minor improvements needed.";
  } else if (total >= 42) {
    recommendation = "⚠️ Moderate: Basic functionality okay, but refinement required.";
  } else if (total >= 30) {
    recommendation = "🔧 Needs Improvement: Key issues in scoring, usability, or structure.";
  } else {
    recommendation = "🚨 Critical Attention: Major functionality missing — rebuild recommended.";
  }

  document.getElementById("performanceRecommendation").innerHTML = `<h4>Toolkit Evaluation Recommendation</h4><p><strong>${recommendation}</strong></p>`;
}

window.addEventListener("DOMContentLoaded", renderPerformanceBoard);