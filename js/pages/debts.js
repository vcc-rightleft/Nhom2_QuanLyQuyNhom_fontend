// js/pages/debts.js — Tab Công nợ của nhóm cho Host (T3CD263)

const groupDebts = [
    {
        id: 'DBT-901',
        memberName: 'Lê Quang Minh',
        type: 'fund',
        typeLabel: 'Đóng quỹ',
        desc: 'Đóng quỹ Đà Lạt đợt 2',
        total: 1000000,
        paid: 600000,
        pendingApproval: false,
        claimedAmount: 0,
        refCode: '',
        disputed: false,
        rejectReason: '',
        reminded: true,
        remindCount: 2,
    },
    {
        id: 'DBT-902',
        memberName: 'Lê Quang Minh',
        type: 'invoice',
        typeLabel: 'Hóa đơn',
        desc: 'Hóa đơn BBQ Tối Thứ 7 (#INV-202)',
        total: 250000,
        paid: 0,
        pendingApproval: true,
        claimedAmount: 250000,
        refCode: 'VCB-882190',
        disputed: false,
        rejectReason: '',
        reminded: false,
        remindCount: 0,
    },
    {
        id: 'DBT-903',
        memberName: 'Lê Quang Minh',
        type: 'adjustment',
        typeLabel: 'Khoản điều chỉnh',
        desc: 'Hoàn tiền dư mua nước suối',
        total: 150000,
        paid: 150000,
        pendingApproval: false,
        claimedAmount: 0,
        refCode: '',
        disputed: false,
        rejectReason: '',
        reminded: false,
        remindCount: 0,
    },
    {
        id: 'DBT-904',
        memberName: 'Trần Khánh Vy',
        type: 'invoice',
        typeLabel: 'Hóa đơn',
        desc: 'Hóa đơn Thuê Xe Limousine (#INV-201)',
        total: 550000,
        paid: 0,
        pendingApproval: true,
        claimedAmount: 550000,
        refCode: 'MB-440192',
        disputed: false,
        rejectReason: '',
        reminded: false,
        remindCount: 0,
    },
    {
        id: 'DBT-905',
        memberName: 'Đặng Tuấn Kiệt',
        type: 'invoice',
        typeLabel: 'Hóa đơn',
        desc: 'Hóa đơn Hải Sản Đêm (#INV-199)',
        total: 480000,
        paid: 0,
        pendingApproval: false,
        claimedAmount: 0,
        refCode: '',
        disputed: true,
        rejectReason: '',
        reminded: false,
        remindCount: 0,
    },
];

function escapeText(str) {
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
    el.innerHTML = `<span>${escapeText(msg)}</span><button type="button" onclick="this.parentElement.remove()" class="font-mono font-bold text-[10px] bg-amber text-ink border border-white px-2 py-0.5 rounded shrink-0 cursor-pointer">ĐÓNG</button>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
}

function updateProgress() {
    const totalAll = groupDebts.reduce((s, d) => s + d.total, 0);
    const paidAll = groupDebts.reduce((s, d) => s + d.paid, 0);
    const pct = totalAll > 0 ? Math.min(100, Math.round((paidAll / totalAll) * 100)) : 0;

    const label = document.getElementById('hostDebtProgressLabel');
    const bar = document.getElementById('hostDebtProgressBar');
    if (label) {
        label.textContent = `${pct}% Đã thu (${formatPlainMoney(paidAll)} / ${formatPlainMoney(totalAll)})`;
    }
    if (bar) {
        bar.style.width = `${pct}%`;
    }
}

function renderPendingApprovals() {
    const listEl = document.getElementById('pendingApprovalsList');
    const badgeEl = document.getElementById('pendingApprovalCountBadge');
    if (!listEl) return;

    const pendingItems = groupDebts.filter((d) => d.pendingApproval && (d.total - d.paid) > 0);
    if (badgeEl) {
        badgeEl.textContent = `${pendingItems.length} chờ duyệt`;
    }

    if (pendingItems.length === 0) {
        listEl.innerHTML = `
      <div class="rounded-xl bg-canvas border border-ink/20 px-4 py-3 text-xs text-muted font-mono">
        Không có thanh toán nào đang chờ xác nhận.
      </div>
    `;
        return;
    }

    listEl.innerHTML = pendingItems
        .map((d) => {
            const amt = d.claimedAmount || Math.max(0, d.total - d.paid);
            return `
        <div class="debt-row rounded-2xl border-2 border-ink bg-canvas/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1 text-xs">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono font-bold text-ink">${escapeText(d.id)}</span>
              <span class="font-bold text-ink">${escapeText(d.memberName)}</span>
              <span class="font-mono text-[11px] bg-white border border-ink/25 px-2 py-0.5 rounded">${escapeText(d.desc)}</span>
            </div>
            <div class="font-mono text-[11px] text-muted">
              Báo trả: <strong class="text-emerald-700">${formatPlainMoney(amt)}</strong>
              ${d.refCode ? ` • Mã GD: <strong class="text-ink">${escapeText(d.refCode)}</strong>` : ''}
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button type="button" onclick="openConfirmPaymentModal('${escapeText(d.id)}')" class="btn-cta-lime px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold">
              ✓ Xác nhận
            </button>
            <button type="button" onclick="openRejectPaymentModal('${escapeText(d.id)}')" class="btn-reject px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold">
              ✕ Từ chối
            </button>
          </div>
        </div>
      `;
        })
        .join('');
}

function renderHostDebtsTable() {
    renderPendingApprovals();

    const memberFilter = document.getElementById('hostMemberFilter')?.value || 'all';
    const filter = document.getElementById('hostDebtFilter')?.value || 'all';
    const tbody = document.getElementById('hostDebtsTableBody');
    if (!tbody) return;

    const filtered = groupDebts.filter((d) => {
        if (memberFilter !== 'all' && d.memberName !== memberFilter) return false;
        const rem = d.total - d.paid;
        if (filter === 'pending_review') return d.pendingApproval === true && rem > 0;
        if (filter === 'fund') return d.type === 'fund' && rem > 0;
        if (filter === 'invoice') return d.type === 'invoice' && rem > 0;
        if (filter === 'disputed') return d.disputed === true;
        if (filter === 'paid') return rem <= 0;
        return true;
    });

    tbody.innerHTML = filtered
        .map((d) => {
            const rem = Math.max(0, d.total - d.paid);
            let statusHtml = '';
            if (rem === 0) {
                statusHtml = `<span class="font-mono text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full whitespace-nowrap">✓ Đã trả đủ</span>`;
            } else if (d.pendingApproval) {
                statusHtml = `<span class="font-mono text-xs font-bold bg-cyan/30 text-ink border border-ink px-2.5 py-1 rounded-full whitespace-nowrap">⏳ Chờ xác nhận</span>`;
            } else if (d.disputed) {
                statusHtml = `<span class="font-mono text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full whitespace-nowrap">⚠ Đang tranh chấp</span>`;
            } else if (d.paid > 0) {
                statusHtml = `<span class="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full whitespace-nowrap">Trả một phần</span>`;
            } else {
                statusHtml = `<span class="font-mono text-xs font-bold bg-rose-100 text-rose-500 px-2.5 py-1 rounded-full whitespace-nowrap">Chưa trả</span>`;
            }

            const reasonNote = d.rejectReason && rem > 0 && !d.pendingApproval
                ? `<div class="mt-1 font-mono text-[11px] text-rose-600">Lý do từ chối: ${escapeText(d.rejectReason)}</div>`
                : '';

            const actionHtml = rem > 0
                ? `<div class="inline-flex flex-wrap justify-end items-center gap-1.5">
            ${d.pendingApproval
                    ? `<button type="button" onclick="openRejectPaymentModal('${escapeText(d.id)}')" class="btn-reject px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold leading-tight text-center">
                    Từ chối
                  </button>`
                    : `<button type="button" onclick="sendHostDebtReminder('${escapeText(d.id)}')" class="${d.reminded ? 'bg-amber text-ink border-2 border-ink shadow-clean' : 'btn-outline'} px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold leading-tight text-center">
                    ${d.reminded ? '🔔 Đã nhắc<br />(' + (d.remindCount || 1) + ')' : '🔔 Nhắc<br />nợ'}
                  </button>`
                }
            <button type="button" onclick="openConfirmPaymentModal('${escapeText(d.id)}')" class="btn-cta-lime px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold leading-tight text-center">
              Xác nhận<br />trả
            </button>
          </div>`
                : `<span class="font-mono text-xs text-muted">Đã đối soát</span>`;

            return `
        <tr class="debt-row align-middle">
          <td class="py-3.5 px-3.5 font-mono text-xs font-bold">${escapeText(d.id)}</td>
          <td class="py-3.5 px-3.5 font-semibold text-xs text-ink">${escapeText(d.memberName)}</td>
          <td class="py-3.5 px-3.5">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="font-mono text-[11px] bg-canvas px-2 py-0.5 rounded border border-ink/20 shrink-0">${escapeText(d.typeLabel)}</span>
              <span class="font-medium text-xs text-ink">${escapeText(d.desc)}</span>
            </div>
            ${reasonNote}
          </td>
          <td class="py-3.5 px-3.5 text-right font-mono text-xs">${formatMoneyCell(d.total)}</td>
          <td class="py-3.5 px-3.5 text-right font-mono text-xs text-emerald-600">${formatMoneyCell(d.paid)}</td>
          <td class="py-3.5 px-3.5 text-right font-mono text-xs font-bold ${rem > 0 ? 'text-rose-500' : 'text-muted'}">${formatMoneyCell(rem)}</td>
          <td class="py-3.5 px-3.5 text-center">${statusHtml}</td>
          <td class="py-3.5 px-3.5 text-right">${actionHtml}</td>
        </tr>
      `;
        })
        .join('');

    updateProgress();
}

function sendHostDebtReminder(debtId) {
    const d = groupDebts.find((item) => item.id === debtId);
    if (!d) return;
    const rem = Math.max(0, d.total - d.paid);
    d.reminded = true;
    d.remindCount = (d.remindCount || 0) + 1;
    renderHostDebtsTable();
    notify(`Đã nhắc nợ ${d.memberName} (${formatPlainMoney(rem)}) cho khoản ${d.id}.`);
}

function openConfirmPaymentModal(debtId) {
    const d = groupDebts.find((item) => item.id === debtId);
    if (!d) return;
    const rem = Math.max(0, d.total - d.paid);
    document.getElementById('payDebtId').value = d.id;
    document.getElementById('payMemberName').textContent = d.memberName;
    document.getElementById('payDebtTitle').textContent = d.desc;
    document.getElementById('payRemainingText').textContent = formatPlainMoney(rem);
    document.getElementById('payReceivedAmount').value = d.pendingApproval && d.claimedAmount ? Math.min(rem, d.claimedAmount) : rem;
    if (d.refCode) {
        document.getElementById('payRefNote').value = d.refCode;
    }
    openModal('modalConfirmPayment');
}

function submitConfirmPayment(e) {
    e.preventDefault();
    const debtId = document.getElementById('payDebtId').value;
    const received = parseInt(document.getElementById('payReceivedAmount').value, 10) || 0;
    const d = groupDebts.find((item) => item.id === debtId);
    if (!d) return;

    const rem = d.total - d.paid;
    d.pendingApproval = false;
    d.claimedAmount = 0;
    d.disputed = false;
    d.rejectReason = '';

    if (received > rem) {
        d.paid = d.total;
        notify(`Số tiền nhập lớn hơn số còn nợ (${formatPlainMoney(rem)}). Đã ghi nhận trả đủ.`);
    } else {
        d.paid += received;
        notify(`Đã xác nhận thanh toán ${formatPlainMoney(received)} cho ${d.memberName}.`);
    }

    closeModal('modalConfirmPayment');
    renderHostDebtsTable();
}

function syncRejectReasonInput() {
    const selectEl = document.getElementById('rejectReasonSelect');
    const detailEl = document.getElementById('rejectReasonDetail');
    if (!selectEl || !detailEl) return;
    if (selectEl.value !== 'Lý do khác') {
        detailEl.value = selectEl.value;
    } else {
        detailEl.value = '';
        detailEl.focus();
    }
}

function openRejectPaymentModal(debtId) {
    const d = groupDebts.find((item) => item.id === debtId);
    if (!d) return;
    document.getElementById('rejectDebtId').value = d.id;
    document.getElementById('rejectMemberName').textContent = d.memberName;
    document.getElementById('rejectDebtTitle').textContent = `${d.id} • ${d.desc}`;

    const selectEl = document.getElementById('rejectReasonSelect');
    if (selectEl) selectEl.value = 'Chưa nhận được tiền trên sao kê';
    syncRejectReasonInput();
    openModal('modalRejectPayment');
}

function submitRejectPayment(e) {
    e.preventDefault();
    const debtId = document.getElementById('rejectDebtId').value;
    const reason = (document.getElementById('rejectReasonDetail')?.value || '').trim();
    if (!reason) {
        notify('Vui lòng nhập lý do từ chối.');
        return;
    }

    const d = groupDebts.find((item) => item.id === debtId);
    if (!d) return;

    d.pendingApproval = false;
    d.claimedAmount = 0;
    d.rejectReason = reason;

    closeModal('modalRejectPayment');
    renderHostDebtsTable();
    notify(`Đã từ chối thanh toán khoản ${d.id} của ${d.memberName} (${reason}).`);
}

document.addEventListener('DOMContentLoaded', renderHostDebtsTable);