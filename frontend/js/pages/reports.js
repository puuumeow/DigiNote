const reportsUser = getUser();

if (!reportsUser || !["admin", "superadmin"].includes(reportsUser.role)) {
  window.location.href = "./login.html";
}

const reportsStatsGrid = document.getElementById("reportsStatsGrid");
const reportsList = document.getElementById("reportsList");
const reportsSearchInput = document.getElementById("reportsSearchInput");
const reportsStatusFilter = document.getElementById("reportsStatusFilter");
const refreshReportsBtn = document.getElementById("refreshReportsBtn");
const downloadReportsCsvBtn = document.getElementById("downloadReportsCsvBtn");

let reportsData = [];
renderStatsQueued = false;

const reportHeaders = () => ({
  Authorization: `Bearer ${reportsUser.token}`,
});

const safeText = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[char]));

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFilteredReports = () => {
  const search = (reportsSearchInput.value || "").trim().toLowerCase();
  const status = reportsStatusFilter.value || "all";

  return reportsData.filter((report) => {
    const noteTitle = report.note?.title || "Deleted note";
    const reporter = report.reportedBy?.fullName || report.reportedBy?.email || "";
    const reason = report.reason || "";
    const matchesSearch =
      !search ||
      noteTitle.toLowerCase().includes(search) ||
      reporter.toLowerCase().includes(search) ||
      reason.toLowerCase().includes(search);
    const matchesStatus = status === "all" || report.status === status;
    return matchesSearch && matchesStatus;
  });
};

const renderStats = () => {
  const pending = reportsData.filter((report) => report.status === "pending").length;
  const reviewed = reportsData.filter((report) => report.status === "reviewed").length;
  const rejected = reportsData.filter((report) => report.status === "rejected").length;

  reportsStatsGrid.innerHTML = `
    <div class="glass-card admin-stat-card"><p class="text-secondary">Total Reports</p><h2>${reportsData.length}</h2><span>All submitted reports</span></div>
    <div class="glass-card admin-stat-card"><p class="text-secondary">Pending</p><h2>${pending}</h2><span>Need admin review</span></div>
    <div class="glass-card admin-stat-card"><p class="text-secondary">Reviewed</p><h2>${reviewed}</h2><span>Action taken</span></div>
    <div class="glass-card admin-stat-card"><p class="text-secondary">Rejected</p><h2>${rejected}</h2><span>False or resolved reports</span></div>
  `;
};

const renderReports = () => {
  const filteredReports = getFilteredReports();
  renderStats();

  if (!filteredReports.length) {
    reportsList.innerHTML = `
      <div class="empty-state">
        <h2>No reports found</h2>
        <p class="text-secondary">Try changing your search or status filter.</p>
      </div>
    `;
    return;
  }

  reportsList.innerHTML = filteredReports.map((report) => `
    <div class="glass-card report-review-card ${report.status || "pending"}">
      <div class="report-review-main">
        <div>
          <span class="admin-status-chip ${report.status || "pending"}">${safeText(report.status || "pending")}</span>
          <h2>${safeText(report.note?.title || "Deleted note")}</h2>
          <p class="text-secondary">${safeText(report.message || "No extra message from reporter.")}</p>
        </div>
        <div class="report-review-meta">
          <span><strong>Reason:</strong> ${safeText(report.reason)}</span>
          <span><strong>Reporter:</strong> ${safeText(report.reportedBy?.fullName || "Unknown")}</span>
          <span><strong>Email:</strong> ${safeText(report.reportedBy?.email || "No email")}</span>
          <span><strong>Date:</strong> ${formatDate(report.createdAt)}</span>
        </div>
      </div>

      <div class="report-note-summary">
        <span>${safeText(report.note?.category || "No category")}</span>
        <span>${safeText(report.note?.department || "No department")}</span>
        <span>${report.note?.isPaid ? `৳ ${Number(report.note?.price || 0).toLocaleString()}` : "Free"}</span>
        <span>⬇ ${report.note?.downloads || 0}</span>
        <span>👍 ${report.note?.upvotes || 0}</span>
      </div>

      <div class="admin-action-buttons report-actions-row">
        ${report.note?._id ? `<a href="./note-details.html?id=${report.note._id}" class="btn btn-outline">Open Note</a>` : ""}
        <button onclick="reviewReport('${report._id}')" class="btn btn-outline">Mark Reviewed</button>
        <button onclick="rejectReport('${report._id}')" class="btn btn-outline">Reject</button>
        ${report.note?._id ? `<button onclick="deleteReportedNote('${report.note._id}', '${report._id}')" class="btn btn-danger">Delete Note</button>` : ""}
      </div>
    </div>
  `).join("");
};

const loadReports = async () => {
  try {
    reportsList.innerHTML = `<div class="empty-state"><h2>Loading reports...</h2></div>`;
    const response = await fetch(`${BASE_URL}/reports`, { headers: reportHeaders() });
    const reports = await response.json();

    if (!response.ok) {
      throw new Error(reports.message || "Failed to load reports");
    }

    reportsData = reports;
    renderReports();
  } catch (error) {
    reportsList.innerHTML = `<p class="text-secondary">Failed to load reports.</p>`;
    showToast("Failed to load reports", "error");
  }
};

const reviewReport = async (reportId) => {
  try {
    const response = await fetch(`${BASE_URL}/reports/review/${reportId}`, {
      method: "PUT",
      headers: reportHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Review failed", "error");
    showToast("Report marked as reviewed");
    renderStats();
reportsList.innerHTML = `<div class="empty-state"><h2>No reports found</h2><p class="text-secondary">Report list starts empty until users submit reports.</p></div>`;
loadReports();
  } catch (error) {
    showToast("Review failed", "error");
  }
};

const rejectReport = async (reportId) => {
  try {
    const response = await fetch(`${BASE_URL}/reports/reject/${reportId}`, {
      method: "PUT",
      headers: reportHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Reject failed", "error");
    showToast("Report rejected");
    renderStats();
reportsList.innerHTML = `<div class="empty-state"><h2>No reports found</h2><p class="text-secondary">Report list starts empty until users submit reports.</p></div>`;
loadReports();
  } catch (error) {
    showToast("Reject failed", "error");
  }
};

const deleteReportedNote = async (noteId, reportId) => {
  if (!confirm("Delete this reported note permanently?")) return;

  try {
    const response = await fetch(`${BASE_URL}/admin/delete-note/${noteId}`, {
      method: "DELETE",
      headers: reportHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Delete failed", "error");
    showToast("Reported note deleted");
    await reviewReport(reportId);
  } catch (error) {
    showToast("Delete failed", "error");
  }
};

const downloadReportsCsv = () => {
  if (!reportsData.length) return showToast("No reports to export", "error");

  const rows = [
    ["Note", "Reporter", "Reason", "Message", "Status", "Date"],
    ...getFilteredReports().map((report) => [
      report.note?.title || "Deleted note",
      report.reportedBy?.email || report.reportedBy?.fullName || "Unknown",
      report.reason || "",
      report.message || "",
      report.status || "pending",
      formatDate(report.createdAt),
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "diginote-reports.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

reportsSearchInput?.addEventListener("input", renderReports);
reportsStatusFilter?.addEventListener("change", renderReports);
refreshReportsBtn?.addEventListener("click", loadReports);
downloadReportsCsvBtn?.addEventListener("click", downloadReportsCsv);

window.reviewReport = reviewReport;
window.rejectReport = rejectReport;
window.deleteReportedNote = deleteReportedNote;

renderStats();
reportsList.innerHTML = `<div class="empty-state"><h2>No reports found</h2><p class="text-secondary">Report list starts empty until users submit reports.</p></div>`;
loadReports();
