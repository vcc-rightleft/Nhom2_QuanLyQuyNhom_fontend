function getCurrentUser() {
    try {
        const raw = localStorage.getItem(APP_CONFIG.USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getAccessToken() {
    return (
        localStorage.getItem(APP_CONFIG.TOKEN_KEY) ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token")
    );
}

function saveAuthSession(token, userObj) {
    if (token) {
        localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
        localStorage.setItem("access_token", token);
    }
    localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(userObj));
    if (typeof renderHeaderLayout === "function") renderHeaderLayout();
}

function logoutUser() {
    localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.USER_KEY);
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    if (typeof notify === "function") {
        notify("Đã đăng xuất và xóa Token khỏi trình duyệt.");
    }
    if (typeof renderHeaderLayout === "function") renderHeaderLayout();
    if (typeof switchRoleView === "function") switchRoleView("auth");
}

function normalizeUserRole(rawRole, fallback = "user") {
    const r = String(rawRole || fallback).toLowerCase();
    return r === "member" ? "user" : r;
}

// CHẶN TRANG (ROUTE GUARD): Chặn trang cần đăng nhập & Trang Admin chỉ cho Admin
function checkRouteAccess(targetView) {
    const publicViews = ["landing", "auth"];
    if (publicViews.includes(targetView)) return true;

    const token = getAccessToken();
    const user = getCurrentUser();

    if (!token || !user) {
        if (typeof notify === "function") {
            notify("🔒 Chặn trang: Bạn cần đăng nhập trước khi truy cập trang này!", true);
        }
        switchRoleView("auth");
        return false;
    }

    if (targetView === "admin" && normalizeUserRole(user.role) !== "admin") {
        if (typeof notify === "function") {
            notify(`⛔ Chặn phân quyền: Trang Admin chỉ dành cho Admin! (Vai trò hiện tại của bạn: ${String(user.role).toUpperCase()})`, true);
        }
        return false;
    }

    return true;
}

function switchAuthTab(tab) {
    ["login", "register", "invite"].forEach(t => {
        document.getElementById(`authForm-${t}`)?.classList.add("hidden");
        const btn = document.getElementById(`authTab-${t}`);
        if (btn) btn.className = "py-2.5 px-3 rounded-lg font-display font-bold text-xs sm:text-sm text-muted hover:text-ink flex items-center justify-center gap-1.5";
    });
    document.getElementById(`authForm-${tab}`)?.classList.remove("hidden");
    const activeBtn = document.getElementById(`authTab-${tab}`);
    if (activeBtn) activeBtn.className = "py-2.5 px-3 rounded-lg font-display font-bold text-xs sm:text-sm bg-white text-ink border border-ink shadow-clean flex items-center justify-center gap-1.5";
}

function fillDemoLogin(role) {
    const emailInput = document.getElementById("loginEmailInput");
    const passInput = document.getElementById("loginPasswordInput");
    const roleInput = document.getElementById("selectedLoginRole");
    if (roleInput) roleInput.value = role;

    if (role === "user" && emailInput) emailInput.value = "minh.le@squad.cash";
    if (role === "host" && emailInput) emailInput.value = "ducanh.host@squad.cash";
    if (role === "admin" && emailInput) emailInput.value = "root.admin@squad.cash";
    if (passInput) passInput.value = "12345678";

    if (typeof notify === "function") {
        notify(`Đã điền nhanh tài khoản mẫu cho vai trò ${role.toUpperCase()}.`);
    }
}

function extractApiError(err, fallbackMsg) {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) {
        return detail.map(d => `${d.loc?.slice(-1)[0] || ""}: ${d.msg}`).join(" | ");
    }
    return detail || err.message || fallbackMsg;
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const emailEl = document.getElementById("loginEmailInput");
    const passEl = document.getElementById("loginPasswordInput");
    const errBox = document.getElementById("loginErrorMsg");
    const role = document.getElementById("selectedLoginRole")?.value || "user";

    const email = emailEl.value.trim();
    const password = passEl.value;

    if (typeof validateEmailOrPhone === "function" && !validateEmailOrPhone(email)) {
        errBox.textContent = "Vui lòng nhập Email hoặc Số điện thoại hợp lệ!";
        errBox.classList.remove("hidden");
        emailEl.classList.add("input-error", "neo-shake");
        setTimeout(() => emailEl.classList.remove("neo-shake"), 450);
        return;
    }
    if (!password || password.length < 6) {
        errBox.textContent = "Mật khẩu phải có tối thiểu 6 ký tự!";
        errBox.classList.remove("hidden");
        passEl.classList.add("input-error", "neo-shake");
        setTimeout(() => passEl.classList.remove("neo-shake"), 450);
        return;
    }

    errBox.classList.add("hidden");
    emailEl.classList.remove("input-error");
    passEl.classList.remove("input-error");

    try {
        const res = await window.apiClient.post("/auth/login", { email, password });
        const data = res.data || {};
        const accessToken = data.access_token || "";
        const rawUser = data.user || {
            id: data.user_id || 0,
            name: data.full_name || email,
            email: email,
            role: data.role || role
        };
        const userData = {
            ...rawUser,
            name: rawUser.full_name || rawUser.name || email,
            role: normalizeUserRole(rawUser.role, role)
        };

        saveAuthSession(accessToken, userData);
        if (typeof notify === "function") {
            notify(`Đăng nhập thành công! (Vai trò: ${userData.role.toUpperCase()})`);
        }
        switchRoleView(userData.role);
    } catch (err) {
        const msg = extractApiError(err, "Không kết nối được tới Backend!");
        errBox.textContent = "Lỗi đăng nhập: " + msg;
        errBox.classList.remove("hidden");
        console.error("Login error:", err.response?.data || err);
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const nameEl = document.getElementById("regDisplayNameInput");
    const contactEl = document.getElementById("regContactInput");
    const passEl = document.getElementById("regPasswordInput");
    const confirmEl = document.getElementById("regConfirmPasswordInput");
    const errBox = document.getElementById("registerErrorMsg");

    const full_name = nameEl.value.trim();
    const email = contactEl.value.trim();
    const password = passEl.value;
    const confirmPass = confirmEl ? confirmEl.value : password;

    if (full_name.length < 2) {
        errBox.textContent = "Tên hiển thị phải từ 2 ký tự trở lên!";
        errBox.classList.remove("hidden");
        nameEl.classList.add("input-error", "neo-shake");
        return;
    }
    if (typeof validateEmailOrPhone === "function" && !validateEmailOrPhone(email)) {
        errBox.textContent = "Email hoặc Số điện thoại không đúng định dạng!";
        errBox.classList.remove("hidden");
        contactEl.classList.add("input-error", "neo-shake");
        return;
    }
    if (password.length < 8) {
        errBox.textContent = "Mật khẩu bảo mật phải có tối thiểu 8 ký tự!";
        errBox.classList.remove("hidden");
        passEl.classList.add("input-error", "neo-shake");
        return;
    }
    if (password !== confirmPass) {
        errBox.textContent = "Mật khẩu nhập lại không khớp!";
        errBox.classList.remove("hidden");
        confirmEl.classList.add("input-error", "neo-shake");
        return;
    }

    errBox.classList.add("hidden");

    try {
        const regRes = await window.apiClient.post("/auth/register", { full_name, email, password });
        let accessToken = "";
        let userData = regRes.data || { name: full_name, email: email, role: "user" };

        try {
            const loginRes = await window.apiClient.post("/auth/login", { email, password });
            accessToken = loginRes.data?.access_token || "";
            if (loginRes.data?.user) userData = loginRes.data.user;
        } catch (_) {}

        saveAuthSession(accessToken, {
            id: userData.id || userData.user_id || 0,
            name: userData.full_name || userData.name || full_name,
            email: userData.email || email,
            role: normalizeUserRole(userData.role, "user")
        });

        if (typeof notify === "function") {
            notify(`Đăng ký thành công tài khoản "${full_name}"!`);
        }
        switchRoleView("user");
    } catch (err) {
        const msg = extractApiError(err, "Không kết nối được tới Backend!");
        errBox.textContent = "Lỗi đăng ký: " + msg;
        errBox.classList.remove("hidden");
        console.error("Register error:", err.response?.data || err);
    }
}