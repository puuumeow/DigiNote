const detailsUser = getUser();
const noteDetails = document.getElementById("noteDetails");
const detailsCommentsList = document.getElementById("detailsCommentsList");
const detailsCommentForm = document.getElementById("detailsCommentForm");
const detailsCommentText = document.getElementById("detailsCommentText");
const noteId = new URLSearchParams(window.location.search).get("id");
const detailsReportModal = document.getElementById("detailsReportModal");
const detailsReportBackdrop = document.getElementById("detailsReportBackdrop");
const detailsReportForm = document.getElementById("detailsReportForm");
const detailsReportReason = document.getElementById("detailsReportReason");
const detailsReportMessage = document.getElementById("detailsReportMessage");
const detailsReportNoteTitle = document.getElementById("detailsReportNoteTitle");

let loadedNote = null;

const renderNoteDetails = (note) => {
  loadedNote = note;

  noteDetails.innerHTML = `
    <div class="note-details-header">
      <div>
        <span class="note-category">${note.category}</span>
        <h1>${note.title}</h1>
        <p class="text-secondary">${note.description}</p>
      </div>
      <span class="price-pill ${note.isPaid ? "paid" : "free"}">${note.isPaid ? `৳ ${note.price}` : "Free"}</span>
    </div>

    <div class="note-meta-grid details-meta-grid">
      <span>🏫 ${note.university}</span>
      <span>🎓 ${note.faculty}</span>
      <span>📚 ${note.department}</span>
      <span>👍 ${note.upvotes || 0}</span>
      <span>⬇ ${note.downloads || 0}</span>
      <span>💬 ${note.commentsCount || 0}</span>
    </div>

    <div class="note-author-row details-author-row">
      <div class="mini-avatar small">
        ${
          note.user?.avatar
            ? `<img src="http://localhost:5000/${note.user.avatar}" alt="${note.user.fullName}">`
            : `<span>${(note.user?.fullName || "U").charAt(0).toUpperCase()}</span>`
        }
      </div>
      <div>
        <a href="./public-profile.html?id=${note.user?._id}" class="author-profile-link"><strong>${note.user?.fullName || "Unknown User"}</strong></a>
        <p class="text-secondary">${note.user?.department || "Uploader"}</p>
      </div>
    </div>

    <div class="note-actions details-actions">
      <a href="${BASE_URL}/notes/preview/${note._id}" target="_blank" class="btn btn-outline">${note.isPaid ? "Preview 2 Pages" : "Preview PDF"}</a>
      ${
        note.isPaid
          ? `<button onclick="purchaseCurrentNote()" class="btn btn-primary">Pay ৳${note.price} & Download</button>`
          : `<button onclick="downloadCurrentNote()" class="btn btn-primary">Download Free</button>`
      }
      <button onclick="upvoteCurrentNote()" class="btn btn-outline">Upvote</button>
      <button onclick="bookmarkCurrentNote()" class="btn btn-outline">Bookmark</button>
      <button onclick="openDetailsReportModal()" class="btn btn-report">Report</button>
    </div>
  `;
};

const loadNoteDetails = async () => {
  try {
    noteDetails.innerHTML = '<div class="empty-state"><h2>Loading note details...</h2></div>';

    const response = await fetch(`${BASE_URL}/notes/${noteId}`);
    const note = await response.json();

    if (!response.ok) {
      return showToast(note.message || "Failed to load note", "error");
    }

    renderNoteDetails(note);
    loadDetailsComments();
  } catch (error) {
    noteDetails.innerHTML = '<p class="text-secondary">Failed to load note details.</p>';
  }
};

const loadDetailsComments = async () => {
  try {
    detailsCommentsList.innerHTML = '<p class="text-secondary">Loading comments...</p>';

    const response = await fetch(`${BASE_URL}/notes/${noteId}/comments`);
    const comments = await response.json();

    if (!comments.length) {
      detailsCommentsList.innerHTML = '<p class="text-secondary">No comments yet.</p>';
      return;
    }

    detailsCommentsList.innerHTML = "";

    comments.forEach((comment) => {
      detailsCommentsList.innerHTML += `
        <div class="comment-card">
          <strong>${comment.user?.fullName || "User"}</strong>
          <p class="text-secondary">${comment.text}</p>
        </div>
      `;
    });
  } catch (error) {
    detailsCommentsList.innerHTML = '<p class="text-secondary">Failed to load comments.</p>';
  }
};

const requireLogin = () => {
  if (!detailsUser) {
    showToast("Login required", "error");
    return false;
  }

  return true;
};

const downloadCurrentNote = async () => {
  if (!requireLogin()) return;

  try {
    const response = await fetch(`${BASE_URL}/notes/download/${noteId}`, {
      headers: {
        Authorization: `Bearer ${detailsUser.token}`,
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
    link.download = `${loadedNote?.title || "DigiNote"}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    showToast("Download failed", "error");
  }
};

const purchaseCurrentNote = async () => {
  if (!requireLogin()) return;

  const confirmed = confirm(
    `This is a paid note. Pay ৳${loadedNote?.price || 0} first to unlock the download.`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`${BASE_URL}/notes/purchase/${noteId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${detailsUser.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Purchase failed", "error");
    }

    showToast(data.message || "Payment successful. Download starting...");
    downloadCurrentNote();
  } catch (error) {
    showToast("Purchase failed", "error");
  }
};

const upvoteCurrentNote = async () => {
  if (!requireLogin()) return;

  try {
    const response = await fetch(`${BASE_URL}/notes/upvote/${noteId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${detailsUser.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Action failed", "error");
    }

    showToast("Note upvoted");
    loadNoteDetails();
  } catch (error) {
    showToast("Action failed", "error");
  }
};

const bookmarkCurrentNote = async () => {
  if (!requireLogin()) return;

  try {
    const response = await fetch(`${BASE_URL}/notes/bookmark/${noteId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${detailsUser.token}`,
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

const openDetailsReportModal = () => {
  if (!requireLogin()) return;

  detailsReportNoteTitle.innerText = `Report: ${loadedNote?.title || "this note"}`;
  detailsReportReason.value = "";
  detailsReportMessage.value = "";
  detailsReportModal.classList.add("show");
  detailsReportBackdrop.classList.add("show");
};

const closeDetailsReportModal = () => {
  detailsReportModal.classList.remove("show");
  detailsReportBackdrop.classList.remove("show");
};

detailsReportForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!requireLogin()) return;

  if (!detailsReportReason.value) {
    return showToast("Choose a report reason", "error");
  }

  try {
    const response = await fetch(`${BASE_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${detailsUser.token}`,
      },
      body: JSON.stringify({
        note: noteId,
        reason: detailsReportReason.value,
        message: detailsReportMessage.value.trim(),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return showToast(data.message || "Report failed", "error");
    }

    showToast("Report submitted to admins");
    closeDetailsReportModal();
  } catch (error) {
    showToast("Report failed", "error");
  }
});

detailsCommentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!requireLogin()) return;

  try {
    const response = await fetch(`${BASE_URL}/notes/${noteId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${detailsUser.token}`,
      },
      body: JSON.stringify({
        text: detailsCommentText.value.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Failed to add comment", "error");
    }

    detailsCommentText.value = "";
    showToast("Comment added");
    loadDetailsComments();
    loadNoteDetails();
  } catch (error) {
    showToast("Failed to add comment", "error");
  }
});

detailsReportBackdrop?.addEventListener("click", closeDetailsReportModal);

window.downloadCurrentNote = downloadCurrentNote;
window.purchaseCurrentNote = purchaseCurrentNote;
window.upvoteCurrentNote = upvoteCurrentNote;
window.bookmarkCurrentNote = bookmarkCurrentNote;
window.openDetailsReportModal = openDetailsReportModal;
window.closeDetailsReportModal = closeDetailsReportModal;

loadNoteDetails();
