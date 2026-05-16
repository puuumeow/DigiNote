const notificationsUser = getUser();
const notificationsContainer = document.getElementById("notificationsContainer");
const notificationSummary = document.getElementById("notificationSummary");
const markAllBtn = document.getElementById("markAllBtn");

if (!notificationsUser) {
  window.location.href = "./login.html";
}

const getNotificationIcon = (type) => {
  if (type === "follow") return "👤";
  if (type === "comment") return "💬";
  if (type === "upvote") return "👍";
  if (type === "purchase") return "💳";
  return "🔔";
};

const safeText = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;",
}[char]));

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const loadNotifications = async () => {
  try {
    notificationsContainer.innerHTML = '<div class="empty-state"><h2>Loading notifications...</h2></div>';

    const response = await fetch(`${BASE_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${notificationsUser.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Failed to load notifications", "error");
    }

    notificationSummary.innerHTML = `
      <strong>${data.unreadCount || 0}</strong>
      <span class="text-secondary">unread notification${data.unreadCount === 1 ? "" : "s"}</span>
    `;

    const notifications = data.notifications || [];
    if (markAllBtn) markAllBtn.disabled = Number(data.unreadCount || 0) === 0;

    if (!notifications.length) {
      notificationsContainer.innerHTML = `
        <div class="empty-state">
          <h2>No notifications yet</h2>
          <p class="text-secondary">When someone follows you or interacts with your notes, it will appear here.</p>
        </div>
      `;
      return;
    }

    notificationsContainer.innerHTML = "";

    notifications.forEach((notification) => {
      const noteLink = notification.note
        ? `<a href="./note-details.html?id=${notification.note._id}" class="btn btn-outline">View Note</a>`
        : "";

      const senderLink = notification.sender
        ? `<a href="./public-profile.html?id=${notification.sender._id}" class="notification-sender">${safeText(notification.sender.fullName)}</a>`
        : "DigiNote";

      notificationsContainer.innerHTML += `
        <div class="glass-card notification-item modern-notification-item ${notification.isRead ? "" : "unread"}">
          <div class="notification-icon">${getNotificationIcon(notification.type)}</div>
          <div class="notification-content">
            <p>${safeText(notification.message)}</p>
            <small class="text-secondary">From ${senderLink} • ${formatDate(notification.createdAt)}</small>
            <div class="notification-actions">
              ${noteLink}
              ${!notification.isRead ? `<button onclick="markOneRead('${notification._id}')" class="btn btn-outline">Mark read</button>` : ""}
            </div>
          </div>
        </div>
      `;
    });
  } catch (error) {
    notificationsContainer.innerHTML = '<p class="text-secondary">Failed to load notifications.</p>';
  }
};

const markOneRead = async (notificationId) => {
  try {
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${notificationsUser.token}`,
      },
    });

    if (!response.ok) {
      return showToast("Failed to update notification", "error");
    }

    loadNotifications();
  } catch (error) {
    showToast("Failed to update notification", "error");
  }
};

markAllBtn?.addEventListener("click", async () => {
  try {
    const response = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${notificationsUser.token}`,
      },
    });

    if (!response.ok) {
      return showToast("Failed to mark notifications", "error");
    }

    showToast("All notifications marked as read");
    loadNotifications();
  } catch (error) {
    showToast("Failed to mark notifications", "error");
  }
});

loadNotifications();
