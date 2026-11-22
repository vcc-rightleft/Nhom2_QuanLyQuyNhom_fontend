
const API_BASE_URL = (
    window.APP_CONFIG?.API_BASE_URL ||
    'http://127.0.0.1:8000'
).replace(/\/+$/, '');

const TOKEN_KEY = window.APP_CONFIG?.TOKEN_KEY || 'squad_cash_token';
const USER_KEY = window.APP_CONFIG?.USER_KEY || 'squad_cash_user';

// Lấy JWT đã lưu khi đăng nhập
function getStoredToken() {
    return (
        localStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        ''
    );
}

// Tạo URL và hỗ trợ query parameters
function buildUrl(endpoint, params) {
    const url = new URL(endpoint, `${API_BASE_URL}/`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.toString();
}

// Xóa token khi phiên đăng nhập hết hạn
function clearAuth() {
    [
        TOKEN_KEY,
        'access_token',
        'token'
    ].forEach(key => localStorage.removeItem(key));

    localStorage.removeItem(USER_KEY);
}

// Hàm request dùng chung cho tất cả API
async function request(endpoint, options = {}, params = null) {
    const token = getStoredToken();

    const headers = {
        ...(options.body != null && !(options.body instanceof FormData)
            ? { 'Content-Type': 'application/json' }
            : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(buildUrl(endpoint, params), {
        ...options,
        headers
    });

    // Xử lý token không hợp lệ hoặc hết hạn
    if (response.status === 401) {
        clearAuth();

        const authUrl = new URL(
            'pages/auth.html',
            new URL(
                window.APP_CONFIG?.ROOT_PATH || '../',
                import.meta.url
            )
        );

        // Tránh chuyển hướng lặp khi đang ở trang đăng nhập
        if (!window.location.pathname.endsWith('/pages/auth.html')) {
            window.location.href = authUrl.href;
        }

        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }

    // Hỗ trợ JSON, text, CSV và response rỗng
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';

    let data;

    if (contentType.includes('application/json')) {
        data = await response.json();
    } else if (
        contentType.includes('text/csv') ||
        contentType.includes('application/octet-stream')
    ) {
        data = await response.blob();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        let message = `Lỗi HTTP ${response.status}`;

        if (typeof data === 'object' && data !== null && !(data instanceof Blob)) {
            const detail = data.detail || data.message;
            if (typeof detail === 'string') {
                message = detail;
            } else if (detail) {
                message = JSON.stringify(detail);
            }
        } else if (typeof data === 'string' && data.trim()) {
            message = data;
        }

        throw new Error(message);
    }

    return data;
}

// API dùng chung
const api = {
    get(endpoint, params = null) {
        return request(endpoint, { method: 'GET' }, params);
    },

    post(endpoint, body) {
        return request(endpoint, {
            method: 'POST',
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return request(endpoint, {
            method: 'PUT',
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    },

    patch(endpoint, body) {
        return request(endpoint, {
            method: 'PATCH',
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return request(endpoint, {
            method: 'DELETE'
        });
    }
};

export default api;
