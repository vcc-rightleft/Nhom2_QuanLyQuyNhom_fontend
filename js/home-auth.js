window.userJoinedGroups = [
    { id: 'GRP-101', inviteCode: 'DALAT26', name: 'Chuyến Đi Đà Lạt Quý 4', host: 'Phan Đức Anh (@ducanh_host)', members: 6, status: 'Hoạt động', balance: 8500000 },
    { id: 'GRP-102', inviteCode: 'APT1204', name: 'Tiền Nhà & Điện Nước T11', host: 'Nguyễn Phương Thảo (@thao_nguyen)', members: 4, status: 'Hoạt động', balance: 4200000 },
    { id: 'GRP-103', inviteCode: 'BADMINTON', name: 'CLB Cầu Lông Thứ 6', host: 'Phan Đức Anh (@ducanh_host)', members: 8, status: 'Hoạt động', balance: 2100000 }
];

window.groupDebts = [
    { id: 'DBT-901', memberName: 'Lê Quang Minh', typeLabel: 'Đóng quỹ', desc: 'Đóng quỹ Đà Lạt đợt 2', date: '25/10/2026', total: 1000000, paid: 600000 },
    { id: 'DBT-902', memberName: 'Lê Quang Minh', typeLabel: 'Hóa đơn', desc: 'Hóa đơn लẩu Bò Ba Toa (#INV-202)', date: '01/11/2026', total: 250000, paid: 0 }
];

window.adminAccounts = [
    { id: 'USR-1001', name: 'Phan Đức Anh', contact: 'duc***@squad.cash', created: '10/01/2025', groups: 4, status: 'active' },
    { id: 'USR-1042', name: 'Lê Quang Minh', contact: 'min***@gmail.com', created: '14/02/2025', groups: 3, status: 'active' },
    { id: 'USR-1088', name: 'Đặng Tuấn Kiệt', contact: 'kie***@yahoo.com', created: '03/05/2025', groups: 2, status: 'locked' }
];

function renderUserWorkspace() {
    const grid = document.getElementById("userGroupsGrid");
    if (grid) {
        const accents = ["bg-lime", "bg-cyan", "bg-amber"];
        grid.innerHTML = userJoinedGroups.map((g, idx) => `
            <div class="card-clean overflow-hidden flex flex-col justify-between bg-white">
                <div class="${accents[idx % accents.length]} px-5 py-2.5 border-b-2 border-ink flex items-center justify-between">
                    <span class="font-mono text-xs font-bold text-ink">#${g.id} • Mã: #${g.inviteCode}</span>
                    <span class="font-mono text-[11px] font-bold bg-white border border-ink px-2 py-0.5 rounded-full">● ${g.status}</span>
                </div>
                <div class="p-6 space-y-3">
                    <h3 class="font-display font-bold text-lg text-ink">${g.name}</h3>
                    <p class="text-xs text-muted">Host: <strong class="text-ink">${g.host}</strong> (${g.members} thành viên)</p>
                    <div class="pt-3 border-t border-line flex items-center justify-between">
                        <span class="text-xs text-muted font-semibold">Số dư quỹ</span>
                        <span class="font-mono font-bold text-base text-indigo">${formatVND(g.balance)}</span>
                    </div>
                </div>
            </div>
        `).join("");
    }

    const debtBody = document.getElementById("userDebtsTableBody");
    if (debtBody) {
        debtBody.innerHTML = groupDebts.map(d => {
            const rem = d.total - d.paid;
            return `
                <tr>
                    <td class="py-3 px-4 font-mono text-xs font-bold">${d.id}</td>
                    <td class="py-3 px-4"><span class="font-mono text-xs bg-canvas px-2 py-0.5 rounded border border-ink">${d.typeLabel}</span></td>
                    <td class="py-3 px-4 font-semibold">${d.desc}</td>
                    <td class="py-3 px-4 text-right font-mono">${formatVND(d.total)}</td>
                    <td class="py-3 px-4 text-right font-mono text-emerald-700">${formatVND(d.paid)}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-rose-600">${formatVND(rem)}</td>
                </tr>
            `;
        }).join("");
    }
}

function renderHostWorkspace() {
    const previewEl = document.getElementById("hostEqualSplitPreview");
    if (!previewEl) return;
    const total = parseInt(document.getElementById("hostBillTotalInput")?.value) || 100000;
    const n = 3;
    const base = Math.floor(total / n / 1000) * 1000;
    const rem = total - base * n;
    previewEl.innerHTML = `
        <div class="p-3 rounded-xl bg-lime/30 border-2 border-ink flex justify-between font-mono text-xs font-bold">
            <span>Người trả trước (Phan Đức Anh - cộng phần dư):</span>
            <span>${formatVND(base + rem)}</span>
        </div>
        <div class="p-3 rounded-xl bg-canvas border border-ink flex justify-between font-mono text-xs">
            <span>Lê Quang Minh:</span>
            <span>${formatVND(base)}</span>
        </div>
        <div class="p-3 rounded-xl bg-canvas border border-ink flex justify-between font-mono text-xs">
            <span>Nguyễn Phương Thảo:</span>
            <span>${formatVND(base)}</span>
        </div>
    `;
}

function renderAdminWorkspace() {
    const tbody = document.getElementById("admAccountsTableBody");
    if (!tbody) return;
    tbody.innerHTML = adminAccounts.map(u => `
        <tr>
            <td class="py-3 px-4 font-mono text-xs font-bold">${u.id}</td>
            <td class="py-3 px-4 font-bold">${u.name}</td>
            <td class="py-3 px-4 font-mono text-xs text-muted">${u.contact}</td>
            <td class="py-3 px-4 font-mono text-xs">${u.created}</td>
            <td class="py-3 px-4 text-center">
                <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                    ${u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                </span>
            </td>
        </tr>
    `).join("");
}