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
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  switchTab("fund");
});