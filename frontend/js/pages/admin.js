const adminUser = getUser();

if (!adminUser || !["admin", "superadmin"].includes(adminUser.role)) {
  window.location.href = "./login.html";
}

const usersTable = document.getElementById("usersTable");
const notesTable = document.getElementById("notesTable");
const reportsTable = document.getElementById("reportsTable");
const adminStatsGrid = document.getElementById("adminStatsGrid");
const adminInsightStrip = document.getElementById("adminInsightStrip");
const userSearchInput = document.getElementById("userSearchInput");
const userRoleFilter = document.getElementById("userRoleFilter");
const userStatusFilter = document.getElementById("userStatusFilter");
const noteSearchInput = document.getElementById("noteSearchInput");
const noteFeatureFilter = document.getElementById("noteFeatureFilter");
const reportSearchInput = document.getElementById("reportSearchInput");
const reportStatusFilter = document.getElementById("reportStatusFilter");
const refreshAdminDataBtn = document.getElementById("refreshAdminDataBtn");
const exportReportsBtn = document.getElementById("exportReportsBtn");
const categoryManagerList = document.getElementById("categoryManagerList");
const resetCategoriesBtn = document.getElementById("resetCategoriesBtn");

let allUsers = [];
let allNotes = [];
let allReports = [];
let latestDashboardData = {};
let latestRevenueData = {};

const authHeaders = () => ({
  Authorization: `Bearer ${adminUser.token}`,
  "Content-Type": "application/json",
});

const tokenOnlyHeaders = () => ({
  Authorization: `Bearer ${adminUser.token}`,
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

const getPendingReportsCount = () => allReports.filter((report) => report.status === "pending").length;
const getPaidNotesCount = () => allNotes.filter((note) => note.isPaid).length;
const getActiveCreatorsCount = () => allUsers.filter((userItem) => userItem.role === "creator" && !userItem.isBanned).length;

const renderInsightStrip = () => {
  if (!adminInsightStrip) return;

  const topNote = [...allNotes].sort((a, b) => (b.downloads || 0) - (a.downloads || 0))[0];
  const pendingReports = getPendingReportsCount();
  const totalDownloads = allNotes.reduce((sum, note) => sum + Number(note.downloads || 0), 0);

  adminInsightStrip.innerHTML = `
    <div class="admin-insight-card urgent">
      <span>Needs Review</span>
      <strong>${pendingReports}</strong>
      <small>${pendingReports === 1 ? "pending report" : "pending reports"}</small>
    </div>
    <div class="admin-insight-card">
      <span>Active Creators</span>
      <strong>${getActiveCreatorsCount()}</strong>
      <small>verified uploaders</small>
    </div>
    <div class="admin-insight-card">
      <span>Paid Notes</span>
      <strong>${getPaidNotesCount()}</strong>
      <small>premium uploads</small>
    </div>
    <div class="admin-insight-card wide">
      <span>Top Downloaded</span>
      <strong>${safeText(topNote?.title || "No note yet")}</strong>
      <small>${totalDownloads.toLocaleString()} total downloads</small>
    </div>
  `;
};

const renderStats = (dashboardData, revenueData) => {
  if (!adminStatsGrid) return;

  const stats = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers ?? allUsers.length,
      helper: `${dashboardData.bannedUsers ?? allUsers.filter((item) => item.isBanned).length} banned users`,
      icon: "👥",
    },
    {
      title: "Total Notes",
      value: dashboardData.totalNotes ?? allNotes.length,
      helper: `${dashboardData.featuredNotes ?? allNotes.filter((item) => item.featured).length} featured notes`,
      icon: "📚",
    },
    {
      title: "Reports",
      value: dashboardData.totalReports ?? allReports.length,
      helper: `${getPendingReportsCount()} pending review`,
      icon: "🚩",
    },
    {
      title: "Revenue",
      value: `৳ ${Number(revenueData.totalRevenue || 0).toLocaleString()}`,
      helper: `${revenueData.paidDownloads ?? 0} paid downloads`,
      icon: "💳",
    },
    {
      title: "Premium Buyers",
      value: revenueData.premiumUsers ?? 0,
      helper: "Users with paid purchases",
      icon: "⭐",
    },
  ];

  adminStatsGrid.innerHTML = stats
    .map(
      (stat) => `
        <div class="glass-card admin-stat-card">
          <div class="admin-stat-icon">${stat.icon}</div>
          <p class="text-secondary">${stat.title}</p>
          <h2>${stat.value}</h2>
          <span>${stat.helper}</span>
        </div>
      `
    )
    .join("");
};

const refreshVisualSummary = () => {
  renderStats(latestDashboardData, latestRevenueData);
  renderInsightStrip();
};

const loadAdminStats = async () => {
  try {
    const [dashboardResponse, revenueResponse] = await Promise.all([
      fetch(`${BASE_URL}/admin/dashboard`, { headers: tokenOnlyHeaders() }),
      fetch(`${BASE_URL}/admin/revenue`, { headers: tokenOnlyHeaders() }),
    ]);

    const dashboardData = await dashboardResponse.json();
    const revenueData = await revenueResponse.json();

    if (!dashboardResponse.ok || !revenueResponse.ok) {
      throw new Error(dashboardData.message || revenueData.message || "Failed to load analytics");
    }

    latestDashboardData = dashboardData;
    latestRevenueData = revenueData;
    refreshVisualSummary();
  } catch (error) {
    showToast("Failed to load analytics", "error");
  }
};

const renderUsers = () => {
  if (!usersTable) return;

  const searchValue = (userSearchInput?.value || "").trim().toLowerCase();
  const roleValue = userRoleFilter?.value || "all";
  const statusValue = userStatusFilter?.value || "all";

  const filteredUsers = allUsers.filter((userItem) => {
    const matchesSearch =
      !searchValue ||
      String(userItem.fullName || "").toLowerCase().includes(searchValue) ||
      String(userItem.email || "").toLowerCase().includes(searchValue);

    const matchesRole = roleValue === "all" || userItem.role === roleValue;
    const matchesStatus =
      statusValue === "all" ||
      (statusValue === "banned" ? userItem.isBanned : !userItem.isBanned);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!filteredUsers.length) {
    usersTable.innerHTML = `
      <tr>
        <td colspan="6"><div class="empty-state"><h2>No users found</h2><p class="text-secondary">Try changing your search or filters.</p></div></td>
      </tr>
    `;
    return;
  }

  usersTable.innerHTML = filteredUsers.map((userItem) => `
    <tr>
      <td>
        <div class="admin-primary-cell">
          <strong>${safeText(userItem.fullName)}</strong>
          <span>${safeText(userItem.university || "No university")}</span>
        </div>
      </td>
      <td>${safeText(userItem.email)}</td>
      <td>
        <select class="form-control admin-table-select" onchange="changeUserRole('${userItem._id}', this.value)">
          <option value="user" ${userItem.role === "user" ? "selected" : ""}>User</option>
          <option value="creator" ${userItem.role === "creator" ? "selected" : ""}>Creator</option>
          <option value="admin" ${userItem.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="superadmin" ${userItem.role === "superadmin" ? "selected" : ""}>Superadmin</option>
        </select>
      </td>
      <td><span class="admin-status-chip ${userItem.isBanned ? "banned" : "active"}">${userItem.isBanned ? "Banned" : "Active"}</span></td>
      <td>${formatDate(userItem.createdAt)}</td>
      <td>
        <div class="admin-action-buttons">
          <button onclick="verifyUserAsCreator('${userItem._id}')" class="btn btn-outline">Verify</button>
          <button onclick="toggleBan('${userItem._id}', ${userItem.isBanned})" class="btn btn-danger">${userItem.isBanned ? "Unban" : "Ban"}</button>
        </div>
      </td>
    </tr>
  `).join("");
};

const loadUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/users`, { headers: tokenOnlyHeaders() });
    const users = await response.json();

    if (!response.ok) throw new Error(users.message || "Failed to load users");

    allUsers = users;
    renderUsers();
    refreshVisualSummary();
  } catch (error) {
    showToast("Failed to load users", "error");
  }
};

const renderNotes = () => {
  if (!notesTable) return;

  const searchValue = (noteSearchInput?.value || "").trim().toLowerCase();
  const filterValue = noteFeatureFilter?.value || "all";

  const filteredNotes = allNotes.filter((noteItem) => {
    const uploaderName = noteItem.user?.fullName || "";
    const categoryName = noteItem.category || "";
    const matchesSearch =
      !searchValue ||
      String(noteItem.title || "").toLowerCase().includes(searchValue) ||
      uploaderName.toLowerCase().includes(searchValue) ||
      categoryName.toLowerCase().includes(searchValue);

    const matchesFilter =
      filterValue === "all" ||
      (filterValue === "featured" && noteItem.featured) ||
      (filterValue === "free" && !noteItem.isPaid) ||
      (filterValue === "paid" && noteItem.isPaid);

    return matchesSearch && matchesFilter;
  });

  if (!filteredNotes.length) {
    notesTable.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h2>No notes found</h2><p class="text-secondary">Try another search or filter.</p></div></td></tr>`;
    return;
  }

  notesTable.innerHTML = filteredNotes.map((noteItem) => `
    <tr>
      <td>
        <div class="admin-primary-cell">
          <strong>${safeText(noteItem.title)}</strong>
          <span>${formatDate(noteItem.createdAt)}</span>
        </div>
      </td>
      <td>${safeText(noteItem.user?.fullName || "Unknown")}</td>
      <td>${safeText(noteItem.category || "—")}</td>
      <td>${noteItem.isPaid ? `Paid (৳ ${Number(noteItem.price || 0).toLocaleString()})` : "Free"}</td>
      <td><div class="admin-note-stats"><span>⬇ ${noteItem.downloads || 0}</span><span>👍 ${noteItem.upvotes || 0}</span><span>💬 ${noteItem.commentsCount || 0}</span></div></td>
      <td>
        <div class="admin-action-buttons">
          <a href="./note-details.html?id=${noteItem._id}" class="btn btn-outline">View</a>
          <button onclick="toggleFeaturedNote('${noteItem._id}', ${noteItem.featured})" class="btn btn-outline">${noteItem.featured ? "Unfeature" : "Feature"}</button>
          <button onclick="deleteAdminNote('${noteItem._id}')" class="btn btn-danger">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
};

const loadNotes = async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/notes`, { headers: tokenOnlyHeaders() });
    const notes = await response.json();

    if (!response.ok) throw new Error(notes.message || "Failed to load notes");

    allNotes = notes;
    renderNotes();
    refreshVisualSummary();
  } catch (error) {
    showToast("Failed to load notes", "error");
  }
};

const renderReports = () => {
  if (!reportsTable) return;

  const searchValue = (reportSearchInput?.value || "").trim().toLowerCase();
  const statusValue = reportStatusFilter?.value || "all";

  const filteredReports = allReports.filter((report) => {
    const noteTitle = report.note?.title || "Deleted note";
    const reporterName = report.reportedBy?.fullName || "Unknown";
    const reason = report.reason || "";

    const matchesSearch =
      !searchValue ||
      noteTitle.toLowerCase().includes(searchValue) ||
      reporterName.toLowerCase().includes(searchValue) ||
      reason.toLowerCase().includes(searchValue);
    const matchesStatus = statusValue === "all" || report.status === statusValue;

    return matchesSearch && matchesStatus;
  });

  if (!filteredReports.length) {
    reportsTable.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h2>No reports found</h2><p class="text-secondary">No reports match this filter.</p></div></td></tr>`;
    return;
  }

  reportsTable.innerHTML = filteredReports.map((report) => `
    <tr>
      <td>
        <div class="admin-primary-cell">
          <strong>${safeText(report.note?.title || "Deleted note")}</strong>
          <span>${safeText(report.note?.category || "No category")}</span>
        </div>
      </td>
      <td>
        <div class="admin-primary-cell">
          <strong>${safeText(report.reportedBy?.fullName || "Unknown")}</strong>
          <span>${safeText(report.reportedBy?.email || "No email")}</span>
        </div>
      </td>
      <td>
        <strong>${safeText(report.reason)}</strong>
        <span class="admin-report-message">${safeText(report.message || "No extra message")}</span>
      </td>
      <td><span class="admin-status-chip ${report.status || "pending"}">${safeText(report.status || "pending")}</span></td>
      <td>${formatDate(report.createdAt)}</td>
      <td>
        <div class="admin-action-buttons">
          ${report.note?._id ? `<a href="./note-details.html?id=${report.note._id}" class="btn btn-outline">Open</a>` : ""}
          <button onclick="reviewReport('${report._id}')" class="btn btn-outline">Review</button>
          <button onclick="rejectReport('${report._id}')" class="btn btn-outline">Reject</button>
          ${report.note?._id ? `<button onclick="deleteReportedNote('${report.note._id}', '${report._id}')" class="btn btn-danger">Delete Note</button>` : ""}
        </div>
      </td>
    </tr>
  `).join("");
};

const loadReports = async () => {
  try {
    const response = await fetch(`${BASE_URL}/reports`, { headers: tokenOnlyHeaders() });
    const reports = await response.json();

    if (!response.ok) throw new Error(reports.message || "Failed to load reports");

    allReports = reports;
    renderReports();
    refreshVisualSummary();
  } catch (error) {
    allReports = [];
    renderReports();
    refreshVisualSummary();
    showToast("Failed to load reports", "error");
  }
};

const toggleBan = async (userId, isBanned) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/${isBanned ? "unban-user" : "ban-user"}/${userId}`, {
      method: "PUT",
      headers: tokenOnlyHeaders(),
    });

    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Action failed", "error");

    showToast("User updated");
    loadUsers();
    loadAdminStats();
  } catch (error) {
    showToast("Action failed", "error");
  }
};

const verifyUserAsCreator = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/verify-creator/${userId}`, {
      method: "PUT",
      headers: tokenOnlyHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Verification failed", "error");
    showToast("Creator verified successfully");
    loadUsers();
  } catch (error) {
    showToast("Verification failed", "error");
  }
};

const changeUserRole = async (userId, role) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/update-role/${userId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Role update failed", "error");
    showToast("Role updated");
    loadUsers();
  } catch (error) {
    showToast("Role update failed", "error");
  }
};

const toggleFeaturedNote = async (noteId, isFeatured) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/${isFeatured ? "remove-feature" : "feature-note"}/${noteId}`, {
      method: "PUT",
      headers: tokenOnlyHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Update failed", "error");
    showToast(isFeatured ? "Featured note removed" : "Note featured");
    loadNotes();
    loadAdminStats();
  } catch (error) {
    showToast("Update failed", "error");
  }
};

const deleteAdminNote = async (noteId) => {
  if (!confirm("Delete this note permanently?")) return;

  try {
    const response = await fetch(`${BASE_URL}/admin/delete-note/${noteId}`, {
      method: "DELETE",
      headers: tokenOnlyHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Delete failed", "error");
    showToast("Note deleted");
    await Promise.all([loadNotes(), loadReports(), loadAdminStats()]);
  } catch (error) {
    showToast("Delete failed", "error");
  }
};

const reviewReport = async (reportId) => {
  try {
    const response = await fetch(`${BASE_URL}/reports/review/${reportId}`, {
      method: "PUT",
      headers: tokenOnlyHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Review failed", "error");
    showToast("Report marked as reviewed");
    loadReports();
  } catch (error) {
    showToast("Review failed", "error");
  }
};

const rejectReport = async (reportId) => {
  try {
    const response = await fetch(`${BASE_URL}/reports/reject/${reportId}`, {
      method: "PUT",
      headers: tokenOnlyHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return showToast(data.message || "Reject failed", "error");
    showToast("Report rejected");
    loadReports();
  } catch (error) {
    showToast("Reject failed", "error");
  }
};

const deleteReportedNote = async (noteId, reportId) => {
  if (!confirm("Delete the reported note and mark this report reviewed?")) return;
  await deleteAdminNote(noteId);
  await reviewReport(reportId);
};

const exportReportsCsv = () => {
  if (!allReports.length) return showToast("No reports to export", "error");

  const rows = [
    ["Note", "Reporter", "Reason", "Message", "Status", "Date"],
    ...allReports.map((report) => [
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
  showToast("Reports CSV downloaded");
};

const renderCategoryManager = () => {
  if (!categoryManagerList) return;

  const categories = getManagedDigiNoteCategories();

  if (!categories.length) {
    categoryManagerList.innerHTML = `<div class="empty-state"><h2>No suggestions left</h2><p class="text-secondary">Click reset to restore default categories.</p></div>`;
    return;
  }

  categoryManagerList.innerHTML = categories.map((categoryItem) => `
    <div class="category-admin-card">
      <div class="category-admin-header">
        <div>
          <h3>${safeText(categoryItem.category)}</h3>
          <p class="text-secondary">${safeText(categoryItem.faculty || "No faculty")}</p>
        </div>
        <button type="button" class="btn btn-danger" onclick="deleteManagedCategory('${String(categoryItem.category).replace(/'/g, "\\'")}')">Delete Category</button>
      </div>
      <div class="department-chip-list">
        ${(categoryItem.departments || []).map((department) => `
          <span class="department-chip">${safeText(department)}
            <button type="button" onclick="deleteManagedDepartment('${String(categoryItem.category).replace(/'/g, "\\'")}', '${String(department).replace(/'/g, "\\'")}')" title="Delete department">×</button>
          </span>
        `).join("")}
      </div>
    </div>
  `).join("");
};

const deleteManagedCategory = (categoryName) => {
  if (!confirm(`Delete category "${categoryName}" from suggestions?`)) return;
  const categories = getManagedDigiNoteCategories().filter((item) => item.category !== categoryName);
  saveManagedDigiNoteCategories(categories);
  renderCategoryManager();
  showToast("Category deleted from suggestions");
};

const deleteManagedDepartment = (categoryName, departmentName) => {
  if (!confirm(`Delete department "${departmentName}" from ${categoryName}?`)) return;
  const categories = getManagedDigiNoteCategories().map((item) => {
    if (item.category !== categoryName) return item;
    return {
      ...item,
      departments: (item.departments || []).filter((department) => department !== departmentName),
    };
  });
  saveManagedDigiNoteCategories(categories);
  renderCategoryManager();
  showToast("Department deleted from suggestions");
};

const refreshAllAdminData = () => {
  loadAdminStats();
  loadUsers();
  loadNotes();
  loadReports();
};

userSearchInput?.addEventListener("input", renderUsers);
userRoleFilter?.addEventListener("change", renderUsers);
userStatusFilter?.addEventListener("change", renderUsers);
noteSearchInput?.addEventListener("input", renderNotes);
noteFeatureFilter?.addEventListener("change", renderNotes);
reportSearchInput?.addEventListener("input", renderReports);
reportStatusFilter?.addEventListener("change", renderReports);
refreshAdminDataBtn?.addEventListener("click", refreshAllAdminData);
exportReportsBtn?.addEventListener("click", exportReportsCsv);

resetCategoriesBtn?.addEventListener("click", () => {
  if (!confirm("Restore all default suggestions?")) return;
  resetManagedDigiNoteCategories();
  renderCategoryManager();
  showToast("Default suggestions restored");
});

window.toggleBan = toggleBan;
window.verifyUserAsCreator = verifyUserAsCreator;
window.changeUserRole = changeUserRole;
window.toggleFeaturedNote = toggleFeaturedNote;
window.deleteAdminNote = deleteAdminNote;
window.reviewReport = reviewReport;
window.rejectReport = rejectReport;
window.deleteReportedNote = deleteReportedNote;
window.deleteManagedCategory = deleteManagedCategory;
window.deleteManagedDepartment = deleteManagedDepartment;

refreshVisualSummary();
renderReports();
refreshAllAdminData();
renderCategoryManager();
