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

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const REDIRECT_URL = '../index.html';

    function switchTab(mode) {
        if (mode === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            tabLogin.className = 'py-2 rounded-lg font-display font-bold text-xs uppercase bg-ink text-lime transition';
            tabRegister.className = 'py-2 rounded-lg font-display font-bold text-xs uppercase text-ink hover:bg-white transition';
        } else {
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            tabRegister.className = 'py-2 rounded-lg font-display font-bold text-xs uppercase bg-ink text-lime transition';
            tabLogin.className = 'py-2 rounded-lg font-display font-bold text-xs uppercase text-ink hover:bg-white transition';
        }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') {
        switchTab('register');
    }

    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        localStorage.setItem(window.APP_CONFIG.TOKEN_KEY, 'mock_jwt_token');
        localStorage.setItem(window.APP_CONFIG.USER_KEY, JSON.stringify({ name: email.split('@')[0], email }));
        showToast('Đăng nhập thành công! Đang chuyển hướng...');
        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, 700);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        localStorage.setItem(window.APP_CONFIG.TOKEN_KEY, 'mock_jwt_token');
        localStorage.setItem(window.APP_CONFIG.USER_KEY, JSON.stringify({ name, email }));
        showToast('Tạo tài khoản thành công! Đang chuyển hướng...');
        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, 700);
    });
});