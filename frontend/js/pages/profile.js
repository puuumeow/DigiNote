let profileUser = getUser();

if (!profileUser) {
  window.location.href = "./login.html";
}

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileRole = document.getElementById("profileRole");
const profileUniversity = document.getElementById("profileUniversity");
const profileFaculty = document.getElementById("profileFaculty");
const profileDepartment = document.getElementById("profileDepartment");
const profileImage = document.getElementById("profileImage");
const profileInitial = document.getElementById("profileInitial");
const profileNotes = document.getElementById("profileNotes");
const avatarForm = document.getElementById("avatarForm");
const avatarInput = document.getElementById("avatarInput");
const avatarBtn = document.getElementById("avatarBtn");
const avatarFileName = document.getElementById("avatarFileName");

const setProfileUI = (userData) => {
  profileName.innerText = userData.fullName || "DigiNote User";
  profileEmail.innerText = userData.email || "";
  profileRole.innerText = userData.role || "user";
  profileUniversity.innerText = userData.university || "Not added";
  profileFaculty.innerText = userData.faculty || "Not added";
  profileDepartment.innerText = userData.department || "Not added";
  profileInitial.innerText = (userData.fullName || "U").charAt(0).toUpperCase();

  if (userData.avatar) {
    profileImage.src = `http://localhost:5000/${userData.avatar}`;
    profileImage.style.display = "block";
    profileInitial.style.display = "none";
  } else {
    profileImage.style.display = "none";
    profileInitial.style.display = "grid";
  }
};

const refreshProfile = async () => {
  try {
    const response = await fetch(`${BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${profileUser.token}`,
      },
    });

    const freshUser = await response.json();

    if (!response.ok) {
      return setProfileUI(profileUser);
    }

    profileUser = {
      ...profileUser,
      ...freshUser,
      token: profileUser.token,
    };

    localStorage.setItem("userInfo", JSON.stringify(profileUser));
    setProfileUI(profileUser);
  } catch (error) {
    setProfileUI(profileUser);
  }
};

const loadProfileNotes = async () => {
  try {
    profileNotes.innerHTML = '<div class="empty-state"><h2>Loading notes...</h2></div>';

    const response = await fetch(`${BASE_URL}/notes/my-notes`, {
      headers: {
        Authorization: `Bearer ${profileUser.token}`,
      },
    });

    const notes = await response.json();

    profileNotes.innerHTML = "";

    if (!notes.length) {
      profileNotes.innerHTML = `
        <div class="empty-state">
          <h2>No uploads yet</h2>
          <p class="text-secondary">Upload your first academic note from the Upload page.</p>
        </div>
      `;
      return;
    }

    notes.forEach((note) => {
      profileNotes.innerHTML += `
        <div class="glass-card note-card polished-note-card">
          <div class="note-top">
            <span class="note-category">${note.category}</span>
            <span class="price-pill">${note.isPaid ? `৳ ${note.price}` : "Free"}</span>
          </div>

          <h2 class="note-title">${note.title}</h2>
          <p class="note-description text-secondary">${note.description}</p>

          <div class="note-footer">
            <span>⬇ ${note.downloads || 0}</span>
            <span>💬 ${note.commentsCount || 0}</span>
          </div>
        </div>
      `;
    });
  } catch (error) {
    profileNotes.innerHTML = '<p class="text-secondary">Failed to load notes.</p>';
  }
};

avatarInput?.addEventListener("change", () => {
  const file = avatarInput.files[0];
  avatarFileName.innerText = file ? file.name : "Click to choose an image";
});

avatarForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = avatarInput.files[0];

  if (!file) {
    return showToast("Please choose an image", "error");
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return showToast("Only JPG, PNG, and WEBP images are allowed", "error");
  }

  if (file.size > 2 * 1024 * 1024) {
    return showToast("Image must be under 2MB", "error");
  }

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    avatarBtn.disabled = true;
    avatarBtn.innerText = "Uploading...";

    const response = await fetch(`${BASE_URL}/users/avatar`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${profileUser.token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Upload failed", "error");
    }

    profileUser = {
      ...profileUser,
      ...data.user,
      avatar: data.avatar,
      token: profileUser.token,
    };

    localStorage.setItem("userInfo", JSON.stringify(profileUser));
    setProfileUI(profileUser);
    avatarForm.reset();
    avatarFileName.innerText = "Click to choose an image";

    showToast("Avatar updated");
  } catch (error) {
    showToast("Upload failed", "error");
  } finally {
    avatarBtn.disabled = false;
    avatarBtn.innerText = "Upload Avatar";
  }
});

refreshProfile();
loadProfileNotes();
