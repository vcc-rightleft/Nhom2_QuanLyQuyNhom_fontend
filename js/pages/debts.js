const MOCK_DEBTS = [
    {
        id: 'DBT-901',
        groupId: 'GRP-101',
        groupCode: '#DALAT26',
        groupName: 'Chuyến Đi Đà Lạt Quý 4',
        title: 'Lẩu Bò Ba Toa (Chia đều 6 người)',
        date: '2026-11-03',
        type: 'owe',
        status: 'unpaid',
        amount: 320000,
        counterpartyName: 'Phan Đức Anh',
        bankCode: 'VCB',
        bankName: 'Vietcombank',
        accountNumber: '1029384756',
        accountName: 'PHAN DUC ANH'
    },
    {
        id: 'DBT-902',
        groupId: 'GRP-101',
        groupCode: '#DALAT26',
        groupName: 'Chuyến Đi Đà Lạt Quý 4',
        title: 'Thuê xe máy 2 ngày tại Đà Lạt',
        date: '2026-11-04',
        type: 'owe',
        status: 'pending',
        amount: 180000,
        counterpartyName: 'Phan Đức Anh',
        bankCode: 'VCB',
        bankName: 'Vietcombank',
        accountNumber: '1029384756',
        accountName: 'PHAN DUC ANH'
    },
    {
        id: 'DBT-905',
        groupId: 'GRP-102',
        groupCode: '#BADMINTON',
        groupName: 'Hội Cầu Lông Thứ 5',
        title: 'Tiền sân & cầu tháng 11',
        date: '2026-11-10',
        type: 'owed',
        status: 'unpaid',
        amount: 150000,
        counterpartyName: 'Lê Quang Minh',
        bankCode: 'MB',
        bankName: 'MB Bank',
        accountNumber: '0987654321',
        accountName: 'LE QUANG MINH'
    },
    {
        id: 'DBT-906',
        groupId: 'GRP-102',
        groupCode: '#BADMINTON',
        groupName: 'Hội Cầu Lông Thứ 5',
        title: 'Nước uống sau trận',
        date: '2026-11-12',
        type: 'owe',
        status: 'paid',
        amount: 45000,
        counterpartyName: 'Nguyễn Phương Thảo',
        bankCode: 'TCB',
        bankName: 'Techcombank',
        accountNumber: '190345678901',
        accountName: 'NGUYEN PHUONG THAO'
    }
];

let debtsState = [...MOCK_DEBTS];

const formatVND = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} ₫`;

function showToast(message, tone = 'lime') {
    const container = document.getElementById('cleanToastContainer');
    if (!container) return;
    const bgClass = tone === 'coral' ? 'bg-coral text-white' : 'bg-lime text-ink';
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto card-subtle px-4 py-3 text-xs font-bold ${bgClass}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function populateGroupFilter() {
    const select = document.getElementById('filter-group');
    const groups = new Map();
    debtsState.forEach((d) => groups.set(d.groupId, `${d.groupName} (${d.groupCode})`));
    select.innerHTML = '<option value="all">Tất cả nhóm</option>';
    groups.forEach((label, id) => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = label;
        select.appendChild(opt);
    });
}

function renderSummary() {
    const oweUnpaid = debtsState.filter((d) => d.type === 'owe' && d.status !== 'paid');
    const owedUnpaid = debtsState.filter((d) => d.type === 'owed' && d.status !== 'paid');

    const totalOwe = oweUnpaid.reduce((sum, d) => sum + d.amount, 0);
    const totalOwed = owedUnpaid.reduce((sum, d) => sum + d.amount, 0);
    const net = totalOwed - totalOwe;

    document.getElementById('total-i-owe').textContent = formatVND(totalOwe);
    document.getElementById('count-i-owe').textContent = `${oweUnpaid.length} khoản chưa hoàn tất`;

    document.getElementById('total-owed-to-me').textContent = formatVND(totalOwed);
    document.getElementById('count-owed-to-me').textContent = `${owedUnpaid.length} khoản đang chờ thu`;

    const netEl = document.getElementById('net-balance');
    netEl.textContent = `${net >= 0 ? '+' : ''}${formatVND(net)}`;
}

function getStatusBadge(debt) {
    if (debt.type === 'owed' && debt.status === 'unpaid') {
        return '<span class="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full border border-ink bg-cyan/40 text-ink">Đang chờ thu</span>';
    }
    if (debt.status === 'unpaid') {
        return '<span class="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full border border-ink bg-coral text-white">Chưa trả</span>';
    }
    if (debt.status === 'pending') {
        return '<span class="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full border border-ink bg-amber text-ink">Chờ duyệt</span>';
    }
    return '<span class="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full border border-ink bg-mint text-white">Đã thanh toán</span>';
}

function renderDebtGroups() {
    const groupFilter = document.getElementById('filter-group').value;
    const typeFilter = document.getElementById('filter-type').value;
    const statusFilter = document.getElementById('filter-status').value;
    const keyword = document.getElementById('filter-search').value.trim().toLowerCase();

    const filtered = debtsState.filter((d) => {
        if (groupFilter !== 'all' && d.groupId !== groupFilter) return false;
        if (typeFilter !== 'all' && d.type !== typeFilter) return false;
        if (statusFilter !== 'all' && d.status !== statusFilter) return false;
        if (keyword) {
            const hay = `${d.title} ${d.counterpartyName} ${d.groupName} ${d.id}`.toLowerCase();
            if (!hay.includes(keyword)) return false;
        }
        return true;
    });

    const container = document.getElementById('debt-groups-container');
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="card-clean p-8 bg-white text-center">
                <p class="font-display font-bold text-base text-ink">Không tìm thấy khoản công nợ nào phù hợp.</p>
                <p class="text-xs text-muted mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
        `;
        return;
    }

    const grouped = {};
    filtered.forEach((item) => {
        if (!grouped[item.groupId]) {
            grouped[item.groupId] = {
                groupName: item.groupName,
                groupCode: item.groupCode,
                items: []
            };
        }
        grouped[item.groupId].items.push(item);
    });

    container.innerHTML = Object.values(grouped).map((grp) => `
        <div class="card-clean overflow-hidden bg-white">
            <div class="os-window-bar">
                <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold bg-lime border border-ink px-2 py-0.5 rounded">${grp.groupCode}</span>
                    <span class="font-display font-bold text-sm sm:text-base text-ink">${grp.groupName}</span>
                </div>
                <span class="font-mono text-xs font-bold text-muted">${grp.items.length} khoản</span>
            </div>
            <div class="divide-y-2 divide-line">
                ${grp.items.map((d) => `
                    <div class="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-canvas/60 transition">
                        <div class="space-y-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="font-mono text-[11px] font-bold text-muted">${d.id}</span>
                                <h4 class="font-display font-bold text-sm sm:text-base text-ink">${d.title}</h4>
                            </div>
                            <div class="text-xs text-muted font-medium">
                                ${d.type === 'owe' ? 'Trả cho:' : 'Nhận từ:'}
                                <strong class="text-ink">${d.counterpartyName}</strong> • Ngày ${d.date}
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-3">
                            <div class="font-mono font-bold text-base ${d.type === 'owe' ? 'text-coral' : 'text-mint'}">
                                ${d.type === 'owe' ? '-' : '+'}${formatVND(d.amount)}
                            </div>
                            ${getStatusBadge(d)}
                            ${d.type === 'owe' && d.status === 'unpaid'
                                ? `<button type="button" onclick="openPayModal('${d.id}')" class="btn-cta-indigo px-3.5 py-2 rounded-xl font-display font-bold text-xs">Tôi đã trả</button>`
                                : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function openPayModal(debtId) {
    const debt = debtsState.find((d) => d.id === debtId);
    if (!debt) return;

    const note = `SQUADCASH ${debt.id}`;
    const qrUrl = `https://img.vietqr.io/image/${debt.bankCode}-${debt.accountNumber}-compact2.png?amount=${debt.amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(debt.accountName)}`;

    document.getElementById('modal-debt-id').value = debt.id;
    document.getElementById('modal-debt-title').textContent = debt.title;
    document.getElementById('modal-debt-amount').textContent = formatVND(debt.amount);
    document.getElementById('modal-receiver-name').textContent = debt.counterpartyName;
    document.getElementById('modal-bank-name').textContent = debt.bankName;
    document.getElementById('modal-account-number').textContent = debt.accountNumber;
    document.getElementById('modal-transfer-note').textContent = note;
    document.getElementById('modal-vietqr-img').src = qrUrl;

    document.getElementById('proof-image-input').value = '';
    const preview = document.getElementById('proof-preview');
    preview.src = '';
    preview.classList.add('hidden');
    document.getElementById('payment-note').value = '';

    document.getElementById('pay-modal').classList.add('active');
}

function closePayModal() {
    document.getElementById('pay-modal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    populateGroupFilter();
    renderSummary();
    renderDebtGroups();

    ['filter-group', 'filter-type', 'filter-status'].forEach((id) => {
        document.getElementById(id).addEventListener('change', renderDebtGroups);
    });
    document.getElementById('filter-search').addEventListener('input', renderDebtGroups);

    document.getElementById('close-modal-btn').addEventListener('click', closePayModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closePayModal);

    document.getElementById('btn-copy-stk').addEventListener('click', () => {
        const text = document.getElementById('modal-account-number').textContent;
        navigator.clipboard.writeText(text);
        showToast(`Đã copy STK: ${text}`);
    });

    document.getElementById('btn-copy-note').addEventListener('click', () => {
        const text = document.getElementById('modal-transfer-note').textContent;
        navigator.clipboard.writeText(text);
        showToast(`Đã copy nội dung: ${text}`);
    });

    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('proof-image-input');
    const preview = document.getElementById('proof-preview');

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.src = ev.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('payment-proof-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const debtId = document.getElementById('modal-debt-id').value;
        const target = debtsState.find((d) => d.id === debtId);
        if (target) {
            target.status = 'pending';
            renderSummary();
            renderDebtGroups();
            closePayModal();
            showToast(`Đã gửi minh chứng cho khoản ${debtId}, đang chờ chủ nhóm duyệt.`);
        }
    });
});