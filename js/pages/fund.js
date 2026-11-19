/**
 * [UI] Tab Quỹ chung (Task T3CCFBA)
 * Tương thích với cấu trúc dữ liệu:
 *  - FundBalanceResponse: { group_id, total_income, total_expense, balance }
 *  - FundTransaction: { transaction_id, group_id, type ('INCOME'|'EXPENSE'), amount, category, payer_id, description, occurred_at, proof_image_url, created_by, created_at }
 *  - Collection: { collection_id, group_id, name, amount_per_member, due_date, status ('ACTIVE'|'COMPLETED'|'CANCELLED'), created_by, created_at, members: [...] }
 */

const GROUP_ID = 1;
const STORAGE_KEY = "nhom2_fund_tab_state_v1";

// Dữ liệu mặc định khi chạy giao diện độc lập (fallback nếu backend chưa chạy)
const DEFAULT_STATE = {
  group: {
    group_id: GROUP_ID,
    name: "Nhóm 2 - Quản lý Quỹ Nhóm",
  },
  currentRole: "HOST", // "HOST" | "USER"
  currentUserId: 1,
  members: [
    { user_id: 1, display_name: "Lê Nguyễn Hữu Quốc", role: "HOST" },
    { user_id: 2, display_name: "Nguyễn Hữu Minh Dương", role: "USER" },
    { user_id: 3, display_name: "Trần Thị Bảo Ngọc", role: "USER" },
    { user_id: 4, display_name: "Phạm Minh Tuấn", role: "USER" },
  ],
  transactions: [
    {
      transaction_id: 101,
      group_id: GROUP_ID,
      type: "INCOME",
      amount: 200000,
      category: "Đóng quỹ định kỳ",
      payer_id: 1,
      description: "Đóng quỹ tháng 11/2026",
      occurred_at: "2026-11-10T09:15:00",
      proof_image_url: "",
      created_by: 1,
      created_at: "2026-11-10T09:15:00",
    },
    {
      transaction_id: 102,
      group_id: GROUP_ID,
      type: "INCOME",
      amount: 200000,
      category: "Đóng quỹ định kỳ",
      payer_id: 2,
      description: "Đóng quỹ tháng 11/2026 (chuyển khoản)",
      occurred_at: "2026-11-11T14:30:00",
      proof_image_url: "https://example.com/chung-tu-ck-102.jpg",
      created_by: 1,
      created_at: "2026-11-11T14:30:00",
    },
    {
      transaction_id: 103,
      group_id: GROUP_ID,
      type: "INCOME",
      amount: 100000,
      category: "Đóng quỹ định kỳ",
      payer_id: 3,
      description: "Đóng trước một phần quỹ tháng 11",
      occurred_at: "2026-11-12T18:05:00",
      proof_image_url: "",
      created_by: 1,
      created_at: "2026-11-12T18:05:00",
    },
    {
      transaction_id: 104,
      group_id: GROUP_ID,
      type: "EXPENSE",
      amount: 230000,
      category: "Ăn uống",
      payer_id: 1,
      description: "Ăn trưa Bún đậu mắm tôm cả nhóm",
      occurred_at: "2026-11-14T12:20:00",
      proof_image_url: "https://example.com/hoa-don-bun-dau.jpg",
      created_by: 1,
      created_at: "2026-11-14T12:25:00",
    },
  ],
  collections: [
    {
      collection_id: 1,
      group_id: GROUP_ID,
      name: "Đóng quỹ tháng 11/2026",
      amount_per_member: 200000,
      due_date: "2026-11-25T23:59:00",
      status: "ACTIVE",
      created_by: 1,
      created_at: "2026-11-05T08:00:00",
      member_statuses: [
        { user_id: 1, amount_paid: 200000, status: "PAID", paid_at: "2026-11-10T09:15:00" },
        { user_id: 2, amount_paid: 200000, status: "PAID", paid_at: "2026-11-11T14:30:00" },
        { user_id: 3, amount_paid: 100000, status: "PARTIAL", paid_at: "2026-11-12T18:05:00" },
        { user_id: 4, amount_paid: 0, status: "UNPAID", paid_at: null },
      ],
    },
    {
      collection_id: 2,
      group_id: GROUP_ID,
      name: "Quỹ liên hoan khai giảng tháng 10",
      amount_per_member: 150000,
      due_date: "2026-10-20T23:59:00",
      status: "COMPLETED",
      created_by: 1,
      created_at: "2026-10-05T10:00:00",
      member_statuses: [
        { user_id: 1, amount_paid: 150000, status: "PAID", paid_at: "2026-10-10T10:00:00" },
        { user_id: 2, amount_paid: 150000, status: "PAID", paid_at: "2026-10-11T09:20:00" },
        { user_id: 3, amount_paid: 150000, status: "PAID", paid_at: "2026-10-12T16:45:00" },
        { user_id: 4, amount_paid: 150000, status: "PAID", paid_at: "2026-10-14T20:10:00" },
      ],
    },
  ],
};

let state = loadState();
let collectionFilter = "ALL";
let transactionFilter = "ALL";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Không đọc được localStorage:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Không lưu được localStorage:", e);
  }
}

// =========================================================
// TÍNH SỐ DƯ QUỸ (Tương đương get_group_fund_balance)
// =========================================================
function getGroupFundBalance(groupId) {
  const groupTxs = state.transactions.filter((tx) => tx.group_id === groupId);

  const total_income = groupTxs
    .filter((tx) => tx.type === "INCOME")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const total_expense = groupTxs
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const balance = total_income - total_expense;

  return {
    group_id: groupId,
    total_income,
    total_expense,
    balance,
  };
}

// =========================================================
// HELPERS ĐỊNH DẠNG
// =========================================================
function formatVND(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + " ₫";
}

function formatDateTime(isoStr) {
  if (!isoStr) return "Không giới hạn";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return escapeHtml(isoStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLocalDateTimeInputValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

function getMemberName(userId) {
  const m = state.members.find((u) => Number(u.user_id) === Number(userId));
  return m ? m.display_name : `Thành viên #${userId}`;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3200);
}

// =========================================================
// RENDER UI
// =========================================================
function renderAll() {
  renderRoleControls();
  renderBalanceCard();
  renderCollections();
  renderTransactions();
}

function renderRoleControls() {
  const isHost = state.currentRole === "HOST";

  document.getElementById("roleHostBtn").classList.toggle("active", isHost);
  document.getElementById("roleMemberBtn").classList.toggle("active", !isHost);

  document.getElementById("hostActionButtons").classList.toggle("hidden", !isHost);
  document.getElementById("memberOnlyNotice").classList.toggle("hidden", isHost);
}

function renderBalanceCard() {
  const { total_income, total_expense, balance } = getGroupFundBalance(GROUP_ID);

  const balanceEl = document.getElementById("fundBalance");
  balanceEl.textContent = formatVND(balance);
  balanceEl.classList.toggle("negative", balance < 0);

  document.getElementById("totalIncome").textContent = "+" + formatVND(total_income);
  document.getElementById("totalExpense").textContent = "−" + formatVND(total_expense);

  const activeCount = state.collections.filter((c) => c.status === "ACTIVE").length;
  document.getElementById("activeCollectionCount").textContent = `${activeCount} đợt`;
}

function renderCollectionStatusBadge(status) {
  switch (status) {
    case "ACTIVE":
      return '<span class="status-badge status-active">Đang thu</span>';
    case "COMPLETED":
      return '<span class="status-badge status-completed">Hoàn thành</span>';
    case "CANCELLED":
      return '<span class="status-badge status-cancelled">Đã hủy</span>';
    default:
      return `<span class="status-badge">${escapeHtml(status)}</span>`;
  }
}

function renderMemberPaymentBadge(status) {
  switch (status) {
    case "PAID":
      return '<span class="status-badge status-paid">Đã đóng</span>';
    case "PARTIAL":
      return '<span class="status-badge status-partial">Đóng một phần</span>';
    default:
      return '<span class="status-badge status-unpaid">Chưa đóng</span>';
  }
}

function renderCollections() {
  const container = document.getElementById("collectionList");
  const isHost = state.currentRole === "HOST";

  const filtered = state.collections.filter((col) =>
    collectionFilter === "ALL" ? true : col.status === collectionFilter
  );

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state">Không có đợt thu nào phù hợp bộ lọc.</div>';
    return;
  }

  container.innerHTML = filtered
    .map((col) => {
      const totalMembers = col.member_statuses.length;
      const paidMembers = col.member_statuses.filter((m) => m.status === "PAID").length;
      const totalExpected = col.amount_per_member * totalMembers;
      const totalCollected = col.member_statuses.reduce((s, m) => s + Number(m.amount_paid || 0), 0);
      const percent = totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 0;

      const memberRows = col.member_statuses
        .map((ms) => {
          const memberName = getMemberName(ms.user_id);
          const remaining = Math.max(0, col.amount_per_member - Number(ms.amount_paid || 0));

          let actionCell = "—";
          if (isHost && col.status === "ACTIVE" && ms.status !== "PAID") {
            actionCell = `
              <button
                type="button"
                class="btn btn-primary btn-sm"
                onclick="confirmMemberPayment(${col.collection_id}, ${ms.user_id})"
              >
                Xác nhận đã đóng
              </button>
            `;
          } else if (ms.status === "PAID") {
            actionCell = `<span style="color:#059669; font-weight:700;">Hoàn tất</span>`;
          }

          return `
            <tr>
              <td>
                <div class="member-name-cell">
                  <span class="member-avatar">${escapeHtml(getInitials(memberName))}</span>
                  <span>${escapeHtml(memberName)}</span>
                </div>
              </td>
              <td>${formatVND(col.amount_per_member)}</td>
              <td class="text-income" style="font-weight:700;">${formatVND(ms.amount_paid)}</td>
              <td class="${remaining > 0 ? "text-expense" : ""}">${formatVND(remaining)}</td>
              <td>${renderMemberPaymentBadge(ms.status)}</td>
              <td>${ms.paid_at ? formatDateTime(ms.paid_at) : "—"}</td>
              ${isHost ? `<td>${actionCell}</td>` : ""}
            </tr>
          `;
        })
        .join("");

      return `
        <article class="collection-item">
          <div class="collection-head">
            <div>
              <div class="collection-title-row">
                <span class="collection-name">${escapeHtml(col.name)}</span>
                ${renderCollectionStatusBadge(col.status)}
              </div>
              <div class="collection-meta">
                <span>Mức đóng: <strong>${formatVND(col.amount_per_member)} / người</strong></span>
                <span>Hạn nộp: <strong>${formatDateTime(col.due_date)}</strong></span>
                <span>Người tạo: <strong>${escapeHtml(getMemberName(col.created_by))}</strong></span>
              </div>
            </div>
            ${
              isHost && col.status === "ACTIVE"
                ? `<button type="button" class="btn btn-outline btn-sm" onclick="cancelCollection(${col.collection_id})">Đóng / Hủy đợt</button>`
                : ""
            }
          </div>

          <div class="collection-progress-wrap">
            <div class="progress-info">
              <span>Tiến độ: ${paidMembers}/${totalMembers} thành viên đã đóng đủ</span>
              <span>${formatVND(totalCollected)} / ${formatVND(totalExpected)} (${percent}%)</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percent}%;"></div>
            </div>
          </div>

          <div class="member-table-wrap">
            <table class="member-table">
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th>Phải đóng</th>
                  <th>Đã đóng</th>
                  <th>Còn thiếu</th>
                  <th>Trạng thái</th>
                  <th>Thời điểm đóng</th>
                  ${isHost ? "<th>Thao tác (Host)</th>" : ""}
                </tr>
              </thead>
              <tbody>
                ${memberRows}
              </tbody>
            </table>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTransactions() {
  const tbody = document.getElementById("transactionTableBody");

  const filtered = state.transactions
    .filter((tx) => (transactionFilter === "ALL" ? true : tx.type === transactionFilter))
    .slice()
    .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có giao dịch nào phù hợp.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((tx) => {
      const isIncome = tx.type === "INCOME";
      const proofHtml = tx.proof_image_url
        ? `<br><a class="proof-link" href="${escapeHtml(tx.proof_image_url)}" target="_blank" rel="noopener noreferrer">Xem ảnh chứng từ</a>`
        : "";

      return `
        <tr>
          <td>${formatDateTime(tx.occurred_at)}</td>
          <td>
            <span class="tx-type-badge ${isIncome ? "tx-income" : "tx-expense"}">
              ${isIncome ? "THU" : "CHI"}
            </span>
          </td>
          <td><strong>${escapeHtml(tx.category || "Chưa phân loại")}</strong></td>
          <td>${tx.payer_id ? escapeHtml(getMemberName(tx.payer_id)) : "—"}</td>
          <td>${escapeHtml(tx.description || "Không có mô tả")}${proofHtml}</td>
          <td style="text-align: right; font-weight: 900;" class="${isIncome ? "text-income" : "text-expense"}">
            ${isIncome ? "+" : "−"}${formatVND(tx.amount)}
          </td>
        </tr>
      `;
    })
    .join("");
}

// =========================================================
// MODAL & FORM HANDLERS
// =========================================================
function populatePayerSelect() {
  const select = document.getElementById("txPayerId");
  select.innerHTML = state.members
    .map((m) => `<option value="${m.user_id}">${escapeHtml(m.display_name)}</option>`)
    .join("");
}

function setTransactionFormType(type) {
  document.getElementById("txType").value = type;
  const isIncome = type === "INCOME";

  document.getElementById("chooseIncomeBtn").classList.toggle("active-income", isIncome);
  document.getElementById("chooseExpenseBtn").classList.toggle("active-expense", !isIncome);
  document.getElementById("txPayerLabel").textContent = isIncome ? "Người nộp tiền" : "Người thực hiện chi";
  document.getElementById("txSubmitBtn").textContent = isIncome ? "Lưu khoản THU" : "Lưu khoản CHI";
  document.getElementById("txSubmitBtn").className = isIncome ? "btn btn-income" : "btn btn-expense";
}

function openTransactionModal(defaultType = "INCOME") {
  if (state.currentRole !== "HOST") {
    showToast("Chỉ Host mới có quyền tạo giao dịch Thu/Chi!", "error");
    return;
  }
  document.getElementById("transactionForm").reset();
  populatePayerSelect();
  setTransactionFormType(defaultType);
  document.getElementById("txOccurredAt").value = getLocalDateTimeInputValue();
  document.getElementById("transactionModal").hidden = false;
}

function openCollectionModal() {
  if (state.currentRole !== "HOST") {
    showToast("Chỉ Host mới có quyền tạo đợt thu quỹ!", "error");
    return;
  }
  document.getElementById("collectionForm").reset();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  document.getElementById("colDueDate").value = getLocalDateTimeInputValue(nextWeek);
  document.getElementById("collectionModal").hidden = false;
}

function closeModal(modalId) {
  document.getElementById(modalId).hidden = true;
}

async function handleTransactionSubmit(e) {
  e.preventDefault();
  if (state.currentRole !== "HOST") {
    showToast("Bạn không có quyền thực hiện thao tác này.", "error");
    return;
  }

  const payload = {
    group_id: GROUP_ID,
    type: document.getElementById("txType").value,
    amount: parseInt(document.getElementById("txAmount").value, 10),
    category: document.getElementById("txCategory").value.trim() || null,
    payer_id: parseInt(document.getElementById("txPayerId").value, 10) || null,
    description: document.getElementById("txDescription").value.trim() || null,
    occurred_at: document.getElementById("txOccurredAt").value || new Date().toISOString(),
    proof_image_url: document.getElementById("txProofUrl").value.trim() || null,
  };

  if (!payload.amount || payload.amount <= 0) {
    showToast("Vui lòng nhập số tiền hợp lệ lớn hơn 0.", "error");
    return;
  }

  // Thử gọi backend API; nếu backend chưa chạy thì lưu trực tiếp vào state local
  let createdTx = null;
  try {
    createdTx = await api.post(`/groups/${GROUP_ID}/fund-transactions`, payload);
  } catch (err) {
    createdTx = {
      ...payload,
      transaction_id: Date.now(),
      created_by: state.currentUserId,
      created_at: new Date().toISOString(),
    };
  }

  state.transactions.unshift(createdTx);
  saveState();
  closeModal("transactionModal");
  renderAll();
  showToast(
    payload.type === "INCOME"
      ? `Đã ghi nhận khoản THU ${formatVND(payload.amount)}`
      : `Đã ghi nhận khoản CHI ${formatVND(payload.amount)}`,
    "success"
  );
}

async function handleCollectionSubmit(e) {
  e.preventDefault();
  if (state.currentRole !== "HOST") {
    showToast("Chỉ Host mới có quyền tạo đợt thu!", "error");
    return;
  }

  const payload = {
    group_id: GROUP_ID,
    name: document.getElementById("colName").value.trim(),
    amount_per_member: parseInt(document.getElementById("colAmount").value, 10),
    due_date: document.getElementById("colDueDate").value || null,
  };

  if (!payload.name || !payload.amount_per_member || payload.amount_per_member <= 0) {
    showToast("Vui lòng nhập đầy đủ tên đợt thu và số tiền hợp lệ.", "error");
    return;
  }

  let newCol = null;
  try {
    newCol = await api.post(`/groups/${GROUP_ID}/collections`, payload);
  } catch (err) {
    newCol = {
      ...payload,
      collection_id: Date.now(),
      status: "ACTIVE",
      created_by: state.currentUserId,
      created_at: new Date().toISOString(),
      member_statuses: state.members.map((m) => ({
        user_id: m.user_id,
        amount_paid: 0,
        status: "UNPAID",
        paid_at: null,
      })),
    };
  }

  state.collections.unshift(newCol);
  saveState();
  closeModal("collectionModal");
  renderAll();
  showToast(`Đã tạo đợt thu "${payload.name}"`, "success");
}

// Host xác nhận một thành viên đã đóng đủ cho đợt thu -> tự cộng vào THU quỹ
window.confirmMemberPayment = function (collectionId, userId) {
  if (state.currentRole !== "HOST") return;
  const col = state.collections.find((c) => c.collection_id === collectionId);
  if (!col) return;

  const ms = col.member_statuses.find((m) => m.user_id === userId);
  if (!ms || ms.status === "PAID") return;

  const remaining = Math.max(0, col.amount_per_member - Number(ms.amount_paid || 0));
  const nowIso = new Date().toISOString();

  ms.amount_paid = col.amount_per_member;
  ms.status = "PAID";
  ms.paid_at = nowIso;

  // Nếu tất cả đã đóng đủ -> chuyển đợt thu sang COMPLETED
  if (col.member_statuses.every((m) => m.status === "PAID")) {
    col.status = "COMPLETED";
  }

  // Ghi nhận tự động giao dịch INCOME tương ứng phần tiền vừa thu
  if (remaining > 0) {
    state.transactions.unshift({
      transaction_id: Date.now(),
      group_id: GROUP_ID,
      type: "INCOME",
      amount: remaining,
      category: "Đóng quỹ định kỳ",
      payer_id: userId,
      description: `Xác nhận đóng đợt thu: ${col.name}`,
      occurred_at: nowIso,
      proof_image_url: "",
      created_by: state.currentUserId,
      created_at: nowIso,
    });
  }

  saveState();
  renderAll();
  showToast(`Đã xác nhận ${getMemberName(userId)} đóng ${formatVND(remaining)}`, "success");
};

window.cancelCollection = function (collectionId) {
  if (state.currentRole !== "HOST") return;
  const col = state.collections.find((c) => c.collection_id === collectionId);
  if (!col) return;
  if (!confirm(`Bạn có chắc muốn hủy đợt thu "${col.name}"?`)) return;

  col.status = "CANCELLED";
  saveState();
  renderAll();
  showToast(`Đã hủy đợt thu "${col.name}"`, "success");
};

// =========================================================
// ĐỒNG BỘ DỮ LIỆU TỪ BACKEND (NẾU CÓ) & KHỞI TẠO
// =========================================================
async function trySyncFromBackend() {
  try {
    const balanceRes = await api.get(`/groups/${GROUP_ID}/fund-balance`);
    if (balanceRes && typeof balanceRes.balance === "number") {
      document.getElementById("fundBalance").textContent = formatVND(balanceRes.balance);
      document.getElementById("totalIncome").textContent = "+" + formatVND(balanceRes.total_income);
      document.getElementById("totalExpense").textContent = "−" + formatVND(balanceRes.total_expense);
    }
  } catch (err) {
    // Fallback mượt mà sang dữ liệu local/mock khi mở HTML tĩnh
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("groupName").textContent = state.group.name;
  document.getElementById("groupIdLabel").textContent = `#${state.group.group_id}`;

  // Chuyển vai trò demo (Host / Thành viên)
  document.querySelectorAll(".role-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentRole = btn.dataset.role;
      saveState();
      renderAll();
      showToast(
        state.currentRole === "HOST"
          ? "Đang xem với quyền Host (đầy đủ nút Thu/Chi)"
          : "Đang xem với quyền Thành viên (chỉ xem)",
        "success"
      );
    });
  });

  // Mở modal Thu / Chi / Tạo đợt thu
  document.getElementById("btnOpenIncome").addEventListener("click", () => openTransactionModal("INCOME"));
  document.getElementById("btnOpenExpense").addEventListener("click", () => openTransactionModal("EXPENSE"));
  document.getElementById("btnOpenCollection").addEventListener("click", openCollectionModal);

  // Chuyển loại Thu / Chi trong modal
  document.getElementById("chooseIncomeBtn").addEventListener("click", () => setTransactionFormType("INCOME"));
  document.getElementById("chooseExpenseBtn").addEventListener("click", () => setTransactionFormType("EXPENSE"));

  // Đóng modal
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
  });

  // Bộ lọc đợt thu
  document.querySelectorAll("#collectionFilters .filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#collectionFilters .filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      collectionFilter = chip.dataset.status;
      renderCollections();
    });
  });

  // Bộ lọc giao dịch
  document.querySelectorAll("#transactionFilters .filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#transactionFilters .filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      transactionFilter = chip.dataset.type;
      renderTransactions();
    });
  });

  // Submit form
  document.getElementById("transactionForm").addEventListener("submit", handleTransactionSubmit);
  document.getElementById("collectionForm").addEventListener("submit", handleCollectionSubmit);

  renderAll();
  trySyncFromBackend();
});
