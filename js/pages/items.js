const DEFAULT_ITEMS = [
    {
        id: 'BIL-201',
        date: '2026-11-03',
        title: 'Lẩu Bò Ba Toa',
        groupCode: '#DALAT26',
        payer: 'Phan Đức Anh',
        total: 1920000,
        splitCount: 6
    },
    {
        id: 'BIL-202',
        date: '2026-11-04',
        title: 'Thuê xe máy 2 ngày',
        groupCode: '#DALAT26',
        payer: 'Phan Đức Anh',
        total: 1080000,
        splitCount: 6
    },
    {
        id: 'BIL-203',
        date: '2026-11-10',
        title: 'Tiền sân & cầu tháng 11',
        groupCode: '#BADMINTON',
        payer: 'Lê Quang Minh',
        total: 600000,
        splitCount: 4
    }
];

function getStoredItems() {
    const saved = JSON.parse(localStorage.getItem('squad_cash_bills') || '[]');
    return [...saved, ...DEFAULT_ITEMS];
}

function renderItems() {
    const groupFilter = document.getElementById('items-filter-group').value;
    const keyword = document.getElementById('items-search').value.trim().toLowerCase();

    const list = getStoredItems().filter((item) => {
        if (groupFilter !== 'all' && item.groupCode !== groupFilter) return false;
        if (keyword) {
            const hay = `${item.id} ${item.title} ${item.payer} ${item.groupCode}`.toLowerCase();
            if (!hay.includes(keyword)) return false;
        }
        return true;
    });

    document.getElementById('items-count').textContent = `${list.length} khoản chi`;
    const tbody = document.getElementById('items-tbody');

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-muted font-medium">Không có khoản chi nào phù hợp.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map((item) => `
        <tr class="hover:bg-canvas/60 transition">
            <td class="p-4">
                <div class="font-mono font-bold text-xs text-ink">${item.id}</div>
                <div class="text-xs text-muted">${item.date}</div>
            </td>
            <td class="p-4 font-display font-bold text-ink">${item.title}</td>
            <td class="p-4">
                <span class="font-mono text-xs font-bold bg-lime border border-ink px-2 py-0.5 rounded">${item.groupCode}</span>
            </td>
            <td class="p-4 font-medium text-ink">${item.payer}</td>
            <td class="p-4 text-right font-mono font-bold text-coral">${Number(item.total).toLocaleString('vi-VN')} ₫</td>
            <td class="p-4 text-center font-mono text-xs font-bold">${item.splitCount} người</td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    renderItems();
    document.getElementById('items-filter-group').addEventListener('change', renderItems);
    document.getElementById('items-search').addEventListener('input', renderItems);
});