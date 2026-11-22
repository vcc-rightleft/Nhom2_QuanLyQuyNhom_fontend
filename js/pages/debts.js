import api from "../api.js";

const MOCK_DEBTS = [
    {
        id: 101,
        group_id: 1,
        group_name: "Nhóm 2 - Đồ án Công nghệ Phần mềm",
        title: "Đóng quỹ nhóm tháng 11/2026",
        type: "owe",
        amount: 150000,
        status: "unpaid",
        due_date: "2026-11-20",
        counterparty_name: "Nguyễn Văn An (Trưởng nhóm)",
        receiver_bank: {
            bank_id: "MB",
            bank_name: "MB Bank (Quân Đội)",
            account_number: "0987654321",
            account_name: "NGUYEN VAN AN"
        }
    },
    {
        id: 102,
        group_id: 1,
        group_name: "Nhóm 2 - Đồ án Công nghệ Phần mềm",
        title: "Tiền in ấn tài liệu & slide thuyết trình",
        type: "owe",
        amount: 45000,
        status: "pending",
        due_date: "2026-11-18",
        counterparty_name: "Trần Thị Bình",
        receiver_bank: {
            bank_id: "VCB",
            bank_name: "Vietcombank",
            account_number: "1023456789",
            account_name: "TRAN THI BINH"
        }
    },
    {
        id: 103,
        group_id: 2,
        group_name: "Quỹ Liên Hoan Lớp HN-KS25-CNTT2",
        title: "Tiền nước uống buổi họp team",
        type: "owed",
        amount: 120000,
        status: "unpaid",
        due_date: "2026-11-22",
        counterparty_name: "Lê Hoàng Nam",
        receiver_bank: null
    },
    {
        id: 104,
        group_id: 2,
        group_name: "Quỹ Liên Hoan Lớp HN-KS25-CNTT2",
        title: "Vé liên hoan cuối kỳ",
        type: "owe",
        amount: 250000,
        status: "unpaid",
        due_date: "2026-11-25",
        counterparty_name: "Phạm Minh Đức (Thủ quỹ)",
        receiver_bank: {
            bank_id: "TCB",
            bank_name: "Techcombank",
            account_number: "190368686868",
            account_name: "PHAM MINH DUC"
        }
    }
];

let allDebts = [];
let selectedProofBase64 = null;

function getCurrentUserId() {
    try {
        const raw = localStorage.getItem("squad_cash_user");
        if (raw) {
            const user = JSON.parse(raw);
            if (user && Number(user.id) > 0) return Number(user.id);
        }
    } catch (_) {}
    return 1;
}

function formatCurrency(amount) {
    if (typeof window.formatMoney === "function") {
        return window.formatMoney(amount);
    }
    return new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) + " đ";
}

function copyTextSafe(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => alert(successMsg))
            .catch(() => fallbackCopy(text, successMsg));
    } else {
        fallbackCopy(text, successMsg);
    }
}

function fallbackCopy(text, successMsg) {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    alert(successMsg);
}

function normalizeDebtItem(raw, defaultType, idx) {
    const statusRaw = String(raw.status || "unpaid").toLowerCase();
    let status = "unpaid";
    if (["paid", "completed", "confirmed"].includes(statusRaw)) status = "paid";
    else if (["pending", "partial", "waiting", "pending_confirmation"].includes(statusRaw)) status = "pending";

    const total = Number(raw.amount ?? raw.amount_due ?? 0);
    const paid = Number(raw.paid_amount ?? raw.amount_paid ?? 0);
    const remaining = raw.remaining_amount !== undefined ? Number(raw.remaining_amount) : Math.max(0, total - paid);

    return {
        id: raw.id ?? raw.debt_id ?? idx + 1,
        group_id: raw.group_id ?? 1,
        group_name: raw.group_name || `Nhóm quỹ #${raw.group_id ?? 1}`,
        title: raw.title || raw.description || `Khoản công nợ #${raw.id ?? idx + 1}`,
        type: raw.type || defaultType,
        amount: status === "paid" ? total : remaining,
        status,
        due_date: raw.due_date ? String(raw.due_date).slice(0, 10) : "",
        counterparty_name:
            raw.counterparty_name ||
            raw.payee_name ||
            raw.debtor_name ||
            (defaultType === "owe" ? `User #${raw.payee_id ?? "?"}` : `User #${raw.debtor_id ?? "?"}`),
        receiver_bank: raw.receiver_bank || null
    };
}

async function loadMyDebts() {
    const userId = getCurrentUserId();
    try {
        const [oweRes, owedRes] = await Promise.all([
            api.get(`/api/debts/owed-by-me/${userId}`).catch(() => []),
            api.get(`/api/debts/owed-to-me/${userId}`).catch(() => [])
        ]);

        const oweList = Array.isArray(oweRes) ? oweRes : (oweRes?.items || oweRes?.debts || []);
        const owedList = Array.isArray(owedRes) ? owedRes : (owedRes?.items || owedRes?.debts || []);

        const combined = [
            ...oweList.map((item, idx) => normalizeDebtItem(item, "owe", idx)),
            ...owedList.map((item, idx) => normalizeDebtItem(item, "owed", idx + 1000))
        ];

        if (combined.length > 0) {
            allDebts = combined;
            initGroupFilter();
            renderPage();
            return;
        }
    } catch (err) {
        console.warn("Sử dụng dữ liệu mẫu cho Trang công nợ:", err.message);
    }

    allDebts = [...MOCK_DEBTS];
    initGroupFilter();
    renderPage();
}

function initGroupFilter() {
    const groupSelect = document.getElementById("filter-group");
    const uniqueGroups = new Map();
    allDebts.forEach((d) => uniqueGroups.set(String(d.group_id), d.group_name));

    groupSelect.innerHTML = `<option value="all">Tất cả nhóm (${uniqueGroups.size})</option>`;
    uniqueGroups.forEach((name, id) => {
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = name;
        groupSelect.appendChild(opt);
    });
}

function updateSummaryCards() {
    let totalIOwe = 0;
    let countIOwe = 0;
    let totalOwedToMe = 0;
    let countOwedToMe = 0;

    allDebts.forEach((item) => {
        if (item.status !== "paid") {
            if (item.type === "owe") {
                totalIOwe += Number(item.amount);
                countIOwe++;
            } else if (item.type === "owed") {
                totalOwedToMe += Number(item.amount);
                countOwedToMe++;
            }
        }
    });

    const net = totalOwedToMe - totalIOwe;
    document.getElementById("total-i-owe").textContent = formatCurrency(totalIOwe);
    document.getElementById("count-i-owe").textContent = `${countIOwe} khoản chưa hoàn tất`;

    document.getElementById("total-owed-to-me").textContent = formatCurrency(totalOwedToMe);
    document.getElementById("count-owed-to-me").textContent = `${countOwedToMe} khoản đang chờ thu`;

    const netEl = document.getElementById("net-balance");
    netEl.textContent = (net > 0 ? "+" : "") + formatCurrency(net);
    netEl.style.color = net >= 0 ? "#059669" : "#dc2626";
}

function getStatusBadge(item) {
    if (item.type === "owed") {
        return item.status === "paid"
            ? `<span class="badge badge-paid">Đã nhận tiền</span>`
            : `<span class="badge badge-receive">Người khác nợ bạn</span>`;
    }
    switch (item.status) {
        case "paid":
            return `<span class="badge badge-paid">Đã thanh toán</span>`;
        case "pending":
            return `<span class="badge badge-pending">Chờ duyệt ảnh CK</span>`;
        default:
            return `<span class="badge badge-unpaid">Chưa thanh toán</span>`;
    }
}

function renderPage() {
    updateSummaryCards();

    const groupFilter = document.getElementById("filter-group").value;
    const typeFilter = document.getElementById("filter-type").value;
    const statusFilter = document.getElementById("filter-status").value;
    const keyword = document.getElementById("filter-search").value.trim().toLowerCase();

    const filtered = allDebts.filter((item) => {
        if (groupFilter !== "all" && String(item.group_id) !== groupFilter) return false;
        if (typeFilter !== "all" && item.type !== typeFilter) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (
            keyword &&
            !item.title.toLowerCase().includes(keyword) &&
            !item.counterparty_name.toLowerCase().includes(keyword) &&
            !item.group_name.toLowerCase().includes(keyword)
        ) {
            return false;
        }
        return true;
    });

    const container = document.getElementById("debt-groups-container");
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="background:#fff; padding:40px; border-radius:12px; text-align:center; color:#64748b;">
                Không tìm thấy khoản công nợ nào phù hợp với bộ lọc.
            </div>`;
        return;
    }

    const grouped = new Map();
    filtered.forEach((item) => {
        if (!grouped.has(item.group_id)) {
            grouped.set(item.group_id, {
                group_name: item.group_name,
                items: []
            });
        }
        grouped.get(item.group_id).items.push(item);
    });

    let html = "";
    grouped.forEach((group) => {
        const groupTotalOwe = group.items
            .filter((i) => i.type === "owe" && i.status !== "paid")
            .reduce((sum, i) => sum + Number(i.amount), 0);

        html += `
            <section class="group-debt-section">
                <div class="group-header">
                    <div class="group-title">📁 ${group.group_name}</div>
                    <div style="font-size: 13px; color: #475569;">
                        Cần trả trong nhóm: <strong style="color: #dc2626;">${formatCurrency(groupTotalOwe)}</strong>
                    </div>
                </div>
                <div>
                    ${group.items.map((item) => {
                        const isOwe = item.type === "owe";
                        const bankInfo = item.receiver_bank
                            ? ` • STK nhận: <strong>${item.receiver_bank.bank_id} - ${item.receiver_bank.account_number}</strong>`
                            : "";

                        let actionBtn = "";
                        if (isOwe) {
                            if (item.status === "unpaid") {
                                actionBtn = `<button type="button" class="btn-pay" data-open-pay="${item.id}">Tôi đã trả</button>`;
                            } else if (item.status === "pending") {
                                actionBtn = `<button type="button" class="btn-pay" disabled>Đang chờ duyệt</button>`;
                            }
                        }

                        return `
                            <div class="debt-item">
                                <div class="debt-info">
                                    <h4>${item.title}</h4>
                                    <div class="debt-meta">
                                        ${isOwe ? "Người nhận:" : "Người nợ:"} <strong>${item.counterparty_name}</strong>
                                        • Hạn: ${item.due_date || "Không có"}
                                        ${isOwe ? bankInfo : ""}
                                    </div>
                                </div>
                                <div class="debt-actions">
                                    ${getStatusBadge(item)}
                                    <div class="debt-amount" style="color: ${isOwe ? "#dc2626" : "#059669"};">
                                        ${isOwe ? "-" : "+"}${formatCurrency(item.amount)}
                                    </div>
                                    ${actionBtn}
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </section>
        `;
    });

    container.innerHTML = html;

    container.querySelectorAll("[data-open-pay]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const debtId = Number(btn.getAttribute("data-open-pay"));
            openPaymentModal(debtId);
        });
    });
}

function openPaymentModal(debtId) {
    const debt = allDebts.find((d) => d.id === debtId);
    if (!debt) return;

    const bank = debt.receiver_bank || {
        bank_id: "MB",
        bank_name: "Chưa cập nhật ngân hàng",
        account_number: "Chưa có STK",
        account_name: debt.counterparty_name
    };

    const transferNote = `THANHTOAN NO ${debt.id}`;

    document.getElementById("modal-debt-id").value = debt.id;
    document.getElementById("modal-debt-title").textContent = debt.title;
    document.getElementById("modal-debt-amount").textContent = formatCurrency(debt.amount);
    document.getElementById("modal-receiver-name").textContent = `${bank.account_name} (${debt.counterparty_name})`;
    document.getElementById("modal-bank-name").textContent = bank.bank_name;
    document.getElementById("modal-account-number").textContent = bank.account_number;
    document.getElementById("modal-transfer-note").textContent = transferNote;

    const qrImg = document.getElementById("modal-vietqr-img");
    if (bank.account_number && bank.account_number !== "Chưa có STK") {
        const qrUrl = `https://img.vietqr.io/image/${bank.bank_id}-${bank.account_number}-compact2.png?amount=${debt.amount}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(bank.account_name)}`;
        qrImg.src = qrUrl;
        qrImg.style.display = "inline-block";
    } else {
        qrImg.style.display = "none";
    }

    selectedProofBase64 = null;
    document.getElementById("proof-image-input").value = "";
    document.getElementById("proof-preview").style.display = "none";
    document.getElementById("payment-note").value = "";

    document.getElementById("pay-modal").classList.add("active");
}

function closePaymentModal() {
    document.getElementById("pay-modal").classList.remove("active");
}

function setupEvents() {
    ["filter-group", "filter-type", "filter-status"].forEach((id) => {
        document.getElementById(id).addEventListener("change", renderPage);
    });
    document.getElementById("filter-search").addEventListener("input", renderPage);

    document.getElementById("close-modal-btn").addEventListener("click", closePaymentModal);
    document.getElementById("cancel-modal-btn").addEventListener("click", closePaymentModal);

    document.getElementById("btn-copy-stk").addEventListener("click", () => {
        const stk = document.getElementById("modal-account-number").textContent;
        copyTextSafe(stk, "Đã sao chép số tài khoản: " + stk);
    });

    document.getElementById("btn-copy-note").addEventListener("click", () => {
        const note = document.getElementById("modal-transfer-note").textContent;
        copyTextSafe(note, "Đã sao chép nội dung chuyển khoản: " + note);
    });

    const dropzone = document.getElementById("upload-dropzone");
    const fileInput = document.getElementById("proof-image-input");
    const previewImg = document.getElementById("proof-preview");

    dropzone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP).");
            fileInput.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh vượt quá dung lượng tối đa 5MB.");
            fileInput.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            selectedProofBase64 = ev.target.result;
            previewImg.src = selectedProofBase64;
            previewImg.style.display = "inline-block";
        };
        reader.readAsDataURL(file);
    });

    document.getElementById("payment-proof-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const debtId = Number(document.getElementById("modal-debt-id").value);
        const note = document.getElementById("payment-note").value.trim();
        const debt = allDebts.find((d) => d.id === debtId);

        if (!selectedProofBase64) {
            alert("Vui lòng tải lên ảnh biên lai chuyển khoản trước khi xác nhận!");
            return;
        }

        const submitBtn = document.getElementById("submit-proof-btn");
        submitBtn.disabled = true;
        submitBtn.textContent = "Đang gửi...";

        let syncedWithBackend = false;
        try {
            await api.post("/api/debts/payments", {
                debt_id: debtId,
                amount: debt ? Number(debt.amount) : 0,
                method: "BANK_TRANSFER",
                proof_image_url: selectedProofBase64,
                note
            });
            syncedWithBackend = true;
        } catch (err) {
            const status = err?.response?.status;
            if (status === 400 || status === 401 || status === 403) {
                const detail = err?.response?.data?.detail || `Lỗi HTTP ${status}`;
                alert("Không thể gửi xác nhận thanh toán: " + detail);
                submitBtn.disabled = false;
                submitBtn.textContent = "Gửi xác nhận đã trả";
                return;
            }
            console.warn("Cập nhật local state (chế độ dữ liệu mẫu):", err.message);
        }

        const idx = allDebts.findIndex((d) => d.id === debtId);
        if (idx !== -1) {
            allDebts[idx].status = "pending";
        }
        submitBtn.disabled = false;
        submitBtn.textContent = "Gửi xác nhận đã trả";
        closePaymentModal();
        renderPage();
        alert(
            syncedWithBackend
                ? "Đã gửi báo cáo thanh toán lên Backend thành công!"
                : "Đã cập nhật trạng thái chờ duyệt trên giao diện (chế độ dữ liệu mẫu)."
        );
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupEvents();
    loadMyDebts();
});