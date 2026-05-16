const publicProfileUser = getUser();
const publicProfileCard = document.getElementById("publicProfileCard");
const publicProfileNotes = document.getElementById("publicProfileNotes");
const publicUserId = new URLSearchParams(window.location.search).get("id");

let loadedPublicUser = null;

if (!publicProfileUser) {
  window.location.href = "./login.html";
}

if (!publicUserId) {
  publicProfileCard.innerHTML = '<p class="text-secondary">User id missing.</p>';
}

const renderProfile = (user) => {
  const isMe = user._id === publicProfileUser._id;

  publicProfileCard.innerHTML = `
    <div class="public-profile-top">
      <div class="profile-avatar-wrapper modern-avatar clean-avatar">
        ${
          user.avatar
            ? `<img src="http://localhost:5000/${user.avatar}" alt="${user.fullName}" class="profile-image">`
            : `<div class="profile-initial">${(user.fullName || "U").charAt(0).toUpperCase()}</div>`
        }
      </div>

      <div class="public-profile-info">
        <span class="eyebrow">User Profile</span>
        <h1>${user.fullName}</h1>
        <p class="text-secondary">${user.bio || "No bio added yet."}</p>

        <div class="profile-details-grid clean-details-grid public-details-grid">
          <div><span>University</span><strong>${user.university || "Not added"}</strong></div>
          <div><span>Faculty</span><strong>${user.faculty || "Not added"}</strong></div>
          <div><span>Department</span><strong>${user.department || "Not added"}</strong></div>
          <div><span>Followers</span><strong id="followersCount">${user.followersCount || 0}</strong></div>
          <div><span>Following</span><strong>${user.followingCount || 0}</strong></div>
        </div>

        <div class="public-profile-actions">
          ${!isMe ? `<button id="followBtn" class="btn btn-primary">${user.isFollowing ? "Unfollow" : "Follow"}</button>` : ""}
          <a href="mailto:${user.email}" class="btn btn-outline">Email User</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById("followBtn")?.addEventListener("click", toggleFollow);
};

const renderNotes = (notes) => {
  publicProfileNotes.innerHTML = "";

  if (!notes.length) {
    publicProfileNotes.innerHTML = `
      <div class="empty-state">
        <h2>No uploads yet</h2>
        <p class="text-secondary">This user has not shared any notes.</p>
      </div>
    `;
    return;
  }

  notes.forEach((note) => {
    publicProfileNotes.innerHTML += `
      <div class="glass-card note-card polished-note-card">
        <div class="note-top">
          <span class="note-category">${note.category}</span>
          <span class="price-pill ${note.isPaid ? "paid" : "free"}">${note.isPaid ? `৳ ${note.price}` : "Free"}</span>
        </div>
        <a href="./note-details.html?id=${note._id}" class="note-title-link"><h2 class="note-title">${note.title}</h2></a>
        <p class="note-description text-secondary">${note.description}</p>
        <div class="note-meta-grid">
          <span>🏫 ${note.university}</span>
          <span>📚 ${note.department}</span>
          <span>👍 ${note.upvotes || 0}</span>
          <span>💬 ${note.commentsCount || 0}</span>
        </div>
        <a href="./note-details.html?id=${note._id}" class="btn btn-primary">View Details</a>
      </div>
    `;
  });
};

const loadPublicProfile = async () => {
  try {
    publicProfileCard.innerHTML = '<div class="empty-state"><h2>Loading profile...</h2></div>';

    const response = await fetch(`${BASE_URL}/users/${publicUserId}`, {
      headers: {
        Authorization: `Bearer ${publicProfileUser.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Failed to load profile", "error");
    }

    loadedPublicUser = data.user;
    renderProfile(data.user);
    renderNotes(data.notes || []);
  } catch (error) {
    publicProfileCard.innerHTML = '<p class="text-secondary">Failed to load profile.</p>';
  }
};

const toggleFollow = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/${publicUserId}/follow`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${publicProfileUser.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Follow action failed", "error");
    }

    loadedPublicUser = {
      ...loadedPublicUser,
      isFollowing: data.isFollowing,
      followersCount: data.followersCount,
    };

    showToast(data.message);
    renderProfile(loadedPublicUser);
  } catch (error) {
    showToast("Follow action failed", "error");
  }
};

loadPublicProfile();
