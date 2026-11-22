// ---------------- 4. USER WORKSPACE LOGIC (FR-USER-001 TO 004) ----------------
        function renderUserWorkspace() {
            // Render FR-USER-001 Groups with vibrant top accent bars
            const accents = ['bg-lime', 'bg-cyan', 'bg-amber'];
            const grid = document.getElementById('userGroupsGrid');
            grid.innerHTML = userJoinedGroups.map((g, idx) => `
                <div class="card-clean overflow-hidden flex flex-col justify-between">
                    <div class="${accents[idx % accents.length]} px-5 py-2.5 border-b-2 border-ink flex items-center justify-between">
                        <span class="font-mono text-xs font-bold text-ink">#${g.id} • ${g.role === 'HOST' ? 'Mã mời: #'+escapeSquadHtml(g.inviteCode) : 'Thành viên'}</span>
                        <span class="font-mono text-[11px] font-bold bg-white border border-ink px-2 py-0.5 rounded-full">● ${g.status}</span>
                    </div>
                    <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                            <h3 class="font-display font-bold text-lg text-ink">${escapeSquadHtml(g.name)}</h3>
                            <p class="text-xs text-muted mt-1">Host: <strong class="text-ink">${escapeSquadHtml(g.host)}</strong></p>
                            <p class="text-xs text-muted">Số thành viên: ${g.members} người</p>
                        </div>
                        <div class="pt-4 border-t border-line flex items-center justify-between">
                            <div>
                                <span class="text-[11px] text-muted block font-semibold">Số dư quỹ chung</span>
                                <span class="font-mono font-bold text-base text-indigo">${formatVND(g.balance)}</span>
                            </div>
                            <button onclick="selectUserGroup(${Number(g.id)})" class="btn-cta-lime px-3.5 py-2 rounded-xl font-display font-bold text-xs">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            `).join('') || '<div class="col-span-full rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center font-semibold">Bạn chưa tham gia nhóm nào. Hãy tạo nhóm ở mục Host hoặc nhập mã mời hợp lệ.</div>';
            const selectedName = document.getElementById('userSelectedGroupName');
            if (selectedName) selectedName.textContent = selectedSquadGroup() ? selectedSquadGroup().name + ' (#' + selectedSquadGroup().id + ')' : 'Chưa chọn nhóm';

            renderUserDebts();
            renderUserInvoices('all');
            renderUserLedger();
        }

        async function selectUserGroup(id) {
            try {
                await selectSquadGroup(id);
                notify('Đã tải dữ liệu nhóm từ MySQL.');
            } catch(err) { notify('Không tải được dữ liệu nhóm: ' + err.message); }
        }

        function switchUserSubTab(sub) {
            ['debts', 'invoices', 'ledger'].forEach(s => {
                document.getElementById(`uSubContent-${s}`).classList.add('hidden');
                document.getElementById(`uSubBtn-${s}`).className = "px-4 py-2 rounded-lg font-display font-bold text-xs text-muted hover:text-ink flex items-center gap-1.5";
            });
            document.getElementById(`uSubContent-${sub}`).classList.remove('hidden');
            document.getElementById(`uSubBtn-${sub}`).className = "px-4 py-2 rounded-lg font-display font-bold text-xs bg-white text-ink border border-ink shadow-clean flex items-center gap-1.5";
        }

        function renderUserDebts() {
            const myDebts = groupDebts.filter(d => d.userId === squadSession?.accountId);
            let totalRemaining = 0;

            const tbody = document.getElementById('userDebtsTableBody');
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
                            <div class="font-semibold text-ink">${escapeSquadHtml(d.desc)}</div>
                            <div class="text-xs text-muted font-mono">${d.date}</div>
                        </td>
                        <td class="py-3.5 px-4 text-right font-mono">${formatVND(d.total)}</td>
                        <td class="py-3.5 px-4 text-right font-mono text-emerald-700">${formatVND(d.paid)}</td>
                        <td class="py-3.5 px-4 text-right font-mono font-bold ${rem > 0 ? 'text-rose-600' : 'text-muted'}">${formatVND(rem)}</td>
                        <td class="py-3.5 px-4 text-center">
                            <div class="inline-flex items-center gap-2">
                                ${badge}
                                ${rem > 0 ? `<button type="button" onclick="openVietQrModal('${d.id}', ${rem}, '')" class="btn-outline px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold hover:bg-lime" title="Mở mã VietQR tự động điền số tiền">QR Trả</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="7" class="p-5 text-center text-muted">Chưa có công nợ</td></tr>';

            document.getElementById('userTotalDebtKpi').textContent = formatVND(totalRemaining);
        }

        function renderUserInvoices(modeFilter) {
            const container = document.getElementById('userInvoicesList');
            const list = modeFilter === 'all' ? groupInvoices : groupInvoices.filter(i => i.mode === modeFilter);

            container.innerHTML = list.map(inv => `
                <div class="card-subtle p-5 flex flex-col justify-between space-y-4 hover:border-ink transition-all">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="font-mono text-xs font-bold text-indigo">#${inv.id} • ${inv.date}</span>
                            <h4 class="font-display font-bold text-base text-ink mt-0.5">${escapeSquadHtml(inv.merchant)}</h4>
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
            `).join('') || '<div class="p-6 text-center text-muted">Chưa có hóa đơn</div>';
        }

        function openUserInvoiceModal(invId) {
            const inv = groupInvoices.find(i => i.id === invId);
            if (!inv) return;
            document.getElementById('uInvModalTitle').textContent = `Chi tiết Hóa đơn #${inv.id}`;
            document.getElementById('uInvModalBody').innerHTML = `
                <div class="card-subtle p-4 space-y-1 text-xs">
                    <div class="flex justify-between"><span class="text-muted">Đơn vị / Quán:</span><strong class="text-ink">${escapeSquadHtml(inv.merchant)}</strong></div>
                    <div class="flex justify-between"><span class="text-muted">Ngày phát sinh:</span><span class="font-mono">${inv.date}</span></div>
                    <div class="flex justify-between"><span class="text-muted">Hình thức chia:</span><span class="font-semibold">${inv.modeLabel}</span></div>
                    <div class="flex justify-between pt-2 border-t border-line text-sm"><span class="font-bold">Phần tiền của bạn:</span><strong class="font-mono text-indigo">${formatVND(inv.myShare)}</strong></div>
                </div>
                <div class="space-y-2">
                    <div class="text-xs font-bold uppercase text-muted">Danh sách món &amp; người tham gia</div>
                    ${inv.items.map(it => `
                        <div class="p-3 rounded-xl border border-line flex justify-between items-center text-xs">
                            <div>
                                <div class="font-bold text-ink">${escapeSquadHtml(it.name)} (SL: ${it.qty})</div>
                                <div class="text-muted">Người dùng: ${escapeSquadHtml(it.assigned)}</div>
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
                        <td class="py-3.5 px-4 font-medium text-ink">${escapeSquadHtml(tx.desc)}</td>
                        <td class="py-3.5 px-4 text-xs text-muted">${escapeSquadHtml(tx.method)}</td>
                        <td class="py-3.5 px-4 text-xs text-muted font-mono">${escapeSquadHtml(tx.author)} • ${tx.time}</td>
                        <td class="py-3.5 px-4 text-right font-mono font-bold ${tx.type === 'in' ? 'text-emerald-700' : 'text-rose-600'}">
                            ${tx.type === 'in' ? '+' : '-'}${formatVND(tx.amount)}
                        </td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="6" class="p-5 text-center text-muted">Chưa có giao dịch</td></tr>';

            const bal = sumIn - sumOut;
            document.getElementById('userLedgerIn').textContent = '+' + formatVND(sumIn);
            document.getElementById('userLedgerOut').textContent = '-' + formatVND(sumOut);
            document.getElementById('userLedgerBalance').textContent = formatVND(bal);
        }
