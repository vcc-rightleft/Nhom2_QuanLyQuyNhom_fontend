const GROUP_MEMBERS = [
    'Phan Đức Anh',
    'Minh Thắng',
    'Lê Quang Minh',
    'Nguyễn Phương Thảo'
];

function showToast(message, tone = 'lime') {
    const container = document.getElementById('cleanToastContainer');
    if (!container) return;
    const bgClass = tone === 'coral' ? 'bg-coral text-white' : 'bg-lime text-ink';
    const toast = document.createElement('div');
    toast.className = `pointer-events-auto card-subtle px-4 py-3 text-xs font-bold ${bgClass}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateSplitPreview() {
    const total = parseInt(document.getElementById('bill-total').value, 10) || 0;
    const checked = document.querySelectorAll('.member-checkbox:checked');
    const count = checked.length;
    const badge = document.getElementById('split-preview-badge');

    if (count === 0 || total <= 0) {
        badge.textContent = '0 ₫ / người';
        return;
    }

    const base = Math.floor(total / count);
    const remainder = total % count;
    badge.textContent = remainder > 0
        ? `~${base.toLocaleString('vi-VN')} ₫ / người (dư ${remainder} ₫)`
        : `${base.toLocaleString('vi-VN')} ₫ / người`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    document.getElementById('bill-date').value = new Date().toISOString().split('T')[0];

    const listEl = document.getElementById('members-checklist');
    listEl.innerHTML = GROUP_MEMBERS.map((name, idx) => `
        <label class="flex items-center gap-3 p-3 bg-white border-2 border-ink rounded-xl cursor-pointer hover:bg-lime/20 transition">
            <input type="checkbox" class="member-checkbox w-4 h-4 accent-indigo" value="${name}" checked id="mem-${idx}">
            <span class="font-display font-bold text-sm text-ink">${name}</span>
        </label>
    `).join('');

    document.getElementById('bill-total').addEventListener('input', updateSplitPreview);
    document.querySelectorAll('.member-checkbox').forEach((cb) => {
        cb.addEventListener('change', updateSplitPreview);
    });

    document.getElementById('bill-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const checked = Array.from(document.querySelectorAll('.member-checkbox:checked')).map((el) => el.value);
        if (checked.length === 0) {
            showToast('Vui lòng chọn ít nhất 1 thành viên để chia tiền!', 'coral');
            return;
        }

        const newBill = {
            id: `BIL-${Math.floor(300 + Math.random() * 699)}`,
            title: document.getElementById('bill-title').value.trim(),
            groupCode: document.getElementById('bill-group').value,
            total: parseInt(document.getElementById('bill-total').value, 10),
            payer: document.getElementById('bill-payer').value,
            date: document.getElementById('bill-date').value,
            splitCount: checked.length
        };

        const existing = JSON.parse(localStorage.getItem('squad_cash_bills') || '[]');
        existing.unshift(newBill);
        localStorage.setItem('squad_cash_bills', JSON.stringify(existing));

        showToast(`Đã tạo khoản chi ${newBill.id} thành công!`);
        setTimeout(() => {
            window.location.href = 'items.html';
        }, 800);
    });
});