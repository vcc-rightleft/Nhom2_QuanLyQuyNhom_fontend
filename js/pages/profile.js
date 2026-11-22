function showToast(message) {
    const container = document.getElementById('cleanToastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto card-subtle px-4 py-3 text-xs font-bold bg-lime text-ink';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateQrPreview() {
    const bank = document.getElementById('prof-bank').value;
    const stk = document.getElementById('prof-stk').value.trim();
    const accName = document.getElementById('prof-acc-name').value.trim().toUpperCase();

    const qrUrl = `https://img.vietqr.io/image/${bank}-${stk}-compact2.png?accountName=${encodeURIComponent(accName)}`;
    document.getElementById('profile-qr-preview').src = qrUrl;
    document.getElementById('preview-acc-name').textContent = accName || '-';
    document.getElementById('preview-bank-stk').textContent = `${bank} • ${stk || '-'}`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    updateQrPreview();

    ['prof-bank', 'prof-stk', 'prof-acc-name'].forEach((id) => {
        document.getElementById(id).addEventListener('input', updateQrPreview);
        document.getElementById(id).addEventListener('change', updateQrPreview);
    });

    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const profileData = {
            name: document.getElementById('prof-name').value.trim(),
            email: document.getElementById('prof-email').value.trim(),
            bank: document.getElementById('prof-bank').value,
            stk: document.getElementById('prof-stk').value.trim(),
            accName: document.getElementById('prof-acc-name').value.trim().toUpperCase()
        };
        localStorage.setItem(window.APP_CONFIG.USER_KEY, JSON.stringify(profileData));
        updateQrPreview();
        showToast('Đã lưu thông tin hồ sơ & VietQR thành công!');
    });
});