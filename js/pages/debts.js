// js/pages/debts.js — Trang Công nợ của tôi (T3CD249)

const myGroupDebts = [
    {
        id: 'DBT-901',
        groupId: 'GRP-101',
        groupName: 'Chuyến Đi Đà Lạt Quý 4',
        groupCode: '#GRP-101',
        direction: 'payable', // payable = Tôi nợ | receivable = Tôi được nợ
        typeLabel: 'Đóng quỹ',
        desc: 'Đóng quỹ Đà Lạt đợt 2',
        total: 1000000,
        paid: 600000,
        recipientName: 'Phan Đức Anh',
        bankCode: 'VCB',
        accountNumber: '1029384756',
        proofStatus: 'none', // none | pending_review
        proofImageUrl: '',
        proofNote: '',
    },
    {
        id: 'DBT-902',
        groupId: 'GRP-101',
        groupName: 'Chuyến Đi Đà Lạt Quý 4',
        groupCode: '#GRP-101',
        direction: 'payable',
        typeLabel: 'Hóa đơn',
        desc: 'Hóa đơn BBQ Tối Thứ 7 (#INV-202)',
        total: 250000,
        paid: 250000,
        recipientName: 'Phan Đức Anh',
        bankCode: 'VCB',
        accountNumber: '1029384756',
        proofStatus: 'none',
        proofImageUrl: '',
        proofNote: '',
    },
    {
        id: 'DBT-903',
        groupId: 'GRP-101',
        groupName: 'Chuyến Đi Đà Lạt Quý 4',
        groupCode: '#GRP-101',
        direction: 'receivable',
        typeLabel: 'Khoản điều chỉnh',
        desc: 'Hoàn tiền dư mua nước suối',
        total: 150000,
        paid: 0,
        recipientName: 'Quỹ nhóm #GRP-101',
        bankCode: 'MB',
        accountNumber: '098765432100',
        proofStatus: 'none',
        proofImageUrl: '',
        proofNote: '',
    },
    {
        id: 'DBT-904',
        groupId: 'GRP-102',
        groupName: 'Team Dự Án Web Sprint 2',
        groupCode: '#GRP-102',
        direction: 'payable',
        typeLabel: 'Hóa đơn',
        desc: 'Hóa đơn Thuê Xe Limousine (#INV-201)',
        total: 550000,
        paid: 0,
        recipientName: 'Trần Khánh Vy',
        bankCode: 'TCB',
        accountNumber: '19036889922011',
        proofStatus: 'none',
        proofImageUrl: '',
        proofNote: '',
    },
    {
        id: 'DBT-905',
        groupId: 'GRP-102',
        groupName: 'Team Dự Án Web Sprint 2',
        groupCode: '#GRP-102',
        direction: 'receivable',
        typeLabel: 'Ứng trước hóa đơn',
        desc: 'Ứng tiền đặt cọc phòng họp (#INV-199)',
        total: 480000,
        paid: 0,
        recipientName: 'Trần Khánh Vy',
        bankCode: 'MB',
        accountNumber: '098765432100',
        proofStatus: 'none',
        proofImageUrl: '',
        proofNote: '',
    },
];

let activeDebtItem = null;
let uploadedReceiptDataUrl = '';

function safeText(str) {
    if (typeof escapeHtml === 'function') return escapeHtml(str);
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatMoneyCell(amount) {
    const n = Number(amount) || 0;
    return `${n.toLocaleString('en-US')}<br /><span class="text-[11px]">đ</span>`;
}

function formatPlainMoney(amount) {
    const n = Number(amount) || 0;
    return `${n.toLocaleString('en-US')} đ`;
}

function openModal(id) {
    document.getElementById(id)?.classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id)?.classList.add('hidden');
}

function notify(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'pointer-events-auto card-clean bg-ink text-white px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-xs font-medium shadow-bold-md';
    el.innerHTML = `<span>${safeText(msg)}</span><button type="button" onclick="this.parentElement.remove()" class="font-mono font-bold text-[10px] bg-amber text-ink border border-white px-2 py-0.5 rounded shrink-0 cursor-pointer">ĐÓNG</button>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function copyAccountNumber(accountNumber, bankCode, recipientName) {
    const text = String(accountNumber || '');
    if (!text) return;
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => { });
    } else {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
    }
    notify(`Đã sao chép STK ${text} (${bankCode} - ${recipientName})`);
}

function updateSummaryKpis(visibleDebts) {
    let totalIOwe = 0;
    let countIOwe = 0;
    let totalOwedToMe = 0;
    let countOwedToMe = 0;

    visibleDebts.forEach((d) => {
        const rem = Math.max(0, (Number(d.total) || 0) - (Number(d.paid) || 0));
        if (rem <= 0) return;
        if (d.direction === 'payable') {
            totalIOwe += rem;
            countIOwe += 1;
        } else {
            totalOwedToMe += rem;
            countOwedToMe += 1;
        }
    });

    const iOweEl = document.getElementById('kpiTotalIOwe');
    const iOweSubEl = document.getElementById('kpiIOweSub');
    const owedEl = document.getElementById('kpiTotalOwedToMe');
    const owedSubEl = document.getElementById('kpiOwedToMeSub');

    if (iOweEl) iOweEl.textContent = formatPlainMoney(totalIOwe);
    if (iOweSubEl) iOweSubEl.textContent = `${countIOwe} khoản chưa thanh toán`;
    if (owedEl) owedEl.textContent = formatPlainMoney(totalOwedToMe);
    if (owedSubEl) owedSubEl.textContent = `${countOwedToMe} khoản chờ hoàn / nhận`;
}

function renderMyDebtsByGroup() {
    const container = document.getElementById('groupedDebtsContainer');
    if (!container) return;

    const groupFilter = document.getElementById('groupFilterSelect')?.value || 'all';
    const dirFilter = document.getElementById('directionFilterSelect')?.value || 'all';

    const filtered = myGroupDebts.filter((d) => {
        if (groupFilter !== 'all' && d.groupId !== groupFilter) return false;
        if (dirFilter !== 'all' && d.direction !== dirFilter) return false;
        return true;
    });

    updateSummaryKpis(filtered);

    if (filtered.length === 0) {
        container.innerHTML = `
      <div class="card-clean p-6 text-center text-xs text-muted bg-canvas">
        Không có khoản công nợ nào phù hợp với bộ lọc.
      </div>
    `;
        return;
    }

    const groupsMap = new Map();
    filtered.forEach((item) => {
        if (!groupsMap.has(item.groupId)) {
            groupsMap.set(item.groupId, {
                groupId: item.groupId,
                groupName: item.groupName,
                groupCode: item.groupCode,
                items: [],
            });
        }
        groupsMap.get(item.groupId).items.push(item);
    });

    container.innerHTML = Array.from(groupsMap.values())
        .map((grp) => {
            const grpPayable = grp.items
                .filter((i) => i.direction === 'payable')
                .reduce((s, i) => s + Math.max(0, (Number(i.total) || 0) - (Number(i.paid) || 0)), 0);
            const grpReceivable = grp.items
                .filter((i) => i.direction === 'receivable')
                .reduce((s, i) => s + Math.max(0, (Number(i.total) || 0) - (Number(i.paid) || 0)), 0);

            const rowsHtml = grp.items
                .map((d) => {
                    const rem = Math.max(0, (Number(d.total) || 0) - (Number(d.paid) || 0));
                    const isPayable = d.direction === 'payable';

                    const dirBadge = isPayable
                        ? `<span class="font-mono text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Tôi nợ</span>`
                        : `<span class="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Được nợ</span>`;

                    let statusHtml = '';
                    if (rem === 0) {
                        statusHtml = `<span class="font-mono text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full whitespace-nowrap">✓ Đã trả đủ</span>`;
                    } else if (d.proofStatus === 'pending_review') {
                        statusHtml = `<span class="font-mono text-xs font-bold bg-cyan/30 text-ink border border-ink px-2.5 py-1 rounded-full whitespace-nowrap">⏳ Chờ đối soát</span>`;
                    } else if (d.paid > 0) {
                        statusHtml = `<span class="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full whitespace-nowrap">Trả một phần</span>`;
                    } else {
                        statusHtml = `<span class="font-mono text-xs font-bold bg-rose-100 text-rose-500 px-2.5 py-1 rounded-full whitespace-nowrap">${isPayable ? 'Chưa trả' : 'Chờ nhận'}</span>`;
                    }

                    let actionHtml = '';
                    if (rem > 0 && isPayable) {
                        actionHtml = `
              <div class="inline-flex items-center gap-2">
                <button type="button" onclick="openMarkPaidModal('${safeText(d.id)}')" class="btn-cta-lime px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold leading-tight text-center">
                  ${d.proofStatus === 'pending_review' ? 'Sửa ảnh<br />minh chứng' : 'Tôi đã<br />trả'}
                </button>
                ${d.proofImageUrl
                                ? `<button type="button" onclick="openViewReceiptModal('${safeText(d.id)}')" class="btn-outline px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold">
                        🖼 Ảnh
                      </button>`
                                : ''
                            }
              </div>
            `;
                    } else if (rem > 0 && !isPayable) {
                        actionHtml = `<span class="font-mono text-xs text-emerald-700 font-bold">Khoản được nợ</span>`;
                    } else {
                        actionHtml = `<span class="font-mono text-xs text-muted">Đã đối soát</span>`;
                    }

                    return `
            <tr class="debt-row align-middle">
              <td class="py-3.5 px-3.5 font-mono text-xs font-bold">
                <div>${safeText(d.id)}</div>
                <div class="mt-1">${dirBadge}</div>
              </td>
              <td class="py-3.5 px-3.5 text-xs">
                <div class="font-semibold text-ink">${safeText(d.recipientName)}</div>
                <div class="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] text-indigo font-bold">
                  <span>${safeText(d.bankCode)} • ${safeText(d.accountNumber)}</span>
                  <button type="button" onclick="copyAccountNumber('${safeText(d.accountNumber)}', '${safeText(d.bankCode)}', '${safeText(d.recipientName)}')"
                    class="font-mono text-[10px] font-bold bg-white border border-ink px-1.5 py-0.5 rounded hover:bg-lime cursor-pointer">
                    Copy
                  </button>
                </div>
              </td>
              <td class="py-3.5 px-3.5">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="font-mono text-[11px] bg-canvas px-2 py-0.5 rounded border border-ink/20 shrink-0">${safeText(d.typeLabel)}</span>
                  <span class="font-medium text-xs text-ink">${safeText(d.desc)}</span>
                </div>
              </td>
              <td class="py-3.5 px-3.5 text-right font-mono text-xs">${formatMoneyCell(d.total)}</td>
              <td class="py-3.5 px-3.5 text-right font-mono text-xs text-emerald-600">${formatMoneyCell(d.paid)}</td>
              <td class="py-3.5 px-3.5 text-right font-mono text-xs font-bold ${rem > 0 ? (isPayable ? 'text-rose-500' : 'text-emerald-700') : 'text-muted'}">${formatMoneyCell(rem)}</td>
              <td class="py-3.5 px-3.5 text-center">${statusHtml}</td>
              <td class="py-3.5 px-3.5 text-right">${actionHtml}</td>
            </tr>
          `;
                })
                .join('');

            return `
        <div class="border-2 border-ink rounded-2xl overflow-hidden bg-white">
          <div class="bg-canvas px-4 py-3 border-b-2 border-ink flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold bg-lime border border-ink px-2 py-0.5 rounded">${safeText(grp.groupCode)}</span>
              <h2 class="font-display font-bold text-base text-ink">${safeText(grp.groupName)}</h2>
            </div>
            <div class="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span>Tôi nợ: <strong class="text-rose-600">${formatPlainMoney(grpPayable)}</strong></span>
              <span>Được nợ: <strong class="text-emerald-700">${formatPlainMoney(grpReceivable)}</strong></span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-ink/20 bg-white font-mono text-[11px] text-muted uppercase">
                  <th class="py-3 px-3.5">MÃ NỢ</th>
                  <th class="py-3 px-3.5">NGƯỜI NHẬN &amp; STK</th>
                  <th class="py-3 px-3.5">LOẠI &amp; NỘI DUNG</th>
                  <th class="py-3 px-3.5 text-right">PHẢI TRẢ</th>
                  <th class="py-3 px-3.5 text-right">ĐÃ TRẢ</th>
                  <th class="py-3 px-3.5 text-right">CÒN NỢ</th>
                  <th class="py-3 px-3.5 text-center">TRẠNG THÁI</th>
                  <th class="py-3 px-3.5 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink/15 text-sm">
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;
        })
        .join('');
}

function openMarkPaidModal(debtId) {
    const debt = myGroupDebts.find((d) => d.id === debtId);
    if (!debt) return;
    activeDebtItem = debt;

    const rem = Math.max(0, (Number(debt.total) || 0) - (Number(debt.paid) || 0));
    document.getElementById('payDebtId').value = debt.id;
    document.getElementById('payDebtTitle').textContent = `${debt.groupCode} • ${debt.desc}`;
    document.getElementById('payRecipientName').textContent = debt.recipientName;
    document.getElementById('payRecipientAccount').textContent = `${debt.bankCode} • ${debt.accountNumber}`;
    document.getElementById('payRemainingText').textContent = formatPlainMoney(rem);

    const fileInput = document.getElementById('receiptImageInput');
    if (fileInput) fileInput.value = '';
    uploadedReceiptDataUrl = debt.proofImageUrl || '';
    document.getElementById('payRefNote').value = debt.proofNote || '';

    const placeholder = document.getElementById('uploadPlaceholder');
    const previewWrap = document.getElementById('uploadPreviewWrap');
    const previewImg = document.getElementById('receiptPreviewImg');
    const fileNameEl = document.getElementById('receiptFileName');

    if (uploadedReceiptDataUrl) {
        placeholder?.classList.add('hidden');
        previewWrap?.classList.remove('hidden');
        if (previewImg) previewImg.src = uploadedReceiptDataUrl;
        if (fileNameEl) fileNameEl.textContent = 'anh-minh-chung.png';
    } else {
        placeholder?.classList.remove('hidden');
        previewWrap?.classList.add('hidden');
        if (previewImg) previewImg.src = '';
    }

    openModal('modalMarkPaid');
}

function copyModalRecipientAccount() {
    if (!activeDebtItem) return;
    copyAccountNumber(
        activeDebtItem.accountNumber,
        activeDebtItem.bankCode,
        activeDebtItem.recipientName
    );
}

function processReceiptFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        notify('Vui lòng chọn tệp ảnh (PNG, JPG, WEBP).');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        notify('Ảnh vượt quá dung lượng 5MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedReceiptDataUrl = e.target?.result || '';
        document.getElementById('uploadPlaceholder')?.classList.add('hidden');
        document.getElementById('uploadPreviewWrap')?.classList.remove('hidden');
        const previewImg = document.getElementById('receiptPreviewImg');
        const fileNameEl = document.getElementById('receiptFileName');
        if (previewImg) previewImg.src = uploadedReceiptDataUrl;
        if (fileNameEl) fileNameEl.textContent = file.name;
    };
    reader.readAsDataURL(file);
}

function handleReceiptFileChange(event) {
    processReceiptFile(event.target?.files?.[0]);
}

function setupReceiptDragAndDrop() {
    const dropzone = document.getElementById('receiptDropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file) processReceiptFile(file);
    });
}

function submitMarkPaidForm(e) {
    e.preventDefault();
    if (!activeDebtItem) return;

    if (!uploadedReceiptDataUrl) {
        notify('Vui lòng tải lên ảnh minh chứng trước khi xác nhận "Tôi đã trả".');
        return;
    }

    const note = document.getElementById('payRefNote')?.value.trim() || '';
    activeDebtItem.proofStatus = 'pending_review';
    activeDebtItem.proofImageUrl = uploadedReceiptDataUrl;
    activeDebtItem.proofNote = note || 'Đã gửi ảnh minh chứng chuyển khoản.';

    closeModal('modalMarkPaid');
    renderMyDebtsByGroup();
    notify(`Đã gửi xác nhận "Tôi đã trả" kèm ảnh cho khoản ${activeDebtItem.id}.`);
}

function openViewReceiptModal(debtId) {
    const debt = myGroupDebts.find((d) => d.id === debtId);
    if (!debt || !debt.proofImageUrl) return;

    document.getElementById('viewReceiptTitle').textContent = `Minh chứng • ${debt.id}`;
    document.getElementById('viewReceiptImg').src = debt.proofImageUrl;
    document.getElementById('viewReceiptNote').textContent = `Ghi chú: ${debt.proofNote || 'Không có ghi chú'}`;
    openModal('modalViewReceipt');
}

document.addEventListener('DOMContentLoaded', () => {
    setupReceiptDragAndDrop();
    renderMyDebtsByGroup();
});