import { renderFundTab } from "./pages/fund.js";
import { DEFAULT_GROUP_ID } from "./config.js";

async function loadOptionalPage(modulePath, container) {
  try {
    const mod = await import(modulePath);
    const renderFn =
      mod.default ||
      Object.values(mod).find((exported) => typeof exported === "function");
    if (renderFn) {
      await renderFn(container);
    }
  } catch (error) {
    container.innerHTML = `<p class="fund-error">Không thể tải trang: ${error.message}</p>`;
  }
}

export async function switchTab(tabName) {
  const container = document.getElementById("app");
  if (!container) return;

  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  if (tabName === "fund") {
    await renderFundTab(container, DEFAULT_GROUP_ID);
    return;
  }

  if (tabName === "home") {
    await loadOptionalPage("./pages/home.js", container);
    return;
  }

  if (tabName === "items") {
    await loadOptionalPage("./pages/items.js", container);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app");
  const navTabs = document.querySelectorAll(".nav-tab");

  // 1. Nếu là trang chính index.html có vùng #app và các nút .nav-tab
  if (appContainer && navTabs.length > 0) {
    navTabs.forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
    switchTab("fund");
    return;
  }

  // 2. Nếu là các trang con độc lập (debts.html, formbill.html, items.html...)
  const root = document.body.getAttribute("data-root") || "../";
  const navHtml = `
    <nav style="padding: 10px 16px; background: #1e293b; color: #fff; margin-bottom: 20px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      <a href="${root}index.html" style="color: #fff; font-weight: bold; text-decoration: none;">Quỹ chung (Trang chủ)</a>
      <a href="${root}pages/auth.html" style="color: #fde047; text-decoration: none;">Đăng nhập / Đăng ký</a>
      <a href="${root}pages/profile.html" style="color: #86efac; text-decoration: none;">Hồ sơ cá nhân</a>
      <a href="${root}pages/formbill.html" style="color: #93c5fd; text-decoration: none;">Tạo hoá đơn</a>
      <a href="${root}pages/debts.html" style="color: #93c5fd; text-decoration: none;">Công nợ của tôi</a>
      <a href="${root}pages/statement.html" style="color: #d4ff00; font-weight: bold; text-decoration: none;">Lịch sử &amp; Sao kê</a>
      <a href="${root}pages/items.html" style="color: #cbd5e1; text-decoration: none;">Items</a>
    </nav>
  `;
  document.body.insertAdjacentHTML("afterbegin", navHtml);
});