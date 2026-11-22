
import api from "../api.js";

// ==========================================
// SQUAD.CASH - ITEMS MANAGEMENT
// ==========================================

// Dữ liệu mẫu của giao diện hóa đơn cũ
const DEFAULT_ITEMS = [
    {
        id: "BIL-201",
        date: "2026-11-03",
        title: "Lẩu Bò Ba Toa",
        groupCode: "#DALAT26",
        payer: "Phan Đức Anh",
        total: 1920000,
        splitCount: 6
    },
    {
        id: "BIL-202",
        date: "2026-11-04",
        title: "Thuê xe máy 2 ngày",
        groupCode: "#DALAT26",
        payer: "Phan Đức Anh",
        total: 1080000,
        splitCount: 6
    },
    {
        id: "BIL-203",
        date: "2026-11-10",
        title: "Tiền sân & cầu tháng 11",
        groupCode: "#BADMINTON",
        payer: "Lê Quang Minh",
        total: 600000,
        splitCount: 4
    }
];

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

function getStoredItems() {
    let saved = [];

    try {
        const raw = localStorage.getItem(
            "squad_cash_bills"
        );

        const parsed = raw
            ? JSON.parse(raw)
            : [];

        if (Array.isArray(parsed)) {
            saved = parsed;
        }
    } catch (error) {
        console.error(
            "Không đọc được danh sách hóa đơn:",
            error
        );
    }

    return [
        ...saved,
        ...DEFAULT_ITEMS
    ];
}

function renderItems() {
    const tbody = $("items-tbody");

    if (!tbody) {
        return;
    }

    const groupFilter =
        $("items-filter-group")?.value || "all";

    const keyword = (
        $("items-search")?.value || ""
    ).trim().toLowerCase();

    const list = getStoredItems().filter((item) => {
        if (
            groupFilter !== "all" &&
            String(item.groupCode) !== groupFilter
        ) {
            return false;
        }

        if (keyword) {
            const searchText = [
                item.id,
                item.title,
                item.payer,
                item.groupCode
            ].join(" ").toLowerCase();

            if (!searchText.includes(keyword)) {
                return false;
            }
        }

        return true;
    });

    if ($("items-count")) {
        $("items-count").textContent =
            `${list.length} khoản chi`;
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="p-8 text-center text-muted font-medium"
                >
                    Không có khoản chi nào phù hợp.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map((item) => `
        <tr class="hover:bg-canvas/60 transition">

            <td class="p-4">
                <div class="font-mono font-bold text-xs text-ink">
                    ${escapeHtml(item.id)}
                </div>

                <div class="text-xs text-muted">
                    ${escapeHtml(item.date || "")}
                </div>
            </td>

            <td class="p-4 font-display font-bold text-ink">
                ${escapeHtml(item.title)}
            </td>

            <td class="p-4">
                <span
                    class="font-mono text-xs font-bold bg-lime border border-ink px-2 py-0.5 rounded"
                >
                    ${escapeHtml(item.groupCode)}
                </span>
            </td>

            <td class="p-4 font-medium text-ink">
                ${escapeHtml(item.payer)}
            </td>

            <td
                class="p-4 text-right font-mono font-bold text-coral"
            >
                ${formatVND(item.total)}
            </td>

            <td
                class="p-4 text-center font-mono text-xs font-bold"
            >
                ${Number(item.splitCount) || 0} người
            </td>

        </tr>
    `).join("");
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
