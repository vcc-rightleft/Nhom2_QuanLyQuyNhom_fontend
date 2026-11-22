// ---------------- 6. ADMIN WORKSPACE LOGIC (FR-ADM-001 TO 007) ----------------
// FR-ADM-001/002/003 — dữ liệu thật từ Backend, không dùng mock.
let adminAccountPage = 1;
let adminAccountRequestVersion = 0;
let adminSearchTimer = null;

function renderAdminWorkspace() {
    renderAdminAccountsTable();
    renderAdminGroupsTable();
}

function switchAdminTab(tab) {
    ['accounts', 'groups', 'retention'].forEach(t => {
        document.getElementById(`aTabContent-${t}`)?.classList.add('hidden');
        const btn = document.getElementById(`aTabBtn-${t}`);
        if (!btn) return;
        btn.classList.remove('bg-ink', 'text-white');
        btn.classList.add('text-muted');
    });
    document.getElementById(`aTabContent-${tab}`)?.classList.remove('hidden');
    const activeBtn = document.getElementById(`aTabBtn-${tab}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-muted');
        activeBtn.classList.add('bg-ink', 'text-white');
    }
}

function searchAdminAccounts() {
    clearTimeout(adminSearchTimer);
    adminAccountPage = 1;
    adminSearchTimer = setTimeout(renderAdminAccountsTable, 300);
}

function changeAdminAccountPage(nextPage) {
    if (nextPage < 1) return;
    adminAccountPage = nextPage;
    renderAdminAccountsTable();
}

async function renderAdminAccountsTable() {
    const tbody = document.getElementById('admAccountsTableBody');
    if (!tbody || !canViewSquad('admin')) return;
    const requestVersion = ++adminAccountRequestVersion;
    const pager = document.getElementById('admAccountsPager');
    tbody.innerHTML = '<tr><td colspan="7" class="py-5 px-4 text-muted">Đang tải dữ liệu tài khoản...</td></tr>';
    if (pager) pager.replaceChildren();
    const q = document.getElementById('admUserSearch')?.value?.trim() || '';
    const status = document.getElementById('admUserStatusFilter')?.value || 'all';
    const params = new URLSearchParams({q, status, page: String(adminAccountPage), page_size:'10'});
    try {
        const result = await squadApi('/api/admin/users?' + params);
        if (requestVersion !== adminAccountRequestVersion || !canViewSquad('admin')) return;
        if (!Array.isArray(result.items)) throw new Error('Dữ liệu trả về không hợp lệ.');
        adminAccounts = result.items;
        tbody.replaceChildren();
        if (!result.items.length) {
            const tr = tbody.insertRow();
            const td = tr.insertCell();
            td.colSpan = 7;
            td.className = 'py-5 px-4 text-muted';
            td.textContent = 'Không có tài khoản phù hợp.';
        }
        for (const u of result.items) {
            const tr = tbody.insertRow();
            const values = [String(u.id), u.full_name, [u.email_masked,u.phone_masked].filter(Boolean).join(' / '),
                u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—',
                String(u.group_count), u.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'];
            values.forEach((value, i) => {
                const td = tr.insertCell();
                td.className = 'py-3.5 px-4 text-sm' + (i === 4 || i === 5 ? ' text-center' : '');
                td.textContent = value || '—';
                if (i === 5 && u.status === 'LOCKED') td.title = u.lock_reason || '';
            });
            const actions = tr.insertCell();
            actions.className = 'py-3.5 px-4 text-right';
            if (u.role === 'ADMIN') {
                actions.textContent = 'Quản trị viên (bảo vệ)';
            } else {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-outline px-3 py-1.5 rounded-lg text-xs font-bold';
                btn.textContent = u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa';
                btn.addEventListener('click', () => u.status === 'ACTIVE' ? openAdminLockModal(u.id, u.full_name) : unlockAdminAccount(u.id));
                actions.append(btn);
            }
        }
        const counter = document.getElementById('admKpiUsers');
        // Tổng tài khoản toàn hệ thống chỉ từ request không có bộ lọc.
        if (!q && status === 'all' && counter) counter.textContent = String(result.total);
        if (pager) {
            const label = document.createElement('span');
            label.textContent = `Trang ${result.page}/${Math.max(1,result.total_pages)} · ${result.total} tài khoản`;
            label.className = 'text-xs text-muted';
            const previous = document.createElement('button');
            previous.textContent = '← Trước'; previous.className = 'btn-outline px-3 py-1 rounded-lg text-xs';
            previous.disabled = result.page <= 1;
            previous.onclick = () => changeAdminAccountPage(result.page - 1);
            const next = document.createElement('button');
            next.textContent = 'Sau →'; next.className = 'btn-outline px-3 py-1 rounded-lg text-xs';
            next.disabled = result.page >= result.total_pages;
            next.onclick = () => changeAdminAccountPage(result.page + 1);
            pager.append(previous, label, next);
        }
    } catch (err) {
        if (requestVersion !== adminAccountRequestVersion) return;
        adminAccounts = [];
        tbody.innerHTML = '';
        const tr = tbody.insertRow();
        const td = tr.insertCell(); td.colSpan = 7;
        td.className = 'py-5 px-4 text-rose-700';
        td.textContent = 'Không tải được danh sách tài khoản: ' + err.message;
    }
}

function openAdminLockModal(id, name) {
    document.getElementById('lockTargetUserId').value = String(id);
    document.getElementById('lockTargetUserName').textContent = `${name} (#${id})`;
    document.getElementById('lockReasonInput').value = '';
    openModal('modalAdminLockUser');
}

async function submitAdminLockUser(event) {
    event.preventDefault();
    const id = Number(document.getElementById('lockTargetUserId').value);
    const reason = document.getElementById('lockReasonInput').value.trim();
    if (!id || reason.length < 5) { notify('Vui lòng nhập lý do khóa (tối thiểu 5 ký tự).'); return; }
    const button = event.currentTarget.querySelector('[type="submit"]');
    if (button) button.disabled = true;
    try {
        await squadApi(`/api/admin/users/${id}/lock`, {method:'POST', body:{reason}});
        closeModal('modalAdminLockUser');
        notify('Đã khóa tài khoản và thu hồi các phiên đăng nhập hiện có.');
        await renderAdminAccountsTable();
    } catch (err) { notify('Khóa tài khoản thất bại: ' + err.message); }
    finally { if (button) button.disabled = false; }
}

async function unlockAdminAccount(id) {
    if (!window.confirm(`Mở khóa tài khoản #${id}?`)) return;
    try {
        await squadApi(`/api/admin/users/${Number(id)}/unlock`, {method:'POST'});
        notify('Đã mở khóa tài khoản.');
        await renderAdminAccountsTable();
    } catch (err) { notify('Mở khóa thất bại: ' + err.message); }
}

        // FR-ADM-004 & 006: Groups & Manual Soft Delete with Dispute Check
        function renderAdminGroupsTable() {
            const filter = document.getElementById('admGroupFilter').value;
            const tbody = document.getElementById('admGroupsTableBody');

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
            notify('Xóa mềm nhóm chưa được tích hợp với API quản trị; không có thay đổi nào được lưu.');
        }

        function restoreSoftDeletedGroup(id) {
            notify('Khôi phục nhóm chưa được tích hợp với API quản trị; không có thay đổi nào được lưu.');
        }

        function runFiveYearRetentionScan() {
            notify('Quét lưu giữ 5 năm chưa được triển khai trên backend.');
        }
