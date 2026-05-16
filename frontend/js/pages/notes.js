const notesContainer = document.getElementById("notesContainer");
const usersContainer = document.getElementById("usersContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const paidFilter = document.getElementById("paidFilter");
const sortFilter = document.getElementById("sortFilter");
const commentsModal = document.getElementById("commentsModal");
const commentsBackdrop = document.getElementById("commentsBackdrop");
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentText = document.getElementById("commentText");
const reportModal = document.getElementById("reportModal");
const reportBackdrop = document.getElementById("reportBackdrop");
const reportForm = document.getElementById("reportForm");
const reportReason = document.getElementById("reportReason");
const reportMessage = document.getElementById("reportMessage");
const reportNoteTitle = document.getElementById("reportNoteTitle");

const user = getUser();
let selectedNoteId = null;
let selectedReportNoteId = null;
let selectedReportTitle = "";
let searchTimer = null;

const populateCategoryFilter = () => {
  getManagedDigiNoteCategories().forEach((item) => {
    const option = document.createElement("option");
    option.value = item.category;
    option.innerText = item.category;
    categoryFilter.appendChild(option);
  });
};

const buildNotesUrl = () => {
  const params = new URLSearchParams();

  if (searchInput.value.trim()) {
    params.append("search", searchInput.value.trim());
  }

  if (categoryFilter.value) {
    params.append("category", categoryFilter.value);
  }

  if (paidFilter.value) {
    params.append("isPaid", paidFilter.value);
  }

  if (sortFilter.value) {
    params.append("sort", sortFilter.value);
  }

  return `${BASE_URL}/notes?${params.toString()}`;
};

const loadUsers = async () => {
  const search = searchInput.value.trim();

  if (!usersContainer || !search) {
    usersContainer.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/users/search?search=${encodeURIComponent(search)}`
    );

    const users = await response.json();

    if (!users.length) {
      usersContainer.innerHTML = "";
      return;
    }

    usersContainer.innerHTML = `
      <div class="section-heading full-row">
        <span class="eyebrow">People</span>
        <h2>Matching Users</h2>
      </div>
    `;

    users.forEach((item) => {
      usersContainer.innerHTML += `
        <a href="./public-profile.html?id=${item._id}" class="glass-card user-result-card user-link-card">
          <div class="mini-avatar">
            ${
              item.avatar
                ? `<img src="http://localhost:5000/${item.avatar}" alt="${item.fullName}">`
                : `<span>${(item.fullName || "U").charAt(0).toUpperCase()}</span>`
            }
          </div>

          <div>
            <h3>${item.fullName}</h3>
            <p class="text-secondary">${item.email}</p>
            <p class="text-secondary">${item.university || "No university added"}</p>
            <span class="note-category">${item.department || "Student"}</span>
          </div>
        </a>
      `;
    });
  } catch (error) {
    usersContainer.innerHTML = "";
  }
};

const loadNotes = async () => {
  try {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>Loading notes...</h2>
      </div>
    `;

    const response = await fetch(buildNotesUrl());
    const data = await response.json();
    const notes = data.notes || [];

    notesContainer.innerHTML = "";

    if (!notes.length) {
      notesContainer.innerHTML = `
        <div class="empty-state">
          <h2>No notes found</h2>
          <p class="text-secondary">Try another keyword or category.</p>
        </div>
      `;
      return;
    }

    notes.forEach((note) => {
      notesContainer.innerHTML += `
        <div class="glass-card note-card polished-note-card">
          <div class="note-top">
            <span class="note-category">${note.category}</span>
            <span class="price-pill ${note.isPaid ? "paid" : "free"}">
              ${note.isPaid ? `৳ ${note.price}` : "Free"}
            </span>
          </div>

          <a href="./note-details.html?id=${note._id}" class="note-title-link">
            <h2 class="note-title">${note.title}</h2>
          </a>
          <p class="note-description text-secondary">${note.description}</p>

          <div class="note-meta-grid">
            <span>🏫 ${note.university}</span>
            <span>📚 ${note.department}</span>
            <span>👍 ${note.upvotes || 0}</span>
            <span>⬇ ${note.downloads || 0}</span>
          </div>

          <div class="note-author-row">
            <div class="mini-avatar small">
              ${
                note.user?.avatar
                  ? `<img src="http://localhost:5000/${note.user.avatar}" alt="${note.user.fullName}">`
                  : `<span>${(note.user?.fullName || "U").charAt(0).toUpperCase()}</span>`
              }
            </div>
            <div>
              <a href="./public-profile.html?id=${note.user?._id}" class="author-profile-link">
                <strong>${note.user?.fullName || "Unknown User"}</strong>
              </a>
              <p class="text-secondary">Uploader</p>
            </div>
          </div>

          <div class="note-actions">
            <a href="${BASE_URL}/notes/preview/${note._id}" target="_blank" class="btn btn-outline">
              ${note.isPaid ? "Preview 2 Pages" : "Preview"}
            </a>

            ${
              note.isPaid
                ? `<button onclick="purchaseNote('${note._id}')" class="btn btn-outline">Pay ৳${note.price}</button>`
                : ""
            }

            <button onclick="downloadNote('${note._id}')" class="btn btn-primary">Download</button>
            <button onclick="upvoteNote('${note._id}')" class="btn btn-outline">Upvote</button>
            <button onclick="bookmarkNote('${note._id}')" class="btn btn-outline">Bookmark</button>
            <a href="./note-details.html?id=${note._id}" class="btn btn-outline">Details</a>
            <button onclick="openComments('${note._id}')" class="btn btn-outline">Comments ${note.commentsCount || 0}</button>
            <button onclick="openReportModal('${note._id}')" class="btn btn-report">Report</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    notesContainer.innerHTML = '<p class="text-secondary">Failed to load notes.</p>';
  }
};

const refreshResults = () => {
  loadNotes();
  loadUsers();
};

const downloadNote = async (noteId) => {
  if (!user) {
    return showToast("Login required", "error");
  }

  try {
    const response = await fetch(`${BASE_URL}/notes/download/${noteId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return showToast(data.message || "Download blocked", "error");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "DigiNote.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    showToast("Download failed", "error");
  }
};

const purchaseNote = async (noteId) => {
  if (!user) {
    return showToast("Login required", "error");
  }

  if (!confirm("Do you want to buy this note?")) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/notes/purchase/${noteId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Purchase failed", "error");
    }

    showToast("Purchase successful. You can download now.");
  } catch (error) {
    showToast("Purchase failed", "error");
  }
};

const upvoteNote = async (noteId) => {
  if (!user) {
    return showToast("Login required", "error");
  }

  try {
    const response = await fetch(`${BASE_URL}/notes/upvote/${noteId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Action failed", "error");
    }

    showToast("Note upvoted");
    loadNotes();
  } catch (error) {
    showToast("Action failed", "error");
  }
};

const bookmarkNote = async (noteId) => {
  if (!user) {
    return showToast("Login required", "error");
  }

  try {
    const response = await fetch(`${BASE_URL}/notes/bookmark/${noteId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Action failed", "error");
    }

    showToast("Bookmarked");
  } catch (error) {
    showToast("Action failed", "error");
  }
};

const openComments = async (noteId) => {
  selectedNoteId = noteId;
  commentsModal.classList.add("show");
  commentsBackdrop.classList.add("show");
  await loadComments(noteId);
};

const closeComments = () => {
  commentsModal.classList.remove("show");
  commentsBackdrop.classList.remove("show");
  selectedNoteId = null;
  commentText.value = "";
};

const loadComments = async (noteId) => {
  try {
    commentsList.innerHTML = '<p class="text-secondary">Loading comments...</p>';

    const response = await fetch(`${BASE_URL}/notes/${noteId}/comments`);
    const comments = await response.json();

    commentsList.innerHTML = "";

    if (!comments.length) {
      commentsList.innerHTML = '<p class="text-secondary">No comments yet.</p>';
      return;
    }

    comments.forEach((comment) => {
      commentsList.innerHTML += `
        <div class="comment-card">
          <strong>${comment.user?.fullName || "User"}</strong>
          <p class="text-secondary">${comment.text}</p>
        </div>
      `;
    });
  } catch (error) {
    commentsList.innerHTML = '<p class="text-secondary">Failed to load comments.</p>';
  }
};

commentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!user) {
    return showToast("Login required", "error");
  }

  if (!selectedNoteId) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/notes/${selectedNoteId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        text: commentText.value.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Failed to add comment", "error");
    }

    commentText.value = "";
    showToast("Comment added");
    await loadComments(selectedNoteId);
    loadNotes();
  } catch (error) {
    showToast("Failed to add comment", "error");
  }
});

commentsBackdrop?.addEventListener("click", closeComments);

const openReportModal = (noteId, title = "this note") => {
  if (!user) {
    return showToast("Login required", "error");
  }

  selectedReportNoteId = noteId;
  selectedReportTitle = title;
  reportNoteTitle.innerText = `Report: ${title}`;
  reportReason.value = "";
  reportMessage.value = "";
  reportModal.classList.add("show");
  reportBackdrop.classList.add("show");
};

const closeReportModal = () => {
  reportModal.classList.remove("show");
  reportBackdrop.classList.remove("show");
  selectedReportNoteId = null;
  selectedReportTitle = "";
};

reportForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!user) {
    return showToast("Login required", "error");
  }

  if (!selectedReportNoteId || !reportReason.value) {
    return showToast("Choose a report reason", "error");
  }

  try {
    const response = await fetch(`${BASE_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        note: selectedReportNoteId,
        reason: reportReason.value,
        message: reportMessage.value.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Report failed", "error");
    }

    showToast("Report submitted to admins");
    closeReportModal();
  } catch (error) {
    showToast("Report failed", "error");
  }
});

reportBackdrop?.addEventListener("click", closeReportModal);


searchInput?.addEventListener("keyup", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(refreshResults, 350);
});

categoryFilter?.addEventListener("change", refreshResults);
paidFilter?.addEventListener("change", refreshResults);
sortFilter?.addEventListener("change", refreshResults);

window.openReportModal = openReportModal;
window.closeReportModal = closeReportModal;

populateCategoryFilter();
refreshResults();
