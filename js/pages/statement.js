/**
 * SQUAD.CASH — Task T3CD008 & T3CDF02:
 * - Bảng giao dịch có bộ lọc đa tiêu chí
 * - Trang sao kê theo tháng có biểu đồ Thu/Chi (Chart.js)
 * - In sao kê bằng window.print()
 * - Xuất CSV lịch sử giao dịch và sao kê theo kỳ đang chọn (UTF-8 BOM cho Excel)
 */

const API_BASE_URL = "http://127.0.0.1:8000";

const MOCK_TRANSACTIONS = [
    {
        id: "TX-261101",
        occurred_at: "2026-11-02T09:15:00",
        type: "INCOME",
        category: "Đóng quỹ định kỳ",
        description: "Thu quỹ nhóm tháng 11 (6 thành viên x 500,000đ)",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 3000000,
    },
    {
        id: "TX-261102",
        occurred_at: "2026-11-04T19:30:00",
        type: "EXPENSE",
        category: "Ăn uống",
        description: "Lẩu Bò Ba Toa - Tiệc khai màn chuyến đi",
        actor: "Lê Quang Minh",
        status: "ACTIVE",
        amount: 1250000,
    },
    {
        id: "TX-261103",
        occurred_at: "2026-11-08T14:00:00",
        type: "EXPENSE",
        category: "Di chuyển",
        description: "Đặt cọc thuê xe Limousine 9 chỗ khứ hồi",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 1500000,
    },
    {
        id: "TX-261104",
        occurred_at: "2026-11-11T10:20:00",
        type: "INCOME",
        category: "Đóng quỹ bổ sung",
        description: "Thu bổ sung quỹ đợt 2 (Chuyển khoản VietQR)",
        actor: "Nguyễn Phương Thảo",
        status: "ACTIVE",
        amount: 2400000,
    },
    {
        id: "TX-261105",
        occurred_at: "2026-11-15T16:45:00",
        type: "EXPENSE",
        category: "Lưu trú",
        description: "Thanh toán tiền phòng Homestay Đà Lạt 2 đêm",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 2100000,
    },
    {
        id: "TX-261106",
        occurred_at: "2026-11-19T20:10:00",
        type: "EXPENSE",
        category: "Ăn uống",
        description: "Tiệc nướng BBQ Thông Reo & đồ uống",
        actor: "Trần Khánh Vy",
        status: "ACTIVE",
        amount: 850000,
    },
    {
        id: "TX-261107",
        occurred_at: "2026-11-21T08:40:00",
        type: "INCOME",
        category: "Hoàn tiền",
        description: "Hoàn tiền cọc giữ phòng không phát sinh hư hại",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 500000,
    },
    {
        id: "TX-261001",
        occurred_at: "2026-10-05T09:00:00",
        type: "INCOME",
        category: "Đóng quỹ định kỳ",
        description: "Thu quỹ nhóm tháng 10",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 4200000,
    },
    {
        id: "TX-261002",
        occurred_at: "2026-10-18T18:30:00",
        type: "EXPENSE",
        category: "Ăn uống",
        description: "Liên hoan sinh nhật thành viên tháng 10",
        actor: "Nguyễn Bảo Việt",
        status: "ACTIVE",
        amount: 1950000,
    },
    {
        id: "TX-260901",
        occurred_at: "2026-09-03T10:00:00",
        type: "INCOME",
        category: "Đóng quỹ định kỳ",
        description: "Thu quỹ nhóm tháng 9",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 3600000,
    },
    {
        id: "TX-260902",
        occurred_at: "2026-09-20T15:15:00",
        type: "EXPENSE",
        category: "Sinh hoạt chung",
        description: "Mua nước uống & dụng cụ sinh hoạt nhóm",
        actor: "Đặng Tuấn Kiệt",
        status: "ACTIVE",
        amount: 1400000,
    },
    {
        id: "TX-260801",
        occurred_at: "2026-08-06T09:30:00",
        type: "INCOME",
        category: "Đóng quỹ định kỳ",
        description: "Thu quỹ tháng 8",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 3000000,
    },
    {
        id: "TX-260802",
        occurred_at: "2026-08-22T17:00:00",
        type: "EXPENSE",
        category: "Thể thao",
        description: "Thuê sân cầu lông & mua cầu tháng 8",
        actor: "Lê Quang Minh",
        status: "ACTIVE",
        amount: 1800000,
    },
    {
        id: "TX-260701",
        occurred_at: "2026-07-04T11:00:00",
        type: "INCOME",
        category: "Đóng quỹ định kỳ",
        description: "Thu quỹ tháng 7",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 2800000,
    },
    {
        id: "TX-260702",
        occurred_at: "2026-07-19T19:45:00",
        type: "EXPENSE",
        category: "Ăn uống",
        description: "Cà phê họp nhóm tổng kết dự án",
        actor: "Nguyễn Phương Thảo",
        status: "ACTIVE",
        amount: 1100000,
    },
    {
        id: "TX-260601",
        occurred_at: "2026-06-02T08:30:00",
        type: "INCOME",
        category: "Đóng quỹ khởi tạo",
        description: "Thu quỹ khởi tạo ban đầu",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 3500000,
    },
    {
        id: "TX-260602",
        occurred_at: "2026-06-16T20:00:00",
        type: "EXPENSE",
        category: "Di chuyển",
        description: "Chi phí xăng xe đi khảo sát địa điểm",
        actor: "Phan Đức Anh (Host)",
        status: "ACTIVE",
        amount: 950000,
    },
];

let allTransactions = [];
let chartViewMode = "months";
let barChartInstance = null;
let categoryChartInstance = null;

function getStoredToken() {
    return (
        localStorage.getItem("squad_cash_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

function getCurrentViewerId() {
    try {
        const raw = localStorage.getItem("squad_cash_user");
        if (raw) {
            const user = JSON.parse(raw);
            if (user && Number(user.id) > 0) return Number(user.id);
        }
    } catch (_) {}
    return 1;
}

function formatVND(amount) {
    return Math.round(Number(amount) || 0).toLocaleString("en-US") + " ₫";
}

function normalizeType(rawType) {
    const t = String(rawType || "").toUpperCase();
    if (["INCOME", "IN", "THU", "DEPOSIT", "CONTRIBUTION"].includes(t)) return "INCOME";
    return "EXPENSE";
}

function formatDateTime(isoStr) {
    if (!isoStr) return "--/--/----";
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return String(isoStr).slice(0, 16);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getYearMonth(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return String(isoStr).slice(0, 7);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function getDateOnly(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return String(isoStr).slice(0, 10);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatMonthLabel(ym) {
    if (!ym || !ym.includes("-")) return ym || "";
    const [y, m] = ym.split("-");
    return `Tháng ${parseInt(m, 10)}/${y}`;
}

function showToast(message, isWarn = false) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "pointer-events-auto card-clean p-3.5 bg-ink text-white flex items-center justify-between gap-3";
    el.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0 ${isWarn ? "bg-coral" : "bg-lime"}"></span>
            <span class="text-xs font-medium">${message}</span>
        </div>
        <button type="button" onclick="this.parentElement.remove()"
            class="font-mono text-[10px] bg-lime text-ink font-bold px-2 py-0.5 rounded border border-ink">ĐÓNG</button>
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function setApiBadge(online, text) {
    const dot = document.getElementById("apiPulseDot");
    const lbl = document.getElementById("apiStatusText");
    if (dot) dot.classList.toggle("offline", !online);
    if (lbl) lbl.textContent = text;
}

function normalizeTransaction(raw, index) {
    const idVal = raw.transaction_id ?? raw.id ?? `TX-${index + 1}`;
    const type = normalizeType(raw.type || raw.transaction_type);
    return {
        id: String(idVal).startsWith("TX-") ? String(idVal) : `TX-${idVal}`,
        occurred_at: raw.occurred_at || raw.created_at || raw.date || new Date().toISOString(),
        type,
        category: raw.category || (type === "INCOME" ? "Thu quỹ" : "Chi chung"),
        description: raw.description || raw.note || raw.title || "Giao dịch quỹ nhóm",
        actor:
            raw.actor_name ||
            raw.payer_name ||
            raw.created_by_name ||
            (raw.payer_id ? `User #${raw.payer_id}` : raw.created_by ? `User #${raw.created_by}` : "Thành viên nhóm"),
        status: String(raw.status || "ACTIVE").toUpperCase(),
        amount: Math.abs(Math.round(Number(raw.amount) || 0)),
    };
}

async function fetchTransactions() {
    const groupId = Math.max(1, parseInt(document.getElementById("groupIdInput")?.value, 10) || 1);
    const viewerId = getCurrentViewerId();
    const token = getStoredToken();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const candidateEndpoints = [
        `${API_BASE_URL}/api/fund-transactions/history/${groupId}?viewer_id=${viewerId}&page=1&page_size=100`,
        `${API_BASE_URL}/api/groups/${groupId}/fund-transactions`,
    ];

    for (const url of candidateEndpoints) {
        try {
            const res = await fetch(url, { method: "GET", headers });
            if (!res.ok) continue;

            const payload = await res.json();
            const rawList = Array.isArray(payload)
                ? payload
                : payload.items || payload.transactions || payload.data || [];

            if (Array.isArray(rawList) && rawList.length > 0) {
                allTransactions = rawList.map(normalizeTransaction);
                setApiBadge(true, `API Online • Nhóm #${groupId}`);
                populateCategoryFilter();
                renderAll();
                showToast(`Đã tải ${allTransactions.length} giao dịch thật từ Backend (Nhóm #${groupId}).`);
                return;
            }
        } catch (_) {}
    }

    allTransactions = [...MOCK_TRANSACTIONS];
    setApiBadge(false, "Chế độ Dữ liệu mẫu");
    populateCategoryFilter();
    renderAll();
}

function populateCategoryFilter() {
    const select = document.getElementById("filterCategory");
    if (!select) return;
    const currentVal = select.value || "ALL";
    const categories = Array.from(new Set(allTransactions.map((t) => t.category).filter(Boolean))).sort();

    select.innerHTML =
        `<option value="ALL">Tất cả danh mục</option>` +
        categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("");

    if (categories.includes(currentVal)) {
        select.value = currentVal;
    }
}

function getFilteredTransactions() {
    const keyword = (document.getElementById("filterSearch")?.value || "").trim().toLowerCase();
    const typeFilter = document.getElementById("filterType")?.value || "ALL";
    const categoryFilter = document.getElementById("filterCategory")?.value || "ALL";
    const dateFrom = document.getElementById("filterDateFrom")?.value || "";
    const dateTo = document.getElementById("filterDateTo")?.value || "";
    const onlySelectedMonth = document.getElementById("filterOnlySelectedMonth")?.checked ?? true;
    const selectedMonth = document.getElementById("statementMonthInput")?.value || "";

    return allTransactions
        .filter((tx) => {
            if (onlySelectedMonth && selectedMonth && getYearMonth(tx.occurred_at) !== selectedMonth) {
                return false;
            }
            if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
            if (categoryFilter !== "ALL" && tx.category !== categoryFilter) return false;

            const txDate = getDateOnly(tx.occurred_at);
            if (dateFrom && txDate < dateFrom) return false;
            if (dateTo && txDate > dateTo) return false;

            if (keyword) {
                const hay = `${tx.id} ${tx.category} ${tx.description} ${tx.actor}`.toLowerCase();
                if (!hay.includes(keyword)) return false;
            }
            return true;
        })
        .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));
}

function renderKPIs(filteredList) {
    const selectedMonth = document.getElementById("statementMonthInput")?.value || "2026-11";
    const onlySelectedMonth = document.getElementById("filterOnlySelectedMonth")?.checked ?? true;

    let totalIn = 0;
    let totalOut = 0;
    let countIn = 0;
    let countOut = 0;

    filteredList.forEach((tx) => {
        if (tx.status === "VOIDED" || tx.status === "CANCELLED") return;
        if (tx.type === "INCOME") {
            totalIn += tx.amount;
            countIn += 1;
        } else {
            totalOut += tx.amount;
            countOut += 1;
        }
    });

    const net = totalIn - totalOut;
    const totalCount = filteredList.length;
    const avg = totalCount > 0 ? Math.round((totalIn + totalOut) / totalCount) : 0;

    document.getElementById("kpiTotalIncome").textContent = `+${formatVND(totalIn)}`;
    document.getElementById("kpiIncomeCount").textContent = `${countIn} giao dịch thu`;

    document.getElementById("kpiTotalExpense").textContent = `-${formatVND(totalOut)}`;
    document.getElementById("kpiExpenseCount").textContent = `${countOut} giao dịch chi`;

    const netSign = net > 0 ? "+" : "";
    document.getElementById("kpiNetBalance").textContent = `${netSign}${formatVND(net)}`;
    document.getElementById("kpiPeriodNote").textContent = onlySelectedMonth
        ? `Kỳ: ${formatMonthLabel(selectedMonth)}`
        : "Kỳ: Toàn bộ bộ lọc";

    document.getElementById("kpiTotalCount").textContent = `${totalCount} GD`;
    document.getElementById("kpiAvgAmount").textContent = `Trung bình: ${formatVND(avg)} / GD`;

    document.getElementById("tableRecordCounter").textContent = `Hiển thị ${totalCount} giao dịch`;
    document.getElementById("tableFooterSummary").textContent = `Tổng cộng: ${totalCount} giao dịch khớp bộ lọc`;
    document.getElementById("footerIncome").textContent = `+${formatVND(totalIn)}`;
    document.getElementById("footerExpense").textContent = `-${formatVND(totalOut)}`;
    document.getElementById("footerNet").textContent = `${netSign}${formatVND(net)}`;
}

function renderTransactionsTable(filteredList) {
    const tbody = document.getElementById("transactionsTableBody");
    if (!tbody) return;

    if (filteredList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-10 px-4 text-center text-muted">
                    <div class="font-display font-bold text-base text-ink">Không tìm thấy giao dịch phù hợp</div>
                    <p class="text-xs mt-1">Hãy thử đổi tháng sao kê hoặc bấm "Xóa bộ lọc" để xem toàn bộ lịch sử.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredList
        .map((tx) => {
            const isIncome = tx.type === "INCOME";
            const typeBadge = isIncome
                ? `<span class="font-mono text-xs font-bold bg-lime text-ink border border-ink px-2.5 py-0.5 rounded-md">+ THU</span>`
                : `<span class="font-mono text-xs font-bold bg-coral text-white border border-ink px-2.5 py-0.5 rounded-md">- CHI</span>`;

            const statusBadge =
                tx.status === "ACTIVE" || tx.status === "COMPLETED"
                    ? `<span class="font-mono text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">Hợp lệ</span>`
                    : `<span class="font-mono text-[11px] font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">${tx.status}</span>`;

            return `
                <tr>
                    <td class="py-3.5 px-4 font-mono text-xs font-bold text-ink">${tx.id}</td>
                    <td class="py-3.5 px-4 font-mono text-xs text-muted whitespace-nowrap">${formatDateTime(tx.occurred_at)}</td>
                    <td class="py-3.5 px-4 whitespace-nowrap">${typeBadge}</td>
                    <td class="py-3.5 px-4">
                        <div class="font-bold text-ink">${tx.description}</div>
                        <div class="font-mono text-[11px] text-indigo mt-0.5">${tx.category}</div>
                    </td>
                    <td class="py-3.5 px-4 text-xs font-medium text-ink">${tx.actor}</td>
                    <td class="py-3.5 px-4 text-center">${statusBadge}</td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                        isIncome ? "text-emerald-700" : "text-rose-600"
                    }">
                        ${isIncome ? "+" : "-"}${formatVND(tx.amount)}
                    </td>
                </tr>
            `;
        })
        .join("");
}

function getLastSixMonths(anchorYm) {
    const [yStr, mStr] = (anchorYm || "2026-11").split("-");
    const year = parseInt(yStr, 10) || 2026;
    const month = parseInt(mStr, 10) || 11;
    const result = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1);
        const pad = (n) => String(n).padStart(2, "0");
        result.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
    }
    return result;
}

function renderBarChart() {
    const canvas = document.getElementById("incomeExpenseBarChart");
    if (!canvas || typeof Chart === "undefined") return;

    const selectedMonth = document.getElementById("statementMonthInput")?.value || "2026-11";
    const titleEl = document.getElementById("barChartTitle");

    let labels = [];
    let incomeData = [];
    let expenseData = [];

    if (chartViewMode === "months") {
        const months = getLastSixMonths(selectedMonth);
        if (titleEl) titleEl.textContent = "Biểu đồ Thu / Chi theo tháng (6 tháng gần nhất)";

        labels = months.map((ym) => {
            const [y, m] = ym.split("-");
            return `T${parseInt(m, 10)}/${y.slice(-2)}`;
        });

        months.forEach((ym) => {
            let sumIn = 0;
            let sumOut = 0;
            allTransactions.forEach((tx) => {
                if (tx.status === "CANCELLED" || getYearMonth(tx.occurred_at) !== ym) return;
                if (tx.type === "INCOME") sumIn += tx.amount;
                else sumOut += tx.amount;
            });
            incomeData.push(sumIn);
            expenseData.push(sumOut);
        });
    } else {
        if (titleEl) titleEl.textContent = `Biểu đồ Thu / Chi theo ngày (${formatMonthLabel(selectedMonth)})`;
        const monthTxs = allTransactions.filter(
            (tx) => tx.status !== "CANCELLED" && getYearMonth(tx.occurred_at) === selectedMonth
        );
        const dayMap = {};

        monthTxs.forEach((tx) => {
            const day = getDateOnly(tx.occurred_at).slice(8, 10);
            if (!dayMap[day]) dayMap[day] = { in: 0, out: 0 };
            if (tx.type === "INCOME") dayMap[day].in += tx.amount;
            else dayMap[day].out += tx.amount;
        });

        const sortedDays = Object.keys(dayMap).sort();
        if (sortedDays.length === 0) {
            labels = ["Chưa có GD"];
            incomeData = [0];
            expenseData = [0];
        } else {
            labels = sortedDays.map((d) => `Ngày ${d}`);
            incomeData = sortedDays.map((d) => dayMap[d].in);
            expenseData = sortedDays.map((d) => dayMap[d].out);
        }
    }

    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(canvas.getContext("2d"), {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Tổng Thu (VND)",
                    data: incomeData,
                    backgroundColor: "#D4FF00",
                    borderColor: "#121212",
                    borderWidth: 2,
                    borderRadius: 6,
                },
                {
                    label: "Tổng Chi (VND)",
                    data: expenseData,
                    backgroundColor: "#FF5E36",
                    borderColor: "#121212",
                    borderWidth: 2,
                    borderRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 450 },
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: "#121212",
                        font: { family: "'Space Grotesk', sans-serif", weight: "bold", size: 12 },
                        usePointStyle: true,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${formatVND(ctx.parsed.y)}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#121212",
                        font: { family: "'JetBrains Mono', monospace", weight: "bold", size: 11 },
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "#E4E4E7" },
                    ticks: {
                        color: "#52525B",
                        font: { family: "'JetBrains Mono', monospace", size: 11 },
                        callback: (value) => (value >= 1000000 ? `${(value / 1000000).toFixed(1)}tr` : `${value / 1000}k`),
                    },
                },
            },
        },
    });
}

function renderCategoryChart(filteredList) {
    const canvas = document.getElementById("expenseCategoryChart");
    const summaryEl = document.getElementById("categoryLegendSummary");
    if (!canvas || typeof Chart === "undefined") return;

    const expenseByCat = {};
    let totalExpense = 0;

    filteredList.forEach((tx) => {
        if (tx.type !== "EXPENSE" || tx.status === "CANCELLED") return;
        expenseByCat[tx.category] = (expenseByCat[tx.category] || 0) + tx.amount;
        totalExpense += tx.amount;
    });

    const labels = Object.keys(expenseByCat);
    const values = Object.values(expenseByCat);

    if (categoryChartInstance) categoryChartInstance.destroy();

    if (labels.length === 0) {
        if (summaryEl) summaryEl.textContent = "Chưa có khoản chi nào trong kỳ lọc hiện tại.";
        categoryChartInstance = new Chart(canvas.getContext("2d"), {
            type: "doughnut",
            data: {
                labels: ["Không có chi tiêu"],
                datasets: [{ data: [1], backgroundColor: ["#E4E4E7"], borderColor: "#121212", borderWidth: 1.5 }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
            },
        });
        return;
    }

    const palette = ["#7C3AED", "#FF5E36", "#38BDF8", "#FACC15", "#10B981", "#D4FF00"];

    categoryChartInstance = new Chart(canvas.getContext("2d"), {
        type: "doughnut",
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: labels.map((_, i) => palette[i % palette.length]),
                    borderColor: "#121212",
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "58%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#121212",
                        font: { family: "'Plus Jakarta Sans', sans-serif", weight: "bold", size: 11 },
                        boxWidth: 12,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const pct = totalExpense > 0 ? Math.round((ctx.parsed / totalExpense) * 100) : 0;
                            return `${ctx.label}: ${formatVND(ctx.parsed)} (${pct}%)`;
                        },
                    },
                },
            },
        },
    });

    if (summaryEl) {
        summaryEl.textContent = `${labels.length} danh mục chi • Tổng: ${formatVND(totalExpense)}`;
    }
}

// =========================================================================
// TASK T3CDF02: XUẤT CSV LỊCH SỬ GIAO DỊCH & SAO KÊ THEO KỲ ĐANG CHỌN
// =========================================================================
function escapeCsvCell(value) {
    const str = String(value ?? "").replaceAll('"', '""');
    return `"${str}"`;
}

function downloadCsvFile(filename, rows) {
    const csvContent =
        "\uFEFF" + rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getPeriodSlug() {
    const groupId = document.getElementById("groupIdInput")?.value || "1";
    const selectedMonth = document.getElementById("statementMonthInput")?.value || "all";
    const onlySelectedMonth = document.getElementById("filterOnlySelectedMonth")?.checked ?? true;
    const dateFrom = document.getElementById("filterDateFrom")?.value || "";
    const dateTo = document.getElementById("filterDateTo")?.value || "";

    let periodPart = onlySelectedMonth ? selectedMonth : "toan-bo";
    if (dateFrom || dateTo) {
        periodPart = `${dateFrom || "dau"}_den_${dateTo || "nay"}`;
    }
    return { groupId, periodPart, selectedMonth, onlySelectedMonth, dateFrom, dateTo };
}

function exportHistoryCsv() {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) {
        showToast("Không có giao dịch nào trong kỳ/bộ lọc hiện tại để xuất CSV!", true);
        return;
    }

    const { groupId, periodPart } = getPeriodSlug();
    const rows = [
        ["Mã GD", "Ngày phát sinh", "Loại", "Danh mục", "Nội dung", "Người thực hiện", "Trạng thái", "Số tiền (VND)"],
        ...filtered.map((tx) => [
            tx.id,
            formatDateTime(tx.occurred_at),
            tx.type === "INCOME" ? "THU" : "CHI",
            tx.category,
            tx.description,
            tx.actor,
            tx.status === "ACTIVE" ? "Hợp lệ" : tx.status,
            tx.type === "INCOME" ? tx.amount : -tx.amount,
        ]),
    ];

    const filename = `lich_su_giao_dich_nhom${groupId}_${periodPart}.csv`;
    downloadCsvFile(filename, rows);
    showToast(`Đã xuất ${filtered.length} giao dịch ra file ${filename}`);
}

function calculateOpeningBalanceForPeriod(selectedMonth, onlySelectedMonth, dateFrom) {
    let cutoffDate = "";
    if (dateFrom) {
        cutoffDate = dateFrom;
    } else if (onlySelectedMonth && selectedMonth) {
        cutoffDate = `${selectedMonth}-01`;
    }
    if (!cutoffDate) return 0;

    return allTransactions.reduce((acc, tx) => {
        if (tx.status === "CANCELLED" || tx.status === "VOIDED") return acc;
        const txDate = getDateOnly(tx.occurred_at);
        if (txDate && txDate < cutoffDate) {
            return acc + (tx.type === "INCOME" ? tx.amount : -tx.amount);
        }
        return acc;
    }, 0);
}

function exportStatementCsv() {
    const filtered = getFilteredTransactions();
    const { groupId, periodPart, selectedMonth, onlySelectedMonth, dateFrom, dateTo } = getPeriodSlug();

    const openingBalance = calculateOpeningBalanceForPeriod(selectedMonth, onlySelectedMonth, dateFrom);
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = {};

    filtered.forEach((tx) => {
        if (tx.status === "CANCELLED" || tx.status === "VOIDED") return;
        if (tx.type === "INCOME") {
            totalIncome += tx.amount;
        } else {
            totalExpense += tx.amount;
            expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
        }
    });

    const netChange = totalIncome - totalExpense;
    const closingBalance = openingBalance + netChange;
    const periodLabel = dateFrom || dateTo
        ? `Từ ${dateFrom || "đầu"} đến ${dateTo || "nay"}`
        : onlySelectedMonth
            ? formatMonthLabel(selectedMonth)
            : "Toàn bộ thời gian";

    const rows = [
        ["BÁO CÁO SAO KÊ QUỸ NHÓM (SQUAD.CASH)"],
        ["Mã nhóm", `#GRP-${groupId}`],
        ["Kỳ sao kê", periodLabel],
        ["Thời điểm xuất", formatDateTime(new Date().toISOString())],
        [],
        ["1. TỔNG HỢP DÒNG TIỀN TRONG KỲ", "Số tiền (VND)"],
        ["Số dư đầu kỳ", openingBalance],
        ["Tổng thu trong kỳ", totalIncome],
        ["Tổng chi trong kỳ", totalExpense],
        ["Chênh lệch ròng (Thu - Chi)", netChange],
        ["Số dư cuối kỳ", closingBalance],
        [],
        ["2. CƠ CẤU CHI TIÊU THEO DANH MỤC", "Số tiền (VND)", "Tỉ trọng (%)"],
        ...(Object.keys(expenseByCategory).length > 0
            ? Object.entries(expenseByCategory).map(([cat, amt]) => [
                  cat,
                  amt,
                  totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) + "%" : "0%",
              ])
            : [["Chưa có khoản chi trong kỳ", 0, "0%"]]),
        [],
        ["3. CHI TIẾT GIAO DỊCH TRONG KỲ"],
        ["Mã GD", "Ngày phát sinh", "Loại", "Danh mục", "Nội dung", "Người thực hiện", "Trạng thái", "Số tiền (VND)"],
        ...filtered.map((tx) => [
            tx.id,
            formatDateTime(tx.occurred_at),
            tx.type === "INCOME" ? "THU" : "CHI",
            tx.category,
            tx.description,
            tx.actor,
            tx.status === "ACTIVE" ? "Hợp lệ" : tx.status,
            tx.type === "INCOME" ? tx.amount : -tx.amount,
        ]),
    ];

    const filename = `sao_ke_quy_nhom${groupId}_${periodPart}.csv`;
    downloadCsvFile(filename, rows);
    showToast(`Đã xuất sao kê kỳ đang chọn ra file ${filename}`);
}

// ---------------- IN SAO KÊ & RENDER TỔNG ----------------
function updatePrintMetadata() {
    const groupId = document.getElementById("groupIdInput")?.value || "1";
    const selectedMonth = document.getElementById("statementMonthInput")?.value || "2026-11";
    const onlySelectedMonth = document.getElementById("filterOnlySelectedMonth")?.checked ?? true;

    const printGroupEl = document.getElementById("printGroupCode");
    const printPeriodEl = document.getElementById("printPeriodLabel");
    const printDateEl = document.getElementById("printExportDate");

    if (printGroupEl) printGroupEl.textContent = `#GRP-${groupId}`;
    if (printPeriodEl) {
        printPeriodEl.textContent = onlySelectedMonth ? formatMonthLabel(selectedMonth) : "Toàn bộ thời gian đã lọc";
    }
    if (printDateEl) {
        printDateEl.textContent = formatDateTime(new Date().toISOString());
    }
}

function handlePrintStatement() {
    updatePrintMetadata();
    window.print();
}

function renderAll() {
    const filtered = getFilteredTransactions();
    renderKPIs(filtered);
    renderTransactionsTable(filtered);
    renderBarChart();
    renderCategoryChart(filtered);
    updatePrintMetadata();
}

function setChartViewMode(mode) {
    chartViewMode = mode;
    const btnMonths = document.getElementById("chartModeMonths");
    const btnDays = document.getElementById("chartModeDays");
    if (btnMonths && btnDays) {
        btnMonths.className =
            mode === "months"
                ? "px-3 py-1 rounded-lg font-mono text-xs font-bold bg-lime text-ink border border-ink"
                : "px-3 py-1 rounded-lg font-mono text-xs font-bold text-muted hover:text-ink";
        btnDays.className =
            mode === "days"
                ? "px-3 py-1 rounded-lg font-mono text-xs font-bold bg-lime text-ink border border-ink"
                : "px-3 py-1 rounded-lg font-mono text-xs font-bold text-muted hover:text-ink";
    }
    renderBarChart();
}

function resetFilters() {
    document.getElementById("filterSearch").value = "";
    document.getElementById("filterType").value = "ALL";
    document.getElementById("filterCategory").value = "ALL";
    document.getElementById("filterDateFrom").value = "";
    document.getElementById("filterDateTo").value = "";
    document.getElementById("filterOnlySelectedMonth").checked = true;
    renderAll();
    showToast("Đã đặt lại toàn bộ bộ lọc giao dịch.");
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") lucide.createIcons();

    ["filterSearch", "filterType", "filterCategory", "filterDateFrom", "filterDateTo", "filterOnlySelectedMonth", "statementMonthInput"].forEach(
        (id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const evt = el.tagName === "INPUT" && el.type === "text" ? "input" : "change";
            el.addEventListener(evt, renderAll);
        }
    );

    document.getElementById("btnReloadData")?.addEventListener("click", fetchTransactions);
    document.getElementById("btnResetFilters")?.addEventListener("click", resetFilters);
    document.getElementById("btnPrintStatementTop")?.addEventListener("click", handlePrintStatement);
    document.getElementById("btnPrintStatementHero")?.addEventListener("click", handlePrintStatement);
    document.getElementById("btnExportHistoryCsv")?.addEventListener("click", exportHistoryCsv);
    document.getElementById("btnExportStatementCsv")?.addEventListener("click", exportStatementCsv);
    document.getElementById("btnExportStatementCsvTop")?.addEventListener("click", exportStatementCsv);
    document.getElementById("chartModeMonths")?.addEventListener("click", () => setChartViewMode("months"));
    document.getElementById("chartModeDays")?.addEventListener("click", () => setChartViewMode("days"));

    fetchTransactions();
});