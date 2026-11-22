const PROFILE_API_BASE =
    typeof APP_CONFIG !== "undefined" && APP_CONFIG.API_BASE_URL
        ? APP_CONFIG.API_BASE_URL
        : "http://127.0.0.1:8000";

const BANK_CODE_MAP = {
    "Vietcombank": "VCB",
    "MB Bank": "MB",
    "Techcombank": "TCB",
    "BIDV": "BIDV",
    "VietinBank": "ICB",
    "ACB": "ACB",
    "TPBank": "TPB",
    "VPBank": "VPB",
    "Agribank": "VBA"
};

const DEMO_PROFILES = {
    "USR-1001": {
        id: "USR-1001",
        role: "HOST",
        full_name: "Phan Đức Anh",
        email: "ducanh.host@squad.cash",
        phone: "0909123456",
        avatar_url: "",
        bank_name: "Vietcombank",
        bank_account_no: "1029384756",
        bank_account_name: "PHAN DUC ANH"
    },
    "USR-1042": {
        id: "USR-1042",
        role: "USER",
        full_name: "Lê Quang Minh",
        email: "minh.le@squad.cash",
        phone: "0988112233",
        avatar_url: "",
        bank_name: "MB Bank",
        bank_account_no: "0988112233",
        bank_account_name: "LE QUANG MINH"
    }
};

let currentProfileData = { ...DEMO_PROFILES["USR-1001"] };

function getStoredToken() {
    return (
        localStorage.getItem("squad_cash_token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

function getAuthHeaders() {
    const token = getStoredToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

function showProfileAlert(message, type = "success") {
    const banner = document.getElementById("profileAlertBanner");
    const icon = document.getElementById("profileAlertIcon");
    const text = document.getElementById("profileAlertText");
    if (!banner || !text) return;

    text.textContent = message;
    if (icon) {
        icon.textContent = type === "success" ? "✓" : "!";
        icon.className =
            type === "success"
                ? "w-8 h-8 rounded-xl bg-lime border-2 border-ink flex items-center justify-center font-bold text-sm shrink-0"
                : "w-8 h-8 rounded-xl bg-coral text-white border-2 border-ink flex items-center justify-center font-bold text-sm shrink-0";
    }
    banner.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function extractApiError(data, fallback) {
    if (!data || !data.detail) return fallback;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail) && data.detail.length > 0) {
        return data.detail.map(d => `${d.loc?.slice(-1)[0] || ""}: ${d.msg}`).join(" | ");
    }
    return fallback;
}

function getDefaultAvatar(fullName) {
    const encoded = encodeURIComponent(fullName || "User");
    return `https://ui-avatars.com/api/?name=${encoded}&background=D4FF00&color=121212&bold=true&size=160`;
}

function updateLivePreviewFromForm() {
    const fullName = document.getElementById("profFullName")?.value.trim() || currentProfileData.full_name || "Người dùng";
    const phone = document.getElementById("profPhone")?.value.trim() || "Chưa cập nhật";
    const email = document.getElementById("profEmailReadonly")?.value.trim() || currentProfileData.email || "";
    const avatarUrl = document.getElementById("profAvatarUrl")?.value.trim() || "";
    const bankName = document.getElementById("profBankName")?.value || "Vietcombank";
    const bankAccNo = document.getElementById("profBankAccountNo")?.value.trim() || "1029384756";
    const bankAccName = (document.getElementById("profBankAccountName")?.value.trim() || fullName).toUpperCase();

    const finalAvatar = avatarUrl || getDefaultAvatar(fullName);

    const heroAvatar = document.getElementById("profileHeroAvatar");
    const miniAvatar = document.getElementById("profLiveMiniAvatar");
    [heroAvatar, miniAvatar].forEach(img => {
        if (!img) return;
        img.src = finalAvatar;
        img.onerror = () => { img.src = getDefaultAvatar(fullName); };
    });

    const heroName = document.getElementById("profileHeroName");
    const heroSub = document.getElementById("profileHeroSub");
    const liveName = document.getElementById("profLiveDisplayName");
    const livePhone = document.getElementById("profLiveDisplayPhone");
    const liveBank = document.getElementById("profLiveBankName");
    const liveAccNo = document.getElementById("profLiveBankAccNo");
    const liveAccName = document.getElementById("profLiveBankAccName");
    const qrImg = document.getElementById("profLiveQrImg");

    if (heroName) heroName.textContent = fullName;
    if (heroSub) heroSub.textContent = `${email} • SĐT: ${phone} • TK nhận tiền: ${bankName} (${bankAccNo})`;
    if (liveName) liveName.textContent = fullName;
    if (livePhone) livePhone.textContent = `SĐT: ${phone}`;
    if (liveBank) liveBank.textContent = bankName;
    if (liveAccNo) liveAccNo.textContent = bankAccNo;
    if (liveAccName) liveAccName.textContent = bankAccName;

    if (qrImg && bankAccNo) {
        const bankCode = BANK_CODE_MAP[bankName] || "VCB";
        qrImg.src = `https://img.vietqr.io/image/${bankCode}-${encodeURIComponent(bankAccNo)}-compact2.png?amount=350000&addInfo=SQUADCASH%20THANHTOAN&accountName=${encodeURIComponent(bankAccName)}`;
    }
}

function populateProfileForm(user) {
    currentProfileData = { ...currentProfileData, ...user };

    const roleUpper = String(user.role || "USER").toUpperCase();
    const roleChip = document.getElementById("profileBannerRoleChip");
    const roleBadge = document.getElementById("profileHeroRoleBadge");
    if (roleChip) {
        roleChip.textContent = `Đang chỉnh sửa: ${roleUpper} — ${user.full_name || "Người dùng"} (#${user.id || "ME"})`;
    }
    if (roleBadge) {
        roleBadge.textContent = roleUpper === "HOST" || roleUpper === "ADMIN" ? `👑 ${roleUpper}` : `👤 ${roleUpper}`;
    }

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val ?? "";
    };

    setVal("profFullName", user.full_name || "");
    setVal("profPhone", user.phone || "");
    setVal("profEmailReadonly", user.email || "");
    setVal("profAvatarUrl", user.avatar_url || "");
    setVal("profBankAccountNo", user.bank_account_no || "");
    setVal("profBankAccountName", user.bank_account_name || "");

    const bankSelect = document.getElementById("profBankName");
    if (bankSelect && user.bank_name) {
        const hasOption = Array.from(bankSelect.options).some(opt => opt.value === user.bank_name);
        if (!hasOption) {
            const opt = document.createElement("option");
            opt.value = user.bank_name;
            opt.textContent = user.bank_name;
            bankSelect.appendChild(opt);
        }
        bankSelect.value = user.bank_name;
    }

    updateLivePreviewFromForm();
}

function syncLocalUserSession(userData) {
    try {
        const raw = localStorage.getItem("squad_cash_user");
        const existing = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
            "squad_cash_user",
            JSON.stringify({
                ...existing,
                id: userData.id ?? existing.id,
                name: userData.full_name || existing.name,
                full_name: userData.full_name || existing.full_name,
                email: userData.email || existing.email,
                role: String(userData.role || existing.role || "user").toLowerCase()
            })
        );
    } catch (_) {}
}

window.selectProfileAccount = function (userId) {
    const profile = DEMO_PROFILES[userId];
    if (!profile) return;

    ["USR-1001", "USR-1042"].forEach(id => {
        const btn = document.getElementById(`profSwitchBtn-${id}`);
        if (!btn) return;
        btn.className =
            id === userId
                ? "p-2.5 rounded-xl border-2 border-ink bg-lime text-ink font-display font-bold text-xs text-left shadow-bold-sm"
                : "p-2.5 rounded-xl border-2 border-ink bg-white text-muted hover:text-ink font-display font-bold text-xs text-left";
    });

    populateProfileForm(profile);
    showProfileAlert(`Đã chuyển xem nhanh hồ sơ mẫu: ${profile.full_name}. Bấm "Đồng bộ từ API" để tải tài khoản đang đăng nhập.`);
};

window.fetchProfileFromFastApi = async function (silent = false) {
    const token = getStoredToken();
    if (!token) {
        populateProfileForm(currentProfileData);
        if (!silent) {
            showProfileAlert("Bạn chưa đăng nhập (chưa có JWT Token). Hãy đăng nhập tại trang Đăng nhập / Đăng ký để đồng bộ hồ sơ thật.", "error");
        }
        return;
    }

    try {
        const res = await fetch(`${PROFILE_API_BASE}/api/users/me`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await res.json().catch(() => null);
        if (res.status === 401) {
            throw new Error("Phiên đăng nhập đã hết hạn hoặc Token không hợp lệ. Vui lòng đăng nhập lại.");
        }
        if (!res.ok) {
            throw new Error(extractApiError(data, "Không thể tải hồ sơ từ Backend."));
        }

        populateProfileForm(data);
        syncLocalUserSession(data);
        if (!silent) {
            showProfileAlert(`Đã đồng bộ hồ sơ thật từ Backend cho tài khoản ${data.email}!`, "success");
        }
    } catch (err) {
        showProfileAlert(err.message, "error");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") lucide.createIcons();

    ["profFullName", "profPhone", "profAvatarUrl", "profBankName", "profBankAccountNo", "profBankAccountName"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const evt = el.tagName === "SELECT" ? "change" : "input";
        el.addEventListener(evt, updateLivePreviewFromForm);
    });

    const profileForm = document.getElementById("scProfileForm");
    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = getStoredToken();
            if (!token) {
                showProfileAlert("Bạn cần đăng nhập trước khi lưu hồ sơ lên Backend!", "error");
                return;
            }

            const btn = document.getElementById("btnSaveProfileMain");
            if (btn) {
                btn.disabled = true;
                btn.textContent = "Đang lưu...";
            }

            const payload = {
                full_name: document.getElementById("profFullName").value.trim(),
                phone: document.getElementById("profPhone").value.trim() || null,
                avatar_url: document.getElementById("profAvatarUrl").value.trim() || null,
                bank_name: document.getElementById("profBankName").value.trim() || null,
                bank_account_no: document.getElementById("profBankAccountNo").value.trim() || null,
                bank_account_name: document.getElementById("profBankAccountName").value.trim().toUpperCase() || null
            };

            try {
                const res = await fetch(`${PROFILE_API_BASE}/api/users/me`, {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    throw new Error(extractApiError(data, "Cập nhật hồ sơ thất bại."));
                }

                populateProfileForm(data);
                syncLocalUserSession(data);
                showProfileAlert("Cập nhật thông tin hồ sơ & tài khoản ngân hàng thành công!", "success");
            } catch (err) {
                showProfileAlert(err.message, "error");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Lưu Hồ Sơ & Đồng Bộ Toàn Hệ Thống";
                }
            }
        });
    }

    const passwordForm = document.getElementById("scPasswordForm");
    if (passwordForm) {
        passwordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = getStoredToken();
            if (!token) {
                showProfileAlert("Bạn cần đăng nhập trước khi đổi mật khẩu!", "error");
                return;
            }

            const oldPassword = document.getElementById("profOldPassword").value;
            const newPassword = document.getElementById("profNewPassword").value;
            const confirmPassword = document.getElementById("profConfirmPassword").value;

            if (newPassword !== confirmPassword) {
                showProfileAlert("Mật khẩu mới và xác nhận mật khẩu không khớp!", "error");
                return;
            }

            const btn = document.getElementById("btnChangePwdMain");
            if (btn) {
                btn.disabled = true;
                btn.textContent = "Đang cập nhật...";
            }

            try {
                const res = await fetch(`${PROFILE_API_BASE}/api/users/me/password`, {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword
                    })
                });
                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    throw new Error(extractApiError(data, "Đổi mật khẩu thất bại."));
                }

                passwordForm.reset();
                showProfileAlert(data?.message || "Đổi mật khẩu thành công!", "success");
            } catch (err) {
                showProfileAlert(err.message, "error");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Cập Nhật Mật Khẩu Mới";
                }
            }
        });
    }

    window.fetchProfileFromFastApi(true);
});