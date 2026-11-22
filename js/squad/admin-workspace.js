// ---------------- 6. ADMIN WORKSPACE LOGIC (FR-ADM-001 TO 007) ----------------
        function renderAdminWorkspace() {
            renderAdminAccountsTable();
            renderAdminGroupsTable();
        }

        function switchAdminTab(tab) {
            ['accounts', 'groups', 'retention'].forEach(t => {
                document.getElementById(`aTabContent-${t}`).classList.add('hidden');
                const btn = document.getElementById(`aTabBtn-${t}`);
                btn.classList.remove('bg-ink', 'text-white');
                btn.classList.add('text-muted');
            });
            document.getElementById(`aTabContent-${tab}`).classList.remove('hidden');
            const activeBtn = document.getElementById(`aTabBtn-${tab}`);
            activeBtn.classList.remove('text-muted');
            activeBtn.classList.add('bg-ink', 'text-white');
        }

        function renderAdminAccountsTable() {
            const q = (document.getElementById('admUserSearch').value || '').toLowerCase();
            const status = document.getElementById('admUserStatusFilter').value;
            const tbody = document.getElementById('admAccountsTableBody');

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
            notify('Chức năng khóa tài khoản chưa có API quản trị được xác thực; không có thay đổi nào được lưu.');
        }

        function unlockAdminAccount(id) {
            notify('Chức năng mở khóa chưa có API quản trị được xác thực; không có thay đổi nào được lưu.');
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
