
import api from "../api.js";

// ==========================================
// SQUAD.CASH - FORM BILL
// ==========================================

const $ = (id) => document.getElementById(id);

const GROUP_MEMBERS = [
    "Phan Đức Anh",
    "Minh Thắng",
    "Lê Quang Minh",
    "Nguyễn Phương Thảo"
];

let currentSplitMode = "equal";
let interactiveFxEnabled = true;
let audioCtx = null;

let itemizedRows = [];
let customAmounts = {};
let latestAllocationMap = {};
let nextItemId = 1;

// ==========================================
// HELPERS
// ==========================================

function formatVND(amount) {
    return `${Math.round(Number(amount) || 0)
        .toLocaleString("vi-VN")} ₫`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );
}

function readAmount(id) {
    return Math.max(
        0,
        Math.round(Number($(id)?.value) || 0)
    );
}

function showToast(message, tone = "lime") {
    let container = $("cleanToastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "cleanToastContainer";
        container.className = "toast-stack";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    const bgClass = tone === "coral"
        ? "bg-coral text-white"
        : "bg-lime text-ink";

    toast.className =
        `pointer-events-auto card-subtle px-4 py-3 text-xs font-bold ${bgClass}`;

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}

function notify(message, isError = false) {
    showToast(message, isError ? "coral" : "lime");
    playUiSound(isError ? "error" : "success");
}

function playUiSound(type = "click") {
    if (!interactiveFxEnabled) return;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        audioCtx ||= new AudioContextClass();

        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);

        oscillator.type = "sine";

        const frequency = type === "error"
            ? 180
            : type === "success"
                ? 880
                : 520;

        oscillator.frequency.setValueAtTime(frequency, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + 0.12
        );

        oscillator.start(now);
        oscillator.stop(now + 0.13);
    } catch (error) {
        console.debug("Audio unavailable:", error);
    }
}

// ==========================================
// CURRENT USER & GROUP
// ==========================================

function getCurrentPayerId() {
    try {
        const key = window.APP_CONFIG?.USER_KEY
            || "squad_cash_user";

        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const user = JSON.parse(raw);
        const id = Number(user?.id ?? user?.user_id);

        return Number.isSafeInteger(id) && id > 0
            ? id
            : null;
    } catch {
        return null;
    }
}

function getCurrentGroupId() {
    const params = new URLSearchParams(
        window.location.search
    );

    const urlId = Number(params.get("group_id"));

    if (Number.isSafeInteger(urlId) && urlId > 0) {
        return urlId;
    }

    const storedId = Number(
        localStorage.getItem("current_group_id")
    );

    if (
        Number.isSafeInteger(storedId) &&
        storedId > 0
    ) {
        return storedId;
    }

    return null;
}

// ==========================================
// MEMBERS
// ==========================================

function getSelectedMembers() {
    const container = $("members");

    if (!container) return [];

    return Array.from(
        container.querySelectorAll(
            "input[type='checkbox']:checked"
        )
    ).map((checkbox) => {
        const name = checkbox.dataset.name
            || checkbox.closest("label")?.textContent?.trim()
            || checkbox.value;

        const rawId = checkbox.dataset.userId
            || checkbox.value;

        const id = Number(rawId);

        return {
            name: name.trim(),
            id: Number.isSafeInteger(id) && id > 0
                ? id
                : null
        };
    });
}

function getParticipantIds(members) {
    if (members.some((member) => !member.id)) {
        throw new Error(
            "Danh sách thành viên chưa có user_id hợp lệ. " +
            "Cần đồng bộ thành viên từ Backend trước khi lưu."
        );
    }

    const ids = members.map((member) => member.id);

    if (new Set(ids).size !== ids.length) {
        throw new Error(
            "Danh sách thành viên có user_id bị trùng."
        );
    }

    return ids;
}

function memberKey(member) {
    return member.id
        ? String(member.id)
        : member.name;
}

function onMemberSelectionChange() {
    playUiSound();

    if (currentSplitMode === "item") {
        renderItemizedRows();
    }

    if (currentSplitMode === "custom") {
        renderCustomRows();
    }

    recalculateHostInvoicePreview();
}

// ==========================================
// SPLIT MODE
// ==========================================

function setInvoiceSplitMode(mode) {
    if (!["equal", "item", "custom"].includes(mode)) {
        return;
    }

    currentSplitMode = mode;

    $("equalMode")?.classList.toggle(
        "active",
        mode === "equal"
    );

    $("itemMode")?.classList.toggle(
        "active",
        mode === "item"
    );

    $("customMode")?.classList.toggle(
        "active",
        mode === "custom"
    );

    if ($("itemizedBox")) {
        $("itemizedBox").style.display =
            mode === "item" ? "block" : "none";
    }

    if ($("customBox")) {
        $("customBox").style.display =
            mode === "custom" ? "block" : "none";
    }

    if (mode === "item") renderItemizedRows();
    if (mode === "custom") renderCustomRows();

    recalculateHostInvoicePreview();
}

// ==========================================
// ITEMIZED SPLIT
// ==========================================

function addItemRow() {
    itemizedRows.push({
        id: nextItemId++,
        name: "",
        qty: 1,
        price: 0,
        consumers: []
    });

    renderItemizedRows();
    recalculateHostInvoicePreview();

    notify("Đã thêm món mới.");
}

function removeItemRow(index) {
    itemizedRows.splice(index, 1);

    renderItemizedRows();
    recalculateHostInvoicePreview();
}

function updateItemRow(index, field, value) {
    const row = itemizedRows[index];
    if (!row) return;

    if (field === "name") {
        row.name = value;
    }

    if (field === "qty") {
        row.qty = Math.max(
            1,
            Math.round(Number(value) || 1)
        );
    }

    if (field === "price") {
        row.price = Math.max(
            0,
            Math.round(Number(value) || 0)
        );
    }

    recalculateHostInvoicePreview();
}

function toggleItemConsumer(index, key) {
    const row = itemizedRows[index];
    if (!row) return;

    const members = getSelectedMembers();
    const validMember = members.find(
        (member) => memberKey(member) === String(key)
    );

    if (!validMember) return;

    const member = memberKey(validMember);
    const position = row.consumers.indexOf(member);

    if (position >= 0) {
        row.consumers.splice(position, 1);
    } else {
        row.consumers.push(member);
    }

    renderItemizedRows();
    recalculateHostInvoicePreview();
}

function renderItemizedRows() {
    const container = $("itemRows");
    if (!container) return;

    const members = getSelectedMembers();

    container.innerHTML = itemizedRows.map((row, index) => `
        <div class="item-card" data-row="${index}">

            <div class="item-row-top">

                <input
                    type="text"
                    value="${escapeHTML(row.name)}"
                    data-field="name"
                    placeholder="Tên món"
                >

                <input
                    type="number"
                    value="${row.qty}"
                    min="1"
                    data-field="qty"
                    placeholder="SL"
                >

                <input
                    type="number"
                    value="${row.price}"
                    min="0"
                    step="1000"
                    data-field="price"
                    placeholder="Đơn giá"
                >

                <button
                    type="button"
                    data-remove-item="${index}"
                    title="Xóa món"
                >
                    Xóa
                </button>
            </div>

            <div class="item-row-bottom">
                <span>Người dùng món:</span>

                <div class="member-pill-group">
                    ${members.map((member) => {
                        const key = memberKey(member);
                        const active = row.consumers.includes(key);

                        return `
                            <button
                                type="button"
                                class="member-pill-btn ${active ? "active" : ""}"
                                data-item-index="${index}"
                                data-member-key="${escapeHTML(key)}"
                            >
                                ${escapeHTML(
                                    member.name.split(" ").pop()
                                )}
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>
        </div>
    `).join("");
}

// ==========================================
// CUSTOM SPLIT
// ==========================================

function updateCustomMemberAmount(key, value) {
    customAmounts[key] = Math.max(
        0,
        Math.round(Number(value) || 0)
    );

    recalculateHostInvoicePreview();
}

function renderCustomRows() {
    const container = $("customRows");
    if (!container) return;

    const members = getSelectedMembers();

    container.innerHTML = members.map((member) => {
        const key = memberKey(member);
        const amount = customAmounts[key] || 0;

        return `
            <div class="custom-row">
                <label>${escapeHTML(member.name)}</label>

                <input
                    type="number"
                    min="0"
                    step="1000"
                    value="${amount}"
                    data-custom-key="${escapeHTML(key)}"
                    placeholder="Nhập số tiền"
                >
            </div>
        `;
    }).join("");
}

// ==========================================
// ALLOCATION CALCULATIONS
// ==========================================

// Chia số nguyên chính xác, không làm mất tiền lẻ.
function divideMoney(amount, keys) {
    const result = {};

    if (keys.length === 0) return result;

    const base = Math.floor(amount / keys.length);
    const remainder = amount % keys.length;

    keys.forEach((key, index) => {
        result[key] = base + (
            index < remainder ? 1 : 0
        );
    });

    return result;
}

function calculateAllocations() {
    const members = getSelectedMembers();
    const keys = members.map(memberKey);

    const fee = readAmount("serviceFee");
    const discount = readAmount("discount");

    const allocations = Object.fromEntries(
        keys.map((key) => [key, 0])
    );

    let subtotal = 0;

    if (currentSplitMode === "equal") {
        subtotal = readAmount("baseAmount");

        const total = subtotal + fee - discount;

        if (total < 0) {
            throw new Error(
                "Giảm giá không thể lớn hơn tổng tiền và phụ phí."
            );
        }

        Object.assign(
            allocations,
            divideMoney(total, keys)
        );

    } else if (currentSplitMode === "item") {
        for (const row of itemizedRows) {
            const lineTotal = row.qty * row.price;
            subtotal += lineTotal;

            if (lineTotal <= 0) continue;

            const consumers = row.consumers.filter(
                (key) => keys.includes(key)
            );

            if (consumers.length === 0) {
                continue;
            }

            const parts = divideMoney(
                lineTotal,
                consumers
            );

            Object.entries(parts).forEach(
                ([key, amount]) => {
                    allocations[key] += amount;
                }
            );
        }

        const adjustment = fee - discount;

        if (adjustment >= 0) {
            const parts = divideMoney(
                adjustment,
                keys
            );

            Object.entries(parts).forEach(
                ([key, amount]) => {
                    allocations[key] += amount;
                }
            );
        } else {
            const parts = divideMoney(
                -adjustment,
                keys
            );

            Object.entries(parts).forEach(
                ([key, amount]) => {
                    allocations[key] -= amount;
                }
            );
        }

    } else {
        keys.forEach((key) => {
            const amount = customAmounts[key] || 0;
            allocations[key] = amount;
            subtotal += amount;
        });

        const adjustment = fee - discount;

        if (adjustment >= 0) {
            const parts = divideMoney(
                adjustment,
                keys
            );

            Object.entries(parts).forEach(
                ([key, amount]) => {
                    allocations[key] += amount;
                }
            );
        } else {
            const parts = divideMoney(
                -adjustment,
                keys
            );

            Object.entries(parts).forEach(
                ([key, amount]) => {
                    allocations[key] -= amount;
                }
            );
        }
    }

    const total = subtotal + fee - discount;

    return {
        members,
        subtotal,
        fee,
        discount,
        total,
        allocations
    };
}

// ==========================================
// PREVIEW
// ==========================================

function recalculateHostInvoicePreview() {
    let result;

    try {
        result = calculateAllocations();
    } catch (error) {
        if ($("previewTotal")) {
            $("previewTotal").textContent = "Không hợp lệ";
        }
        return;
    }

    latestAllocationMap = result.allocations;

    if ($("previewBase")) {
        $("previewBase").textContent =
            formatVND(result.subtotal);
    }

    if ($("previewFee")) {
        $("previewFee").textContent =
            "+" + formatVND(result.fee);
    }

    if ($("previewDiscount")) {
        $("previewDiscount").textContent =
            "-" + formatVND(result.discount);
    }

    if ($("previewTotal")) {
        $("previewTotal").textContent =
            formatVND(result.total);
    }

    if ($("baseAmount") && currentSplitMode !== "equal") {
        $("baseAmount").value = result.subtotal;
    }

    const list = $("allocationList");

    if (list) {
        list.innerHTML = result.members.map((member) => {
            const key = memberKey(member);

            return `
                <div class="allocation-row">
                    <span>${escapeHTML(member.name)}</span>
                    <strong>${formatVND(
                        result.allocations[key] || 0
                    )}</strong>
                </div>
            `;
        }).join("");
    }

    if ($("customStatus")) {
        $("customStatus").textContent =
            `Tổng tự chọn: ${formatVND(result.subtotal)}`;
    }
}

// ==========================================
// AMOUNT SHORTCUTS
// ==========================================

function quickAddAmount(delta) {
    const amount = Math.round(Number(delta) || 0);

    if (currentSplitMode === "equal") {
        if ($("baseAmount")) {
            $("baseAmount").value =
                readAmount("baseAmount") + amount;
        }
    } else if (currentSplitMode === "item") {
        if (itemizedRows.length > 0) {
            itemizedRows[0].price = Math.max(
                0,
                itemizedRows[0].price + amount
            );

            renderItemizedRows();
        }
    } else {
        const first = getSelectedMembers()[0];

        if (first) {
            const key = memberKey(first);

            customAmounts[key] = Math.max(
                0,
                (customAmounts[key] || 0) + amount
            );

            renderCustomRows();
        }
    }

    recalculateHostInvoicePreview();
}

function quickResetAmount() {
    ["baseAmount", "serviceFee", "discount"].forEach(
        (id) => {
            if ($(id)) $(id).value = 0;
        }
    );

    Object.keys(customAmounts).forEach(
        (key) => {
            customAmounts[key] = 0;
        }
    );

    itemizedRows = [];

    renderItemizedRows();
    renderCustomRows();
    recalculateHostInvoicePreview();

    notify("Đã đặt lại số tiền.");
}

function handleBaseAmountManualInput() {
    if (currentSplitMode !== "equal") {
        setInvoiceSplitMode("equal");
    }

    recalculateHostInvoicePreview();
}

// ==========================================
// SAVE HOST INVOICE TO BACKEND
// ==========================================

async function saveHostInvoice() {
    const groupId = getCurrentGroupId();
    const payerId = getCurrentPayerId();

    if (!groupId) {
        notify(
            "Vui lòng chọn nhóm trước khi tạo hóa đơn.",
            true
        );
        return;
    }

    if (!payerId) {
        notify(
            "Vui lòng đăng nhập trước khi tạo hóa đơn.",
            true
        );
        return;
    }

    let result;
    let participantIds;

    try {
        result = calculateAllocations();

        if (result.members.length === 0) {
            throw new Error(
                "Phải chọn ít nhất một thành viên."
            );
        }

        participantIds = getParticipantIds(
            result.members
        );

        if (result.total <= 0) {
            throw new Error(
                "Tổng hóa đơn phải lớn hơn 0."
            );
        }

        if (
            Object.values(result.allocations).some(
                (amount) => amount < 0
            )
        ) {
            throw new Error(
                "Số tiền của một thành viên không thể âm."
            );
        }

        const allocationTotal = Object.values(
            result.allocations
        ).reduce((sum, value) => sum + value, 0);

        if (allocationTotal !== result.total) {
            throw new Error(
                "Tiền phân bổ không khớp tổng hóa đơn. " +
                "Hãy kiểm tra người dùng món và giảm giá."
            );
        }

    } catch (error) {
        notify(error.message, true);
        return;
    }

    const title = $("merchantName")?.value.trim()
        || "Hóa đơn nhóm";

    let endpoint;
    let payload;

    if (currentSplitMode === "equal") {
        endpoint = "/api/bills/equal-split";

        payload = {
            group_id: groupId,
            title,
            total_amount: result.total,
            paid_by: payerId,
            participant_ids: participantIds,
            note: "Tạo từ giao diện chia đều"
        };

    } else if (currentSplitMode === "custom") {
        endpoint = "/api/bills/split-custom";

        const shares = result.members.map((member) => ({
            user_id: member.id,
            amount: result.allocations[memberKey(member)]
        }));

        payload = {
            group_id: groupId,
            title,
            payer_id: payerId,
            created_by: payerId,
            total_amount: result.total,
            shares
        };

    } else {
        endpoint = "/api/bills/split-by-items";

        // Endpoint này chỉ có phụ phí dương.
        // Không tự chuyển giảm giá thành dữ liệu sai.
        if (result.discount > result.fee) {
            notify(
                "Chia theo món hiện chưa hỗ trợ giảm giá " +
                "lớn hơn phụ phí qua API này.",
                true
            );
            return;
        }

        const memberMap = new Map(
            result.members.map(
                (member) => [memberKey(member), member.id]
            )
        );

        const items = itemizedRows
            .filter((row) =>
                row.qty > 0 && row.price > 0
            )
            .map((row) => ({
                item_name: row.name.trim(),
                quantity: row.qty,
                unit_price: row.price,
                user_ids: row.consumers
                    .filter((key) => memberMap.has(key))
                    .map((key) => memberMap.get(key))
            }));

        if (
            items.length === 0 ||
            items.some(
                (item) =>
                    !item.item_name ||
                    item.user_ids.length === 0
            )
        ) {
            notify(
                "Mỗi món phải có tên, đơn giá và người sử dụng.",
                true
            );
            return;
        }

        payload = {
            group_id: groupId,
            title,
            payer_id: payerId,
            created_by: payerId,
            fee_split_mode: "EQUAL",
            service_ship_fee: result.fee - result.discount,
            total_amount: result.total,
            items
        };
    }

    const button = $("confirm");

    if (button) button.disabled = true;

    try {
        const response = await api.post(
            endpoint,
            payload
        );

        const billId = response?.id
            ?? response?.bill_id
            ?? "OK";

        notify(
            `Đã lưu hóa đơn "${title}" (ID #${billId}).`
        );

        // Chỉ đặt lại biểu mẫu sau khi Backend lưu thành công.
        quickResetAmount();

        if ($("merchantName")) {
            $("merchantName").value = "";
        }

    } catch (error) {
        console.error("Bill API error:", error);

        notify(
            "Không thể lưu hóa đơn: " + error.message,
            true
        );

    } finally {
        if (button) button.disabled = false;
    }
}

// ==========================================
// LEGACY FORM - CHIA ĐỀU
// ==========================================

function updateSplitPreview() {
    const total = readAmount("bill-total");

    const checked = document.querySelectorAll(
        ".member-checkbox:checked"
    );

    const badge = $("split-preview-badge");

    if (!badge) return;

    if (!checked.length || total <= 0) {
        badge.textContent = "0 ₫ / người";
        return;
    }

    const base = Math.floor(
        total / checked.length
    );

    const remainder = total % checked.length;

    badge.textContent = remainder
        ? `~${formatVND(base)} / người (dư ${remainder} ₫)`
        : `${formatVND(base)} / người`;
}

function initLegacyBillForm() {
    const form = $("bill-form");
    if (!form) return;

    const list = $("members-checklist");

    if (list && !list.children.length) {
        list.innerHTML = GROUP_MEMBERS
            .map((name, index) => `
                <label class="flex items-center gap-3 p-3 bg-white border-2 border-ink rounded-xl cursor-pointer">
                    <input
                        type="checkbox"
                        class="member-checkbox"
                        value="${escapeHTML(name)}"
                        checked
                        id="mem-${index}"
                    >
                    <span>${escapeHTML(name)}</span>
                </label>
            `)
            .join("");
    }

    if ($("bill-date")) {
        const date = new Date();

        const localDate = new Date(
            date.getTime() -
            date.getTimezoneOffset() * 60000
        );

        $("bill-date").value = localDate
            .toISOString()
            .slice(0, 10);
    }

    $("bill-total")?.addEventListener(
        "input",
        updateSplitPreview
    );

    list?.addEventListener(
        "change",
        updateSplitPreview
    );

    updateSplitPreview();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const checked = Array.from(
            document.querySelectorAll(
                ".member-checkbox:checked"
            )
        );

        if (!checked.length) {
            notify(
                "Vui lòng chọn ít nhất một thành viên.",
                true
            );
            return;
        }

        const total = readAmount("bill-total");

        if (total <= 0) {
            notify(
                "Số tiền hóa đơn phải lớn hơn 0.",
                true
            );
            return;
        }

        const newBill = {
            id: `BIL-${Date.now()}`,
            title: $("bill-title")?.value.trim() || "Hóa đơn",
            groupCode: $("bill-group")?.value || "",
            total,
            payer: $("bill-payer")?.value || "",
            date: $("bill-date")?.value || "",
            splitCount: checked.length
        };

        // Chế độ giao diện cũ chỉ lưu dữ liệu mẫu.
        // Không coi đây là hóa đơn đã lưu vào MySQL.
        let existing = [];

        try {
            existing = JSON.parse(
                localStorage.getItem("squad_cash_bills") ||
                "[]"
            );

            if (!Array.isArray(existing)) {
                existing = [];
            }
        } catch {
            existing = [];
        }

        existing.unshift(newBill);

        localStorage.setItem(
            "squad_cash_bills",
            JSON.stringify(existing)
        );

        notify(
            `Đã lưu hóa đơn mẫu ${newBill.id} trên trình duyệt.`
        );
    });
}

// ==========================================
// OTHER UI FUNCTIONS
// ==========================================

function switchRoleNav(button) {
    document.querySelectorAll(
        ".role-nav button"
    ).forEach((item) => {
        item.classList.remove("active");
    });

    button.classList.add("active");
}

function switchSectionTab(button) {
    document.querySelectorAll(
        ".section-tabs .tab"
    ).forEach((item) => {
        item.classList.remove("active");
    });

    button.classList.add("active");
}

function toggleFxPill() {
    interactiveFxEnabled = !interactiveFxEnabled;

    if ($("fxTogglePill")) {
        $("fxTogglePill").textContent =
            interactiveFxEnabled
                ? "✨ FX: BẬT"
                : "✨ FX: TẮT";
    }
}

function toggleSrsBadges() {
    document.querySelectorAll(
        ".tab-code, .fr-code-tag"
    ).forEach((element) => {
        element.style.display =
            element.style.display === "none"
                ? ""
                : "none";
    });
}

function createNewGroupPrompt() {
    notify(
        "Vui lòng dùng chức năng Quản lý nhóm để tạo nhóm mới.",
        true
    );
}

function focusInvoiceForm() {
    $("invoiceFormPanel")?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    $("baseAmount")?.focus();
}

// ==========================================
// EXPOSE FUNCTIONS FOR HTML ONCLICK
// ==========================================

Object.assign(window, {
    setInvoiceSplitMode,
    quickAddAmount,
    quickResetAmount,
    onMemberSelectionChange,
    addItemRow,
    removeItemRow,
    updateItemRow,
    toggleItemConsumer,
    updateCustomMemberAmount,
    recalculateHostInvoicePreview,
    handleBaseAmountManualInput,
    saveHostInvoice,
    switchRoleNav,
    switchSectionTab,
    toggleFxPill,
    toggleSrsBadges,
    createNewGroupPrompt,
    focusInvoiceForm
});

// ==========================================
// EVENTS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    initLegacyBillForm();

    // Host invoice
    if ($("invoiceFormPanel")) {
        $("baseAmount")?.addEventListener(
            "input",
            handleBaseAmountManualInput
        );

        $("serviceFee")?.addEventListener(
            "input",
            recalculateHostInvoicePreview
        );

        $("discount")?.addEventListener(
            "input",
            recalculateHostInvoicePreview
        );

        $("members")?.addEventListener(
            "change",
            onMemberSelectionChange
        );

        $("itemRows")?.addEventListener(
            "input",
            (event) => {
                const input = event.target.closest(
                    "[data-field]"
                );

                if (!input) return;

                const row = input.closest(
                    "[data-row]"
                );

                if (!row) return;

                updateItemRow(
                    Number(row.dataset.row),
                    input.dataset.field,
                    input.value
                );
            }
        );

        $("itemRows")?.addEventListener(
            "click",
            (event) => {
                const removeButton = event.target.closest(
                    "[data-remove-item]"
                );

                if (removeButton) {
                    removeItemRow(
                        Number(removeButton.dataset.removeItem)
                    );
                    return;
                }

                const memberButton = event.target.closest(
                    "[data-item-index]"
                );

                if (memberButton) {
                    toggleItemConsumer(
                        Number(memberButton.dataset.itemIndex),
                        memberButton.dataset.memberKey
                    );
                }
            }
        );

        $("customRows")?.addEventListener(
            "input",
            (event) => {
                const input = event.target.closest(
                    "[data-custom-key]"
                );

                if (!input) return;

                updateCustomMemberAmount(
                    input.dataset.customKey,
                    input.value
                );
            }
        );

        $("confirm")?.addEventListener(
            "click",
            saveHostInvoice
        );

        setInvoiceSplitMode("equal");
    }
});
