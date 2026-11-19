const API_BASE_URL = "http://127.0.0.1:8000";

const alertBox = document.getElementById("alert-box");
const avatarPreview = document.getElementById("avatar-preview");
const avatarInput = document.getElementById("avatar_url");
const displayName = document.getElementById("display-name");
const displayEmail = document.getElementById("display-email");

const profileForm = document.getElementById("profile-form");
const passwordForm = document.getElementById("password-form");

// Lấy JWT token từ localStorage (đã lưu khi đăng nhập)
function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Hiển thị thông báo thành công / lỗi
function showAlert(message, type = "success") {
  alertBox.textContent = message;
  alertBox.className =
    type === "success"
      ? "rounded-lg p-4 text-sm font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
      : "rounded-lg p-4 text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200";
  alertBox.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Trích xuất thông báo lỗi từ FastAPI response
function extractErrorMessage(errorData, fallback) {
  if (!errorData || !errorData.detail) return fallback;
  if (typeof errorData.detail === "string") return errorData.detail;
  if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
    return errorData.detail[0].msg || fallback;
  }
  return fallback;
}

// Cập nhật ảnh đại diện mặc định hoặc từ URL
function updateAvatarDisplay(url, fullName) {
  const fallbackName = encodeURIComponent(fullName || "User");
  const defaultAvatar = `https://ui-avatars.com/api/?name=${fallbackName}&background=4f46e5&color=fff&size=128`;
  avatarPreview.src = url && url.trim() !== "" ? url.trim() : defaultAvatar;
  avatarPreview.onerror = () => {
    avatarPreview.src = defaultAvatar;
  };
}

// Xem trước ảnh ngay khi người dùng dán link avatar mới
avatarInput.addEventListener("input", () => {
  const fullName = document.getElementById("full_name").value;
  updateAvatarDisplay(avatarInput.value, fullName);
});

// 1. Tải thông tin hồ sơ hiện tại (GET /api/users/me)
async function loadUserProfile() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    showAlert("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem và chỉnh sửa hồ sơ.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(extractErrorMessage(err, "Không thể tải thông tin tài khoản."));
    }

    const user = await response.json();

    // Đổ dữ liệu lên giao diện
    displayName.textContent = user.full_name || "Chưa cập nhật tên";
    displayEmail.textContent = user.email || "";

    document.getElementById("full_name").value = user.full_name || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("avatar_url").value = user.avatar_url || "";
    document.getElementById("bank_name").value = user.bank_name || "";
    document.getElementById("bank_account_no").value = user.bank_account_no || "";
    document.getElementById("bank_account_name").value = user.bank_account_name || "";

    updateAvatarDisplay(user.avatar_url, user.full_name);
  } catch (error) {
    showAlert(error.message, "error");
  }
}

// 2. Cập nhật thông tin hồ sơ & ngân hàng (PUT /api/users/me)
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("btn-save-profile");
  btn.disabled = true;
  btn.textContent = "Đang lưu...";

  const payload = {
    full_name: document.getElementById("full_name").value.trim(),
    phone: document.getElementById("phone").value.trim() || null,
    avatar_url: document.getElementById("avatar_url").value.trim() || null,
    bank_name: document.getElementById("bank_name").value.trim() || null,
    bank_account_no: document.getElementById("bank_account_no").value.trim() || null,
    bank_account_name: document.getElementById("bank_account_name").value.trim().toUpperCase() || null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(extractErrorMessage(data, "Cập nhật hồ sơ thất bại."));
    }

    displayName.textContent = data.full_name;
    updateAvatarDisplay(data.avatar_url, data.full_name);
    showAlert("Cập nhật thông tin hồ sơ và tài khoản nhận tiền thành công!", "success");
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Lưu thay đổi";
  }
});

// 3. Đổi mật khẩu (PUT /api/users/me/password)
passwordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const oldPassword = document.getElementById("old_password").value;
  const newPassword = document.getElementById("new_password").value;
  const confirmPassword = document.getElementById("confirm_password").value;

  if (newPassword !== confirmPassword) {
    showAlert("Mật khẩu mới và xác nhận mật khẩu không khớp.", "error");
    return;
  }

  const btn = document.getElementById("btn-change-password");
  btn.disabled = true;
  btn.textContent = "Đang cập nhật...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/me/password`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(extractErrorMessage(data, "Đổi mật khẩu thất bại."));
    }

    passwordForm.reset();
    showAlert(data?.message || "Đổi mật khẩu thành công!", "success");
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Cập nhật mật khẩu";
  }
});

// Khởi chạy khi mở trang
document.addEventListener("DOMContentLoaded", loadUserProfile);