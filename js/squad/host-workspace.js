// ---------------- 5. HOST WORKSPACE LOGIC (FR-HOST-001 TO 006) ----------------
        function renderHostWorkspace() {
            const group = selectedSquadGroup();
            const title = document.getElementById('hostGroupNameTitle');
            if (title) title.textContent = group?.name || 'Chưa chọn nhóm';
            const label = document.getElementById('squadSelectedGroupBadge');
            if (label) label.textContent = group ? `${group.name} (#${group.id})` : 'Chưa có nhóm';
            const hostLabel = document.getElementById('hostHeaderCurrentHostText');
            if (hostLabel) hostLabel.textContent = group ? (group.role === 'HOST' ? 'Bạn là Host' : 'Bạn là thành viên') : 'Host: Chưa có nhóm';
            const select = document.getElementById('squadGroupSelector');
            if (select) {
                select.innerHTML = userJoinedGroups.map(g => `<option value="${Number(g.id)}">${escapeSquadHtml(g.name)} (${g.role})</option>`).join('') || '<option value="">Chưa có nhóm</option>';
                if (group) select.value = String(group.id);
            }
            renderSingleInviteCodeCard();
            renderHostMembersTable();
            initEqualSplitCheckboxes();
            renderItemizedRows();
            renderCustomSplitMembers();
            recalculateHostInvoicePreview();
            renderHostFundLedger();
            renderHostDebtsTable();
        }

        function switchHostTab(tab) {
            ['members', 'invoice', 'fund', 'debts'].forEach(t => {
                document.getElementById(`hTabContent-${t}`).classList.add('hidden');
                const btn = document.getElementById(`hTabBtn-${t}`);
                btn.className = "px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm text-ink hover:bg-lime/40 flex items-center gap-2";
            });
            document.getElementById(`hTabContent-${tab}`).classList.remove('hidden');
            const activeBtn = document.getElementById(`hTabBtn-${tab}`);
            activeBtn.className = "px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm bg-indigo text-white border-2 border-ink shadow-bold-sm flex items-center gap-2";
        }

        // FR-HOST-001: Create Group (Auto-assign 1 unique group code)
        async function submitHostCreateGroup(e) {
            e.preventDefault();
            const name = document.getElementById('newGroupNameInput').value.trim();
            const description = document.getElementById('newGroupDescInput')?.value.trim() || '';
            if (!name) return;
            try {
                const created = await squadApi('/api/groups/', {method:'POST', body:{name, description}});
                await refreshServerGroups(created.id);
                renderHostWorkspace();
                closeModal('modalHostCreateGroup');
                notify('Tạo nhóm thành công và đã lưu vào database.');
            } catch(err) { notify('Tạo nhóm thất bại: ' + err.message); }
        }

        // FR-HOST-002: Single Invite Code Per Group
        function renderSingleInviteCodeCard() {
            const codeEl = document.getElementById('hostSingleGroupCode');
            if (codeEl) {
                codeEl.textContent = currentGroupSingleCode ? '#' + currentGroupSingleCode : 'Chưa có nhóm';
            }
        }

        function copySingleGroupCode() {
            const temp = document.createElement('textarea');
            temp.value = currentGroupSingleCode;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            notify(currentGroupSingleCode ? 'Đã sao chép mã nhóm.' : 'Chưa có mã nhóm để sao chép.');
        }

        function copySingleGroupLink() {
            notify('Chưa triển khai link mời theo tên miền. Vui lòng gửi mã nhóm cho người nhận.');
        }

        function regenerateSingleGroupCode() {
            notify('Đổi mã mời cần endpoint backend tương ứng; không thể tự đổi mã phía trình duyệt.');
        }

        function renderHostMembersTable() {
            const tbody = document.getElementById('hostMembersTableBody');
            const countTitle = document.getElementById('hostMemberCountTitle');
            if (countTitle) countTitle.textContent = `Danh sách Thành viên trong nhóm (${groupMembers.length})`;

            tbody.innerHTML = groupMembers.map(m => `
                <tr>
                    <td class="py-3 px-4">
                        <div class="font-bold text-ink flex items-center gap-1.5">
                            <span>${escapeSquadHtml(m.name)}</span>
                            ${m.role === 'Host' ? '<span title="Chủ nhóm hiện tại">👑</span>' : ''}
                        </div>
                        <div class="font-mono text-xs text-muted">${escapeSquadHtml(m.handle)} (${m.id})</div>
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

        function handleDirectInviteMember(e) {
            e.preventDefault();
            notify('Chưa có API mời trực tiếp theo email. Hãy gửi mã nhóm để thành viên tự tham gia.');
        }

        // FR-HOST-003: Invoice Equal & Itemized Split
        function initEqualSplitCheckboxes() {
            const container = document.getElementById('equalMembersCheckboxes');
            container.innerHTML = groupMembers.map(m => `
                <label class="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-line cursor-pointer text-xs font-semibold">
                    <input type="checkbox" data-user-id="${Number(m.id)}" value="${escapeSquadHtml(m.name)}" checked onchange="recalculateHostInvoicePreview()" class="equal-member-cb accent-indigo w-4 h-4">
                    <span class="truncate">${escapeSquadHtml(m.name)}</span>
                </label>
            `).join('');
        }

        function setInvoiceSplitMode(mode) {
            if (!['equal','itemized','custom'].includes(mode)) return;
            currentSplitMode = mode;
            for (const key of ['equal','itemized','custom']) {
                const section = document.getElementById('invoice' + key[0].toUpperCase() + key.slice(1) + 'Section');
                const btn = document.getElementById('splitModeBtn-' + key);
                section?.classList.toggle('hidden', key !== mode);
                if (btn) btn.className = key === mode
                    ? 'p-3.5 rounded-xl border-[1.5px] border-ink bg-lime/40 font-display font-bold text-sm text-left flex items-center justify-between text-ink'
                    : 'p-3.5 rounded-xl border-[1.5px] border-line bg-white font-display font-bold text-sm text-left flex items-center justify-between text-muted';
            }
            if (mode === 'custom') renderCustomSplitMembers();
            recalculateHostInvoicePreview();
        }

        function renderCustomSplitMembers() {
            const container = document.getElementById('invoiceCustomMembers');
            if (!container) return;
            // Preserve user-entered amounts on routine UI refresh.
            const previous = new Map(Array.from(container.querySelectorAll('.custom-member-amount')).map(el => [el.dataset.userId, el.value]));
            container.innerHTML = groupMembers.map(m => `
                <label class="flex items-center justify-between gap-3 bg-white border border-line rounded-xl px-3 py-2">
                    <span class="text-xs font-bold">${escapeSquadHtml(m.name)}</span>
                    <input class="custom-member-amount input-clean px-3 py-2 w-36 text-right font-mono text-sm" type="number" min="0" step="1"
                        data-user-id="${Number(m.id)}" value="${escapeSquadHtml(previous.get(String(m.id)) || '0')}"
                        oninput="recalculateHostInvoicePreview()" aria-label="Số tiền ${escapeSquadHtml(m.name)}">
                </label>`).join('');
        }

        function renderItemizedRows() {
            const container = document.getElementById('invoiceItemsContainer');
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
                name: '',
                qty: 1,
                price: 0,
                consumers: groupMembers.slice(0, 2).map(m => m.name)
            });
            renderItemizedRows();
            recalculateHostInvoicePreview();
        }

        let latestAllocationMap = {};
        function splitVndAcross(total, ids) {
            const amounts = {};
            if (!ids.length) return amounts;
            const base = Math.floor(total / ids.length);
            let remainder = total - base * ids.length;
            ids.forEach((id, i) => { amounts[id] = base + (i < remainder ? 1 : 0); });
            return amounts;
        }
        function recalculateHostInvoicePreview() {
            const fee = Math.max(0, Number(document.getElementById('invFeeTip').value) || 0);
            const discount = Math.max(0, Number(document.getElementById('invDiscount').value) || 0);
            let subtotal = 0;
            latestAllocationMap = {};
            if (currentSplitMode === 'equal') {
                subtotal = Math.max(0, Number(document.getElementById('invEqualBaseAmount').value) || 0);
                const users = Array.from(document.querySelectorAll('.equal-member-cb:checked')).map(cb => Number(cb.dataset.userId));
                latestAllocationMap = splitVndAcross(Math.max(0, subtotal + fee - discount), users);
            } else if (currentSplitMode === 'itemized') {
                for (const row of itemizedRows) {
                    const total = Number(row.qty) * Number(row.price);
                    subtotal += total;
                    const ids = [...new Set(row.consumers.map(name => groupMembers.find(m => m.name === name)?.id).filter(Boolean))];
                    const allocations = splitVndAcross(total, ids);
                    for (const [id, amount] of Object.entries(allocations)) latestAllocationMap[id] = (latestAllocationMap[id] || 0) + amount;
                }
                // Assign service fees and discounts consistently with the API by equal VND distribution.
                const users = Object.keys(latestAllocationMap);
                if (users.length) {
                    const additions = splitVndAcross(fee, users);
                    const reductions = splitVndAcross(discount, users);
                    users.forEach(id => latestAllocationMap[id] += additions[id] - reductions[id]);
                }
            } else {
                subtotal = Math.max(0, Number(document.getElementById('invCustomBaseAmount').value) || 0);
                document.querySelectorAll('.custom-member-amount').forEach(el => {
                    const amount = Number(el.value) || 0;
                    if (Number.isSafeInteger(amount) && amount >= 0) latestAllocationMap[Number(el.dataset.userId)] = amount;
                });
                const diff = subtotal + fee - discount - Object.values(latestAllocationMap).reduce((a,b) => a+b, 0);
                const element = document.getElementById('invoiceCustomDifference');
                if (element) {
                    element.textContent = diff === 0 ? '✓ Tổng phân bổ đã khớp hóa đơn' : 'Chênh lệch cần điều chỉnh: ' + formatVND(diff);
                    element.className = 'text-xs font-semibold ' + (diff === 0 ? 'text-emerald-700' : 'text-rose-600');
                }
            }
            const total = subtotal + fee - discount;
            document.getElementById('previewSubtotal').textContent = formatVND(subtotal);
            document.getElementById('previewFee').textContent = '+' + formatVND(fee);
            document.getElementById('previewDiscount').textContent = '-' + formatVND(discount);
            document.getElementById('previewGrandTotal').textContent = formatVND(total);
            const list = document.getElementById('invoiceAllocationPreviewList');
            const entries = Object.entries(latestAllocationMap);
            list.innerHTML = entries.length ? entries.map(([id, amount]) => {
                const member = groupMembers.find(m => String(m.id) === String(id));
                return `<div class="p-3 rounded-xl border border-line bg-canvas flex items-center justify-between"><span class="font-semibold text-xs text-ink">${escapeSquadHtml(member?.name || ('#'+id))}</span><span class="font-mono font-bold text-sm text-indigo">${formatVND(amount)}</span></div>`;
            }).join('') : '<div class="p-4 text-xs text-rose-600 font-semibold">Chọn thành viên hoặc thêm món để xem phân bổ.</div>';
        }

        async function saveHostInvoice() {
            try {
                const group = requireActiveHostGroup();
                const title = document.getElementById('invMerchantName').value.trim();
                if (!title) throw new Error('Nhập tên hóa đơn.');
                const fee = Number(document.getElementById('invFeeTip').value || 0);
                const discount = Number(document.getElementById('invDiscount').value || 0);
                const subtotal = currentSplitMode === 'equal' ? Number(document.getElementById('invEqualBaseAmount').value)
                    : currentSplitMode === 'custom' ? Number(document.getElementById('invCustomBaseAmount').value)
                    : itemizedRows.reduce((s, r) => s + Number(r.qty) * Number(r.price), 0);
                const total_amount = subtotal + fee - discount;
                if (![fee, discount, subtotal, total_amount].every(Number.isSafeInteger) || fee < 0 || discount < 0 || subtotal < 0 || total_amount <= 0)
                    throw new Error('Tiền phải là số nguyên VND và tổng hóa đơn phải lớn hơn 0.');
                const paid_by = Number(squadSession.accountId);
                const payload = {group_id: group.id, title, paid_by, split_type: currentSplitMode.toUpperCase(), total_amount, service_fee:fee, discount};
                if (currentSplitMode === 'equal') {
                    payload.participant_ids = Array.from(document.querySelectorAll('.equal-member-cb:checked')).map(el => Number(el.dataset.userId));
                    if (!payload.participant_ids.length) throw new Error('Chọn ít nhất một thành viên.');
                } else if (currentSplitMode === 'itemized') {
                    if (!itemizedRows.length) throw new Error('Thêm ít nhất một món.');
                    payload.items = itemizedRows.map(r => ({
                        name:r.name.trim(), quantity:Number(r.qty), unit_price:Number(r.price),
                        consumer_user_ids:[...new Set(r.consumers.map(name => groupMembers.find(m => m.name === name)?.id).filter(Boolean))]
                    }));
                    if (payload.items.some(r => !r.name || !Number.isSafeInteger(r.quantity) || r.quantity <= 0 || !Number.isSafeInteger(r.unit_price) || r.unit_price <= 0 || !r.consumer_user_ids.length))
                        throw new Error('Kiểm tra tên món, số lượng, giá và người sử dụng từng món.');
                } else {
                    payload.shares = Array.from(document.querySelectorAll('.custom-member-amount')).map(el => ({member_id:Number(el.dataset.userId), amount:Number(el.value)}));
                    if (!payload.shares.length || payload.shares.some(s => !Number.isSafeInteger(s.amount) || s.amount < 0)) throw new Error('Số tiền chia tùy chỉnh không hợp lệ.');
                    if (payload.shares.reduce((n, s) => n + s.amount, 0) !== total_amount) throw new Error('Tổng số tiền chia phải bằng tổng hóa đơn.');
                }
                const date = document.getElementById('invDate').value;
                if (date) payload.bill_date = new Date(date + 'T12:00:00').toISOString();
                const result = await squadApi("/api/bills/create-split", {
                    method: "POST",
                    body: payload
                });
                // Chỉ reset khi Backend xác nhận lưu thành công
                resetHostInvoiceForm();
                // Tải lại dữ liệu nhóm và công nợ từ Backend
                await selectSquadGroup(group.id);
                notify("Đã lưu hóa đơn #" + result.id + " vào MySQL.");
                // Chuyển sang trang công nợ
                switchHostTab("debts");
                return true;
            } catch (err) { notify('Không thể lưu hóa đơn: ' + err.message); return false; }
        }

        // FR-HOST-004: Group Fund Ledger
        function renderHostFundLedger() {
            let sumIn = 0, sumOut = 0;
            const tbody = document.getElementById('hostFundLedgerBody');
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
                            <div class="font-semibold text-ink">${escapeSquadHtml(tx.desc)}</div>
                            <div class="text-xs text-muted">${escapeSquadHtml(tx.method)}</div>
                        </td>
                        <td class="py-3 px-4 font-mono text-xs text-muted">${tx.time}<br/>${escapeSquadHtml(tx.author)}</td>
                        <td class="py-3 px-4 text-right font-mono font-bold ${tx.type === 'in' ? 'text-emerald-700' : 'text-rose-600'}">
                            ${tx.type === 'in' ? '+' : '-'}${formatVND(tx.amount)}
                        </td>
                    </tr>
                `;
            }).join('');

            document.getElementById('hostFundBalanceDisplay').textContent = formatVND(selectedSquadGroup()?.balance || 0);
        }

        async function handleRecordFundTx(e) {
            e.preventDefault();
            try {
                const group = requireActiveHostGroup();
                const type = document.querySelector('input[name="txType"]:checked')?.value === 'out' ? 'EXPENSE' : 'INCOME';
                const amount = Number(document.getElementById('fundTxAmount').value);
                if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Số tiền phải là số VND nguyên dương.');
                const category = document.getElementById('fundTxMethod').value;
                const description = document.getElementById('fundTxDesc').value.trim();
                await squadApi('/api/groups/'+group.id+'/fund-transactions', {
                    method:'POST',body:{type,amount,category,description,payer_id:Number(squadSession.accountId)}
                });
                await selectSquadGroup(group.id);
                document.getElementById('fundTxDesc').value = '';
                notify('Đã ghi giao dịch vào MySQL, số dư quỹ được tải lại từ API.');
                return true;
            } catch(err) {
                notify('Ghi giao dịch thất bại: '+err.message);
                return false;
            }
        }

        // FR-HOST-005 & 006: Debts & Reconcile Payment
        function renderHostDebtsTable() {
            const filter = document.getElementById('hostDebtFilter').value;
            const tbody = document.getElementById('hostDebtsTableBody');

            const filtered = groupDebts.filter(d => {
                const rem = d.total - d.paid;
                if (filter === 'fund') return d.type === 'fund' && rem > 0;
                if (filter === 'invoice') return d.type === 'invoice' && rem > 0;
                if (filter === 'disputed') return d.disputed === true;
                if (filter === 'paid') return rem <= 0;
                return true;
            });

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
                        <td class="py-3.5 px-4 font-bold text-ink">${escapeSquadHtml(d.memberName)}</td>
                        <td class="py-3.5 px-4">
                            <span class="font-mono text-[11px] bg-canvas px-2 py-0.5 rounded border border-ink/15 mr-1">${d.typeLabel}</span>
                            <span class="font-medium">${escapeSquadHtml(d.desc)}</span>
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

        function copyDebtReminder(member, amount, desc) {
            const text = `[SQUAD.CASH] Nhắc nhẹ ${member}: Bạn còn khoản cần thanh toán ${formatVND(amount)} cho "${desc}".`;
            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            notify(`Đã sao chép nội dung nhắc nợ cho ${member} (Lưu ý SRS: Nhắc nợ không tự tính là đã trả).`);
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
            notify('Chưa thể xác nhận thanh toán trực tiếp: Backend yêu cầu phiếu thanh toán PENDING. Không cập nhật công nợ giả.');
        }

function resetHostInvoiceForm() {
    // Xóa tên quán
    const merchant = document.getElementById("invMerchantName");
    if (merchant) merchant.value = "";

    // Xóa số tiền chia đều
    const equalAmount = document.getElementById("invEqualBaseAmount");
    if (equalAmount) equalAmount.value = "";

    // Xóa số tiền chia tùy chỉnh
    const customAmount = document.getElementById("invCustomBaseAmount");
    if (customAmount) customAmount.value = "";

    // Xóa phí dịch vụ và giảm giá
    const fee = document.getElementById("invFeeTip");
    const discount = document.getElementById("invDiscount");

    if (fee) fee.value = "0";
    if (discount) discount.value = "0";

    // Đưa ngày về ngày hiện tại theo giờ địa phương
    const date = document.getElementById("invDate");

    if (date) {
        const now = new Date();
        const local = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        );
        date.value = local.toISOString().slice(0, 10);
    }

    // Xóa danh sách món đã nhập
    if (typeof itemizedRows !== "undefined") {
        itemizedRows.length = 0;
    }

    // Xóa các khoản tiền chia tùy chỉnh
    document.querySelectorAll(".custom-member-amount")
        .forEach(input => input.value = "0");

    // Chọn lại tất cả thành viên theo mặc định
    document.querySelectorAll(".equal-member-cb")
        .forEach(input => input.checked = true);

    // Xóa dữ liệu phân bổ cũ
    latestAllocationMap = {};

    // Chuyển về chế độ chia đều
    setInvoiceSplitMode("equal");

    // Làm mới giao diện và bản xem trước
    if (typeof renderItemizedRows === "function") {
        renderItemizedRows();
    }

    recalculateHostInvoicePreview();
}
