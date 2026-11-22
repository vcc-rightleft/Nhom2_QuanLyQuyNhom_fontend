
import api from "../api.js";

// ==========================================
// SQUAD.CASH - ITEMS MANAGEMENT
// ==========================================

const $ = (id) => document.getElementById(id);

// ==========================================
// HELPERS
// ==========================================

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatVND(amount) {
    return (
        Number(amount || 0).toLocaleString("vi-VN") +
        " ₫"
    );
}

function getStoredToken() {
    const tokenKey =
        window.APP_CONFIG?.TOKEN_KEY ||
        "squad_cash_token";

    return (
        sessionStorage.getItem(tokenKey) ||
        localStorage.getItem(tokenKey) ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

function extractError(error) {
    const detail =
        error?.response?.data?.detail ||
        error?.detail;

    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {
        return detail
            .map((item) => item.msg || String(item))
            .join(" | ");
    }

    return error?.message || "Lỗi không xác định";
}

function showMessage(message, isError = false) {
    const container = $("cleanToastContainer");

    if (!container) {
        if (isError) {
            alert(message);
        } else {
            console.info(message);
        }
        return;
    }

    const toast = document.createElement("div");

    toast.className = [
        "pointer-events-auto",
        "card-subtle",
        "px-4",
        "py-3",
        "text-xs",
        "font-bold",
        isError
            ? "bg-coral text-white"
            : "bg-lime text-ink"
    ].join(" ");

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}


// ==========================================
// PHẦN 1 - DANH SÁCH HÓA ĐƠN
// GIAO DIỆN CỦA NHÁNH DEV
// ==========================================

async function renderItems() {
    const tbody = $("items-tbody");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center">Đang tải hóa đơn...</td></tr>';
    try {
        const groups = await api.get("/api/groups/my-groups");
        if (!Array.isArray(groups)) throw new Error("API nhóm trả dữ liệu không hợp lệ");
        const pages = await Promise.all(groups.map(async (group) => {
            const id = Number(group.group_id ?? group.id);
            if (!Number.isSafeInteger(id) || id <= 0) return [];
            const result = await api.get(`/api/bills/groups/${id}?page_size=100`);
            const bills = Array.isArray(result) ? result : result?.items;
            if (!Array.isArray(bills)) throw new Error("API hóa đơn trả dữ liệu không hợp lệ");
            return bills.map(bill => ({...bill, groupCode: String(group.group_name || group.name || id)}));
        }));
        const list = pages.flat();
        const groupFilter = $("items-filter-group")?.value || "all";
        const keyword = ($("items-search")?.value || "").trim().toLowerCase();
        const filtered = list.filter(x => (groupFilter === "all" || x.groupCode === groupFilter) &&
            (!keyword || `${x.id} ${x.title} ${x.groupCode}`.toLowerCase().includes(keyword)));
        if ($("items-count")) $("items-count").textContent = `${filtered.length} khoản chi`;
        tbody.innerHTML = filtered.length ? filtered.map(b => `<tr class="hover:bg-canvas/60 transition">
            <td class="p-4 font-mono text-xs">${escapeHtml(b.id)}</td>
            <td class="p-4 font-bold">${escapeHtml(b.title)}</td>
            <td class="p-4">${escapeHtml(b.groupCode)}</td>
            <td class="p-4">${escapeHtml(b.payer_name || '')}</td>
            <td class="p-4 text-right font-mono">${formatVND(b.total_amount)}</td>
            <td class="p-4 text-center">${escapeHtml(b.split_type || '—')}</td></tr>`).join("") :
            '<tr><td colspan="6" class="p-8 text-center">Chưa có khoản chi nào.</td></tr>';
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-600">${escapeHtml(extractError(error))}</td></tr>`;
    }
}

function setupBillList() {
    const tbody = $("items-tbody");

    if (!tbody) {
        return;
    }

    $("items-filter-group")?.addEventListener(
        "change",
        renderItems
    );

    $("items-search")?.addEventListener(
        "input",
        renderItems
    );

    renderItems();
}


// ==========================================
// PHẦN 2 - QUẢN LÝ DANH MỤC ITEMS
// KẾT NỐI FASTAPI BACKEND
// ==========================================

export async function loadItems() {
    const tbody = $("item-list");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td
                colspan="5"
                class="py-6 text-center text-slate-500"
            >
                Đang tải dữ liệu...
            </td>
        </tr>
    `;

    try {
        const response = await api.get("/api/items");

        const list = Array.isArray(response)
            ? response
            : Array.isArray(response?.items)
                ? response.items
                : null;

        if (!list) {
            throw new Error(
                "Backend trả dữ liệu không đúng định dạng."
            );
        }

        if (list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="py-6 text-center text-slate-500"
                    >
                        Chưa có mục nào.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = list.map((item) => `
            <tr class="hover:bg-lime-50">

                <td class="py-3 px-3 font-mono font-bold">
                    #${escapeHtml(item.id)}
                </td>

                <td class="py-3 px-3 font-semibold">
                    ${escapeHtml(item.name)}
                </td>

                <td
                    class="py-3 px-3 text-right font-mono font-bold text-indigo-700"
                >
                    ${formatVND(item.price)}
                </td>

                <td class="py-3 px-3 text-slate-600">
                    ${escapeHtml(item.description || "")}
                </td>

                <td class="py-3 px-3 text-center">
                    <button
                        type="button"
                        data-delete-id="${escapeHtml(item.id)}"
                        class="px-3 py-1 rounded-lg border border-black bg-rose-500 text-white font-bold text-xs hover:opacity-90"
                    >
                        Xóa
                    </button>
                </td>

            </tr>
        `).join("");

        tbody.querySelectorAll(
            "[data-delete-id]"
        ).forEach((button) => {
            button.addEventListener("click", () => {
                const id = Number(
                    button.dataset.deleteId
                );

                if (
                    Number.isSafeInteger(id) &&
                    id > 0
                ) {
                    deleteItem(id);
                }
            });
        });

    } catch (error) {
        console.error(
            "Không tải được items:",
            error
        );

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="py-6 text-center text-rose-600 font-semibold"
                >
                    Lỗi tải dữ liệu:
                    ${escapeHtml(extractError(error))}
                </td>
            </tr>
        `;
    }
}


// ==========================================
// XÓA ITEM
// ==========================================

async function deleteItem(id) {
    if (!Number.isSafeInteger(id) || id <= 0) {
        return;
    }

    if (!confirm(`Bạn có chắc muốn xóa mục #${id}?`)) {
        return;
    }

    try {
        await api.delete(`/api/items/${id}`);

        showMessage(
            `Đã xóa mục #${id} thành công.`
        );

        await loadItems();

    } catch (error) {
        console.error(
            "Lỗi xóa item:",
            error
        );

        showMessage(
            "Không thể xóa mục: " +
            extractError(error),
            true
        );
    }
}


// ==========================================
// THÊM ITEM MỚI
// ==========================================

async function createItem(event) {
    event.preventDefault();

    const name = $("name")?.value.trim() || "";

    const price = Number(
        $("price")?.value || 0
    );

    const description =
        $("description")?.value.trim() || "";

    if (!name) {
        showMessage(
            "Vui lòng nhập tên mục.",
            true
        );
        return;
    }

    if (
        !Number.isFinite(price) ||
        price < 0
    ) {
        showMessage(
            "Giá phải là số không âm.",
            true
        );
        return;
    }

    const form = $("item-form");

    const submitButton = form?.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        await api.post("/api/items", {
            name,
            price,
            description
        });

        showMessage(
            "Đã thêm mục mới thành công."
        );

        form.reset();

        await loadItems();

    } catch (error) {
        console.error(
            "Lỗi thêm item:",
            error
        );

        showMessage(
            "Không thể thêm mục: " +
            extractError(error),
            true
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}


// ==========================================
// KHỞI TẠO GIAO DIỆN QUẢN LÝ ITEMS
// ==========================================

function setupItemManagement() {
    const form = $("item-form");

    if (!form) {
        return;
    }

    // Kiểm tra token trước khi gọi API
    if (!getStoredToken()) {
        showMessage(
            "Bạn cần đăng nhập để quản lý danh mục.",
            true
        );

        window.location.href = "./auth.html";
        return;
    }

    $("btn-reload-items")?.addEventListener(
        "click",
        loadItems
    );

    form.addEventListener(
        "submit",
        createItem
    );

    loadItems();
}


// ==========================================
// DOM READY
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        // Giao diện danh sách hóa đơn của dev
        setupBillList();

        // Giao diện quản lý danh mục qua API
        setupItemManagement();
    }
);
