import {
  getFundSummary,
  getCollectionCampaigns,
  createFundIncome,
  createFundExpense,
  getStoredUserRole,
} from "../fundApi.js";
import { DEFAULT_GROUP_ID } from "../config.js";

function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(amount || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isHostUser() {
  const role = getStoredUserRole();
  return role === "HOST" || role === "ADMIN";
}

function renderCampaignsHtml(campaignsData) {
  const campaigns = Array.isArray(campaignsData)
    ? campaignsData
    : campaignsData?.items || campaignsData?.campaigns || campaignsData?.collections || [];

  if (!campaigns.length) {
    return `<p class="fund-empty">Chưa có đợt thu quỹ nào trong nhóm.</p>`;
  }

  return campaigns
    .map((campaign) => {
      const members =
        campaign.member_statuses ||
        campaign.members ||
        campaign.debts ||
        campaign.contributions ||
        [];
      const paidCount = members.filter(
        (m) =>
          String(m.status || "").toUpperCase() === "PAID" || m.is_paid === true
      ).length;

      const title = escapeHtml(campaign.title || campaign.name || "Đợt thu quỹ");
      const amountPerMember = formatVND(
        campaign.amount_per_member ?? campaign.amount ?? 0
      );
      const dueDate = campaign.due_date
        ? `<span class="fund-campaign-meta">Hạn đóng: ${escapeHtml(String(campaign.due_date).slice(0, 10))}</span>`
        : "";

      const membersHtml = members.length
        ? members
            .map((member) => {
              const isPaid =
                String(member.status || "").toUpperCase() === "PAID" ||
                member.is_paid === true;
              const memberName = escapeHtml(
                member.full_name ||
                  member.member_name ||
                  member.display_name ||
                  member.username ||
                  `Thành viên #${member.user_id || member.id || "?"}`
              );
              return `
                <li class="fund-member-row">
                  <span class="fund-member-name">${memberName}</span>
                  <span class="fund-status-badge ${isPaid ? "paid" : "unpaid"}">
                    ${isPaid ? "Đã đóng" : "Chưa đóng"}
                  </span>
                </li>
              `;
            })
            .join("")
        : `<li class="fund-member-row fund-muted">Chưa có danh sách thành viên cho đợt thu này.</li>`;

      return `
        <article class="fund-campaign-card">
          <div class="fund-campaign-head">
            <div>
              <h4 class="fund-campaign-title">${title}</h4>
              <div class="fund-campaign-sub">
                <span class="fund-campaign-meta">Mức đóng: <strong>${amountPerMember}</strong></span>
                ${dueDate}
              </div>
            </div>
            <span class="fund-progress-badge">${paidCount}/${members.length} đã đóng</span>
          </div>
          <ul class="fund-member-list">
            ${membersHtml}
          </ul>
        </article>
      `;
    })
    .join("");
}

export async function renderFundTab(container, groupId = DEFAULT_GROUP_ID) {
  const isHost = isHostUser();

  container.innerHTML = `
    <section class="fund-tab">
      <div class="fund-balance-card">
        <div class="fund-balance-info">
          <span class="fund-label">Số dư quỹ chung hiện tại (Nhóm #${escapeHtml(groupId)})</span>
          <h2 id="fund-balance-value" class="fund-amount">Đang tải...</h2>
          <div class="fund-stats">
            <span class="fund-stat">Tổng thu: <strong id="fund-total-income">--</strong></span>
            <span class="fund-stat">Tổng chi: <strong id="fund-total-expense">--</strong></span>
          </div>
        </div>

        ${
          isHost
            ? `
          <div class="fund-host-actions">
            <button id="btn-open-income" type="button" class="fund-btn fund-btn-income">+ Tạo khoản thu</button>
            <button id="btn-open-expense" type="button" class="fund-btn fund-btn-expense">- Ghi khoản chi</button>
          </div>
        `
            : `<span class="fund-role-note">Chế độ Thành viên (chỉ xem)</span>`
        }
      </div>

      ${
        isHost
          ? `
        <div id="fund-form-wrapper" class="fund-form-card hidden">
          <div class="fund-form-header">
            <h3 id="fund-form-title">Ghi nhận giao dịch quỹ</h3>
            <button id="btn-close-form" type="button" class="fund-btn-close" aria-label="Đóng">&times;</button>
          </div>

          <form id="fund-transaction-form" class="fund-form">
            <input type="hidden" id="fund-tx-type" value="INCOME" />

            <div class="fund-field">
              <label for="fund-title" id="fund-title-label">Tên đợt thu / Danh mục *</label>
              <input id="fund-title" type="text" required placeholder="VD: Quỹ tháng 11 / Tiền sân cầu lông" />
            </div>

            <div class="fund-field">
              <label for="fund-amount" id="fund-amount-label">Số tiền (VNĐ) *</label>
              <input id="fund-amount" type="number" min="1000" step="1000" required placeholder="VD: 100000" />
            </div>

            <div class="fund-field">
              <label for="fund-description">Ghi chú</label>
              <textarea id="fund-description" rows="2" placeholder="Nhập mô tả chi tiết (không bắt buộc)"></textarea>
            </div>

            <div class="fund-form-actions">
              <button type="submit" id="btn-submit-fund" class="fund-btn fund-btn-primary">Lưu giao dịch</button>
              <button type="button" id="btn-cancel-form" class="fund-btn fund-btn-secondary">Hủy</button>
            </div>
            <p id="fund-form-message" class="fund-message"></p>
          </form>
        </div>
      `
          : ""
      }

      <div class="fund-campaigns-section">
        <div class="fund-section-header">
          <h3>Danh sách đợt thu &amp; trạng thái đóng của từng thành viên</h3>
          <button id="btn-reload-fund" type="button" class="fund-btn fund-btn-light">Làm mới</button>
        </div>
        <div id="fund-campaigns-list" class="fund-campaigns-list">
          <p class="fund-loading">Đang tải dữ liệu quỹ chung...</p>
        </div>
      </div>
    </section>
  `;

  const balanceEl = container.querySelector("#fund-balance-value");
  const incomeEl = container.querySelector("#fund-total-income");
  const expenseEl = container.querySelector("#fund-total-expense");
  const listEl = container.querySelector("#fund-campaigns-list");
  const reloadBtn = container.querySelector("#btn-reload-fund");

  async function loadFundData() {
    listEl.innerHTML = `<p class="fund-loading">Đang tải danh sách đợt thu...</p>`;
    try {
      const [summary, campaigns] = await Promise.all([
        getFundSummary(groupId),
        getCollectionCampaigns(groupId),
      ]);

      // Backend /fund-overview trả về summary.balance là object { balance, total_income, total_expense }
      const balObj =
        summary && typeof summary.balance === "object" && summary.balance !== null
          ? summary.balance
          : summary || {};

      balanceEl.textContent = formatVND(
        balObj.balance ?? balObj.current_balance ?? 0
      );
      incomeEl.textContent = formatVND(balObj.total_income ?? 0);
      expenseEl.textContent = formatVND(balObj.total_expense ?? 0);
      listEl.innerHTML = renderCampaignsHtml(campaigns || summary?.collections);
    } catch (error) {
      balanceEl.textContent = "Lỗi kết nối";
      incomeEl.textContent = "--";
      expenseEl.textContent = "--";
      listEl.innerHTML = `<p class="fund-error">Không thể tải dữ liệu từ Backend: ${escapeHtml(error.message)}</p>`;
    }
  }

  reloadBtn.addEventListener("click", loadFundData);

  if (isHost) {
    const formWrapper = container.querySelector("#fund-form-wrapper");
    const formTitle = container.querySelector("#fund-form-title");
    const titleLabel = container.querySelector("#fund-title-label");
    const amountLabel = container.querySelector("#fund-amount-label");
    const txTypeInput = container.querySelector("#fund-tx-type");
    const form = container.querySelector("#fund-transaction-form");
    const submitBtn = container.querySelector("#btn-submit-fund");
    const msgEl = container.querySelector("#fund-form-message");

    const openForm = (type) => {
      txTypeInput.value = type;
      if (type === "INCOME") {
        formTitle.textContent = "Tạo khoản thu / Đợt thu quỹ";
        titleLabel.textContent = "Tên đợt thu / Khoản thu *";
        amountLabel.textContent = "Số tiền mỗi người / Số tiền thu (VNĐ) *";
      } else {
        formTitle.textContent = "Ghi nhận khoản chi từ quỹ";
        titleLabel.textContent = "Nội dung / Danh mục chi *";
        amountLabel.textContent = "Số tiền chi (VNĐ) *";
      }
      msgEl.textContent = "";
      msgEl.className = "fund-message";
      formWrapper.classList.remove("hidden");
    };

    const closeForm = () => {
      form.reset();
      msgEl.textContent = "";
      msgEl.className = "fund-message";
      formWrapper.classList.add("hidden");
    };

    container
      .querySelector("#btn-open-income")
      .addEventListener("click", () => openForm("INCOME"));
    container
      .querySelector("#btn-open-expense")
      .addEventListener("click", () => openForm("EXPENSE"));
    container
      .querySelector("#btn-close-form")
      .addEventListener("click", closeForm);
    container
      .querySelector("#btn-cancel-form")
      .addEventListener("click", closeForm);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const type = txTypeInput.value;
      const title = container.querySelector("#fund-title").value.trim();
      const amount = Number(container.querySelector("#fund-amount").value);
      const description = container
        .querySelector("#fund-description")
        .value.trim();

      if (!title) {
        msgEl.textContent = "Vui lòng nhập tên khoản thu/chi.";
        msgEl.className = "fund-message error";
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        msgEl.textContent = "Số tiền phải lớn hơn 0 VNĐ.";
        msgEl.className = "fund-message error";
        return;
      }

      const payload = {
        type,
        category: title,
        amount,
        description: description || title,
      };

      submitBtn.disabled = true;
      msgEl.textContent = "Đang gửi dữ liệu...";
      msgEl.className = "fund-message";

      try {
        if (type === "INCOME") {
          await createFundIncome(groupId, payload);
        } else {
          await createFundExpense(groupId, payload);
        }
        msgEl.textContent = "Lưu giao dịch thành công!";
        msgEl.className = "fund-message success";
        await loadFundData();
        setTimeout(closeForm, 700);
      } catch (error) {
        msgEl.textContent = `Thất bại: ${error.message}`;
        msgEl.className = "fund-message error";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  await loadFundData();
}