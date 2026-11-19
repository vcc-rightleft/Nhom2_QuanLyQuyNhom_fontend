// js/pages/debts.js

const groupDebts = [
    {
        id: 'DBT-901',
        memberName: 'Lê Quang Minh',
        type: 'fund',
        typeLabel: 'Đóng quỹ',
        desc: 'Đóng quỹ Đà Lạt đợt 2',
        total: 1000000,
        paid: 600000,
        disputed: false,
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
        paid: 250000,
        disputed: false,
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
        disputed: false,
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
        disputed: false,
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
        disputed: true,
        reminded: false,
        remindCount: 0,
    },
];

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
    el.innerHTML = `<span>${msg}</span><button type="button" onclick="this.parentElement.remove()" class="font-mono font-bold text-[10px] bg-amber text-ink border border-white px-2 py-0.5 rounded shrink-0 cursor-pointer">ĐÓNG</button>`;
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

function renderHostDebtsTable() {
    const filter = document.getElementById('hostDebtFilter')?.value || 'all';
    const tbody = document.getElementById('hostDebtsTableBody');
    if (!tbody) return;

    const filtered = groupDebts.filter((d) => {
        const rem = d.total - d.paid;
        if (filter === 'fund') return d.type === 'fund' && rem > 0;
        if (filter === 'invoice') return d.type === 'invoice' && rem > 0;
        if (filter === 'disputed') return d.disputed === true;
        if (filter === 'paid') return rem <= 0;
        return true;
    });

    tbody.innerHTML = filtered.map((d) => {
        const rem = Math.max(0, d.total - d.paid);
        let statusHtml = '';
        if (d.disputed) {
            statusHtml = `<span class="font-mono text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full whitespace-nowrap">⚠ Đang tranh chấp</span>`;
        } else if (rem === 0) {
            statusHtml = `<span class="font-mono text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full whitespace-nowrap">✓ Đã trả đủ</span>`;
        } else if (d.paid > 0) {
            statusHtml = `<span class="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full whitespace-nowrap">Trả một phần</span>`;
        } else {
            statusHtml = `<span class="font-mono text-xs font-bold bg-rose-100 text-rose-500 px-2.5 py-1 rounded-full whitespace-nowrap">Chưa trả</span>`;
        }

        const actionHtml = rem > 0
            ? `<div class="inline-flex items-center gap-2">
          <button type="button" onclick="sendHostDebtReminder('${d.id}')" class="${d.reminded ? 'bg-amber text-ink border-2 border-ink shadow-clean' : 'btn-outline'} px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold leading-tight text-center">
            ${d.reminded ? '🔔 Đã nhắc<br />(' + (d.remindCount || 1) + ')' : '🔔 Nhắc<br />nợ'}
          </button>
          <button type="button" onclick="openConfirmPaymentModal('${d.id}')" class="btn-cta-lime px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold leading-tight text-center">
            Xác nhận<br />trả
          </button>
        </div>`
            : `<span class="font-mono text-xs text-muted">Đã đối soát</span>`;

        return `
      <tr class="debt-row align-middle">
        <td class="py-3.5 px-3.5 font-mono text-xs font-bold">${d.id}</td>
        <td class="py-3.5 px-3.5 font-semibold text-xs text-ink">${d.memberName}</td>
        <td class="py-3.5 px-3.5">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="font-mono text-[11px] bg-canvas px-2 py-0.5 rounded border border-ink/20 shrink-0">${d.typeLabel}</span>
            <span class="font-medium text-xs text-ink">${d.desc}</span>
          </div>
        </td>
        <td class="py-3.5 px-3.5 text-right font-mono text-xs">${formatMoneyCell(d.total)}</td>
        <td class="py-3.5 px-3.5 text-right font-mono text-xs text-emerald-600">${formatMoneyCell(d.paid)}</td>
        <td class="py-3.5 px-3.5 text-right font-mono text-xs font-bold ${rem > 0 ? 'text-rose-500' : 'text-muted'}">${formatMoneyCell(rem)}</td>
        <td class="py-3.5 px-3.5 text-center">${statusHtml}</td>
        <td class="py-3.5 px-3.5 text-right">${actionHtml}</td>
      </tr>
    `;
    }).join('');

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
    document.getElementById('payReceivedAmount').value = rem;
    openModal('modalConfirmPayment');
}

function submitConfirmPayment(e) {
    e.preventDefault();
    const debtId = document.getElementById('payDebtId').value;
    const received = parseInt(document.getElementById('payReceivedAmount').value, 10) || 0;
    const d = groupDebts.find((item) => item.id === debtId);
    if (!d) return;

    const rem = d.total - d.paid;
    if (received > rem) {
        d.paid = d.total;
        d.disputed = false;
        notify(`Số tiền nhập lớn hơn số còn nợ (${formatPlainMoney(rem)}). Đã ghi nhận trả đủ.`);
    } else {
        d.paid += received;
        d.disputed = false;
        notify(`Đã cập nhật thanh toán ${formatPlainMoney(received)} cho ${d.memberName}.`);
    }

    closeModal('modalConfirmPayment');
    renderHostDebtsTable();
}

document.addEventListener('DOMContentLoaded', renderHostDebtsTable);