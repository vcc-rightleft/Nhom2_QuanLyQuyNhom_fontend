
import api from "../api.js";

// ==========================================
// SQUAD.CASH - PROFILE
// ==========================================

const $ = (id) => document.getElementById(id);

const USER_KEY =
    window.APP_CONFIG?.USER_KEY || "squad_cash_user";

const TOKEN_KEY =
    window.APP_CONFIG?.TOKEN_KEY || "squad_cash_token";

const BANK_CODE_MAP = {
    Vietcombank: "VCB",
    "MB Bank": "MB",
    Techcombank: "TCB",
    BIDV: "BIDV",
    VietinBank: "ICB",
    ACB: "ACB",
    TPBank: "TPB",
    VPBank: "VPB",
    Agribank: "VBA"
};

let currentProfileData = {};
let previewProfile = null;

// ==========================================
// HELPERS
// ==========================================

function getStoredToken() {
    return (
        sessionStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        const user = raw ? JSON.parse(raw) : {};
        return user && typeof user === "object" ? user : {};
    } catch {
        return {};
    }
}

function getDefaultAvatar(name) {
    return (
        "https://ui-avatars.com/api/" +
        "?name=" + encodeURIComponent(name || "User") +
        "&background=D4FF00&color=121212&bold=true&size=160"
    );
}

function getBankCode(bankName) {
    return BANK_CODE_MAP[bankName] || bankName || "";
}

function buildVietQr(bank, account, name) {
    if (!bank || !account) return "";

    const bankCode = getBankCode(bank);

    return (
        `https://img.vietqr.io/image/` +
        `${encodeURIComponent(bankCode)}-` +
        `${encodeURIComponent(account)}-compact2.png` +
        `?accountName=${encodeURIComponent(name || "")}`
    );
}

function setValue(id, value) {
    const element = $(id);
    if (element) element.value = value ?? "";
}

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value ?? "";
}

function setImage(id, src, fallback = "") {
    const element = $(id);
    if (!element) return;

    if (!src) {
        element.removeAttribute("src");
        return;
    }

    element.onerror = fallback
        ? () => {
            element.onerror = null;
            element.src = fallback;
        }
        : null;

    element.src = src;
}

function showToast(message, isError = false) {
    const container = $("cleanToastContainer");

    if (!container) {
        if (isError) {
            alert(message);
        } else {
            console.info(message);
        }
        return;
    }

    const toast = document.createElement("div");

    toast.className = [
        "pointer-events-auto",
        "card-subtle",
        "px-4",
        "py-3",
        "text-xs",
        "font-bold",
        isError
            ? "bg-coral text-white"
            : "bg-lime text-ink"
    ].join(" ");

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}

function showProfileAlert(message, type = "success") {
    const banner = $("profileAlertBanner");
    const icon = $("profileAlertIcon");
    const text = $("profileAlertText");

    if (!banner || !text) {
        showToast(message, type === "error");
        return;
    }

    text.textContent = message;

    if (icon) {
        icon.textContent = type === "success" ? "✓" : "!";

        icon.className = type === "success"
            ? "w-8 h-8 rounded-xl bg-lime border-2 border-ink flex items-center justify-center font-bold text-sm shrink-0"
            : "w-8 h-8 rounded-xl bg-coral text-white border-2 border-ink flex items-center justify-center font-bold text-sm shrink-0";
    }

    banner.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function extractError(error) {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
        return detail.map(item => item.msg || "")
            .filter(Boolean)
            .join(" | ");
    }

    return error?.message || "Có lỗi xảy ra.";
}

// ==========================================
// ĐỒNG BỘ PHIÊN ĐĂNG NHẬP
// ==========================================

function syncLocalUserSession(user) {
    if (!user || typeof user !== "object") return;

    const existing = getStoredUser();

    const updated = {
        ...existing,
        ...user,

        id: user.id ?? existing.id,
        full_name: user.full_name ?? existing.full_name,
        name: user.full_name ?? existing.name,
        email: user.email ?? existing.email
    };

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(updated)
    );
}

// ==========================================
// GIAO DIỆN HỒ SƠ CŨ
// ==========================================

function updateQrPreview() {
    const bank = $("prof-bank")?.value || "";
    const account = $("prof-stk")?.value.trim() || "";
    const name = (
        $("prof-acc-name")?.value.trim() || ""
    ).toUpperCase();

    setImage(
        "profile-qr-preview",
        buildVietQr(bank, account, name)
    );

    setText(
        "preview-acc-name",
        name || "-"
    );

    setText(
        "preview-bank-stk",
        `${bank || "Chưa chọn ngân hàng"} • ${account || "-"}`
    );
}

function populateLegacyForm(user) {
    setValue(
        "prof-name",
        user.full_name || user.name || ""
    );

    setValue(
        "prof-email",
        user.email || ""
    );

    setValue(
        "prof-bank",
        user.bank_name || user.bank || ""
    );

    setValue(
        "prof-stk",
        user.bank_account_no || user.stk || ""
    );

    setValue(
        "prof-acc-name",
        user.bank_account_name || user.accName || ""
    );

    updateQrPreview();
}

function setupLegacyProfileForm() {
    const form = $("profile-form");

    if (!form) return;

    populateLegacyForm(getStoredUser());

    [
        "prof-bank",
        "prof-stk",
        "prof-acc-name"
    ].forEach((id) => {
        $(id)?.addEventListener(
            "input",
            updateQrPreview
        );

        $(id)?.addEventListener(
            "change",
            updateQrPreview
        );
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const existing = getStoredUser();

        const profile = {
            ...existing,

            full_name: $("prof-name")?.value.trim() || "",
            email: $("prof-email")?.value.trim() || "",

            bank_name: $("prof-bank")?.value || "",
            bank_account_no: $("prof-stk")?.value.trim() || "",
            bank_account_name: (
                $("prof-acc-name")?.value.trim() || ""
            ).toUpperCase()
        };

        // Chỉ lưu bản nháp trên trình duyệt.
        // Không thay thế dữ liệu tài khoản trên Backend.
        localStorage.setItem(
            "squad_cash_profile_draft",
            JSON.stringify(profile)
        );

        updateQrPreview();

        showToast(
            "Đã lưu bản nháp hồ sơ trên trình duyệt. " +
            "Dữ liệu chưa được cập nhật lên Backend."
        );
    });
}

// ==========================================
// LIVE PREVIEW - GIAO DIỆN MỚI
// ==========================================

function updateLivePreviewFromForm() {
    const user = previewProfile || currentProfileData;

    const fullName =
        $("profFullName")?.value.trim() ||
        user.full_name ||
        "Người dùng";

    const phone =
        $("profPhone")?.value.trim() || "";

    const email =
        $("profEmailReadonly")?.value.trim() ||
        user.email ||
        "";

    const avatarUrl =
        $("profAvatarUrl")?.value.trim() ||
        user.avatar_url ||
        "";

    const bankName =
        $("profBankName")?.value || "";

    const bankAccountNo =
        $("profBankAccountNo")?.value.trim() || "";

    const bankAccountName = (
        $("profBankAccountName")?.value.trim() ||
        fullName
    ).toUpperCase();

    const avatar =
        avatarUrl || getDefaultAvatar(fullName);

    setImage(
        "profileHeroAvatar",
        avatar,
        getDefaultAvatar(fullName)
    );

    setImage(
        "profLiveMiniAvatar",
        avatar,
        getDefaultAvatar(fullName)
    );

    setText("profileHeroName", fullName);

    setText(
        "profileHeroSub",
        `${email} • SĐT: ${phone || "Chưa cập nhật"} • TK nhận tiền: ${bankName || "Chưa cập nhật"} (${bankAccountNo || "-"})`
    );

    setText("profLiveDisplayName", fullName);

    setText(
        "profLiveDisplayPhone",
        `SĐT: ${phone || "Chưa cập nhật"}`
    );

    setText(
        "profLiveBankName",
        bankName || "Chưa cập nhật"
    );

    setText(
        "profLiveBankAccNo",
        bankAccountNo || "-"
    );

    setText(
        "profLiveBankAccName",
        bankAccountName
    );

    setImage(
        "profLiveQrImg",
        buildVietQr(
            bankName,
            bankAccountNo,
            bankAccountName
        )
    );
}

// ==========================================
// ĐỔ DỮ LIỆU VÀO FORM
// ==========================================

function populateProfileForm(user) {
    if (!user) return;

    currentProfileData = {
        ...currentProfileData,
        ...user
    };

    previewProfile = null;

    const role = String(
        user.role || "USER"
    ).toUpperCase();

    setText(
        "profileBannerRoleChip",
        `Đang chỉnh sửa: ${role} — ${user.full_name || "Người dùng"} (#${user.id ?? "ME"})`
    );

    setText(
        "profileHeroRoleBadge",
        role === "HOST" || role === "ADMIN"
            ? `👑 ${role}`
            : `👤 ${role}`
    );

    setValue(
        "profFullName",
        user.full_name || ""
    );

    setValue(
        "profPhone",
        user.phone || ""
    );

    setValue(
        "profEmailReadonly",
        user.email || ""
    );

    setValue(
        "profAvatarUrl",
        user.avatar_url || ""
    );

    setValue(
        "profBankAccountNo",
        user.bank_account_no || ""
    );

    setValue(
        "profBankAccountName",
        user.bank_account_name || ""
    );

    const bankSelect = $("profBankName");

    if (bankSelect) {
        const bank = user.bank_name || "";

        if (
            bank &&
            !Array.from(bankSelect.options)
                .some(option => option.value === bank)
        ) {
            bankSelect.add(
                new Option(bank, bank)
            );
        }

        bankSelect.value = bank;
    }

    updateLivePreviewFromForm();
}

// ==========================================
// LẤY HỒ SƠ TỪ FASTAPI
// ==========================================

async function fetchProfileFromFastApi(silent = false) {
    if (!getStoredToken()) {
        if (!silent) {
            showProfileAlert(
                "Bạn cần đăng nhập trước khi đồng bộ hồ sơ.",
                "error"
            );
        }
        return;
    }

    try {
        const user = await api.get("/api/users/me");

        if (
            !user ||
            typeof user !== "object" ||
            !user.id
        ) {
            throw new Error(
                "Backend không trả về hồ sơ hợp lệ."
            );
        }

        populateProfileForm(user);
        populateLegacyForm(user);
        syncLocalUserSession(user);

        if (!silent) {
            showProfileAlert(
                "Đã đồng bộ hồ sơ từ Backend thành công!",
                "success"
            );
        }

    } catch (error) {
        showProfileAlert(
            "Không thể tải hồ sơ: " + extractError(error),
            "error"
        );
    }
}

// ==========================================
// CẬP NHẬT HỒ SƠ QUA BACKEND
// ==========================================

async function saveProfile(event) {
    event.preventDefault();

    if (!getStoredToken()) {
        showProfileAlert(
            "Bạn cần đăng nhập trước khi lưu hồ sơ.",
            "error"
        );
        return;
    }

    const fullName =
        $("profFullName")?.value.trim() || "";

    if (!fullName) {
        showProfileAlert(
            "Họ tên không được để trống.",
            "error"
        );
        return;
    }

    const payload = {
        full_name: fullName,

        phone:
            $("profPhone")?.value.trim() || null,

        avatar_url:
            $("profAvatarUrl")?.value.trim() || null,

        bank_name:
            $("profBankName")?.value || null,

        bank_account_no:
            $("profBankAccountNo")?.value.trim() || null,

        bank_account_name: (
            $("profBankAccountName")?.value.trim() || ""
        ).toUpperCase() || null
    };

    const button = $("btnSaveProfileMain");

    if (button) {
        button.disabled = true;
        button.textContent = "Đang lưu...";
    }

    try {
        const user = await api.put(
            "/api/users/me",
            payload
        );

        populateProfileForm(user);
        populateLegacyForm(user);
        syncLocalUserSession(user);

        showProfileAlert(
            "Cập nhật hồ sơ và tài khoản ngân hàng thành công!",
            "success"
        );

    } catch (error) {
        showProfileAlert(
            "Cập nhật hồ sơ thất bại: " +
            extractError(error),
            "error"
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent =
                "Lưu Hồ Sơ & Đồng Bộ Toàn Hệ Thống";
        }
    }
}

// ==========================================
// ĐỔI MẬT KHẨU
// ==========================================

async function changePassword(event) {
    event.preventDefault();

    if (!getStoredToken()) {
        showProfileAlert(
            "Bạn cần đăng nhập trước khi đổi mật khẩu.",
            "error"
        );
        return;
    }

    const oldPassword =
        $("profOldPassword")?.value || "";

    const newPassword =
        $("profNewPassword")?.value || "";

    const confirmPassword =
        $("profConfirmPassword")?.value || "";

    if (!oldPassword || !newPassword) {
        showProfileAlert(
            "Vui lòng nhập đầy đủ mật khẩu.",
            "error"
        );
        return;
    }

    if (newPassword !== confirmPassword) {
        showProfileAlert(
            "Mật khẩu mới và xác nhận không khớp.",
            "error"
        );
        return;
    }

    const button = $("btnChangePwdMain");

    if (button) {
        button.disabled = true;
        button.textContent = "Đang cập nhật...";
    }

    try {
        const result = await api.put(
            "/api/users/me/password",
            {
                old_password: oldPassword,
                new_password: newPassword
            }
        );

        $("scPasswordForm")?.reset();

        showProfileAlert(
            result?.message || "Đổi mật khẩu thành công!",
            "success"
        );

    } catch (error) {
        showProfileAlert(
            "Không thể đổi mật khẩu: " +
            extractError(error),
            "error"
        );

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent =
                "Cập Nhật Mật Khẩu Mới";
        }
    }
}

// Không hỗ trợ chọn hồ sơ mẫu. Chỉ tải thông tin /api/users/me.
function selectProfileAccount() {
    showProfileAlert('Hồ sơ chỉ được tải từ tài khoản đang đăng nhập.', 'error');
}
async function restoreRealProfile() {
    await fetchProfileFromFastApi();
}
function isPreviewMode() { return false; }

// ==========================================
// KHỞI TẠO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        setupLegacyProfileForm();

        [
            "profFullName",
            "profPhone",
            "profAvatarUrl",
            "profBankName",
            "profBankAccountNo",
            "profBankAccountName"
        ].forEach((id) => {
            const element = $(id);
            if (!element) return;

            element.addEventListener(
                element.tagName === "SELECT"
                    ? "change"
                    : "input",
                updateLivePreviewFromForm
            );
        });

        $("scProfileForm")?.addEventListener(
            "submit",
            async (event) => {
                if (isPreviewMode()) {
                    event.preventDefault();

                    showProfileAlert(
                        "Không thể lưu hồ sơ mẫu. " +
                        "Hãy đồng bộ tài khoản thật từ API.",
                        "error"
                    );

                    return;
                }

                await saveProfile(event);
            }
        );

        $("scPasswordForm")?.addEventListener(
            "submit",
            changePassword
        );

        // Tự động đồng bộ hồ sơ thật nếu đã đăng nhập
        if (getStoredToken()) {
            fetchProfileFromFastApi(true);
        }
    }
);

// ==========================================
// FUNCTIONS CHO HTML ONCLICK
// ==========================================

window.fetchProfileFromFastApi = restoreRealProfile;
window.selectProfileAccount = selectProfileAccount;
