const FASTAPI_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = `${FASTAPI_URL}/api`;
const DEFAULT_GROUP_IMAGE = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=240&q=80';

let CURRENT_USER_ID = null;
let CURRENT_USER = null;
let currentSplitMode = 'equal';
let interactiveFxEnabled = true;
let audioCtx = null;

let myGroups = [];
let currentGroupId = null;
let currentGroupInfo = {
    id: null,
    name: 'Đang tải...',
    inviteCode: '------',
    imageUrl: DEFAULT_GROUP_IMAGE
};

let groupMembers = [];
let customAmounts = {};
let itemizedRows = [];
let latestAllocationMap = {};
let pendingConfirmCallback = null;
let tempUploadedGroupImage = '';

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
    const isWarn = forceWarn || message.includes('Từ chối') || message.includes('Không thể') || message.includes('Cảnh báo') || message.includes('Lỗi');
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

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
    } else {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
    }
}

function getLocalGroupOverrides(groupId) {
    try {
        const raw = localStorage.getItem(`squad_group_meta_${groupId}`);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveLocalGroupOverrides(groupId, data) {
    try {
        localStorage.setItem(`squad_group_meta_${groupId}`, JSON.stringify(data));
    } catch (e) {}
}

function normalizeMember(raw) {
    const uid = Number(raw.user_id ?? raw.id);
    const name = raw.full_name || raw.username || raw.name || `Thành viên #${uid}`;
    const handle = raw.email || raw.username ? `@${raw.username || raw.email.split('@')[0]}` : `ID #${uid}`;
    const roleUpper = String(raw.role || 'MEMBER').toUpperCase();
    return {
        userId: uid,
        recordId: Number(raw.id ?? uid),
        name,
        handle,
        role: roleUpper === 'HOST' ? 'Host' : 'User',
        status: raw.status || 'ACTIVE'
    };
}

function getCurrentHostMember() {
    return groupMembers.find((m) => m.role === 'Host') || groupMembers[0] || null;
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
                if (currentGroupId) await loadGroupDataById(currentGroupId);
                else await initHostPage();
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

function syncGroupHeaderUI() {
    const host = getCurrentHostMember();
    document.getElementById('currentGroupTitle').textContent = `${currentGroupInfo.name}.`;
    document.getElementById('groupNamePreviewText').textContent = currentGroupInfo.name;
    document.getElementById('osGroupCodeBadge').textContent = `MÃ NHÓM: #${currentGroupInfo.inviteCode}`;
    document.getElementById('hostSingleGroupCode').textContent = `#${currentGroupInfo.inviteCode}`;
    document.getElementById('inviteStickerGroupId').textContent = `MÃ NHÓM CỐ ĐỊNH • #GRP-${currentGroupId || '--'}`;
    document.getElementById('hostOsPathText').textContent = `squad.cash/os/host-command/grp-${currentGroupId || '--'}`;
    document.getElementById('hostHeaderCurrentHostText').textContent = host
        ? `Host: ${host.name} (${host.handle})`
        : 'Host: Chưa xác định';
    document.getElementById('groupAvatarDisplay').src = currentGroupInfo.imageUrl;
    document.getElementById('groupThumbSmall').src = currentGroupInfo.imageUrl;
}

function renderHostMembersTable() {
    const tbody = document.getElementById('hostMembersTableBody');
    const countTitle = document.getElementById('hostMemberCountTitle');
    if (countTitle) countTitle.textContent = `Danh sách Thành viên trong nhóm (${groupMembers.length})`;
    if (!tbody) return;

    if (groupMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="py-8 px-4 text-center text-xs text-muted">Chưa có thành viên nào trong nhóm này.</td></tr>';
        return;
    }

    tbody.innerHTML = groupMembers.map((m, idx) => {
        const isHost = m.role === 'Host';
        return `
            <tr class="row-cascade-in" style="animation-delay: ${Math.min(idx * 40, 320)}ms;">
                <td class="py-3 px-4">
                    <div class="font-bold text-ink flex items-center gap-1.5">
                        <span>${m.name}</span>
                        ${isHost ? '<span title="Chủ nhóm hiện tại">👑</span>' : ''}
                    </div>
                    <div class="font-mono text-xs text-muted">${m.handle} (User #${m.userId})</div>
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded whitespace-nowrap ${isHost ? 'bg-lime border border-ink shadow-bold-sm' : 'bg-canvas border border-line'}">
                        ${isHost ? '👑 Host (Chủ nhóm)' : 'User (Thành viên)'}
                    </span>
                </td>
                <td class="py-3 px-4 font-mono text-xs font-bold text-emerald-700 whitespace-nowrap">● ${m.status}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                    ${isHost
                        ? '<span class="inline-block font-mono text-[11px] font-bold text-indigo bg-indigo-50 border border-indigo px-2.5 py-1 rounded-lg whitespace-nowrap">Đang nắm quyền</span>'
                        : `<div class="inline-flex items-center gap-1.5 whitespace-nowrap">
                                <button type="button" onclick="openTransferHostModal(${m.userId})" class="btn-outline px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold hover:bg-amber whitespace-nowrap">
                                    👑 Chuyển Host
                                </button>
                                <button type="button" onclick="openRemoveMemberModal(${m.userId})" class="btn-outline px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold text-rose-600 hover:bg-rose-50 whitespace-nowrap">
                                    🗑️ Xoá
                                </button>
                           </div>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function initEqualSplitCheckboxes() {
    const container = document.getElementById('equalMembersCheckboxes');
    if (!container) return;

    if (groupMembers.length === 0) {
        container.innerHTML = '<div class="col-span-full text-xs text-muted">Nhóm chưa có thành viên để chia hóa đơn.</div>';
        return;
    }

    container.innerHTML = groupMembers.map((m) => `
        <label class="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-line cursor-pointer text-xs font-semibold">
            <input type="checkbox" value="${m.userId}" data-name="${m.name}" checked onchange="onMemberSelectionChange()" class="equal-member-cb accent-indigo w-4 h-4">
            <span class="truncate">${m.name}</span>
        </label>
    `).join('');
}

function seedBillHelpersForCurrentMembers() {
    customAmounts = {};
    const count = Math.max(1, groupMembers.length);
    const defaultPer = Math.floor(1800000 / count);
    groupMembers.forEach((m) => {
        customAmounts[m.userId] = defaultPer;
    });

    const allIds = groupMembers.map((m) => m.userId);
    itemizedRows = [
        {
            id: 1,
            name: 'Món chính dùng chung',
            qty: 1,
            price: 600000,
            consumerIds: [...allIds]
        }
    ];
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

async function loadGroupDataById(groupId) {
    if (!groupId) return;
    currentGroupId = Number(groupId);

    const url = new URL(window.location.href);
    url.searchParams.set('group_id', String(currentGroupId));
    window.history.replaceState({}, '', url);

    try {
        const [detailRes, membersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/groups/${currentGroupId}`, { headers: getAuthHeaders() }),
            fetch(`${API_BASE_URL}/groups/${currentGroupId}/members`, { headers: getAuthHeaders() })
        ]);

        const detail = detailRes.ok ? await detailRes.json() : null;
        const rawMembers = membersRes.ok ? await membersRes.json() : [];

        const fallbackGroup = myGroups.find((g) => Number(g.group_id || g.id) === currentGroupId) || {};
        const overrides = getLocalGroupOverrides(currentGroupId);

        const rawCode = (detail && detail.invite_code) || fallbackGroup.invite_code || `GRP${currentGroupId}`;
        const rawName = (detail && (detail.group_name || detail.name)) || fallbackGroup.group_name || fallbackGroup.name || `Nhóm #${currentGroupId}`;
        const rawImg = (detail && detail.image_url) || fallbackGroup.image_url || DEFAULT_GROUP_IMAGE;

        currentGroupInfo = {
            id: currentGroupId,
            name: overrides.name || rawName,
            inviteCode: String(overrides.inviteCode || rawCode).replace('#', ''),
            imageUrl: overrides.imageUrl || rawImg
        };

        groupMembers = Array.isArray(rawMembers) ? rawMembers.map(normalizeMember) : [];
        groupMembers.sort((a, b) => (a.role === 'Host' ? -1 : b.role === 'Host' ? 1 : 0));

        syncGroupHeaderUI();
        renderHostMembersTable();
        initEqualSplitCheckboxes();
        seedBillHelpersForCurrentMembers();
        renderItemizedRows();
        renderCustomRows();
        recalculateHostInvoicePreview();
    } catch (err) {
        console.error(err);
        notify('Không thể tải dữ liệu nhóm từ Backend cổng 8000.', true);
    }
}

async function initHostPage() {
    myGroups = await fetchMyGroupsAPI();
    const selector = document.getElementById('hostGroupSelector');

    if (myGroups.length === 0) {
        if (selector) selector.innerHTML = '<option value="">Chưa có nhóm</option>';
        currentGroupInfo = {
            id: null,
            name: 'Chưa có nhóm quỹ',
            inviteCode: '------',
            imageUrl: DEFAULT_GROUP_IMAGE
        };
        groupMembers = [];
        syncGroupHeaderUI();
        renderHostMembersTable();
        initEqualSplitCheckboxes();
        recalculateHostInvoicePreview();
        return;
    }

    if (selector) {
        selector.innerHTML = myGroups.map((g) => {
            const id = Number(g.group_id || g.id);
            const name = g.group_name || g.name || `Nhóm #${id}`;
            return `<option value="${id}">#GRP-${id} — ${name}</option>`;
        }).join('');
    }

    const params = new URLSearchParams(window.location.search);
    const paramId = Number(params.get('group_id'));
    const existsInList = myGroups.some((g) => Number(g.group_id || g.id) === paramId);
    const initialId = existsInList ? paramId : Number(myGroups[0].group_id || myGroups[0].id);

    if (selector) selector.value = String(initialId);
    await loadGroupDataById(initialId);
}

async function handleGroupSelectorChange(groupIdVal) {
    if (!groupIdVal) return;
    await loadGroupDataById(Number(groupIdVal));
    notify(`Đã chuyển sang quản trị nhóm #GRP-${groupIdVal}.`);
}

function switchHostTab(tab) {
    ['members', 'invoice', 'fund', 'debts'].forEach((t) => {
        document.getElementById(`hTabContent-${t}`).classList.add('hidden');
        document.getElementById(`hTabBtn-${t}`).className = 'px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm text-ink hover:bg-lime/40 flex items-center gap-2';
    });
    document.getElementById(`hTabContent-${tab}`).classList.remove('hidden');
    document.getElementById(`hTabBtn-${tab}`).className = 'px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm bg-indigo text-white border-2 border-ink shadow-bold-sm flex items-center gap-2';

    if (tab === 'invoice') recalculateHostInvoicePreview();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function copySingleGroupCode() {
    copyTextToClipboard(currentGroupInfo.inviteCode);
    notify(`Đã sao chép mã nhóm #${currentGroupInfo.inviteCode} vào bộ nhớ tạm!`);
}

function copySingleGroupLink() {
    const link = `${window.location.origin}/join/${currentGroupInfo.inviteCode}`;
    copyTextToClipboard(link);
    notify(`Đã sao chép link mời nhóm: ${link}`);
}

function openConfirmDialog({ icon, title, message, confirmLabel, onConfirm }) {
    document.getElementById('confirmModalIcon').textContent = icon || '⚠️';
    document.getElementById('confirmModalTitle').textContent = title || 'Xác Nhận Thao Tác';
    document.getElementById('confirmModalMessage').textContent = message || '';
    document.getElementById('confirmModalSubmitBtn').textContent = confirmLabel || 'XÁC NHẬN';
    pendingConfirmCallback = onConfirm;
    openModal('modalConfirmAction');
}

function executePendingConfirmAction() {
    const fn = pendingConfirmCallback;
    pendingConfirmCallback = null;
    closeModal('modalConfirmAction');
    if (typeof fn === 'function') fn();
}

function openConfirmRegenerateCode() {
    openConfirmDialog({
        icon: '↻',
        title: 'Xác Nhận Đổi Mã Mời Mới',
        message: `Mã mời hiện tại (#${currentGroupInfo.inviteCode}) sẽ được thay thế bằng mã mới. Bạn có chắc muốn tiếp tục?`,
        confirmLabel: 'Đổi Mã Mới',
        onConfirm: () => {
            const newCode = 'DL' + Math.floor(1000 + Math.random() * 8999);
            currentGroupInfo.inviteCode = newCode;
            const prev = getLocalGroupOverrides(currentGroupId);
            saveLocalGroupOverrides(currentGroupId, { ...prev, inviteCode: newCode });
            syncGroupHeaderUI();
            notify(`Đã đổi mã mời nhóm sang #${newCode}.`);
        }
    });
}

function openTransferHostModal(targetUserId) {
    const currentHost = getCurrentHostMember();
    const targetMember = groupMembers.find((m) => m.userId === Number(targetUserId));
    if (!targetMember) return;

    document.getElementById('transferTargetMemberId').value = String(targetMember.userId);
    document.getElementById('transferCurrentHostName').textContent = currentHost
        ? `${currentHost.name} (User #${currentHost.userId})`
        : `User #${CURRENT_USER_ID}`;
    document.getElementById('transferNewHostName').textContent = `${targetMember.name} (User #${targetMember.userId})`;
    openModal('modalTransferHost');
}

async function submitTransferHostRole(e) {
    e.preventDefault();
    const newHostId = Number(document.getElementById('transferTargetMemberId').value);
    if (!currentGroupId || !newHostId) return;

    try {
        const res = await fetch(
            `${API_BASE_URL}/groups/${currentGroupId}/transfer-host?new_host_id=${encodeURIComponent(newHostId)}`,
            { method: 'POST', headers: getAuthHeaders() }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            notify('Lỗi chuyển Host: ' + (data.detail || `HTTP ${res.status}`), true);
            return;
        }
        closeModal('modalTransferHost');
        launchConfettiBurst();
        await loadGroupDataById(currentGroupId);
        notify(`👑 Đã chuyển quyền Host sang User #${newHostId} trong MySQL thành công!`);
    } catch (err) {
        notify('Không kết nối được tới API chuyển Host: ' + err.message, true);
    }
}

function openRemoveMemberModal(targetUserId) {
    const member = groupMembers.find((m) => m.userId === Number(targetUserId));
    if (!member) return;
    if (member.role === 'Host') {
        notify('Từ chối: Không thể xoá Host hiện tại. Vui lòng chuyển quyền Host trước.', true);
        return;
    }

    openConfirmDialog({
        icon: '🗑️',
        title: 'Xác Nhận Xoá Thành Viên',
        message: `Bạn có chắc muốn xoá "${member.name}" (User #${member.userId}) khỏi nhóm "${currentGroupInfo.name}"?`,
        confirmLabel: 'Xoá Thành Viên',
        onConfirm: async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/groups/${currentGroupId}/members/${member.userId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    notify('Lỗi xoá thành viên: ' + (data.detail || `HTTP ${res.status}`), true);
                    return;
                }
                await loadGroupDataById(currentGroupId);
                notify(`Đã xoá thành viên "${member.name}" khỏi nhóm trong MySQL.`);
            } catch (err) {
                notify('Không kết nối được tới API xoá thành viên: ' + err.message, true);
            }
        }
    });
}

function openLeaveGroupModal() {
    if (!currentGroupId) return;
    openConfirmDialog({
        icon: '🚪',
        title: 'Xác Nhận Rời Nhóm',
        message: `Bạn có chắc muốn rời khỏi nhóm "${currentGroupInfo.name}" (#GRP-${currentGroupId})? Nếu đang là Host duy nhất, hệ thống sẽ từ chối cho tới khi bạn chuyển quyền Host.`,
        confirmLabel: 'Rời Nhóm Ngay',
        onConfirm: async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/groups/${currentGroupId}/leave`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    notify('Từ chối rời nhóm: ' + (data.detail || `HTTP ${res.status}`), true);
                    return;
                }
                notify(`Bạn đã rời khỏi nhóm "${currentGroupInfo.name}" thành công!`);
                setTimeout(() => {
                    window.location.href = './group.html';
                }, 900);
            } catch (err) {
                notify('Không kết nối được tới API rời nhóm: ' + err.message, true);
            }
        }
    });
}

async function submitHostCreateGroup(e) {
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
        closeModal('modalHostCreateGroup');
        launchConfettiBurst();

        const newId = data.group_id || data.id;
        myGroups = await fetchMyGroupsAPI();
        const selector = document.getElementById('hostGroupSelector');
        if (selector) {
            selector.innerHTML = myGroups.map((g) => {
                const id = Number(g.group_id || g.id);
                const gName = g.group_name || g.name || `Nhóm #${id}`;
                return `<option value="${id}">#GRP-${id} — ${gName}</option>`;
            }).join('');
            if (newId) selector.value = String(newId);
        }
        if (newId) await loadGroupDataById(Number(newId));
        notify(`Đã tạo nhóm "${name}" trong MySQL thành công!`);
    } catch (err) {
        notify('Không kết nối được tới API tạo nhóm: ' + err.message, true);
    }
}

function openEditGroupModal() {
    tempUploadedGroupImage = '';
    document.getElementById('editGroupNameInput').value = currentGroupInfo.name;
    document.getElementById('editGroupImageUrlInput').value = currentGroupInfo.imageUrl.startsWith('data:') ? '' : currentGroupInfo.imageUrl;
    document.getElementById('editGroupAvatarPreview').src = currentGroupInfo.imageUrl;
    const fileInput = document.getElementById('editGroupImageFile');
    if (fileInput) fileInput.value = '';
    openModal('modalEditGroup');
}

function previewGroupImageUrl(url) {
    const trimmed = (url || '').trim();
    if (trimmed) {
        tempUploadedGroupImage = '';
        document.getElementById('editGroupAvatarPreview').src = trimmed;
    }
}

function handleGroupImageFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        tempUploadedGroupImage = e.target.result;
        document.getElementById('editGroupAvatarPreview').src = tempUploadedGroupImage;
        document.getElementById('editGroupImageUrlInput').value = '';
    };
    reader.readAsDataURL(file);
}

function submitEditGroup(e) {
    e.preventDefault();
    const newName = document.getElementById('editGroupNameInput').value.trim();
    const newUrl = document.getElementById('editGroupImageUrlInput').value.trim();
    if (!newName) return;

    currentGroupInfo.name = newName;
    if (tempUploadedGroupImage) currentGroupInfo.imageUrl = tempUploadedGroupImage;
    else if (newUrl) currentGroupInfo.imageUrl = newUrl;

    const prev = getLocalGroupOverrides(currentGroupId);
    saveLocalGroupOverrides(currentGroupId, {
        ...prev,
        name: currentGroupInfo.name,
        imageUrl: currentGroupInfo.imageUrl
    });

    syncGroupHeaderUI();
    closeModal('modalEditGroup');
    notify(`Đã cập nhật tên và ảnh đại diện cho nhóm "${newName}"!`);
}

function getSelectedMembers() {
    return Array.from(document.querySelectorAll('.equal-member-cb:checked')).map((cb) => ({
        userId: Number(cb.value),
        name: cb.getAttribute('data-name') || `User #${cb.value}`
    }));
}

function setInvoiceSplitMode(mode) {
    currentSplitMode = mode;
    const activeCls = 'p-3.5 rounded-xl border-[1.5px] border-ink bg-lime/40 font-display font-bold text-xs sm:text-sm text-left flex items-center justify-between text-ink';
    const inactiveCls = 'p-3.5 rounded-xl border-[1.5px] border-line bg-white font-display font-bold text-xs sm:text-sm text-left flex items-center justify-between text-muted';

    ['equal', 'itemized', 'custom'].forEach((m) => {
        const btn = document.getElementById(`splitModeBtn-${m}`);
        if (btn) btn.className = m === mode ? activeCls : inactiveCls;
    });

    document.getElementById('invoiceItemizedSection').classList.toggle('hidden', mode !== 'itemized');
    document.getElementById('invoiceCustomSection').classList.toggle('hidden', mode !== 'custom');

    if (mode === 'itemized') renderItemizedRows();
    if (mode === 'custom') renderCustomRows();

    recalculateHostInvoicePreview();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleBaseAmountManualInput() {
    if (currentSplitMode !== 'equal') {
        setInvoiceSplitMode('equal');
        return;
    }
    recalculateHostInvoicePreview();
}

function quickAddAmount(delta) {
    const el = document.getElementById('invEqualBaseAmount');
    if (currentSplitMode === 'custom') {
        const selected = getSelectedMembers();
        if (selected.length > 0) {
            const firstId = selected[0].userId;
            customAmounts[firstId] = (Number(customAmounts[firstId]) || 0) + delta;
            renderCustomRows();
        }
    } else if (currentSplitMode === 'itemized') {
        if (itemizedRows.length > 0) {
            itemizedRows[0].price = (Number(itemizedRows[0].price) || 0) + delta;
            renderItemizedRows();
        }
    } else if (el) {
        el.value = (parseInt(el.value, 10) || 0) + delta;
    }

    if (el) {
        el.classList.remove('value-flash');
        void el.offsetWidth;
        el.classList.add('value-flash');
    }
    recalculateHostInvoicePreview();
}

function quickResetAmount() {
    document.getElementById('invEqualBaseAmount').value = 0;
    document.getElementById('invFeeTip').value = 0;
    document.getElementById('invDiscount').value = 0;
    Object.keys(customAmounts).forEach((k) => { customAmounts[k] = 0; });
    if (currentSplitMode === 'custom') renderCustomRows();
    recalculateHostInvoicePreview();
}

function onMemberSelectionChange() {
    if (currentSplitMode === 'itemized') renderItemizedRows();
    if (currentSplitMode === 'custom') renderCustomRows();
    recalculateHostInvoicePreview();
}

function renderItemizedRows() {
    const container = document.getElementById('invoiceItemsContainer');
    if (!container) return;
    const selected = getSelectedMembers();

    container.innerHTML = itemizedRows.map((row, idx) => `
        <div class="p-3.5 bg-white rounded-xl border border-line space-y-2">
            <div class="grid grid-cols-12 gap-2 items-center">
                <input type="text" value="${row.name}" oninput="updateItemRow(${idx}, 'name', this.value)" class="col-span-6 input-clean px-3 py-1.5 text-xs font-bold" placeholder="Tên món">
                <input type="number" value="${row.qty}" min="1" oninput="updateItemRow(${idx}, 'qty', this.value)" class="col-span-2 input-clean px-2 py-1.5 text-xs font-mono text-center" title="Số lượng">
                <input type="number" value="${row.price}" min="0" step="1000" oninput="updateItemRow(${idx}, 'price', this.value)" class="col-span-4 input-clean px-2.5 py-1.5 text-xs font-mono font-bold" title="Đơn giá">
            </div>
            <div class="text-[11px] text-muted flex flex-wrap items-center gap-1.5">
                <span class="font-bold text-ink">Người dùng món:</span>
                ${selected.map((m) => {
                    const active = row.consumerIds.includes(m.userId);
                    return `<button type="button" onclick="toggleItemConsumer(${idx}, ${m.userId})" class="px-2 py-0.5 rounded border font-mono ${active ? 'bg-indigo text-white border-indigo' : 'bg-canvas text-muted border-line'}">${m.name.split(' ').pop()}</button>`;
                }).join('')}
            </div>
        </div>
    `).join('');
}

function updateItemRow(idx, field, val) {
    if (!itemizedRows[idx]) return;
    if (field === 'name') itemizedRows[idx].name = val;
    if (field === 'qty') itemizedRows[idx].qty = Math.max(1, parseInt(val, 10) || 1);
    if (field === 'price') itemizedRows[idx].price = Math.max(0, parseInt(val, 10) || 0);
    recalculateHostInvoicePreview();
}

function toggleItemConsumer(idx, userId) {
    const arr = itemizedRows[idx].consumerIds;
    const pos = arr.indexOf(Number(userId));
    if (pos >= 0) {
        if (arr.length > 1) arr.splice(pos, 1);
        else {
            notify('Mỗi món ăn phải có ít nhất 1 thành viên sử dụng!', true);
            return;
        }
    } else {
        arr.push(Number(userId));
    }
    renderItemizedRows();
    recalculateHostInvoicePreview();
}

function addInvoiceItemRow() {
    const selected = getSelectedMembers();
    const ids = selected.map((m) => m.userId);
    itemizedRows.push({
        id: Date.now(),
        name: 'Món gọi thêm #' + (itemizedRows.length + 1),
        qty: 1,
        price: 150000,
        consumerIds: ids.length >= 2 ? ids.slice(0, 2) : ids
    });
    renderItemizedRows();
    recalculateHostInvoicePreview();
}

function renderCustomRows() {
    const container = document.getElementById('customMembersContainer');
    if (!container) return;
    const selected = getSelectedMembers();

    container.innerHTML = selected.map((m) => {
        const val = customAmounts[m.userId] !== undefined ? customAmounts[m.userId] : 0;
        return `
            <div class="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-line">
                <span class="text-xs font-bold text-ink">${m.name}</span>
                <input type="number" min="0" step="1000" value="${val}" oninput="updateCustomMemberAmount(${m.userId}, this.value)"
                    class="input-clean w-40 px-3 py-1.5 font-mono text-xs font-bold text-right">
            </div>
        `;
    }).join('');
}

function updateCustomMemberAmount(userId, val) {
    customAmounts[Number(userId)] = Math.max(0, parseInt(val, 10) || 0);
    recalculateHostInvoicePreview();
}

function recalculateHostInvoicePreview() {
    const baseInput = document.getElementById('invEqualBaseAmount');
    const fee = Math.max(0, parseInt(document.getElementById('invFeeTip')?.value, 10) || 0);
    const discount = Math.max(0, parseInt(document.getElementById('invDiscount')?.value, 10) || 0);
    const feeMode = document.getElementById('feeSplitModeSelect')?.value || 'EQUAL';

    const checkedMembers = getSelectedMembers();
    const checkedIds = checkedMembers.map((m) => m.userId);
    let subtotal = 0;
    latestAllocationMap = {};

    if (currentSplitMode === 'equal') {
        subtotal = Math.max(0, parseInt(baseInput?.value, 10) || 0);
        const grand = Math.max(0, subtotal + fee - discount);
        if (checkedMembers.length > 0) {
            const baseShare = Math.floor(grand / checkedMembers.length);
            const rem = grand - (baseShare * checkedMembers.length);
            checkedMembers.forEach((m, idx) => {
                latestAllocationMap[m.userId] = baseShare + (idx === 0 ? rem : 0);
            });
        }
    } else if (currentSplitMode === 'itemized') {
        const itemTotals = {};
        checkedIds.forEach((uid) => {
            itemTotals[uid] = 0;
            latestAllocationMap[uid] = 0;
        });

        itemizedRows.forEach((r) => {
            const lineTotal = (Number(r.qty) || 1) * (Number(r.price) || 0);
            subtotal += lineTotal;
            const validConsumers = r.consumerIds.filter((uid) => checkedIds.includes(uid));
            if (validConsumers.length > 0) {
                const base = Math.floor(lineTotal / validConsumers.length);
                const rem = lineTotal - (base * validConsumers.length);
                validConsumers.forEach((uid, idx) => {
                    itemTotals[uid] = (itemTotals[uid] || 0) + base + (idx === 0 ? rem : 0);
                });
            }
        });

        if (baseInput && document.activeElement !== baseInput) baseInput.value = subtotal;

        const effectiveFee = Math.max(0, fee - discount);
        const activeIds = checkedIds.filter((uid) => (itemTotals[uid] || 0) > 0);
        const targetIds = activeIds.length > 0 ? activeIds : checkedIds;

        if (targetIds.length > 0) {
            const feeMap = {};
            if (feeMode === 'PROPORTIONAL' && subtotal > 0) {
                let allocated = 0;
                targetIds.forEach((uid) => {
                    const f = Math.floor((effectiveFee * (itemTotals[uid] || 0)) / subtotal);
                    feeMap[uid] = f;
                    allocated += f;
                });
                const rem = effectiveFee - allocated;
                const sorted = [...targetIds].sort((a, b) => (itemTotals[b] || 0) - (itemTotals[a] || 0));
                if (sorted.length > 0 && rem > 0) feeMap[sorted[0]] += rem;
            } else {
                const fBase = Math.floor(effectiveFee / targetIds.length);
                const fRem = effectiveFee - (fBase * targetIds.length);
                targetIds.forEach((uid, idx) => {
                    feeMap[uid] = fBase + (idx === 0 ? fRem : 0);
                });
            }
            checkedIds.forEach((uid) => {
                latestAllocationMap[uid] = (itemTotals[uid] || 0) + (feeMap[uid] || 0);
            });
        }
    } else if (currentSplitMode === 'custom') {
        subtotal = checkedMembers.reduce((sum, m) => sum + (Number(customAmounts[m.userId]) || 0), 0);
        if (baseInput && document.activeElement !== baseInput) baseInput.value = subtotal;

        const netAdj = fee - discount;
        const adjBase = checkedMembers.length > 0 ? Math.trunc(netAdj / checkedMembers.length) : 0;
        const adjRem = checkedMembers.length > 0 ? netAdj - (adjBase * checkedMembers.length) : 0;

        checkedMembers.forEach((m, idx) => {
            const raw = Number(customAmounts[m.userId]) || 0;
            latestAllocationMap[m.userId] = Math.max(0, raw + adjBase + (idx === 0 ? adjRem : 0));
        });

        const statusEl = document.getElementById('customStatusText');
        if (statusEl) {
            statusEl.textContent = `Tổng tự chọn: ${formatVND(subtotal)} (phân bổ cho ${checkedMembers.length} thành viên).`;
        }
    }

    const grandTotal = currentSplitMode === 'itemized'
        ? subtotal + Math.max(0, fee - discount)
        : Math.max(0, subtotal + fee - discount);

    document.getElementById('previewSubtotal').textContent = formatVND(subtotal);
    document.getElementById('previewFee').textContent = '+' + formatVND(fee);
    document.getElementById('previewDiscount').textContent = '-' + formatVND(discount);
    document.getElementById('previewGrandTotal').textContent = formatVND(grandTotal);

    const listEl = document.getElementById('invoiceAllocationPreviewList');
    if (checkedMembers.length === 0) {
        listEl.innerHTML = '<div class="p-4 text-xs text-rose-600 font-semibold">Vui lòng chọn ít nhất 1 thành viên tham gia hóa đơn (FR-HOST-003).</div>';
        return;
    }

    listEl.innerHTML = checkedMembers.map((m) => `
        <div class="p-3 rounded-xl border border-line bg-canvas flex items-center justify-between">
            <span class="font-semibold text-xs text-ink">${m.name}</span>
            <span class="font-mono font-bold text-sm text-indigo">${formatVND(latestAllocationMap[m.userId] || 0)}</span>
        </div>
    `).join('');
}

async function saveHostInvoice() {
    if (!currentGroupId) {
        notify('Không thể lưu: Chưa chọn nhóm hợp lệ từ MySQL!', true);
        return;
    }

    const checkedMembers = getSelectedMembers();
    if (checkedMembers.length === 0) {
        notify('Không thể lưu: Hóa đơn phải có ít nhất 1 thành viên tham gia!', true);
        return;
    }

    const title = document.getElementById('invMerchantName').value.trim() || 'Hóa đơn nhóm';
    const participantIds = checkedMembers.map((m) => m.userId);
    const totalFromMap = participantIds.reduce((s, uid) => s + Math.round(Number(latestAllocationMap[uid]) || 0), 0);
    const hostMember = getCurrentHostMember();
    const payerId = hostMember ? hostMember.userId : CURRENT_USER_ID;

    let endpoint = '/bills/equal-split';
    let payload = {};

    if (currentSplitMode === 'equal') {
        endpoint = '/bills/equal-split';
        payload = {
            group_id: currentGroupId,
            title,
            total_amount: totalFromMap,
            paid_by: payerId,
            participant_ids: participantIds,
            note: 'Tạo từ giao diện Chia đều'
        };
    } else if (currentSplitMode === 'custom') {
        endpoint = '/bills/split-custom';
        const shares = checkedMembers.map((m) => ({
            user_id: m.userId,
            amount: Math.round(Number(latestAllocationMap[m.userId]) || 0)
        }));
        const exactTotal = shares.reduce((s, x) => s + x.amount, 0);
        payload = {
            group_id: currentGroupId,
            title,
            payer_id: payerId,
            created_by: CURRENT_USER_ID,
            total_amount: exactTotal,
            shares
        };
    } else {
        endpoint = '/bills/split-by-items';
        const fee = Math.max(0, parseInt(document.getElementById('invFeeTip').value, 10) || 0);
        const discount = Math.max(0, parseInt(document.getElementById('invDiscount').value, 10) || 0);
        const feeMode = document.getElementById('feeSplitModeSelect')?.value || 'EQUAL';

        const items = itemizedRows
            .map((r) => ({
                item_name: (r.name || '').trim() || 'Món ăn',
                quantity: Math.max(1, Number(r.qty) || 1),
                unit_price: Number(r.price) || 0,
                user_ids: (r.consumerIds || []).filter((uid) => participantIds.includes(uid))
            }))
            .filter((it) => it.unit_price > 0 && it.user_ids.length > 0);

        if (items.length === 0) {
            notify('Không thể lưu: Cần ít nhất 1 món có đơn giá > 0 và có thành viên dùng món!', true);
            return;
        }

        const itemsSum = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
        const serviceShipFee = Math.max(0, fee - discount);

        payload = {
            group_id: currentGroupId,
            title,
            payer_id: payerId,
            created_by: CURRENT_USER_ID,
            fee_split_mode: feeMode,
            service_ship_fee: serviceShipFee,
            total_amount: itemsSum + serviceShipFee,
            items
        };
    }

    try {
        const res = await fetch(API_BASE_URL + endpoint, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const detail = Array.isArray(data.detail)
                ? data.detail.map((d) => `${(d.loc || []).slice(-1)[0] || ''}: ${d.msg}`).join(' | ')
                : (data.detail || `HTTP ${res.status}`);
            notify('Lỗi lưu hóa đơn: ' + detail, true);
            console.error('Bill API error:', res.status, data, payload);
            return;
        }
        const billId = data.bill_id || data.id || 'OK';
        launchConfettiBurst();
        notify(data.message || `Đã lưu hóa đơn "${title}" (ID #${billId}) vào MySQL thành công!`);
    } catch (err) {
        notify('Không kết nối được tới Backend (cổng 8000): ' + err.message, true);
    }
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
    const authenticated = await loadCurrentUser();
    if (!authenticated) return;
    pingFastApiBackend(true);
    await initHostPage();
});