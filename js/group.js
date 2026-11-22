const FASTAPI_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = `${FASTAPI_URL}/api`;

let CURRENT_USER_ID = null;
let CURRENT_USER = null;
let interactiveFxEnabled = true;
let audioCtx = null;
let loadedGroups = [];
let selectedGroupId = null;
let currentGroupBills = [];

function getAuthToken() {
    return (
        localStorage.getItem('squad_cash_token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('squadcash_token') ||
        localStorage.getItem('token') ||
        ''
    );
}

function getAuthHeaders() {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

function clearSessionAndRedirect() {
    [
        'squad_cash_token',
        'squad_cash_user',
        'access_token',
        'squadcash_token',
        'token',
        'current_user',
        'squadcash_user',
        'user'
    ].forEach((key) => {
        localStorage.removeItem(key);
    });
    window.location.replace('./auth.html');
}

async function fetchAuthEndpoint(path, options = {}) {
    let res = await fetch(`${API_BASE_URL}${path}`, options);
    if (res.status === 404) {
        res = await fetch(`${FASTAPI_URL}${path}`, options);
    }
    return res;
}

async function loadCurrentUser() {
    const token = getAuthToken();
    if (!token) {
        clearSessionAndRedirect();
        return false;
    }

    try {
        const res = await fetchAuthEndpoint('/auth/me', {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (res.status === 401 || res.status === 403) {
            clearSessionAndRedirect();
            return false;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const user = await res.json();
        CURRENT_USER = user;
        CURRENT_USER_ID = Number(user.id);

        const badgeEl = document.getElementById('currentUserBadge');
        if (badgeEl) {
            badgeEl.textContent = `${user.full_name || user.name || 'User'} (#${CURRENT_USER_ID})`;
        }

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function logoutAccount() {
    const token = getAuthToken();
    if (token) {
        try {
            await fetchAuthEndpoint('/auth/logout', {
                method: 'POST',
                headers: getAuthHeaders()
            });
        } catch (err) {}
    }
    clearSessionAndRedirect();
}

function formatVND(amount) {
    return Math.round(Number(amount) || 0).toLocaleString('en-US') + ' ₫';
}

function formatDateDisplay(rawDate) {
    if (!rawDate) return '--';
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) return String(rawDate);
    return d.toLocaleDateString('vi-VN');
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

function toggleFrBadges(show) {
    document.body.classList.toggle('hide-fr-badges', !show);
}

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
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
}

function notify(message, forceWarn = false) {
    const container = document.getElementById('cleanToastContainer');
    if (!container) return;
    const isWarn = forceWarn || message.includes('Từ chối') || message.includes('Lỗi') || message.includes('Không thể');
    playUiSound(isWarn ? 'error' : 'success');

    const item = document.createElement('div');
    item.className = 'pointer-events-auto card-clean overflow-hidden bg-ink text-white shadow-bold modal-pop';
    item.innerHTML = `
        <div class="p-4 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full shrink-0 ${isWarn ? 'bg-coral' : 'bg-lime'}"></span>
                <span class="text-xs font-medium leading-relaxed">${message}</span>
            </div>
            <button type="button" onclick="this.closest('.card-clean').remove()" class="font-mono text-[10px] bg-lime text-ink font-bold px-2.5 py-1 rounded border border-ink shrink-0">ĐÓNG</button>
        </div>
        <div class="toast-progress ${isWarn ? '!bg-coral' : ''}"></div>
    `;
    container.appendChild(item);
    setTimeout(() => {
        if (item.parentElement) item.remove();
    }, 4200);
}

function animateVndElement(el, targetAmount, prefix = '') {
    if (!el) return;
    const duration = 600;
    const startTime = performance.now();
    el.classList.remove('value-flash');
    void el.offsetWidth;
    el.classList.add('value-flash');

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * targetAmount);
        el.textContent = prefix + current.toLocaleString('en-US') + ' ₫';
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

async function pingFastApiBackend(silent = false) {
    const dot = document.getElementById('apiPulseDot');
    const lbl = document.getElementById('apiStatusLabel');
    try {
        const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
        if (res.ok) {
            if (dot) dot.classList.remove('offline');
            if (lbl) lbl.textContent = 'FastAPI: ONLINE';
            if (!silent) {
                notify('Kết nối trực tiếp tới FastAPI (http://127.0.0.1:8000) thành công!');
                await renderUserWorkspace();
            }
            return true;
        }
    } catch (err) {
        if (dot) dot.classList.add('offline');
        if (lbl) lbl.textContent = 'API: OFFLINE';
        if (!silent) {
            notify('Không kết nối được tới FastAPI cổng 8000.', true);
        }
    }
    return false;
}

function goToHostPage(groupId) {
    const targetId = groupId || selectedGroupId || (loadedGroups[0] ? (loadedGroups[0].group_id || loadedGroups[0].id) : '');
    const url = targetId ? `./formbill.html?group_id=${encodeURIComponent(targetId)}` : './formbill.html';
    window.location.href = url;
}

async function fetchMyGroupsAPI() {
    try {
        const res = await fetch(`${API_BASE_URL}/groups/my-groups`, { headers: getAuthHeaders() });
        if (res.status === 401 || res.status === 403) {
            clearSessionAndRedirect();
            return [];
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        document.getElementById('apiPulseDot')?.classList.remove('offline');
        const lbl = document.getElementById('apiStatusLabel');
        if (lbl) lbl.textContent = 'FastAPI: ONLINE';
        return await res.json();
    } catch (err) {
        console.error(err);
        document.getElementById('apiPulseDot')?.classList.add('offline');
        const lbl = document.getElementById('apiStatusLabel');
        if (lbl) lbl.textContent = 'API: OFFLINE';
        return [];
    }
}

async function fetchGroupDetailAPI(groupId) {
    try {
        const res = await fetch(`${API_BASE_URL}/groups/${groupId}`, { headers: getAuthHeaders() });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}

async function fetchGroupBillsAPI(groupId) {
    try {
        const res = await fetch(`${API_BASE_URL}/bills/groups/${groupId}?page=1&page_size=50`, { headers: getAuthHeaders() });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data.items || []);
    } catch (err) {
        return [];
    }
}

async function fetchBillDetailAPI(billId) {
    try {
        const res = await fetch(`${API_BASE_URL}/bills/${billId}`, { headers: getAuthHeaders() });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}

function getSplitTypeLabel(splitType) {
    const type = String(splitType || '').toUpperCase();
    if (type === 'EQUAL') return 'Chia đều (Equal)';
    if (type === 'ITEMIZED') return 'Chia theo món (Itemized)';
    if (type === 'CUSTOM') return 'Tự chọn (Custom)';
    return type || 'Khác';
}

async function renderUserWorkspace() {
    const groups = await fetchMyGroupsAPI();
    loadedGroups = Array.isArray(groups) ? groups : [];
    const grid = document.getElementById('userGroupsGrid');

    const totalBal = loadedGroups.reduce((acc, g) => acc + (Number(g.fund_balance) || 0), 0);
    animateVndElement(document.getElementById('userTotalBalanceKpi'), totalBal);

    if (loadedGroups.length === 0) {
        grid.innerHTML = `
            <div class="md:col-span-3 card-clean p-10 text-center space-y-3 bg-white">
                <p class="text-sm font-semibold text-muted">Bạn chưa tham gia nhóm quỹ nào trong MySQL.</p>
                <div class="flex justify-center gap-3">
                    <button type="button" onclick="openModal('modalJoinGroup')" class="btn-outline px-4 py-2 rounded-xl font-display font-bold text-xs">Nhập mã mời</button>
                    <button type="button" onclick="openModal('modalCreateGroup')" class="btn-cta-lime px-4 py-2 rounded-xl font-display font-bold text-xs">+ Tạo nhóm mới</button>
                </div>
            </div>
        `;
        return;
    }

    const accents = ['bg-lime', 'bg-cyan', 'bg-amber'];
    grid.innerHTML = loadedGroups.map((g, idx) => {
        const gid = g.group_id || g.id;
        const gname = g.group_name || g.name || `Nhóm #${gid}`;
        const code = g.invite_code ? `#${String(g.invite_code).replace('#', '')}` : `Vai trò: ${g.role || 'MEMBER'}`;
        const safeName = gname.replace(/'/g, "\\'");
        return `
            <div class="card-clean overflow-hidden flex flex-col justify-between stagger-card-in" style="animation-delay: ${Math.min(idx * 65, 320)}ms;">
                <div class="${accents[idx % accents.length]} px-5 py-2.5 border-b-2 border-ink flex items-center justify-between">
                    <span class="font-mono text-xs font-bold text-ink">#GRP-${gid} • ${code}</span>
                    <span class="font-mono text-[11px] font-bold bg-white border border-ink px-2 py-0.5 rounded-full">● Hoạt động</span>
                </div>
                <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                        <h3 class="font-display font-bold text-lg text-ink">${gname}</h3>
                        <p class="text-xs text-muted mt-1">Vai trò của bạn: <strong class="text-ink">${g.role || 'MEMBER'}</strong></p>
                        <p class="text-xs text-muted">Số thành viên: ${g.member_count || 1} người</p>
                    </div>
                    <div class="pt-4 border-t border-line flex items-center justify-between gap-2">
                        <div>
                            <span class="text-[11px] text-muted block font-semibold">Số dư quỹ chung</span>
                            <span class="font-mono font-bold text-base text-indigo">${formatVND(g.fund_balance)}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="goToHostPage(${gid})" class="btn-outline px-3 py-2 rounded-xl font-display font-bold text-xs" title="Mở quản trị Host">
                                👑 Host
                            </button>
                            <button type="button" onclick="selectUserGroup(${gid}, '${safeName}')" class="btn-cta-lime px-3.5 py-2 rounded-xl font-display font-bold text-xs">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    attachInteractive3DTilt(grid);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function selectUserGroup(groupId, fallbackName) {
    selectedGroupId = Number(groupId);
    const detailSection = document.getElementById('userGroupDetailSection');
    detailSection.classList.remove('hidden');

    const [detail, bills] = await Promise.all([
        fetchGroupDetailAPI(selectedGroupId),
        fetchGroupBillsAPI(selectedGroupId)
    ]);

    currentGroupBills = Array.isArray(bills) ? bills : [];

    const name = (detail && (detail.group_name || detail.name)) || fallbackName || `Nhóm #${selectedGroupId}`;
    const balance = Number((detail && detail.fund_balance) ?? (loadedGroups.find(g => Number(g.group_id || g.id) === selectedGroupId)?.fund_balance) ?? 0);

    document.getElementById('userSelectedGroupName').textContent = `${name} (#GRP-${selectedGroupId})`;
    document.getElementById('userLedgerBalance').textContent = formatVND(balance);

    const filterEl = document.getElementById('userInvoiceModeFilter');
    if (filterEl) filterEl.value = 'ALL';

    renderUserInvoices('ALL');
    await renderUserDebtsFromBills();

    detailSection.scrollIntoView({ behavior: 'smooth' });
    notify(`Đang hiển thị dữ liệu cá nhân của bạn trong nhóm ${name}.`);
}

function switchUserSubTab(sub) {
    ['debts', 'invoices', 'ledger'].forEach((s) => {
        document.getElementById(`uSubContent-${s}`).classList.add('hidden');
        document.getElementById(`uSubBtn-${s}`).className = 'px-4 py-2 rounded-lg font-display font-bold text-xs text-muted hover:text-ink flex items-center gap-1.5';
    });
    document.getElementById(`uSubContent-${sub}`).classList.remove('hidden');
    document.getElementById(`uSubBtn-${sub}`).className = 'px-4 py-2 rounded-lg font-display font-bold text-xs bg-white text-ink border border-ink shadow-clean flex items-center gap-1.5';
}

async function renderUserDebtsFromBills() {
    const tbody = document.getElementById('userDebtsTableBody');
    if (!tbody) return;

    const activeBills = currentGroupBills.filter((b) => String(b.status || 'ACTIVE').toUpperCase() !== 'CANCELLED');
    if (activeBills.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-8 px-4 text-center text-xs text-muted">Chưa có khoản công nợ hóa đơn nào trong nhóm này.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="7" class="py-6 px-4 text-center text-xs text-muted">Đang tải chi tiết công nợ từ MySQL...</td></tr>';

    const details = await Promise.all(activeBills.slice(0, 15).map((b) => fetchBillDetailAPI(b.id)));
    const myDebts = [];

    details.forEach((detail) => {
        if (!detail || !Array.isArray(detail.shares)) return;
        const myShare = detail.shares.find((s) => Number(s.member_id ?? s.user_id) === CURRENT_USER_ID);
        if (!myShare) return;

        const total = Number(myShare.amount ?? myShare.total_share_amount ?? 0);
        const paid = Number(myShare.paid_amount ?? 0);
        const rem = Math.max(0, total - paid);
        const statusStr = String(myShare.debt_status || (rem === 0 ? 'PAID' : 'UNPAID')).toUpperCase();

        if (statusStr === 'PAYER') return;

        myDebts.push({
            id: myShare.debt_id ? `DBT-${myShare.debt_id}` : `INV-${detail.id || detail.bill_id}`,
            desc: detail.title,
            date: formatDateDisplay(detail.bill_date || detail.created_at),
            total,
            paid,
            rem,
            status: statusStr
        });
    });

    if (myDebts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="py-8 px-4 text-center text-xs text-muted">Bạn không có khoản công nợ hóa đơn nào cần thanh toán trong nhóm này.</td></tr>';
        return;
    }

    tbody.innerHTML = myDebts.map((d, idx) => {
        let badge = '<span class="font-mono text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">Chưa trả</span>';
        if (d.rem === 0 || d.status === 'PAID') {
            badge = '<span class="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">Đã trả đủ</span>';
        } else if (d.paid > 0 || d.status === 'PARTIAL') {
            badge = '<span class="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">Trả một phần</span>';
        }

        return `
            <tr class="row-cascade-in" style="animation-delay: ${Math.min(idx * 40, 320)}ms;">
                <td class="py-3.5 px-4 font-mono text-xs font-bold">${d.id}</td>
                <td class="py-3.5 px-4"><span class="font-mono text-xs bg-canvas px-2 py-0.5 rounded border border-ink/15">Hóa đơn</span></td>
                <td class="py-3.5 px-4">
                    <div class="font-semibold text-ink">${d.desc}</div>
                    <div class="text-xs text-muted font-mono">${d.date}</div>
                </td>
                <td class="py-3.5 px-4 text-right font-mono">${formatVND(d.total)}</td>
                <td class="py-3.5 px-4 text-right font-mono text-emerald-700">${formatVND(d.paid)}</td>
                <td class="py-3.5 px-4 text-right font-mono font-bold ${d.rem > 0 ? 'text-rose-600' : 'text-muted'}">${formatVND(d.rem)}</td>
                <td class="py-3.5 px-4 text-center">${badge}</td>
            </tr>
        `;
    }).join('');
}

function renderUserInvoices(modeFilter) {
    const container = document.getElementById('userInvoicesList');
    if (!container) return;

    const list = modeFilter === 'ALL'
        ? currentGroupBills
        : currentGroupBills.filter((i) => String(i.split_type || '').toUpperCase() === modeFilter);

    if (list.length === 0) {
        container.innerHTML = '<div class="md:col-span-2 card-subtle p-8 text-center text-xs text-muted">Chưa có hóa đơn nào phù hợp trong nhóm này.</div>';
        return;
    }

    container.innerHTML = list.map((inv, idx) => {
        const isCancelled = String(inv.status || 'ACTIVE').toUpperCase() === 'CANCELLED';
        const payerText = inv.paid_by_name || (inv.paid_by ? `User #${inv.paid_by}` : '--');
        return `
            <div class="card-subtle p-5 flex flex-col justify-between space-y-4 row-cascade-in" style="animation-delay: ${Math.min(idx * 45, 320)}ms;">
                <div class="flex items-start justify-between gap-2">
                    <div>
                        <span class="font-mono text-xs font-bold text-indigo">#INV-${inv.id} • ${formatDateDisplay(inv.bill_date)}</span>
                        <h4 class="font-display font-bold text-base text-ink mt-0.5">${inv.title}</h4>
                        <p class="text-xs text-muted mt-0.5">Người ứng tiền: <strong class="text-ink">${payerText}</strong></p>
                    </div>
                    <span class="font-mono text-[11px] bg-white border border-ink/20 px-2.5 py-1 rounded-md shrink-0">${getSplitTypeLabel(inv.split_type)}</span>
                </div>
                <div class="pt-3 border-t border-line flex items-center justify-between gap-2">
                    <div>
                        <span class="text-xs text-muted block">Tổng hóa đơn: <strong class="font-mono text-indigo">${formatVND(inv.total_amount)}</strong></span>
                        <span class="font-mono text-[11px] font-bold ${isCancelled ? 'text-rose-600' : 'text-emerald-700'}">${isCancelled ? '● Đã huỷ' : '● Đang áp dụng'}</span>
                    </div>
                    <button type="button" onclick="openUserInvoiceModal(${inv.id})" class="btn-outline px-3 py-1.5 rounded-lg font-display font-bold text-xs">
                        Xem chi tiết món
                    </button>
                </div>
            </div>
        `;
    }).join('');

    attachInteractive3DTilt(container);
}

async function openUserInvoiceModal(invId) {
    const inv = await fetchBillDetailAPI(invId);
    if (!inv) {
        notify('Không thể tải chi tiết hóa đơn từ Backend.', true);
        return;
    }

    const resolvedId = inv.id || inv.bill_id || invId;
    const payerText = inv.paid_by_name || (inv.paid_by || inv.payer_id ? `User #${inv.paid_by || inv.payer_id}` : '--');
    const items = Array.isArray(inv.items) ? inv.items : [];
    const shares = Array.isArray(inv.shares) ? inv.shares : [];

    document.getElementById('uInvModalTitle').textContent = `Chi tiết Hóa đơn #INV-${resolvedId}`;
    document.getElementById('uInvModalBody').innerHTML = `
        <div class="card-subtle p-4 space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-muted">Đơn vị / Quán:</span><strong class="text-ink">${inv.title}</strong></div>
            <div class="flex justify-between"><span class="text-muted">Người ứng tiền:</span><strong class="text-ink">${payerText}</strong></div>
            <div class="flex justify-between"><span class="text-muted">Ngày phát sinh:</span><span class="font-mono">${formatDateDisplay(inv.bill_date || inv.created_at)}</span></div>
            <div class="flex justify-between"><span class="text-muted">Hình thức chia:</span><span class="font-semibold">${getSplitTypeLabel(inv.split_type)}</span></div>
            <div class="flex justify-between pt-2 border-t border-line text-sm"><span class="font-bold">Tổng cộng hóa đơn:</span><strong class="font-mono text-indigo">${formatVND(inv.total_amount)}</strong></div>
        </div>
        ${items.length > 0 ? `
            <div class="space-y-2">
                <div class="text-xs font-bold uppercase text-muted">Danh sách món (${items.length})</div>
                ${items.map((it) => {
                    const name = it.name || it.item_name || 'Món ăn';
                    const qty = Number(it.quantity) || 1;
                    const price = Number(it.line_total ?? it.total_price ?? (qty * (Number(it.unit_price) || 0)));
                    return `
                        <div class="p-3 rounded-xl border border-line flex justify-between items-center text-xs bg-white">
                            <div>
                                <div class="font-bold text-ink">${name} (SL: ${qty})</div>
                                <div class="text-muted font-mono">Đơn giá: ${formatVND(it.unit_price)}</div>
                            </div>
                            <span class="font-mono font-bold text-indigo">${formatVND(price)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : ''}
        ${shares.length > 0 ? `
            <div class="space-y-2">
                <div class="text-xs font-bold uppercase text-muted">Phân bổ từng thành viên (${shares.length})</div>
                ${shares.map((s) => {
                    const uid = s.member_id ?? s.user_id;
                    const name = s.member_name || `User #${uid}`;
                    const amt = Number(s.amount ?? s.total_share_amount ?? 0);
                    return `
                        <div class="p-3 rounded-xl border border-line flex justify-between items-center text-xs bg-canvas">
                            <div>
                                <div class="font-bold text-ink">${name}</div>
                                <div class="text-muted font-mono">User #${uid}${s.debt_status ? ' • ' + s.debt_status : ''}</div>
                            </div>
                            <span class="font-mono font-bold text-rose-600">${formatVND(amt)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : ''}
    `;

    openModal('modalUserInvoiceDetail');
}

async function submitJoinGroupByCode(e) {
    e.preventDefault();
    const input = document.getElementById('joinInviteCodeInput');
    const code = input.value.trim().replace('#', '');
    if (!code) return;

    try {
        const res = await fetch(`${API_BASE_URL}/groups/join?invite_code=${encodeURIComponent(code)}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify('Lỗi tham gia nhóm: ' + (data.detail || `HTTP ${res.status}`), true);
            return;
        }
        input.value = '';
        closeModal('modalJoinGroup');
        launchConfettiBurst();
        notify('Tham gia nhóm thành công!');
        await renderUserWorkspace();
    } catch (err) {
        notify('Không kết nối được tới API tham gia nhóm.', true);
    }
}

async function submitCreateGroup(e) {
    e.preventDefault();
    const nameInput = document.getElementById('newGroupNameInput');
    const descInput = document.getElementById('newGroupDescInput');
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    if (!name) return;

    try {
        const res = await fetch(`${API_BASE_URL}/groups/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, description })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify('Lỗi tạo nhóm: ' + (data.detail || `HTTP ${res.status}`), true);
            return;
        }
        nameInput.value = '';
        descInput.value = '';
        closeModal('modalCreateGroup');
        launchConfettiBurst();
        notify(`Đã tạo nhóm "${name}" thành công!`);
        await renderUserWorkspace();
    } catch (err) {
        notify('Không kết nối được tới API tạo nhóm.', true);
    }
}

function attachInteractive3DTilt(root = document) {
    const cards = root.querySelectorAll('#userGroupsGrid > .card-clean, #userInvoicesList > .card-subtle, .card-lime, .card-violet, .card-coral');
    cards.forEach((card) => {
        if (card.dataset.tiltBound === '1') return;
        card.dataset.tiltBound = '1';
        card.classList.add('neo-tilt-ready');

        const glare = document.createElement('div');
        glare.className = 'neo-spotlight-glare';
        card.appendChild(glare);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const pctX = (x / Math.max(1, rect.width)) - 0.5;
            const pctY = (y / Math.max(1, rect.height)) - 0.5;
            const rotX = (-pctY * 7).toFixed(2);
            const rotY = (pctX * 7).toFixed(2);
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(-2px, -2px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    playUiSound('click');
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.className = 'neo-ripple';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 550);
});

let mouseNormX = 0;
let mouseNormY = 0;
const cursorTrailMotes = [];

window.addEventListener('mousemove', (e) => {
    mouseNormX = (e.clientX / Math.max(1, window.innerWidth)) - 0.5;
    mouseNormY = (e.clientY / Math.max(1, window.innerHeight)) - 0.5;
    if (Math.random() < 0.3) {
        cursorTrailMotes.push({
            x: e.clientX + (Math.random() - 0.5) * 14,
            y: e.clientY + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.5 - Math.random() * 0.9,
            r: 1.8 + Math.random() * 2.2,
            alpha: 0.72,
            color: Math.random() > 0.45 ? '#D4FF00' : '#b88924'
        });
        if (cursorTrailMotes.length > 35) cursorTrailMotes.shift();
    }
}, { passive: true });

function drawWiroPainterlyCloud(ctx, cx, cy, scale, tone, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const puffs = [
        { dx: 0, dy: 0, r: 125 },
        { dx: -90, dy: 22, r: 92 },
        { dx: 92, dy: 18, r: 96 },
        { dx: -45, dy: -38, r: 82 },
        { dx: 48, dy: -35, r: 84 },
        { dx: -140, dy: 42, r: 68 },
        { dx: 140, dy: 40, r: 72 }
    ];

    puffs.forEach((p) => {
        const gLight = ctx.createRadialGradient(p.dx - p.r * 0.18, p.dy - p.r * 0.2, p.r * 0.05, p.dx, p.dy, p.r);
        if (tone === 'gold') {
            gLight.addColorStop(0, 'rgba(255, 251, 240, 0.9)');
            gLight.addColorStop(0.58, 'rgba(246, 231, 198, 0.6)');
            gLight.addColorStop(1, 'rgba(240, 220, 182, 0)');
        } else {
            gLight.addColorStop(0, 'rgba(255, 253, 248, 0.92)');
            gLight.addColorStop(0.6, 'rgba(244, 236, 222, 0.6)');
            gLight.addColorStop(1, 'rgba(232, 220, 204, 0)');
        }
        ctx.fillStyle = gLight;
        ctx.beginPath();
        ctx.arc(p.dx, p.dy, p.r, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

function initAppAmbientCanvas() {
    const canvas = document.getElementById('appAmbientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const ambientClouds = [
        { xRatio: 0.1, yRatio: 0.16, scale: 0.85, parallax: 28, tone: 'warm' },
        { xRatio: 0.9, yRatio: 0.15, scale: 0.9, parallax: 32, tone: 'gold' },
        { xRatio: 0.06, yRatio: 0.58, scale: 0.95, parallax: 40, tone: 'ivory' },
        { xRatio: 0.94, yRatio: 0.62, scale: 0.92, parallax: 36, tone: 'warm' }
    ];

    const floatingGoldDust = Array.from({ length: 32 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 1.2 + Math.random() * 2.2,
        speedY: 0.00015 + Math.random() * 0.00025,
        phase: Math.random() * Math.PI * 2
    }));

    function renderAmbient(now) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
        ctx.clearRect(0, 0, w, h);

        const t = (now || 0) * 0.001;
        const cx = w / 2 - mouseNormX * 24;
        const cy = h * 0.18 - mouseNormY * 18;

        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < 12; i++) {
            const ang = (i / 12) * Math.PI * 2 + t * 0.025;
            const grad = ctx.createLinearGradient(0, 0, Math.cos(ang) * w * 0.55, Math.sin(ang) * w * 0.55);
            grad.addColorStop(0, 'rgba(250, 232, 180, 0.2)');
            grad.addColorStop(0.6, 'rgba(240, 215, 150, 0.05)');
            grad.addColorStop(1, 'rgba(240, 215, 150, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, w * 0.6, ang - 0.04, ang + 0.04);
            ctx.closePath();
            ctx.fill();
        }

        ctx.rotate(t * 0.04);
        ctx.strokeStyle = 'rgba(184, 137, 36, 0.16)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(w, h) * 0.34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ambientClouds.forEach((cl, idx) => {
            const driftX = Math.sin(t * 0.35 + idx * 1.7) * 28 - mouseNormX * cl.parallax;
            const driftY = Math.cos(t * 0.45 + idx) * 10 - mouseNormY * (cl.parallax * 0.6);
            drawWiroPainterlyCloud(ctx, cl.xRatio * w + driftX, cl.yRatio * h + driftY, cl.scale, cl.tone, 0.55);
        });

        ctx.save();
        floatingGoldDust.forEach((d, idx) => {
            d.y -= d.speedY;
            if (d.y < -0.05) d.y = 1.05;
            const px = (d.x * w) + Math.sin(t * 0.8 + d.phase) * 18 - mouseNormX * 16;
            const py = (d.y * h) - mouseNormY * 12;
            const pulse = 0.25 + 0.35 * Math.sin(t * 2.2 + d.phase);
            ctx.fillStyle = idx % 2 === 0 ? '#b88924' : '#7C3AED';
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(px, py, d.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        for (let i = cursorTrailMotes.length - 1; i >= 0; i--) {
            const m = cursorTrailMotes[i];
            m.x += m.vx;
            m.y += m.vy;
            m.alpha -= 0.024;
            if (m.alpha <= 0) {
                cursorTrailMotes.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.fillStyle = m.color;
            ctx.globalAlpha = m.alpha;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(renderAmbient);
    }

    requestAnimationFrame(renderAmbient);
}

window.addEventListener('DOMContentLoaded', async () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initAppAmbientCanvas();
    attachInteractive3DTilt(document);
    const authenticated = await loadCurrentUser();
    if (!authenticated) return;
    pingFastApiBackend(true);
    await renderUserWorkspace();
});