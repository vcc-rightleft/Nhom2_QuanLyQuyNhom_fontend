const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000';
const TOKEN_KEY = window.APP_CONFIG?.TOKEN_KEY || 'squad_cash_token';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(window.APP_CONFIG?.USER_KEY || 'squad_cash_user');
        window.location.href = '/Frontend/pages/auth.html';
        throw new Error('Phiên đăng nhập hết hạn');
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || data.message || `Lỗi HTTP ${response.status}`);
    }
    return data;
}

const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' })
};

export default api;