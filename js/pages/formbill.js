let currentSplitMode = "equal";
let interactiveFxEnabled = true;
let audioCtx = null;

let customAmounts = {
    "Phan Đức Anh": 300000,
    "Lê Quang Minh": 300000,
    "Nguyễn Phương Thảo": 300000,
    "Trần Khánh Vy": 300000,
    "Nguyễn Bảo Việt": 300000,
    "Đặng Tuấn Kiệt": 300000
};

let itemizedRows = [
    {
        id: 1,
        name: "Lẩu Bò Đặc Biệt",
        qty: 1,
        price: 600000,
        consumers: ["Phan Đức Anh", "Lê Quang Minh", "Nguyễn Phương Thảo"]
    },
    {
        id: 2,
        name: "Bắp Bò Nhúng Thêm",
        qty: 2,
        price: 200000,
        consumers: ["Lê Quang Minh", "Trần Khánh Vy"]
    },
    {
        id: 3,
        name: "Thùng Bia Tiger Bạc",
        qty: 1,
        price: 420000,
        consumers: ["Phan Đức Anh", "Nguyễn Bảo Việt", "Đặng Tuấn Kiệt"]
    }
];

let latestAllocationMap = {};

function formatVND(amount) {
    return Math.round(Number(amount) || 0).toLocaleString("en-US") + " ₫";
}

function playUiSound(type = "click") {
    if (!interactiveFxEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        if (type === "click") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === "success") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.setValueAtTime(880, now + 0.07);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.23);
        } else if (type === "error") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.setValueAtTime(130, now + 0.08);
            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.21);
        }
    } catch (e) {}
}

function notify(message, forceWarn = false) {
    let container = document.getElementById("cleanToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "cleanToastContainer";
        container.className = "toast-stack";
        document.body.appendChild(container);
    }

    const isWarn = forceWarn || message.includes("Từ chối") || message.includes("Không thể") || message.includes("Cảnh báo") || message.includes("vui lòng");
    playUiSound(isWarn ? "error" : "success");

    const item = document.createElement("div");
    item.className = "srs-toast-card";
    item.innerHTML = `
        <div class="srs-toast-inner">
            <div class="srs-toast-left">
                <span class="srs-toast-dot ${isWarn ? "warn" : ""}"></span>
                <span class="srs-toast-msg">${message}</span>
            </div>
            <button type="button" class="srs-toast-close">ĐÓNG</button>
        </div>
        <div class="srs-toast-progress ${isWarn ? "warn" : ""}"></div>
    `;

    item.querySelector(".srs-toast-close").addEventListener("click", () => {
        item.remove();
    });

    container.appendChild(item);
    setTimeout(() => {
        if (item.parentElement) item.remove();
    }, 4200);
}

function getSelectedMembers() {
    return Array.from(document.querySelectorAll("#members input[type='checkbox']:checked")).map(cb => cb.value);
}

function setInvoiceSplitMode(nextMode) {
    currentSplitMode = nextMode;
    playUiSound("click");

    const eqBtn = document.getElementById("equalMode");
    const itBtn = document.getElementById("itemMode");
    const cuBtn = document.getElementById("customMode");

    eqBtn?.classList.toggle("active", currentSplitMode === "equal");
    itBtn?.classList.toggle("active", currentSplitMode === "item");
    cuBtn?.classList.toggle("active", currentSplitMode === "custom");

    const itemBox = document.getElementById("itemizedBox");
    const customBox = document.getElementById("customBox");

    if (itemBox) itemBox.style.display = currentSplitMode === "item" ? "block" : "none";
    if (customBox) customBox.style.display = currentSplitMode === "custom" ? "block" : "none";

    if (currentSplitMode === "item") {
        renderItemizedRows();
    } else if (currentSplitMode === "custom") {
        renderCustomRows();
    }

    recalculateHostInvoicePreview();
}

function quickAddAmount(delta) {
    playUiSound("click");
    const baseInput = document.getElementById("baseAmount");

    if (currentSplitMode === "custom") {
        const people = getSelectedMembers();
        if (people.length > 0) {
            const first = people[0];
            customAmounts[first] = (Number(customAmounts[first]) || 0) + delta;
            renderCustomRows();
        }
    } else if (currentSplitMode === "item") {
        if (itemizedRows.length > 0) {
            itemizedRows[0].price = (Number(itemizedRows[0].price) || 0) + delta;
            renderItemizedRows();
        }
    } else if (baseInput) {
        const current = parseInt(baseInput.value, 10) || 0;
        baseInput.value = current + delta;
    }

    if (baseInput) {
        baseInput.classList.remove("value-flash");
        void baseInput.offsetWidth;
        baseInput.classList.add("value-flash");
    }

    recalculateHostInvoicePreview();
}

function quickResetAmount() {
    playUiSound("click");
    const baseInput = document.getElementById("baseAmount");
    const feeInput = document.getElementById("serviceFee");
    const discountInput = document.getElementById("discount");

    if (baseInput) baseInput.value = 0;
    if (feeInput) feeInput.value = 0;
    if (discountInput) discountInput.value = 0;

    Object.keys(customAmounts).forEach(k => { customAmounts[k] = 0; });
    if (currentSplitMode === "custom") renderCustomRows();

    recalculateHostInvoicePreview();
    notify("Đã đặt lại tổng tiền món chính, phụ phí và giảm giá về 0 ₫.");
}

function onMemberSelectionChange() {
    playUiSound("click");
    if (currentSplitMode === "item") renderItemizedRows();
    if (currentSplitMode === "custom") renderCustomRows();
    recalculateHostInvoicePreview();
}

function renderItemizedRows() {
    const container = document.getElementById("itemRows");
    if (!container) return;
    const people = getSelectedMembers();

    container.innerHTML = itemizedRows.map((row, idx) => `
        <div class="item-card">
            <div class="item-row-top">
                <input type="text" value="${row.name}" oninput="updateItemRow(${idx}, 'name', this.value)" placeholder="Tên món">
                <input type="number" value="${row.qty}" min="1" oninput="updateItemRow(${idx}, 'qty', this.value)" placeholder="SL" title="Số lượng">
                <input type="number" value="${row.price}" min="0" step="1000" oninput="updateItemRow(${idx}, 'price', this.value)" placeholder="Đơn giá" title="Đơn giá">
            </div>
            <div class="item-row-bottom">
                <span>Người dùng món:</span>
                <div class="member-pill-group">
                    ${people.map(personName => {
                        const active = row.consumers.includes(personName);
                        const shortName = personName.split(" ").pop();
                        return `<button type="button" onclick="toggleItemConsumer(${idx}, '${personName}')" class="member-pill-btn ${active ? "active" : ""}" title="${personName}">${shortName}</button>`;
                    }).join("")}
                </div>
            </div>
        </div>
    `).join("");
}

function updateItemRow(idx, field, val) {
    if (!itemizedRows[idx]) return;
    if (field === "name") itemizedRows[idx].name = val;
    if (field === "qty") itemizedRows[idx].qty = Math.max(1, parseInt(val, 10) || 1);
    if (field === "price") itemizedRows[idx].price = Math.max(0, parseInt(val, 10) || 0);
    recalculateHostInvoicePreview();
}

function toggleItemConsumer(idx, memberName) {
    playUiSound("click");
    const arr = itemizedRows[idx].consumers;
    const pos = arr.indexOf(memberName);
    if (pos >= 0) {
        if (arr.length > 1) {
            arr.splice(pos, 1);
        } else {
            notify("Mỗi món ăn phải có ít nhất 1 thành viên sử dụng!", true);
            return;
        }
    } else {
        arr.push(memberName);
    }
    renderItemizedRows();
    recalculateHostInvoicePreview();
}

function addInvoiceItemRow() {
    playUiSound("click");
    const people = getSelectedMembers();
    itemizedRows.push({
        id: Date.now(),
        name: "Món gọi thêm #" + (itemizedRows.length + 1),
        qty: 1,
        price: 150000,
        consumers: people.length >= 2 ? people.slice(0, 2) : [...people]
    });
    renderItemizedRows();
    recalculateHostInvoicePreview();
    notify("Đã thêm món mới vào danh sách chia theo món.");
}

function renderCustomRows() {
    const container = document.getElementById("customRows");
    if (!container) return;
    const people = getSelectedMembers();

    container.innerHTML = people.map(name => {
        const val = customAmounts[name] !== undefined ? customAmounts[name] : 0;
        return `
            <div class="custom-row">
                <label>${name}</label>
                <input type="number" min="0" step="1000" value="${val}" oninput="updateCustomMemberAmount('${name}', this.value)" placeholder="Nhập số tiền">
            </div>
        `;
    }).join("");
}

function updateCustomMemberAmount(name, val) {
    customAmounts[name] = Math.max(0, parseInt(val, 10) || 0);
    recalculateHostInvoicePreview();
}

function recalculateHostInvoicePreview() {
    const baseInput = document.getElementById("baseAmount");
    const feeInput = document.getElementById("serviceFee");
    const discountInput = document.getElementById("discount");

    const fee = Math.max(0, parseInt(feeInput?.value, 10) || 0);
    const discount = Math.max(0, parseInt(discountInput?.value, 10) || 0);
    const checkedMembers = getSelectedMembers();

    let subtotal = 0;
    latestAllocationMap = {};

    if (currentSplitMode === "equal") {
        subtotal = Math.max(0, parseInt(baseInput?.value, 10) || 0);
        const grand = Math.max(0, subtotal + fee - discount);
        if (checkedMembers.length > 0) {
            const baseShare = Math.floor(grand / checkedMembers.length);
            const remainder = grand - (baseShare * checkedMembers.length);
            checkedMembers.forEach((name, idx) => {
                latestAllocationMap[name] = baseShare + (idx === 0 ? remainder : 0);
            });
        }
    } else if (currentSplitMode === "item") {
        checkedMembers.forEach(name => { latestAllocationMap[name] = 0; });

        itemizedRows.forEach(r => {
            const lineTotal = (Number(r.qty) || 1) * (Number(r.price) || 0);
            subtotal += lineTotal;
            const validConsumers = r.consumers.filter(c => checkedMembers.includes(c));
            if (validConsumers.length > 0) {
                const per = Math.round(lineTotal / validConsumers.length);
                validConsumers.forEach(c => {
                    latestAllocationMap[c] = (latestAllocationMap[c] || 0) + per;
                });
            }
        });

        if (baseInput && document.activeElement !== baseInput) {
            baseInput.value = subtotal;
        }

        const netAdj = fee - discount;
        if (checkedMembers.length > 0) {
            const adjPerPerson = Math.round(netAdj / checkedMembers.length);
            checkedMembers.forEach(p => {
                latestAllocationMap[p] = Math.max(0, (latestAllocationMap[p] || 0) + adjPerPerson);
            });
        }
    } else if (currentSplitMode === "custom") {
        subtotal = checkedMembers.reduce((sum, name) => sum + (Number(customAmounts[name]) || 0), 0);
        if (baseInput && document.activeElement !== baseInput) {
            baseInput.value = subtotal;
        }

        const netAdj = fee - discount;
        const adjPerPerson = checkedMembers.length > 0 ? Math.round(netAdj / checkedMembers.length) : 0;

        checkedMembers.forEach(name => {
            const raw = Number(customAmounts[name]) || 0;
            latestAllocationMap[name] = Math.max(0, raw + adjPerPerson);
        });

        const customStatus = document.getElementById("customStatus");
        if (customStatus) {
            customStatus.textContent = `Tổng tự chọn: ${formatVND(subtotal)} (Đã cộng/trừ đều phụ phí & giảm giá cho ${checkedMembers.length} người).`;
            customStatus.style.color = "#059669";
        }
    }

    const grandTotal = Math.max(0, subtotal + fee - discount);

    const previewBase = document.getElementById("previewBase");
    const previewFee = document.getElementById("previewFee");
    const previewDiscount = document.getElementById("previewDiscount");
    const previewTotal = document.getElementById("previewTotal");

    if (previewBase) previewBase.textContent = formatVND(subtotal);
    if (previewFee) previewFee.textContent = "+" + formatVND(fee);
    if (previewDiscount) previewDiscount.textContent = "-" + formatVND(discount);
    if (previewTotal) previewTotal.textContent = formatVND(grandTotal);

    const listEl = document.getElementById("allocationList");
    if (!listEl) return;

    if (checkedMembers.length === 0) {
        listEl.innerHTML = `<div class="allocation-row" style="justify-content:center; color:#dc2626;">Vui lòng chọn ít nhất 1 thành viên tham gia hóa đơn (FR-HOST-003).</div>`;
        return;
    }

    listEl.innerHTML = Object.entries(latestAllocationMap).map(([name, amount]) => `
        <div class="allocation-row">
            <span>${name}</span>
            <strong>${formatVND(amount)}</strong>
        </div>
    `).join("");
}

function saveHostInvoice() {
    const checkedMembers = getSelectedMembers();
    if (checkedMembers.length === 0) {
        notify("Không thể lưu: Hóa đơn phải có ít nhất 1 thành viên tham gia!", true);
        return;
    }

    const merchant = document.getElementById("merchantName")?.value.trim() || "Hóa đơn nhóm";
    const newInvId = "INV-" + Math.floor(210 + Math.random() * 700);
    const totalText = document.getElementById("previewTotal")?.textContent || "0 ₫";

    notify(`Đã lưu hóa đơn "${merchant}" (#${newInvId} - Tổng ${totalText}) và tạo ${checkedMembers.length} khoản phải trả tại mục Công nợ!`);
}

function switchRoleNav(btn) {
    document.querySelectorAll(".role-nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    notify(`Đăng nhập thành công! Đã mở không gian ${btn.textContent.trim()}.`);
}

function switchSectionTab(btn) {
    document.querySelectorAll(".section-tabs .tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const label = btn.querySelector("span")?.textContent || "Tab";
    notify(`Đang hiển thị phân mục: ${label}`);
}

function toggleFxPill() {
    interactiveFxEnabled = !interactiveFxEnabled;
    const pill = document.getElementById("fxTogglePill");
    if (pill) pill.textContent = interactiveFxEnabled ? "✨ FX: BẬT" : "✨ FX: TẮT";
    notify(interactiveFxEnabled ? "Đã bật hiệu ứng âm thanh Tactile!" : "Đã tạm tắt hiệu ứng âm thanh.");
}

function toggleSrsBadges() {
    document.querySelectorAll(".tab-code, .fr-code-tag").forEach(el => {
        el.style.display = el.style.display === "none" ? "inline-flex" : "none";
    });
    notify("Đã bật/tắt hiển thị nhãn mã yêu cầu SRS (FR-Code).");
}

function createNewGroupPrompt() {
    const name = prompt("Nhập tên nhóm quỹ mới (FR-HOST-001):", "Quỹ Cắm Trại Hồ Trị An");
    if (name && name.trim()) {
        const autoCode = "SQ" + Math.floor(1000 + Math.random() * 8999);
        const titleEl = document.getElementById("currentGroupTitle");
        const codeEl = document.getElementById("osGroupCodeBadge");
        if (titleEl) titleEl.textContent = name.trim() + ".";
        if (codeEl) codeEl.textContent = "MÃ NHÓM: #" + autoCode;
        notify(`Đã tạo nhóm "${name.trim()}" với Mã mời duy nhất #${autoCode}!`);
    }
}

function focusInvoiceForm() {
    document.getElementById("invoiceFormPanel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => document.getElementById("baseAmount")?.focus(), 250);
    notify("Đã trỏ tới biểu mẫu Tạo Hóa Đơn & Chia Tiền.");
}

window.addEventListener("DOMContentLoaded", () => {
    setInvoiceSplitMode("equal");
});

function handleBaseAmountManualInput() {
    // Nếu đang ở chế độ Chia theo món hoặc Tự chọn mà người dùng chủ động sửa ô Tổng tiền chính,
    // tự động chuyển sang chế độ "Chia đều" để nhận đúng con số mới nhập
    if (currentSplitMode !== "equal") {
        currentSplitMode = "equal";
        document.getElementById("equalMode")?.classList.add("active");
        document.getElementById("itemMode")?.classList.remove("active");
        document.getElementById("customMode")?.classList.remove("active");

        const itemBox = document.getElementById("itemizedBox");
        const customBox = document.getElementById("customBox");
        if (itemBox) itemBox.style.display = "none";
        if (customBox) customBox.style.display = "none";
    }
    recalculateHostInvoicePreview();
}

window.addEventListener("DOMContentLoaded", () => {
    const baseInput = document.getElementById("baseAmount");
    const feeInput = document.getElementById("serviceFee");
    const discountInput = document.getElementById("discount");

    if (baseInput) {
        baseInput.oninput = handleBaseAmountManualInput;
        baseInput.addEventListener("keyup", handleBaseAmountManualInput);
        baseInput.addEventListener("change", handleBaseAmountManualInput);
    }
    if (feeInput) {
        feeInput.oninput = recalculateHostInvoicePreview;
    }
    if (discountInput) {
        discountInput.oninput = recalculateHostInvoicePreview;
    }

    setInvoiceSplitMode("equal");
});