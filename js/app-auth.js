// =========================================================================
// 0. CẤU HÌNH TAILWIND & KHỞI TẠO ICONS
// =========================================================================
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    canvas: '#F6F5F0',
                    surface: '#FFFFFF',
                    ink: '#121212',
                    muted: '#52525B',
                    line: '#E4E4E7',
                    indigo: {
                        DEFAULT: '#7C3AED',
                        50: '#F5F3FF',
                        100: '#EDE9FE',
                        600: '#7C3AED',
                        700: '#6D28D9'
                    },
                    lime: {
                        DEFAULT: '#D4FF00',
                        soft: '#F4FFC2'
                    },
                    coral: '#FF5E36',
                    cyan: '#38BDF8',
                    amber: '#FACC15',
                    mint: '#10B981'
                },
                fontFamily: {
                    display: ['"Space Grotesk"', 'sans-serif'],
                    sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                    mono: ['"JetBrains Mono"', 'monospace'],
                },
                boxShadow: {
                    'clean': '3px 3px 0px #121212',
                    'bold': '4px 4px 0px #121212',
                    'bold-sm': '2px 2px 0px #121212',
                }
            }
        }
    };
}

if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// =========================================================================
// 1. SRS STATE & INTEGER VND DATA
// =========================================================================
window.groupMembers = [
    { id: 'USR-1001', name: 'Phan Đức Anh', handle: '@ducanh_host', role: 'Host', joined: '01/10/2026' },
    { id: 'USR-1042', name: 'Lê Quang Minh', handle: '@minh_le', role: 'User', joined: '02/10/2026' },
    { id: 'USR-1055', name: 'Nguyễn Phương Thảo', handle: '@thao_nguyen', role: 'User', joined: '02/10/2026' },
    { id: 'USR-1068', name: 'Trần Khánh Vy', handle: '@khanh_vy', role: 'User', joined: '05/10/2026' },
    { id: 'USR-1071', name: 'Nguyễn Bảo Việt', handle: '@bao_viet', role: 'User', joined: '06/10/2026' },
    { id: 'USR-1088', name: 'Đặng Tuấn Kiệt', handle: '@tuan_kiet', role: 'User', joined: '08/10/2026' }
];

window.userJoinedGroups = [
    { id: 'GRP-101', inviteCode: 'DALAT26', name: 'Chuyến Đi Đà Lạt Quý 4', host: 'Phan Đức Anh (@ducanh_host)', members: 6, status: 'Hoạt động', balance: 8500000 },
    { id: 'GRP-102', inviteCode: 'APT1204', name: 'Tiền Nhà & Điện Nước T11', host: 'Nguyễn Phương Thảo (@thao_nguyen)', members: 4, status: 'Hoạt động', balance: 4200000 },
    { id: 'GRP-103', inviteCode: 'BADMINTON', name: 'CLB Cầu Lông Thứ 6', host: 'Phan Đức Anh (@ducanh_host)', members: 8, status: 'Hoạt động', balance: 2100000 }
];

// Debts list shared between Host (FR-HOST-005/006) & User (FR-USER-002)
window.groupDebts = [
    { id: 'DBT-901', userId: 'USR-1042', memberName: 'Lê Quang Minh', type: 'fund', typeLabel: 'Đóng quỹ', desc: 'Đóng quỹ Đà Lạt đợt 2', date: '25/10/2026', total: 1000000, paid: 600000, disputed: false },
    { id: 'DBT-902', userId: 'USR-1042', memberName: 'Lê Quang Minh', type: 'invoice', typeLabel: 'Hóa đơn', desc: 'Hóa đơn BBQ Tối Thứ 7 (#INV-202)', date: '01/11/2026', total: 250000, paid: 0, disputed: false },
    { id: 'DBT-903', userId: 'USR-1042', memberName: 'Lê Quang Minh', type: 'adjust', typeLabel: 'Khoản điều chỉnh', desc: 'Hoàn tiền dư mua nước suối', date: '02/11/2026', total: 150000, paid: 150000, disputed: false },
    { id: 'DBT-904', userId: 'USR-1068', memberName: 'Trần Khánh Vy', type: 'invoice', typeLabel: 'Hóa đơn', desc: 'Hóa đơn Thuê Xe Limousine (#INV-201)', date: '28/10/2026', total: 550000, paid: 0, disputed: false },
    { id: 'DBT-905', userId: 'USR-1088', memberName: 'Đặng Tuấn Kiệt', type: 'invoice', typeLabel: 'Hóa đơn', desc: 'Hóa đơn Hải Sản Đêm (#INV-199)', date: '20/10/2026', total: 480000, paid: 0, disputed: true }
];

window.groupInvoices = [
    {
        id: 'INV-201',
        merchant: 'Thuê Xe Limousine Khứ Hồi',
        date: '28/10/2026',
        mode: 'equal',
        modeLabel: 'Chia đều (6 người)',
        total: 3300000,
        myShare: 550000,
        items: [{ name: 'Gói thuê xe 9 chỗ 3 ngày 2 đêm', qty: 1, price: 3300000, assigned: 'Tất cả 6 thành viên' }]
    },
    {
        id: 'INV-202',
        merchant: 'Tiệm Nướng BBQ Thông Reo',
        date: '01/11/2026',
        mode: 'itemized',
        modeLabel: 'Chia theo món',
        total: 1650000,
        myShare: 250000,
        items: [
            { name: 'Combo Sườn Nướng tảng', qty: 2, price: 600000, assigned: 'Minh, Đức Anh, Thảo, Vy' },
            { name: 'Lẩu Gà Lá É lớn', qty: 1, price: 450000, assigned: 'Cả nhóm 6 người' }
        ]
    }
];

window.fundTransactions = [
    { id: 'TX-501', type: 'in', desc: 'Thu quỹ đợt 1 (6 thành viên x 2,000,000₫)', method: 'Chuyển khoản', author: 'Phan Đức Anh (Host)', time: '20/10/2026 09:30', amount: 12000000 },
    { id: 'TX-502', type: 'out', desc: 'Đặt cọc Villa Đà Lạt 2 đêm (Mã HĐ: VL-882)', method: 'Chuyển khoản', author: 'Phan Đức Anh (Host)', time: '24/10/2026 14:15', amount: 3500000 }
];

window.currentGroupSingleCode = 'DALAT26';
window.currentSplitMode = 'equal';
window.itemizedRows = [
    { id: 1, name: 'Lẩu Bò Đặc Biệt', qty: 1, price: 600000, consumers: ['Phan Đức Anh', 'Lê Quang Minh', 'Nguyễn Phương Thảo'] },
    { id: 2, name: 'Bắp Bò Nhúng Thêm', qty: 2, price: 200000, consumers: ['Lê Quang Minh', 'Trần Khánh Vy'] },
    { id: 3, name: 'Thùng Bia Tiger Bạc', qty: 1, price: 420000, consumers: ['Phan Đức Anh', 'Nguyễn Bảo Việt', 'Đặng Tuấn Kiệt'] }
];

window.adminAccounts = [
    { id: 'USR-1001', name: 'Phan Đức Anh', contact: 'duc***@squad.cash / 090***881', created: '10/01/2025', groups: 4, status: 'active', isProtected: false },
    { id: 'USR-1042', name: 'Lê Quang Minh', contact: 'min***@gmail.com / 098***112', created: '14/02/2025', groups: 3, status: 'active', isProtected: false },
    { id: 'USR-1088', name: 'Đặng Tuấn Kiệt', contact: 'kie***@yahoo.com / 091***449', created: '03/05/2025', groups: 2, status: 'locked', lockReason: 'Nghi vấn spam mã mời liên tục', isProtected: false },
    { id: 'ADM-0001', name: 'System Root Admin', contact: 'sec***@squad.cash', created: '01/01/2024', groups: 0, status: 'active', isProtected: true }
];

window.adminServerGroups = [
    { id: 'GRP-101', name: 'Chuyến Đi Đà Lạt Quý 4', host: 'Phan Đức Anh', members: 6, invoices: 4, txs: 8, lastActive: '03/11/2026', status: 'active', hasDispute: false, unverifiedTx: false },
    { id: 'GRP-089', name: 'Quỹ Team Building Hè 2025', host: 'Nguyễn Phương Thảo', members: 11, invoices: 9, txs: 14, lastActive: '10/04/2025', status: 'inactive', hasDispute: false, unverifiedTx: false },
    { id: 'GRP-054', name: 'Nhóm Thuê Căn Hộ Quận 7', host: 'Đặng Tuấn Kiệt', members: 4, invoices: 12, txs: 19, lastActive: '19/08/2026', status: 'disputed', hasDispute: true, unverifiedTx: true }
];

function formatVND(amount) {
    return Math.round(amount).toLocaleString('en-US') + ' ₫';
}

// =========================================================================
// 2. TOP NAVIGATION & SRS BADGE TOGGLE
// =========================================================================
function switchRoleView(role) {
    ['landing', 'auth', 'user', 'host', 'admin'].forEach(r => {
        const viewEl = document.getElementById(`view-${r}`);
        if (viewEl) viewEl.classList.add('hidden');
        const btn = document.getElementById(`roleBtn-${r}`);
        if (btn) btn.className = "px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all text-muted hover:text-ink";
    });

    const targetView = document.getElementById(`view-${role}`);
    if (targetView) targetView.classList.remove('hidden');
    
    const activeBtn = document.getElementById(`roleBtn-${role}`);
    if (activeBtn) {
        activeBtn.className = "px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all bg-lime text-ink border-2 border-ink shadow-bold-sm";
    }

    if (role === 'user') {
        renderUserWorkspace();
    } else if (role === 'host') {
        renderHostWorkspace();
    } else if (role === 'admin') {
        renderAdminWorkspace();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleFrBadges(show) {
    if (show) {
        document.body.classList.remove('hide-fr-badges');
    } else {
        document.body.classList.add('hide-fr-badges');
    }
}

// =========================================================================
// 3. AUTH & INVITE CODE LOGIC
// =========================================================================
function switchAuthTab(tab) {
    ['login', 'register', 'invite'].forEach(t => {
        document.getElementById(`authForm-${t}`)?.classList.add('hidden');
        const tabBtn = document.getElementById(`authTab-${t}`);
        if (tabBtn) tabBtn.className = "py-2.5 px-3 rounded-lg font-display font-bold text-xs sm:text-sm text-muted hover:text-ink flex items-center justify-center gap-1.5";
    });
    document.getElementById(`authForm-${tab}`)?.classList.remove('hidden');
    const activeTabBtn = document.getElementById(`authTab-${tab}`);
    if (activeTabBtn) activeTabBtn.className = "py-2.5 px-3 rounded-lg font-display font-bold text-xs sm:text-sm bg-white text-ink border border-ink shadow-clean flex items-center justify-center gap-1.5";
}

function setAuthFrame(mode) {
    const wrapper = document.getElementById('authWrapper');
    const left = document.getElementById('authLeftCol');
    const right = document.getElementById('authRightCol');
    const btnD = document.getElementById('authVpDesktop');
    const btnM = document.getElementById('authVpMobile');

    if (mode === 'mobile') {
        wrapper.classList.add('auth-mobile-frame');
        wrapper.classList.remove('lg:grid-cols-12');
        left.classList.remove('lg:col-span-5', 'lg:border-r-[1.5px]');
        right.classList.remove('lg:col-span-7');
        btnM.className = "px-3 py-1 rounded-lg font-mono text-xs font-bold bg-ink text-white";
        btnD.className = "px-3 py-1 rounded-lg font-mono text-xs font-bold text-muted hover:text-ink";
    } else {
        wrapper.classList.remove('auth-mobile-frame');
        wrapper.classList.add('lg:grid-cols-12');
        left.classList.add('lg:col-span-5', 'lg:border-r-[1.5px]');
        right.classList.add('lg:col-span-7');
        btnD.className = "px-3 py-1 rounded-lg font-mono text-xs font-bold bg-ink text-white";
        btnM.className = "px-3 py-1 rounded-lg font-mono text-xs font-bold text-muted hover:text-ink";
    }
}

function fillDemoLogin(role) {
    const emailInput = document.getElementById('loginEmailInput');
    document.getElementById('selectedLoginRole').value = role;
    if (role === 'user') emailInput.value = 'minh.le@squad.cash (Vai trò User)';
    if (role === 'host') emailInput.value = 'ducanh.host@squad.cash (Vai trò Host)';
    if (role === 'admin') emailInput.value = 'root.admin@squad.cash (Vai trò Admin)';
    notify(`Đã chọn tài khoản mẫu cho vai trò ${role.toUpperCase()}.`);
}

function _mockHandleAuthSubmit(e) {
    e.preventDefault();
    const role = document.getElementById('selectedLoginRole').value || 'host';
    runCurtainRoleTransition(role, `⚡ ĐANG MỞ KHÔNG GIAN VAI TRÒ ${role.toUpperCase()}...`, `Đăng nhập thành công! Đã mở không gian vai trò ${role.toUpperCase()}.`);
}

function _mockHandleRegisterSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('regDisplayNameInput');
    const newName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Thành Viên Mới';
    openWesternOnboarding(newName);
}

function testInviteCode(code) {
    document.getElementById('inviteCodeField').value = code;
    verifyInviteCode();
}

function verifyInviteCode() {
    const code = document.getElementById('inviteCodeField').value.trim().toUpperCase().replace('#', '');
    const box = document.getElementById('inviteVerifyResult');
    const foundGroup = userJoinedGroups.find(g => g.inviteCode === code) || (code === currentGroupSingleCode ? userJoinedGroups[0] : null);

    if (!foundGroup || code === 'WRONG99') {
        box.className = "card-subtle p-5 space-y-3 bg-rose-50";
        box.innerHTML = `
            <div class="font-mono text-xs font-bold text-white bg-coral border border-ink px-2.5 py-1 rounded-md inline-block">
                ✕ MÃ NHÓM KHÔNG TỒN TẠI (#${code})
            </div>
            <p class="text-xs text-rose-700 font-medium">Lý do từ chối: Mã mời không đúng hoặc Host đã đổi mã mới cho nhóm này.</p>
        `;
    } else {
        box.className = "card-subtle p-5 space-y-3 bg-lime/25";
        box.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-ink bg-lime border border-ink px-2.5 py-1 rounded-md">
                    ✓ MÃ NHÓM HỢP LỆ (#${foundGroup.inviteCode})
                </span>
                <span class="font-mono text-xs font-bold text-indigo">Mã cố định của nhóm</span>
            </div>
            <div>
                <h4 class="font-display font-bold text-base text-ink">Nhóm: ${foundGroup.name} (#${foundGroup.id})</h4>
                <p class="text-xs text-muted mt-0.5">Host quản lý: <strong>${foundGroup.host}</strong> • Hiện có ${foundGroup.members} thành viên</p>
            </div>
            <button type="button" onclick="confirmJoinGroupByCode()" class="btn-cta-lime w-full py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider">
                Xác nhận tham gia nhóm (Vai trò User) →
            </button>
        `;
    }
}

function confirmJoinGroupByCode() {
    runCurtainRoleTransition('user', '🔑 XÁC THỰC MÃ #DALAT26 • ĐANG VÀO NHÓM...', 'Đã kiểm tra không trùng membership và mở không gian nhóm #GRP-101!');
}

// =========================================================================
// 4. USER WORKSPACE LOGIC (FR-USER-001 TO 004)
// =========================================================================
function renderUserWorkspace() {
    const accents = ['bg-lime', 'bg-cyan', 'bg-amber'];
    const grid = document.getElementById('userGroupsGrid');
    if (grid) {
        grid.innerHTML = userJoinedGroups.map((g, idx) => `
            <div class="card-clean overflow-hidden flex flex-col justify-between">
                <div class="${accents[idx % accents.length]} px-5 py-2.5 border-b-2 border-ink flex items-center justify-between">
                    <span class="font-mono text-xs font-bold text-ink">#${g.id} • Mã mời: #${g.inviteCode}</span>
                    <span class="font-mono text-[11px] font-bold bg-white border border-ink px-2 py-0.5 rounded-full">● ${g.status}</span>
                </div>
                <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                        <h3 class="font-display font-bold text-lg text-ink">${g.name}</h3>
                        <p class="text-xs text-muted mt-1">Host: <strong class="text-ink">${g.host}</strong></p>
                        <p class="text-xs text-muted">Số thành viên: ${g.members} người</p>
                    </div>
                    <div class="pt-4 border-t border-line flex items-center justify-between">
                        <div>
                            <span class="text-[11px] text-muted block font-semibold">Số dư quỹ chung</span>
                            <span class="font-mono font-bold text-base text-indigo">${formatVND(g.balance)}</span>
                        </div>
                        <button onclick="selectUserGroup('${g.id}', '${g.name}')" class="btn-cta-lime px-3.5 py-2 rounded-xl font-display font-bold text-xs">
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderUserDebts();
    renderUserInvoices('all');
    renderUserLedger();
}

function selectUserGroup(id, name) {
    document.getElementById('userSelectedGroupName').textContent = `${name} (#${id})`;
    notify(`Đang hiển thị dữ liệu cá nhân của bạn trong nhóm ${name}.`);
}

function switchUserSubTab(sub) {
    ['debts', 'invoices', 'ledger'].forEach(s => {
        document.getElementById(`uSubContent-${s}`)?.classList.add('hidden');
        const btn = document.getElementById(`uSubBtn-${s}`);
        if (btn) btn.className = "px-4 py-2 rounded-lg font-display font-bold text-xs text-muted hover:text-ink flex items-center gap-1.5";
    });
    document.getElementById(`uSubContent-${sub}`)?.classList.remove('hidden');
    const activeBtn = document.getElementById(`uSubBtn-${sub}`);
    if (activeBtn) activeBtn.className = "px-4 py-2 rounded-lg font-display font-bold text-xs bg-white text-ink border border-ink shadow-clean flex items-center gap-1.5";
}

function renderUserDebts() {
    const myDebts = groupDebts.filter(d => d.userId === 'USR-1042');
    let totalRemaining = 0;

    const tbody = document.getElementById('userDebtsTableBody');
    if (tbody) {
        tbody.innerHTML = myDebts.map(d => {
            const rem = Math.max(0, d.total - d.paid);
            totalRemaining += rem;
            let badge = '';
            if (rem === 0) {
                badge = `<span class="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">Đã trả đủ</span>`;
            } else if (d.paid > 0) {
                badge = `<span class="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">Trả một phần</span>`;
            } else {
                badge = `<span class="font-mono text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">Chưa trả</span>`;
            }

            return `
                <tr>
                    <td class="py-3.5 px-4 font-mono text-xs font-bold">${d.id}</td>
                    <td class="py-3.5 px-4"><span class="font-mono text-xs bg-canvas px-2 py-0.5 rounded border border-ink/15">${d.typeLabel}</span></td>
                    <td class="py-3.5 px-4">
                        <div class="font-semibold text-ink">${d.desc}</div>
                        <div class="text-xs text-muted font-mono">${d.date}</div>
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono">${formatVND(d.total)}</td>
                    <td class="py-3.5 px-4 text-right font-mono text-emerald-700">${formatVND(d.paid)}</td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold ${rem > 0 ? 'text-rose-600' : 'text-muted'}">${formatVND(rem)}</td>
                    <td class="py-3.5 px-4 text-center">
                        <div class="inline-flex items-center gap-2">
                            ${badge}
                            ${rem > 0 ? `<button type="button" onclick="openVietQrModal('${d.id}', ${rem}, '${d.desc}')" class="btn-outline px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold hover:bg-lime" title="Mở mã VietQR tự động điền số tiền">QR Trả</button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    const kpiEl = document.getElementById('userTotalDebtKpi');
    if (kpiEl) kpiEl.textContent = formatVND(totalRemaining);
}

function renderUserInvoices(modeFilter) {
    const container = document.getElementById('userInvoicesList');
    if (!container) return;
    const list = modeFilter === 'all' ? groupInvoices : groupInvoices.filter(i => i.mode === modeFilter);

    container.innerHTML = list.map(inv => `
        <div class="card-subtle p-5 flex flex-col justify-between space-y-4 hover:border-ink transition-all">
            <div class="flex items-start justify-between gap-2">
                <div>
                    <span class="font-mono text-xs font-bold text-indigo">#${inv.id} • ${inv.date}</span>
                    <h4 class="font-display font-bold text-base text-ink mt-0.5">${inv.merchant}</h4>
                </div>
                <span class="font-mono text-[11px] bg-white border border-ink/20 px-2.5 py-1 rounded-md">${inv.modeLabel}</span>
            </div>
            <div class="pt-3 border-t border-line flex items-center justify-between">
                <div>
                    <span class="text-xs text-muted block">Tổng hóa đơn: ${formatVND(inv.total)}</span>
                    <span class="text-xs font-bold text-ink">Phần của bạn: <strong class="font-mono text-indigo">${formatVND(inv.myShare)}</strong></span>
                </div>
                <button onclick="openUserInvoiceModal('${inv.id}')" class="btn-outline px-3 py-1.5 rounded-lg font-display font-bold text-xs">
                    Xem chi tiết món
                </button>
            </div>
        </div>
    `).join('');
}

function openUserInvoiceModal(invId) {
    const inv = groupInvoices.find(i => i.id === invId);
    if (!inv) return;
    document.getElementById('uInvModalTitle').textContent = `Chi tiết Hóa đơn #${inv.id}`;
    document.getElementById('uInvModalBody').innerHTML = `
        <div class="card-subtle p-4 space-y-1 text-xs">
            <div class="flex justify-between"><span class="text-muted">Đơn vị / Quán:</span><strong class="text-ink">${inv.merchant}</strong></div>
            <div class="flex justify-between"><span class="text-muted">Ngày phát sinh:</span><span class="font-mono">${inv.date}</span></div>
            <div class="flex justify-between"><span class="text-muted">Hình thức chia:</span><span class="font-semibold">${inv.modeLabel}</span></div>
            <div class="flex justify-between pt-2 border-t border-line text-sm"><span class="font-bold">Phần tiền của bạn:</span><strong class="font-mono text-indigo">${formatVND(inv.myShare)}</strong></div>
        </div>
        <div class="space-y-2">
            <div class="text-xs font-bold uppercase text-muted">Danh sách món &amp; người tham gia</div>
            ${inv.items.map(it => `
                <div class="p-3 rounded-xl border border-line flex justify-between items-center text-xs">
                    <div>
                        <div class="font-bold text-ink">${it.name} (SL: ${it.qty})</div>
                        <div class="text-muted">Người dùng: ${it.assigned}</div>
                    </div>
                    <span class="font-mono font-bold">${formatVND(it.price)}</span>
                </div>
            `).join('')}
        </div>
    `;
    openModal('modalUserInvoiceDetail');
}

function renderUserLedger() {
    let sumIn = 0, sumOut = 0;
    const tbody = document.getElementById('userLedgerTableBody');
    if (tbody) {
        tbody.innerHTML = fundTransactions.map(tx => {
            if (tx.type === 'in') sumIn += tx.amount;
            else sumOut += tx.amount;
            return `
                <tr>
                    <td class="py-3.5 px-4 font-mono text-xs font-bold">${tx.id}</td>
                    <td class="py-3.5 px-4">
                        <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded ${tx.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                            ${tx.type === 'in' ? 'THU QUỸ' : 'CHI QUỸ'}
                        </span>
                    </td>
                    <td class="py-3.5 px-4 font-medium text-ink">${tx.desc}</td>
                    <td class="py-3.5 px-4 text-xs text-muted">${tx.method}</td>
                    <td class="py-3.5 px-4 text-xs text-muted font-mono">${tx.author} • ${tx.time}</td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold ${tx.type === 'in' ? 'text-emerald-700' : 'text-rose-600'}">
                        ${tx.type === 'in' ? '+' : '-'}${formatVND(tx.amount)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    const bal = sumIn - sumOut;
    const inEl = document.getElementById('userLedgerIn');
    const outEl = document.getElementById('userLedgerOut');
    const balEl = document.getElementById('userLedgerBalance');
    if (inEl) inEl.textContent = '+' + formatVND(sumIn);
    if (outEl) outEl.textContent = '-' + formatVND(sumOut);
    if (balEl) balEl.textContent = formatVND(bal);
}

// =========================================================================
// 5. HOST WORKSPACE LOGIC (FR-HOST-001 TO 006)
// =========================================================================
function renderHostWorkspace() {
    renderSingleInviteCodeCard();
    renderHostMembersTable();
    initEqualSplitCheckboxes();
    renderItemizedRows();
    recalculateHostInvoicePreview();
    renderHostFundLedger();
    renderHostDebtsTable();
}

function switchHostTab(tab) {
    ['members', 'invoice', 'fund', 'debts'].forEach(t => {
        document.getElementById(`hTabContent-${t}`)?.classList.add('hidden');
        const btn = document.getElementById(`hTabBtn-${t}`);
        if (btn) btn.className = "px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm text-ink hover:bg-lime/40 flex items-center gap-2";
    });
    document.getElementById(`hTabContent-${tab}`)?.classList.remove('hidden');
    const activeBtn = document.getElementById(`hTabBtn-${tab}`);
    if (activeBtn) activeBtn.className = "px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm bg-indigo text-white border-2 border-ink shadow-bold-sm flex items-center gap-2";
}

function submitHostCreateGroup(e) {
    e.preventDefault();
    const name = document.getElementById('newGroupNameInput').value.trim();
    if (!name) return;
    const newId = 'GRP-' + Math.floor(110 + Math.random() * 800);
    const autoCode = 'SQ' + Math.floor(1000 + Math.random() * 8999);
    userJoinedGroups.unshift({
        id: newId,
        inviteCode: autoCode,
        name: name,
        host: 'Phan Đức Anh (@ducanh_host)',
        members: 1,
        status: 'Hoạt động',
        balance: 0
    });
    currentGroupSingleCode = autoCode;
    renderSingleInviteCodeCard();
    closeModal('modalHostCreateGroup');
    notify(`Đã tạo nhóm "${name}" (#${newId}) với Mã mời duy nhất #${autoCode}!`);
}

function renderSingleInviteCodeCard() {
    const codeEl = document.getElementById('hostSingleGroupCode');
    if (codeEl) codeEl.textContent = '#' + currentGroupSingleCode;
}

function copySingleGroupCode() {
    navigator.clipboard?.writeText(currentGroupSingleCode);
    notify(`Đã sao chép mã nhóm #${currentGroupSingleCode} vào bộ nhớ tạm!`);
}

function copySingleGroupLink() {
    const link = `https://squad.cash/join/${currentGroupSingleCode}`;
    navigator.clipboard?.writeText(link);
    notify(`Đã sao chép link mời nhóm: ${link}`);
}

function regenerateSingleGroupCode() {
    const newCode = 'DL' + Math.floor(1000 + Math.random() * 8999);
    currentGroupSingleCode = newCode;
    userJoinedGroups[0].inviteCode = newCode;
    renderSingleInviteCodeCard();
    notify(`Đã đổi mã mời duy nhất của nhóm sang #${newCode} (Mã cũ đã bị vô hiệu).`);
}

function renderHostMembersTable() {
    const tbody = document.getElementById('hostMembersTableBody');
    const countTitle = document.getElementById('hostMemberCountTitle');
    if (countTitle) countTitle.textContent = `Danh sách Thành viên trong nhóm (${groupMembers.length})`;

    if (tbody) {
        tbody.innerHTML = groupMembers.map(m => `
            <tr>
                <td class="py-3 px-4">
                    <div class="font-bold text-ink flex items-center gap-1.5">
                        <span>${m.name}</span>
                        ${m.role === 'Host' ? '<span title="Chủ nhóm hiện tại">👑</span>' : ''}
                    </div>
                    <div class="font-mono text-xs text-muted">${m.handle} (${m.id})</div>
                </td>
                <td class="py-3 px-4">
                    <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded ${m.role === 'Host' ? 'bg-lime border border-ink shadow-bold-sm' : 'bg-canvas border border-line'}">
                        ${m.role === 'Host' ? '👑 Host (Chủ nhóm)' : 'User (Thành viên)'}
                    </span>
                </td>
                <td class="py-3 px-4 font-mono text-xs text-muted">${m.joined}</td>
                <td class="py-3 px-4 font-mono text-xs font-bold text-emerald-700">● Đã xác thực</td>
                <td class="py-3 px-4 text-right">
                    ${m.role === 'Host'
                        ? `<span class="font-mono text-[11px] font-bold text-indigo bg-indigo-50 border border-indigo px-2.5 py-1 rounded-lg">Đang nắm quyền</span>`
                        : `<button type="button" onclick="openTransferHostModal('${m.id}')" class="btn-outline px-3 py-1.5 rounded-lg font-mono text-xs font-bold hover:bg-amber">
                            👑 Chuyển Host
                           </button>`
                    }
                </td>
            </tr>
        `).join('');
    }
}

function handleDirectInviteMember(e) {
    e.preventDefault();
    const val = document.getElementById('directMemberEmail').value.trim();
    if (groupMembers.some(m => m.handle.includes(val) || m.name.toLowerCase() === val.toLowerCase())) {
        notify('Từ chối: Thành viên này đã có trong nhóm (Chống trùng membership FR-HOST-002).');
        return;
    }
    groupMembers.push({
        id: 'USR-' + Math.floor(1100 + Math.random() * 800),
        name: val,
        handle: '@member_' + groupMembers.length,
        role: 'User',
        joined: '03/11/2026'
    });
    document.getElementById('directMemberEmail').value = '';
    renderHostMembersTable();
    initEqualSplitCheckboxes();
    notify(`Đã gửi lời mời và thêm "${val}" vào danh sách thành viên nhóm.`);
}

function initEqualSplitCheckboxes() {
    const container = document.getElementById('equalMembersCheckboxes');
    if (!container) return;
    container.innerHTML = groupMembers.map(m => `
        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-line cursor-pointer text-xs font-semibold">
            <input type="checkbox" value="${m.name}" checked onchange="recalculateHostInvoicePreview()" class="equal-member-cb accent-indigo w-4 h-4">
            <span class="truncate">${m.name}</span>
        </label>
    `).join('');
}

function setInvoiceSplitMode(mode) {
    currentSplitMode = mode;
    const eqSec = document.getElementById('invoiceEqualSection');
    const itSec = document.getElementById('invoiceItemizedSection');
    const btnEq = document.getElementById('splitModeBtn-equal');
    const btnIt = document.getElementById('splitModeBtn-itemized');

    if (mode === 'equal') {
        eqSec.classList.remove('hidden');
        itSec.classList.add('hidden');
        btnEq.className = "p-3.5 rounded-xl border-[1.5px] border-ink bg-lime/40 font-display font-bold text-sm text-left flex items-center justify-between text-ink";
        btnIt.className = "p-3.5 rounded-xl border-[1.5px] border-line bg-white font-display font-bold text-sm text-left flex items-center justify-between text-muted";
    } else {
        eqSec.classList.add('hidden');
        itSec.classList.remove('hidden');
        btnIt.className = "p-3.5 rounded-xl border-[1.5px] border-ink bg-lime/40 font-display font-bold text-sm text-left flex items-center justify-between text-ink";
        btnEq.className = "p-3.5 rounded-xl border-[1.5px] border-line bg-white font-display font-bold text-sm text-left flex items-center justify-between text-muted";
    }
    recalculateHostInvoicePreview();
}

function renderItemizedRows() {
    const container = document.getElementById('invoiceItemsContainer');
    if (!container) return;
    container.innerHTML = itemizedRows.map((row, idx) => `
        <div class="p-3.5 bg-white rounded-xl border border-line space-y-2">
            <div class="grid grid-cols-12 gap-2 items-center">
                <input type="text" value="${row.name}" oninput="updateItemRow(${idx}, 'name', this.value)" class="col-span-6 input-clean px-3 py-1.5 text-xs font-bold" placeholder="Tên món">
                <input type="number" value="${row.qty}" min="1" oninput="updateItemRow(${idx}, 'qty', this.value)" class="col-span-2 input-clean px-2 py-1.5 text-xs font-mono text-center" title="Số lượng">
                <input type="number" value="${row.price}" step="1000" oninput="updateItemRow(${idx}, 'price', this.value)" class="col-span-4 input-clean px-2.5 py-1.5 text-xs font-mono font-bold" title="Đơn giá">
            </div>
            <div class="text-[11px] text-muted flex flex-wrap items-center gap-1.5">
                <span class="font-bold text-ink">Người dùng món:</span>
                ${groupMembers.slice(0, 4).map(m => {
                    const active = row.consumers.includes(m.name);
                    return `<button type="button" onclick="toggleItemConsumer(${idx}, '${m.name}')" class="px-2 py-0.5 rounded border font-mono ${active ? 'bg-indigo text-white border-indigo' : 'bg-canvas text-muted border-line'}">${m.name.split(' ').pop()}</button>`;
                }).join('')}
            </div>
        </div>
    `).join('');
}

function updateItemRow(idx, field, val) {
    if (field === 'name') itemizedRows[idx].name = val;
    if (field === 'qty') itemizedRows[idx].qty = Math.max(1, parseInt(val) || 1);
    if (field === 'price') itemizedRows[idx].price = Math.max(0, parseInt(val) || 0);
    recalculateHostInvoicePreview();
}

function toggleItemConsumer(idx, memberName) {
    const arr = itemizedRows[idx].consumers;
    const pos = arr.indexOf(memberName);
    if (pos >= 0 && arr.length > 1) {
        arr.splice(pos, 1);
    } else if (pos === -1) {
        arr.push(memberName);
    }
    renderItemizedRows();
    recalculateHostInvoicePreview();
}

function addInvoiceItemRow() {
    itemizedRows.push({
        id: Date.now(),
        name: 'Món gọi thêm #' + (itemizedRows.length + 1),
        qty: 1,
        price: 150000,
        consumers: [groupMembers[0].name, groupMembers[1].name]
    });
    renderItemizedRows();
    recalculateHostInvoicePreview();
}

window.latestAllocationMap = {};

function recalculateHostInvoicePreview() {
    const fee = Math.max(0, parseInt(document.getElementById('invFeeTip')?.value) || 0);
    const discount = Math.max(0, parseInt(document.getElementById('invDiscount')?.value) || 0);
    let subtotal = 0;
    latestAllocationMap = {};

    if (currentSplitMode === 'equal') {
        subtotal = Math.max(0, parseInt(document.getElementById('invEqualBaseAmount')?.value) || 0);
        const checked = Array.from(document.querySelectorAll('.equal-member-cb:checked')).map(cb => cb.value);
        const grand = Math.max(0, subtotal + fee - discount);
        if (checked.length > 0) {
            const baseShare = Math.floor(grand / checked.length);
            let remainder = grand - (baseShare * checked.length);
            checked.forEach((name, idx) => {
                latestAllocationMap[name] = baseShare + (idx === 0 ? remainder : 0);
            });
        }
    } else {
        itemizedRows.forEach(r => {
            const lineTotal = r.qty * r.price;
            subtotal += lineTotal;
            const count = r.consumers.length || 1;
            const per = Math.round(lineTotal / count);
            r.consumers.forEach(c => {
                latestAllocationMap[c] = (latestAllocationMap[c] || 0) + per;
            });
        });
        const people = Object.keys(latestAllocationMap);
        const netAdj = fee - discount;
        if (people.length > 0) {
            const adjPerPerson = Math.round(netAdj / people.length);
            people.forEach(p => {
                latestAllocationMap[p] = Math.max(0, latestAllocationMap[p] + adjPerPerson);
            });
        }
    }

    const grandTotal = Math.max(0, subtotal + fee - discount);
    if (document.getElementById('previewSubtotal')) {
        document.getElementById('previewSubtotal').textContent = formatVND(subtotal);
        document.getElementById('previewFee').textContent = '+' + formatVND(fee);
        document.getElementById('previewDiscount').textContent = '-' + formatVND(discount);
        document.getElementById('previewGrandTotal').textContent = formatVND(grandTotal);
    }

    const listEl = document.getElementById('invoiceAllocationPreviewList');
    if (!listEl) return;
    const entries = Object.entries(latestAllocationMap);
    if (entries.length === 0) {
        listEl.innerHTML = `<div class="p-4 text-xs text-rose-600 font-semibold">Vui lòng chọn ít nhất 1 thành viên tham gia hóa đơn (FR-HOST-003).</div>`;
        return;
    }

    listEl.innerHTML = entries.map(([name, amount]) => `
        <div class="p-3 rounded-xl border border-line bg-canvas flex items-center justify-between">
            <span class="font-semibold text-xs text-ink">${name}</span>
            <span class="font-mono font-bold text-sm text-indigo">${formatVND(amount)}</span>
        </div>
    `).join('');
}

function saveHostInvoice() {
    const entries = Object.entries(latestAllocationMap);
    if (entries.length === 0) {
        notify('Không thể lưu: Hóa đơn phải có ít nhất 1 thành viên tham gia!');
        return;
    }
    const merchant = document.getElementById('invMerchantName').value.trim() || 'Hóa đơn nhóm';
    const date = document.getElementById('invDate').value;
    const newInvId = 'INV-' + Math.floor(210 + Math.random() * 700);

    entries.forEach(([name, amount], idx) => {
        groupDebts.unshift({
            id: 'DBT-' + Math.floor(910 + Math.random() * 800 + idx),
            userId: name === 'Lê Quang Minh' ? 'USR-1042' : 'USR-10xx',
            memberName: name,
            type: 'invoice',
            typeLabel: 'Hóa đơn',
            desc: `${merchant} (#${newInvId})`,
            date: date,
            total: amount,
            paid: 0,
            disputed: false
        });
    });

    notify(`Đã lưu hóa đơn #${newInvId} và tạo ${entries.length} khoản phải trả tại mục Công nợ!`);
    switchHostTab('debts');
    renderHostDebtsTable();
}

function renderHostFundLedger() {
    let sumIn = 0, sumOut = 0;
    const tbody = document.getElementById('hostFundLedgerBody');
    if (tbody) {
        tbody.innerHTML = fundTransactions.map(tx => {
            if (tx.type === 'in') sumIn += tx.amount;
            else sumOut += tx.amount;
            return `
                <tr>
                    <td class="py-3 px-4 font-mono text-xs font-bold">${tx.id}</td>
                    <td class="py-3 px-4">
                        <span class="font-mono text-xs font-bold px-2 py-0.5 rounded ${tx.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                            ${tx.type === 'in' ? '+ THU' : '- CHI'}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="font-semibold text-ink">${tx.desc}</div>
                        <div class="text-xs text-muted">${tx.method}</div>
                    </td>
                    <td class="py-3 px-4 font-mono text-xs text-muted">${tx.time}<br/>${tx.author}</td>
                    <td class="py-3 px-4 text-right font-mono font-bold ${tx.type === 'in' ? 'text-emerald-700' : 'text-rose-600'}">
                        ${tx.type === 'in' ? '+' : '-'}${formatVND(tx.amount)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    const currentBal = sumIn - sumOut;
    const balEl = document.getElementById('hostFundBalanceDisplay');
    if (balEl) balEl.textContent = formatVND(currentBal);
    userJoinedGroups[0].balance = currentBal;
}

function handleRecordFundTx(e) {
    e.preventDefault();
    const type = document.querySelector('input[name="txType"]:checked').value;
    const amount = parseInt(document.getElementById('fundTxAmount').value) || 0;
    const method = document.getElementById('fundTxMethod').value;
    const desc = document.getElementById('fundTxDesc').value.trim();

    const currentBal = userJoinedGroups[0].balance;
    if (type === 'out' && amount > currentBal) {
        notify('Cảnh báo FR-HOST-004: Khoản chi vượt quá số dư quỹ hiện tại! Giao dịch vẫn được ghi nhận kèm cảnh báo âm quỹ.');
    }

    fundTransactions.unshift({
        id: 'TX-' + Math.floor(510 + Math.random() * 400),
        type: type,
        desc: desc,
        method: method,
        author: 'Phan Đức Anh (Host)',
        time: '03/11/2026 23:46',
        amount: amount
    });

    document.getElementById('fundTxDesc').value = '';
    renderHostFundLedger();
    notify(`Đã ghi nhận giao dịch ${type === 'in' ? 'THU' : 'CHI'} ${formatVND(amount)} vào Sổ quỹ.`);
}

function renderHostDebtsTable() {
    const filterEl = document.getElementById('hostDebtFilter');
    if (!filterEl) return;
    const filter = filterEl.value;
    const tbody = document.getElementById('hostDebtsTableBody');

    const filtered = groupDebts.filter(d => {
        const rem = d.total - d.paid;
        if (filter === 'fund') return d.type === 'fund' && rem > 0;
        if (filter === 'invoice') return d.type === 'invoice' && rem > 0;
        if (filter === 'disputed') return d.disputed === true;
        if (filter === 'paid') return rem <= 0;
        return true;
    });

    if (tbody) {
        tbody.innerHTML = filtered.map(d => {
            const rem = Math.max(0, d.total - d.paid);
            let statusHtml = '';
            if (d.disputed) {
                statusHtml = `<span class="font-mono text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">⚠ Đang tranh chấp</span>`;
            } else if (rem === 0) {
                statusHtml = `<span class="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">✓ Đã trả đủ</span>`;
            } else if (d.paid > 0) {
                statusHtml = `<span class="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">Trả một phần</span>`;
            } else {
                statusHtml = `<span class="font-mono text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">Chưa trả</span>`;
            }

            return `
                <tr>
                    <td class="py-3.5 px-4 font-mono text-xs font-bold">${d.id}</td>
                    <td class="py-3.5 px-4 font-bold text-ink">${d.memberName}</td>
                    <td class="py-3.5 px-4">
                        <span class="font-mono text-[11px] bg-canvas px-2 py-0.5 rounded border border-ink/15 mr-1">${d.typeLabel}</span>
                        <span class="font-medium">${d.desc}</span>
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono">${formatVND(d.total)}</td>
                    <td class="py-3.5 px-4 text-right font-mono text-emerald-700">${formatVND(d.paid)}</td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold ${rem > 0 ? 'text-rose-600' : 'text-muted'}">${formatVND(rem)}</td>
                    <td class="py-3.5 px-4 text-center">${statusHtml}</td>
                    <td class="py-3.5 px-4 text-right">
                        ${rem > 0 
                            ? `<div class="inline-flex items-center gap-1.5">
                                <button onclick="sendHostDebtReminder('${d.id}')" class="${d.reminded ? 'bg-amber text-ink border-2 border-ink shadow-bold-sm' : 'btn-outline'} px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold" title="Bắn thông báo nhắc nợ to đùng sang màn hình của thành viên này">
                                    ${d.reminded ? '🔔 Đã nhắc (' + (d.remindCount || 1) + ')' : '🔔 Nhắc nợ'}
                                </button>
                                <button onclick="openConfirmPaymentModal('${d.id}')" class="btn-cta-lime px-3 py-1.5 rounded-lg font-mono text-xs font-bold">Xác nhận trả</button>
                               </div>`
                            : `<span class="font-mono text-xs text-muted">Đã đối soát</span>`
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }
}

function openConfirmPaymentModal(debtId) {
    const d = groupDebts.find(item => item.id === debtId);
    if (!d) return;
    const rem = Math.max(0, d.total - d.paid);
    document.getElementById('payDebtId').value = d.id;
    document.getElementById('payMemberName').textContent = d.memberName;
    document.getElementById('payDebtTitle').textContent = d.desc;
    document.getElementById('payRemainingText').textContent = formatVND(rem);
    document.getElementById('payReceivedAmount').value = rem;
    openModal('modalConfirmPayment');
}

function submitConfirmPayment(e) {
    e.preventDefault();
    const debtId = document.getElementById('payDebtId').value;
    const received = parseInt(document.getElementById('payReceivedAmount').value) || 0;
    const d = groupDebts.find(item => item.id === debtId);
    if (!d) return;

    const rem = d.total - d.paid;
    if (received > rem) {
        notify(`Cảnh báo FR-HOST-005: Số tiền nhập (${formatVND(received)}) lớn hơn số còn nợ (${formatVND(rem)}). Hệ thống chỉ gạch đúng số nợ và yêu cầu ghi có/hoàn trả phần dư!`);
        d.paid = d.total;
    } else {
        d.paid += received;
        d.disputed = false;
        const afterRem = d.total - d.paid;
        notify(afterRem === 0 
            ? `Đã đối soát & xác nhận ${d.memberName} thanh toán ĐỦ (${formatVND(received)}).`
            : `Đã ghi nhận ${d.memberName} THANH TOÁN MỘT PHẦN (${formatVND(received)}). Còn nợ: ${formatVND(afterRem)}.`
        );
    }

    closeModal('modalConfirmPayment');
    renderHostDebtsTable();
}

// =========================================================================
// 6. ADMIN WORKSPACE LOGIC (FR-ADM-001 TO 007)
// =========================================================================
function renderAdminWorkspace() {
    renderAdminAccountsTable();
    renderAdminGroupsTable();
}

function switchAdminTab(tab) {
    ['accounts', 'groups', 'retention'].forEach(t => {
        document.getElementById(`aTabContent-${t}`)?.classList.add('hidden');
        const btn = document.getElementById(`aTabBtn-${t}`);
        if (btn) {
            btn.classList.remove('bg-ink', 'text-white');
            btn.classList.add('text-muted');
        }
    });
    document.getElementById(`aTabContent-${tab}`)?.classList.remove('hidden');
    const activeBtn = document.getElementById(`aTabBtn-${tab}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-muted');
        activeBtn.classList.add('bg-ink', 'text-white');
    }
}

function renderAdminAccountsTable() {
    const q = (document.getElementById('admUserSearch')?.value || '').toLowerCase();
    const status = document.getElementById('admUserStatusFilter')?.value || 'all';
    const tbody = document.getElementById('admAccountsTableBody');
    if (!tbody) return;

    const list = adminAccounts.filter(u => {
        const matchQ = u.id.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.contact.toLowerCase().includes(q);
        const matchS = status === 'all' ? true : u.status === status;
        return matchQ && matchS;
    });

    tbody.innerHTML = list.map(u => `
        <tr>
            <td class="py-3.5 px-4 font-mono text-xs font-bold">${u.id}</td>
            <td class="py-3.5 px-4 font-bold text-ink">${u.name}</td>
            <td class="py-3.5 px-4 font-mono text-xs text-muted">${u.contact}</td>
            <td class="py-3.5 px-4 font-mono text-xs text-muted">${u.created}</td>
            <td class="py-3.5 px-4 text-center font-mono text-xs font-bold">${u.groups}</td>
            <td class="py-3.5 px-4 text-center">
                ${u.status === 'active'
                    ? `<span class="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">Hoạt động</span>`
                    : `<span class="font-mono text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full" title="${u.lockReason || ''}">Bị khóa</span>`
                }
            </td>
            <td class="py-3.5 px-4 text-right">
                ${u.isProtected
                    ? `<span class="font-mono text-xs text-muted">Tài khoản Bảo vệ</span>`
                    : (u.status === 'active'
                        ? `<button onclick="openAdminLockModal('${u.id}', '${u.name}')" class="btn-outline px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-rose-600">Khóa TK (FR-ADM-002)</button>`
                        : `<button onclick="unlockAdminAccount('${u.id}')" class="btn-cta-lime px-3 py-1.5 rounded-lg font-mono text-xs font-bold">Mở khóa (FR-ADM-003)</button>`
                      )
                }
            </td>
        </tr>
    `).join('');
}

function openAdminLockModal(id, name) {
    document.getElementById('lockTargetUserId').value = id;
    document.getElementById('lockTargetUserName').textContent = `${name} (${id})`;
    openModal('modalAdminLockUser');
}

function submitAdminLockUser(e) {
    e.preventDefault();
    const id = document.getElementById('lockTargetUserId').value;
    const reason = document.getElementById('lockReasonInput').value;
    const acc = adminAccounts.find(a => a.id === id);
    if (acc) {
        acc.status = 'locked';
        acc.lockReason = reason;
    }
    closeModal('modalAdminLockUser');
    renderAdminAccountsTable();
    notify(`Đã khóa tài khoản ${id}, thu hồi phiên đăng nhập và ghi Audit Log!`);
}

function unlockAdminAccount(id) {
    const acc = adminAccounts.find(a => a.id === id);
    if (acc) {
        acc.status = 'active';
        renderAdminAccountsTable();
        notify(`Đã mở khóa tài khoản ${id} (FR-ADM-003) và ghi nhận nhật ký quản trị.`);
    }
}

function renderAdminGroupsTable() {
    const filter = document.getElementById('admGroupFilter')?.value || 'all';
    const tbody = document.getElementById('admGroupsTableBody');
    if (!tbody) return;

    const list = adminServerGroups.filter(g => filter === 'all' ? true : g.status === filter);
    tbody.innerHTML = list.map(g => {
        let badge = '';
        if (g.status === 'active') badge = `<span class="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">Hoạt động</span>`;
        else if (g.status === 'inactive') badge = `<span class="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">Ít hoạt động</span>`;
        else if (g.status === 'disputed') badge = `<span class="font-mono text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">Đang tranh chấp</span>`;
        else badge = `<span class="font-mono text-xs font-bold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">Chờ xóa (Xóa mềm)</span>`;

        return `
            <tr>
                <td class="py-3.5 px-4 font-mono text-xs font-bold">${g.id}</td>
                <td class="py-3.5 px-4">
                    <div class="font-bold text-ink">${g.name}</div>
                    <div class="text-xs text-muted">Host: ${g.host} • ${g.invoices} hóa đơn • ${g.txs} GD</div>
                </td>
                <td class="py-3.5 px-4 text-center font-mono text-xs font-bold">${g.members}</td>
                <td class="py-3.5 px-4 font-mono text-xs text-muted">${g.lastActive}</td>
                <td class="py-3.5 px-4 text-center">${badge}</td>
                <td class="py-3.5 px-4 text-right">
                    ${g.status === 'soft_deleted'
                        ? `<button onclick="restoreSoftDeletedGroup('${g.id}')" class="btn-outline px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-indigo">Khôi phục</button>`
                        : `<button onclick="attemptManualDeleteGroup('${g.id}')" class="btn-outline px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-rose-600">Xóa nhóm</button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function attemptManualDeleteGroup(groupId) {
    const g = adminServerGroups.find(item => item.id === groupId);
    if (!g) return;

    if (g.hasDispute || g.unverifiedTx) {
        notify(`Chặn xóa FR-ADM-006: Nhóm #${g.id} đang có khoản nợ tranh chấp hoặc giao dịch chưa đối soát! Cần giải quyết trước khi xóa.`);
        return;
    }

    document.getElementById('delGroupId').value = g.id;
    document.getElementById('delGroupCodeHint').textContent = g.id;
    document.getElementById('delGroupConfirmCode').value = g.id;
    document.getElementById('delGroupSummaryBox').innerHTML = `
        <div class="font-bold text-ink">Nhóm mục tiêu: ${g.name} (#${g.id})</div>
        <div>Host: ${g.host} • Thành viên: ${g.members} người</div>
        <div>Dữ liệu liên quan: <strong>${g.invoices} hóa đơn</strong> và <strong>${g.txs} giao dịch quỹ</strong>.</div>
        <div class="text-amber-800 font-semibold pt-1">Hệ thống sẽ chuyển nhóm sang trạng thái Xóa mềm (Lưu giữ tạm thời trước khi xóa vĩnh viễn).</div>
    `;
    openModal('modalAdminDeleteGroup');
}

function submitAdminDeleteGroup(e) {
    e.preventDefault();
    const id = document.getElementById('delGroupId').value;
    const confirmCode = document.getElementById('delGroupConfirmCode').value.trim().toUpperCase();
    if (confirmCode !== id) {
        notify('Mã xác nhận nhóm chưa khớp!');
        return;
    }
    const g = adminServerGroups.find(item => item.id === id);
    if (g) g.status = 'soft_deleted';
    closeModal('modalAdminDeleteGroup');
    renderAdminGroupsTable();
    notify(`Đã chuyển nhóm #${id} sang trạng thái Xóa mềm và lưu Audit Log (FR-ADM-006).`);
}

function restoreSoftDeletedGroup(id) {
    const g = adminServerGroups.find(item => item.id === id);
    if (g) g.status = 'inactive';
    renderAdminGroupsTable();
    notify(`Đã khôi phục nhóm #${id} trong thời gian lưu giữ cho phép.`);
}

function runFiveYearRetentionScan() {
    notify('Tác vụ FR-ADM-007 hoàn tất: Đã gửi cảnh báo 1 nhóm quá hạn 5 năm, tự động bỏ qua 1 nhóm đang có tranh chấp.');
}

// =========================================================================
// 7. MODAL, TOAST & MICRO-INTERACTIONS ENGINE
// =========================================================================
window.FASTAPI_URL = 'http://127.0.0.1:8000';
window.interactiveFxEnabled = true;
window.audioCtx = null;

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    const card = modal.querySelector('.card-clean');
    if (card) {
        card.classList.remove('modal-pop');
        void card.offsetWidth;
        card.classList.add('modal-pop');
    }
}

function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
}

function playUiSound(type = 'click') {
    if (!interactiveFxEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now);
            osc.frequency.setValueAtTime(880, now + 0.07);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.23);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.setValueAtTime(130, now + 0.08);
            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.21);
        }
    } catch (e) {}
}

function notify(message) {
    const container = document.getElementById('cleanToastContainer');
    if (!container) return;
    const item = document.createElement('div');
    const isWarn = message.includes('Từ chối') || message.includes('Chặn') || message.includes('Cảnh báo') || message.includes('chưa khớp');
    playUiSound(isWarn ? 'error' : 'success');

    item.className = "pointer-events-auto card-clean overflow-hidden bg-ink text-white shadow-bold modal-pop";
    item.innerHTML = `
        <div class="p-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full shrink-0 ${isWarn ? 'bg-coral' : 'bg-lime'}"></span>
                <span class="text-xs font-medium leading-relaxed">${message}</span>
            </div>
            <button onclick="this.closest('.card-clean').remove()" class="font-mono text-[10px] bg-lime text-ink font-bold px-2.5 py-1 rounded border border-ink shrink-0">ĐÓNG</button>
        </div>
        <div class="toast-progress ${isWarn ? '!bg-coral' : ''}"></div>
    `;
    container.appendChild(item);
    setTimeout(() => { if (item.parentElement) item.remove(); }, 4200);
}

function launchConfettiBurst() {
    if (!interactiveFxEnabled || typeof confetti !== 'function') return;
    confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#D4FF00', '#7C3AED', '#FF5E36', '#38BDF8', '#121212']
    });
}

function toggleSoundFx() {
    interactiveFxEnabled = !interactiveFxEnabled;
    const lbl = document.getElementById('soundToggleLabel');
    if (lbl) lbl.textContent = interactiveFxEnabled ? 'FX: BẬT' : 'FX: TẮT';
    if (interactiveFxEnabled) {
        playUiSound('success');
        launchConfettiBurst();
        notify('Đã bật hiệu ứng âm thanh Tactile & Pháo hoa tương tác!');
    } else {
        notify('Đã tạm tắt hiệu ứng âm thanh & pháo hoa.');
    }
}

async function pingFastApiBackend(silent = false) {
    const dot = document.getElementById('apiPulseDot');
    const lbl = document.getElementById('apiStatusLabel');
    try {
        const res = await fetch(`${FASTAPI_URL}/api/health`, { method: 'GET' });
        if (res.ok) {
            if (dot) dot.classList.remove('offline');
            if (lbl) lbl.textContent = 'FastAPI: ONLINE';
            if (!silent) notify('Kết nối trực tiếp tới FastAPI (http://127.0.0.1:8000) thành công!');
            return true;
        }
    } catch (err) {
        if (dot) dot.classList.add('offline');
        if (lbl) lbl.textContent = 'Chế độ SRS Local';
        if (!silent) notify('Đang chạy dữ liệu tương tác SRS trực tiếp trên trình duyệt.');
    }
    return false;
}

// =========================================================================
// 8. SMART UX HELPERS (VIETQR, CHIPS, CTRL+K, URGENT REMINDER & HOST TRANSFER)
// =========================================================================
function quickAddAmount(inputId, delta, triggerInvoiceCalc = false) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.value = (parseInt(el.value) || 0) + delta;
    if (triggerInvoiceCalc) recalculateHostInvoicePreview();
}

function quickSetAmount(inputId, val, triggerInvoiceCalc = false) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.value = val;
    if (triggerInvoiceCalc) recalculateHostInvoicePreview();
}

window.currentQrMemo = '';
function openVietQrModal(debtId, amount, desc) {
    currentQrMemo = `SQUADCASH ${debtId}`;
    document.getElementById('qrAmountDisplay').textContent = formatVND(amount);
    document.getElementById('qrMemoDisplay').textContent = `Nội dung: ${currentQrMemo}`;
    const qrImg = document.getElementById('vietQrImage');
    if (qrImg) {
        qrImg.src = `https://img.vietqr.io/image/VCB-1029384756-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(currentQrMemo)}&accountName=PHAN%20DUC%20ANH`;
    }
    openModal('modalVietQrPay');
}

function copyQrTransferInfo() {
    navigator.clipboard?.writeText(currentQrMemo);
    notify(`Đã sao chép nội dung chuyển khoản "${currentQrMemo}"!`);
}

// Command Palette (Ctrl + K)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openModal('modalCmdPalette');
        setTimeout(() => document.getElementById('cmdSearchInput')?.focus(), 60);
    } else if (e.key === 'Escape') {
        closeModal('modalCmdPalette');
        closeModal('modalVietQrPay');
    }
});

function filterCmdPalette(q) {
    const term = q.trim().toLowerCase();
    document.querySelectorAll('#cmdPaletteList .cmd-item').forEach(btn => {
        btn.style.display = btn.textContent.toLowerCase().includes(term) ? 'flex' : 'none';
    });
}

function runCmdAction(role, subTab) {
    closeModal('modalCmdPalette');
    switchRoleView(role);
    if (role === 'host') switchHostTab(subTab);
    if (role === 'user') switchUserSubTab(subTab);
    if (role === 'admin') switchAdminTab(subTab);
}

// Urgent Reminder & Host Ownership Transfer
groupDebts[0].reminded = true;
groupDebts[0].remindCount = 1;
groupDebts[0].remindedAt = 'Vừa xong';
window.hasUnreadUrgentReminder = true;

function sendHostDebtReminder(debtId) {
    const d = groupDebts.find(item => item.id === debtId);
    if (!d) return;
    const rem = Math.max(0, d.total - d.paid);
    d.reminded = true;
    d.remindCount = (d.remindCount || 0) + 1;
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    d.remindedAt = `Hôm nay lúc ${nowStr}`;
    hasUnreadUrgentReminder = true;

    renderHostDebtsTable();
    notify(`🔔 Đã bắn lệnh NHẮC NỢ KHẨN cho ${d.memberName} (${formatVND(rem)})!`);
}

function openUrgentReminderModal() {
    const remindedList = groupDebts.filter(d => (d.userId === 'USR-1042' || d.reminded) && (d.total - d.paid) > 0 && d.reminded);
    if (remindedList.length === 0) return;

    let totalRem = 0;
    const listEl = document.getElementById('urgentReminderItemsList');
    if (listEl) {
        listEl.innerHTML = remindedList.map(d => {
            const rem = Math.max(0, d.total - d.paid);
            totalRem += rem;
            return `
                <div class="p-3.5 rounded-xl bg-rose-50 border-2 border-ink flex items-center justify-between gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono text-[11px] font-bold bg-coral text-white px-2 py-0.5 rounded border border-ink">${d.id}</span>
                            <span class="font-bold text-sm text-ink">${d.desc}</span>
                        </div>
                        <div class="text-xs text-muted mt-0.5">Thành viên: <strong class="text-ink">${d.memberName}</strong></div>
                    </div>
                    <div class="text-right shrink-0">
                        <div class="font-mono font-bold text-base text-rose-600">${formatVND(rem)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    document.getElementById('urgentReminderTotalAmount').textContent = formatVND(totalRem);
    document.getElementById('modalUrgentDebtReminder')?.classList.remove('hidden');
}

function acknowledgeUrgentReminder() {
    hasUnreadUrgentReminder = false;
    closeModal('modalUrgentDebtReminder');
}

function payFromUrgentModal() {
    const remindedList = groupDebts.filter(d => (d.userId === 'USR-1042' || d.reminded) && (d.total - d.paid) > 0 && d.reminded);
    hasUnreadUrgentReminder = false;
    closeModal('modalUrgentDebtReminder');
    if (remindedList.length > 0) {
        const first = remindedList[0];
        openVietQrModal(first.id, Math.max(0, first.total - first.paid), first.desc);
    }
}

function openTransferHostModal(targetMemberId) {
    const currentHost = groupMembers.find(m => m.role === 'Host') || groupMembers[0];
    const targetMember = groupMembers.find(m => m.id === targetMemberId);
    if (!targetMember) return;

    document.getElementById('transferTargetMemberId').value = targetMember.id;
    document.getElementById('transferCurrentHostName').textContent = `${currentHost.name} (${currentHost.handle})`;
    document.getElementById('transferNewHostName').textContent = `${targetMember.name} (${targetMember.handle})`;
    openModal('modalTransferHost');
}

function submitTransferHostRole(e) {
    e.preventDefault();
    const targetId = document.getElementById('transferTargetMemberId').value;
    const prevHost = groupMembers.find(m => m.role === 'Host') || groupMembers[0];
    const newHost = groupMembers.find(m => m.id === targetId);
    if (!newHost) return;

    groupMembers.forEach(m => { m.role = (m.id === targetId) ? 'Host' : 'User'; });
    groupMembers.sort((a, b) => (a.role === 'Host' ? -1 : b.role === 'Host' ? 1 : 0));
    userJoinedGroups[0].host = `${newHost.name} (${newHost.handle})`;

    closeModal('modalTransferHost');
    renderHostMembersTable();
    launchConfettiBurst();
    notify(`👑 Đã chuyển quyền Host sang cho ${newHost.name} thành công!`);
}

// =========================================================================
// 9. KHỞI CHẠY KHI TẢI TRANG
// =========================================================================
window.addEventListener('DOMContentLoaded', () => {
    pingFastApiBackend(true);
});