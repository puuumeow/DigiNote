const user = getUser();

if (!user) {
  window.location.href = "./login.html";
}

const userName = document.getElementById("userName");
const totalUploadsCount = document.getElementById("totalUploadsCount");
const downloadsCount = document.getElementById("downloadsCount");
const earningsCount = document.getElementById("earningsCount");
const unreadNotificationsCount = document.getElementById("unreadNotificationsCount");
const notificationBadge = document.getElementById("notificationBadge");
const sidebarNotificationBadge = document.getElementById("sidebarNotificationBadge");
const adminDashboardCard = document.getElementById("adminDashboardCard");
const adminSidebarLinks = document.querySelectorAll(".admin-sidebar-link");
const salesList = document.getElementById("salesList");
const purchasesList = document.getElementById("purchasesList");

userName.innerText = user.fullName || "User";

const authHeaders = () => ({
  Authorization: `Bearer ${user.token}`,
});

const setText = (element, value) => {
  if (element) element.innerText = value;
};

const setNotificationBadges = (count) => {
  const badges = [notificationBadge, sidebarNotificationBadge];

  badges.forEach((badge) => {
    if (!badge) return;
    badge.innerText = count;
    badge.classList.toggle("hidden", Number(count) <= 0);
  });
};

const formatDate = (date) => {
  if (!date) return "Unknown date";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const renderEmptyList = (element, message) => {
  if (!element) return;
  element.innerHTML = `<div class="dashboard-empty-state">${message}</div>`;
};

const loadMyNoteStats = async () => {
  try {
    const [notesResponse, salesResponse] = await Promise.all([
      fetch(`${BASE_URL}/notes/my-notes`, {
        headers: authHeaders(),
      }),
      fetch(`${BASE_URL}/notes/my-sales`, {
        headers: authHeaders(),
      }),
    ]);

    const notes = await notesResponse.json();
    const salesData = await salesResponse.json();

    if (!notesResponse.ok || !Array.isArray(notes)) {
      throw new Error(notes.message || "Failed to load stats");
    }

    if (!salesResponse.ok) {
      throw new Error(salesData.message || "Failed to load sales");
    }

    const totalUploads = notes.length;
    const totalDownloads = notes.reduce((sum, note) => sum + Number(note.downloads || 0), 0);
    const earnings = Number(salesData.totalEarnings || 0);

    setText(totalUploadsCount, totalUploads);
    setText(downloadsCount, totalDownloads);
    setText(earningsCount, `৳ ${earnings.toLocaleString()}`);
    renderSalesList(salesData.purchases || []);
  } catch (error) {
    setText(totalUploadsCount, 0);
    setText(downloadsCount, 0);
    setText(earningsCount, "৳ 0");
    renderEmptyList(salesList, "No sales found yet.");
  }
};

const renderSalesList = (sales) => {
  if (!salesList) return;

  if (!sales.length) {
    renderEmptyList(salesList, "No one has bought your notes yet.");
    return;
  }

  salesList.innerHTML = sales
    .map((sale) => `
      <div class="dashboard-list-item">
        <div class="dashboard-buyer-info">
          <div class="mini-avatar small">
            ${
              sale.user?.avatar
                ? `<img src="${BASE_URL.replace("/api", "")}/${sale.user.avatar}" alt="${sale.user.fullName}">`
                : `<span>${(sale.user?.fullName || "B").charAt(0).toUpperCase()}</span>`
            }
          </div>
          <div>
            <h3>${sale.user?.fullName || "Unknown Buyer"}</h3>
            <p class="text-secondary">Bought: ${sale.note?.title || "Deleted Note"}</p>
          </div>
        </div>
        <div class="dashboard-amount">
          <strong>৳ ${Number(sale.amount || 0).toLocaleString()}</strong>
          <span>${formatDate(sale.createdAt)}</span>
        </div>
      </div>
    `)
    .join("");
};

const loadMyPurchases = async () => {
  try {
    const response = await fetch(`${BASE_URL}/notes/my-purchases`, {
      headers: authHeaders(),
    });

    const purchases = await response.json();

    if (!response.ok || !Array.isArray(purchases)) {
      throw new Error(purchases.message || "Failed to load purchases");
    }

    if (!purchases.length) {
      renderEmptyList(purchasesList, "You have not bought any paid notes yet.");
      return;
    }

    purchasesList.innerHTML = purchases
      .map((purchase) => `
        <div class="dashboard-list-item">
          <div>
            <h3>${purchase.note?.title || "Deleted Note"}</h3>
            <p class="text-secondary">Seller: ${purchase.note?.user?.fullName || "Unknown"}</p>
          </div>
          <div class="dashboard-actions-mini">
            <strong>৳ ${Number(purchase.amount || 0).toLocaleString()}</strong>
            ${
              purchase.note?._id
                ? `<a href="./note-details.html?id=${purchase.note._id}" class="btn btn-primary">Open</a>`
                : ""
            }
          </div>
        </div>
      `)
      .join("");
  } catch (error) {
    renderEmptyList(purchasesList, "Could not load your purchases.");
  }
};

const loadNotificationStats = async () => {
  try {
    const response = await fetch(`${BASE_URL}/notifications`, {
      headers: authHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load notifications");
    }

    const unreadCount = Number(data.unreadCount || 0);
    setText(unreadNotificationsCount, unreadCount);
    setNotificationBadges(unreadCount);
  } catch (error) {
    setText(unreadNotificationsCount, 0);
    setNotificationBadges(0);
  }
};

if (["admin", "superadmin"].includes(user.role)) {
  adminSidebarLinks.forEach((link) => link.classList.remove("hidden"));
  adminDashboardCard.innerHTML = `
    <div class="glass-card dashboard-card admin-dashboard-access">
      <h2>Admin Controls</h2>
      <p class="text-secondary">You have administrator access.</p>
      <div class="dashboard-admin-actions">
        <a href="./admin.html" class="btn btn-primary">Open Admin Panel</a>
        <a href="./reports.html" class="btn btn-outline">Review Reports</a>
        <a href="./revenue.html" class="btn btn-outline">Revenue</a>
      </div>
    </div>
  `;
}

loadMyNoteStats();
loadMyPurchases();
loadNotificationStats();
