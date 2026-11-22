import api from "../api.js";

function getStoredToken() {
  return (
    localStorage.getItem("squad_cash_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + " ₫";
}

function extractError(err) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg).join(" | ");
  }
  return err?.message || "Lỗi không xác định";
}

export async function loadItems() {
  const tbody = document.getElementById("item-list");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500">Đang tải dữ liệu...</td></tr>`;

  try {
    const items = await api.get("/api/items");
    const list = Array.isArray(items) ? items : [];

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500">Chưa có mục nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map(
        (item) => `
        <tr class="hover:bg-lime-50">
          <td class="py-3 px-3 font-mono font-bold">#${escapeHtml(item.id)}</td>
          <td class="py-3 px-3 font-semibold">${escapeHtml(item.name)}</td>
          <td class="py-3 px-3 text-right font-mono font-bold text-indigo-700">${formatVND(item.price)}</td>
          <td class="py-3 px-3 text-slate-600">${escapeHtml(item.description || "")}</td>
          <td class="py-3 px-3 text-center">
            <button type="button" data-delete-id="${item.id}"
              class="px-3 py-1 rounded-lg border border-black bg-rose-500 text-white font-bold text-xs hover:opacity-90">
              Xoá
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    tbody.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteItem(Number(btn.getAttribute("data-delete-id")));
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-rose-600 font-semibold">Lỗi tải dữ liệu: ${escapeHtml(extractError(err))}</td></tr>`;
  }
}

async function deleteItem(id) {
  if (!confirm(`Xóa mục #${id}?`)) return;
  try {
    await api.delete(`/api/items/${id}`);
    await loadItems();
  } catch (err) {
    alert("Lỗi khi xóa: " + extractError(err));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("item-form");
  if (!form) return;

  // Chặn trang nếu chưa đăng nhập
  if (!getStoredToken()) {
    alert("Bạn cần đăng nhập để truy cập trang này!");
    window.location.href = "./auth.html";
    return;
  }

  document.getElementById("btn-reload-items")?.addEventListener("click", loadItems);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const price = parseInt(document.getElementById("price").value, 10) || 0;
    const description = document.getElementById("description").value.trim();

    if (!name) {
      alert("Vui lòng nhập tên mục.");
      return;
    }

    try {
      await api.post("/api/items", { name, price, description });
      form.reset();
      await loadItems();
    } catch (err) {
      alert("Lỗi khi thêm: " + extractError(err));
    }
  });

  loadItems();
});