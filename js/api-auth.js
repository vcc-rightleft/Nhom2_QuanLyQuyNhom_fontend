function getAuthBaseUrl() {
    if (typeof APP_CONFIG !== "undefined" && APP_CONFIG.API_BASE_URL) {
        return APP_CONFIG.API_BASE_URL;
    }
    if (typeof API_BASE_URL !== "undefined" && API_BASE_URL) {
        return API_BASE_URL;
    }
    return "http://127.0.0.1:8000";
}

function getAuthStoredToken() {
    const configKey = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.TOKEN_KEY)
        ? APP_CONFIG.TOKEN_KEY
        : "squad_cash_token";
    return (
        localStorage.getItem(configKey) ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

if (typeof window.apiClient === "undefined" && typeof axios !== "undefined") {
    window.apiClient = axios.create({
        baseURL: getAuthBaseUrl(),
        headers: { "Content-Type": "application/json" }
    });

    window.apiClient.interceptors.request.use(
        (config) => {
            const token = getAuthStoredToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
}

function switchRoleView(role) {
    // Kiểm tra Route Guard (Chặn trang cần đăng nhập & Chặn trang Admin)
    if (typeof checkRouteAccess === "function" && !checkRouteAccess(role)) {
        return;
    }

    const normalizedRole = role === "member" ? "user" : role;

    ["landing", "auth", "user", "host", "admin"].forEach(r => {
        document.getElementById(`view-${r}`)?.classList.add("hidden");
        const btn = document.getElementById(`roleBtn-${r}`);
        if (btn) {
            btn.className = "px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all text-muted hover:text-ink";
        }
    });

    document.getElementById(`view-${normalizedRole}`)?.classList.remove("hidden");
    const activeBtn = document.getElementById(`roleBtn-${normalizedRole}`);
    if (activeBtn) {
        activeBtn.className = "px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all bg-lime text-ink border-2 border-ink shadow-bold-sm";
    }

    if (normalizedRole === "user" && typeof renderUserWorkspace === "function") renderUserWorkspace();
    if (normalizedRole === "host" && typeof renderHostWorkspace === "function") renderHostWorkspace();
    if (normalizedRole === "admin" && typeof renderAdminWorkspace === "function") renderAdminWorkspace();

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function goToAuthFromLanding(mode = "login") {
    switchRoleView("auth");
    if (typeof switchAuthTab === "function") switchAuthTab(mode);
}

window.addEventListener("DOMContentLoaded", () => {
    if (typeof renderHeaderLayout === "function") renderHeaderLayout();
    if (typeof pingFastApiBackend === "function") pingFastApiBackend(true);

    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const token = typeof getAccessToken === "function" ? getAccessToken() : getAuthStoredToken();

    if (user && token) {
        switchRoleView(user.role || "user");
    } else {
        switchRoleView("landing");
    }
});