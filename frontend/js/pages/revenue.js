const revenueUser = getUser();

const revenueContent = document.getElementById("revenueContent");
const revenueAccessDenied = document.getElementById("revenueAccessDenied");
const logoutBtn = document.getElementById("logoutBtn");
const totalRevenueEl = document.getElementById("totalRevenue");
const premiumUsersEl = document.getElementById("premiumUsers");
const paidDownloadsEl = document.getElementById("paidDownloads");
const revenueStatus = document.getElementById("revenueStatus");
const purchaseTableBody = document.getElementById("purchaseTableBody");
const purchaseSearchInput = document.getElementById("purchaseSearchInput");
const exportPurchasesBtn = document.getElementById("exportPurchasesBtn");

let purchaseRecords = [];

const isRevenueAdmin = revenueUser && ["admin", "superadmin"].includes(revenueUser.role);

if (!revenueUser) {
  window.location.href = "./login.html";
}

if (revenueUser && !isRevenueAdmin) {
  revenueContent?.classList.add("hidden");
  revenueAccessDenied?.classList.remove("hidden");
}

logoutBtn?.addEventListener("click", logout);

const formatCurrency = (amount) => `৳ ${Number(amount || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const safeText = (value, fallback = "—") => value || fallback;

const renderPurchases = () => {
  if (!purchaseTableBody) {
    return;
  }

  const searchValue = (purchaseSearchInput?.value || "").trim().toLowerCase();

  const filteredPurchases = purchaseRecords.filter((purchase) => {
    const buyerName = purchase.buyer?.fullName || "";
    const buyerEmail = purchase.buyer?.email || "";
    const noteTitle = purchase.note?.title || "";
    const category = purchase.note?.category || "";
    const sellerName = purchase.note?.seller?.fullName || "";
    const sellerEmail = purchase.note?.seller?.email || "";

    return [buyerName, buyerEmail, noteTitle, category, sellerName, sellerEmail]
      .join(" ")
      .toLowerCase()
      .includes(searchValue);
  });

  if (!filteredPurchases.length) {
    purchaseTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <h2>No purchases found</h2>
            <p class="text-secondary">${purchaseRecords.length ? "Try another search keyword." : "Paid purchase records will appear here."}</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  purchaseTableBody.innerHTML = filteredPurchases
    .map((purchase) => {
      const buyerName = safeText(purchase.buyer?.fullName, "Deleted user");
      const buyerEmail = safeText(purchase.buyer?.email, "No email");
      const buyerUniversity = purchase.buyer?.university || "";
      const noteTitle = safeText(purchase.note?.title, "Deleted note");
      const noteCategory = safeText(purchase.note?.category, "No category");
      const sellerName = safeText(purchase.note?.seller?.fullName, "Unknown seller");
      const sellerEmail = safeText(purchase.note?.seller?.email, "No email");
      const noteLink = purchase.note?._id
        ? `./note-details.html?id=${purchase.note._id}`
        : "#";

      return `
        <tr>
          <td>
            <div class="revenue-primary-cell">
              <strong>${buyerName}</strong>
              <span>${buyerEmail}</span>
              ${buyerUniversity ? `<small>${buyerUniversity}</small>` : ""}
            </div>
          </td>
          <td>
            <div class="revenue-primary-cell">
              <strong>${noteTitle}</strong>
              <span>${noteCategory}</span>
            </div>
          </td>
          <td>
            <div class="revenue-primary-cell">
              <strong>${sellerName}</strong>
              <span>${sellerEmail}</span>
            </div>
          </td>
          <td><strong>${formatCurrency(purchase.amount)}</strong></td>
          <td><span class="revenue-status-chip">${purchase.status || "paid"}</span></td>
          <td>${formatDate(purchase.purchasedAt)}</td>
          <td>
            <a href="${noteLink}" class="btn btn-outline ${purchase.note?._id ? "" : "disabled-link"}">View Note</a>
          </td>
        </tr>
      `;
    })
    .join("");
};

const exportPurchases = () => {
  if (!purchaseRecords.length) {
    return showToast("No purchases to export", "error");
  }

  const rows = [
    ["Buyer", "Buyer Email", "Note", "Category", "Seller", "Seller Email", "Amount", "Status", "Date"],
    ...purchaseRecords.map((purchase) => [
      purchase.buyer?.fullName || "Deleted user",
      purchase.buyer?.email || "",
      purchase.note?.title || "Deleted note",
      purchase.note?.category || "",
      purchase.note?.seller?.fullName || "Unknown seller",
      purchase.note?.seller?.email || "",
      purchase.amount || 0,
      purchase.status || "paid",
      formatDate(purchase.purchasedAt),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "diginote-purchases.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const loadRevenue = async () => {
  if (!isRevenueAdmin) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/revenue`, {
      headers: {
        Authorization: `Bearer ${revenueUser.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message || "Failed to load revenue", "error");
    }

    purchaseRecords = Array.isArray(data.purchases) ? data.purchases : [];

    totalRevenueEl.innerText = formatCurrency(data.totalRevenue || 0);
    premiumUsersEl.innerText = Number(data.premiumUsers || 0).toLocaleString();
    paidDownloadsEl.innerText = Number(data.paidDownloads || 0).toLocaleString();

    revenueStatus.innerText = purchaseRecords.length
      ? "Revenue is calculated from successful paid note purchases."
      : "No paid notes have been sold yet. Revenue starts from ৳ 0.";

    renderPurchases();
  } catch (error) {
    showToast("Failed to load revenue", "error");
  }
};

purchaseSearchInput?.addEventListener("input", renderPurchases);
exportPurchasesBtn?.addEventListener("click", exportPurchases);

loadRevenue();
