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
  const root = document.body.getAttribute("data-root") || "./";
  const navHtml = `
    <nav style="padding: 10px 16px; background: #eee; margin-bottom: 20px; display: flex; gap: 16px; flex-wrap: wrap;">
      <a href="${root}index.html">Quỹ chung (Trang chủ)</a>
      <a href="${root}pages/formbill.html">Tạo hoá đơn</a>
      <a href="${root}pages/debts.html">Công nợ của tôi</a>
      <a href="${root}pages/items.html">Items (CRUD mẫu)</a>
    </nav>
  `;
  document.body.insertAdjacentHTML("afterbegin", navHtml);
});