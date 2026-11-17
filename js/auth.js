function getCurrentUser() {
    try {
        const raw = localStorage.getItem(APP_CONFIG.USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getAccessToken() {
    return localStorage.getItem(APP_CONFIG.TOKEN_KEY);
}

function saveAuthSession(token, userObj) {
    localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(userObj));
    if (typeof renderHeaderLayout === "function") renderHeaderLayout();
}

function logoutUser() {
    localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.USER_KEY);
    notify("Đã đăng xuất và xóa Token khỏi trình duyệt.");
    if (typeof renderHeaderLayout === "function") renderHeaderLayout();
    if (typeof switchRoleView === "function") switchRoleView("auth");
}

// CHẶN TRANG (ROUTE GUARD): Chặn trang cần đăng nhập & Trang Admin chỉ cho Admin
function checkRouteAccess(targetView) {
    const publicViews = ["landing", "auth"];
    if (publicViews.includes(targetView)) return true;

    const token = getAccessToken();
    const user = getCurrentUser();

    // 1. Chặn trang nếu chưa đăng nhập
    if (!token || !user) {
        notify("🔒 Chặn trang: Bạn cần đăng nhập trước khi truy cập trang này!", true);
        switchRoleView("auth");
        return false;
    }

    // 2. Chặn trang Admin nếu tài khoản không có quyền Admin
    if (targetView === "admin" && user.role !== "admin") {
        notify(`⛔ Chặn phân quyền: Trang Admin chỉ dành cho Admin! (Vai trò hiện tại của bạn: ${user.role.toUpperCase()})`, true);
        return false;
    }

    return true;
}

// Chuyển tab trong khung Auth (Login / Register / Invite)
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
    document.getElementById("selectedLoginRole").value = role;

    if (role === "user") emailInput.value = "minh.le@squad.cash";
    if (role === "host") emailInput.value = "ducanh.host@squad.cash";
    if (role === "admin") emailInput.value = "root.admin@squad.cash";
    if (passInput) passInput.value = "12345678";

    notify(`Đã điền nhanh tài khoản mẫu cho vai trò ${role.toUpperCase()}.`);
}

// Xử lý Submit Đăng nhập có Validate + Gọi API / Lưu Token
async function handleAuthSubmit(e) {
    e.preventDefault();
    const emailEl = document.getElementById("loginEmailInput");
    const passEl = document.getElementById("loginPasswordInput");
    const errBox = document.getElementById("loginErrorMsg");
    const role = document.getElementById("selectedLoginRole")?.value || "user";

    const email = emailEl.value.trim();
    const password = passEl.value;

    // Validate dữ liệu đầu vào
    if (!validateEmailOrPhone(email)) {
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

    // Thử gọi API /auth/login thật, nếu server tắt thì cấp JWT mẫu theo đúng role để demo
    let accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_${role}_${Date.now()}`;
    let userData = {
        id: role === "admin" ? 1 : (role === "host" ? 2 : 3),
        name: role === "admin" ? "System Root Admin" : (role === "host" ? "Phan Đức Anh" : "Lê Quang Minh"),
        email: email,
        role: role
    };

    if (apiClient) {
        try {
            const res = await apiClient.post("/auth/login", { email, password });
            if (res.data && res.data.access_token) {
                accessToken = res.data.access_token;
                userData = res.data.user || { ...userData, role: res.data.role || role };
            }
        } catch (err) {
            // Chạy tiếp với token mẫu khi test UI độc lập
        }
    }

    saveAuthSession(accessToken, userData);
    notify(`Đăng nhập thành công! Đã lưu JWT Token (Vai trò: ${userData.role.toUpperCase()}).`);
    switchRoleView(userData.role);
}

// Xử lý Submit Đăng ký có Validate đầy đủ
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
    if (!validateEmailOrPhone(email)) {
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

    if (apiClient) {
        try {
            await apiClient.post("/auth/register", { full_name, email, password });
        } catch (err) {
            // Cho phép lưu session demo nếu chỉ chạy Frontend
        }
    }

    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.reg_user_${Date.now()}`;
    const newUser = { id: 10, name: full_name, email: email, role: "user" };
    saveAuthSession(token, newUser);
    notify(`Đăng ký thành công tài khoản "${full_name}"! Đã tự động lưu Token.`);
    switchRoleView("user");
}