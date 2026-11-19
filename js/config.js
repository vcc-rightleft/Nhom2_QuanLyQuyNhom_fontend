// Địa chỉ Backend FastAPI (Nhom2_QuanLyQuyNhom_backend)
export const API_BASE_URL = "http://127.0.0.1:8000";

// ID nhóm mặc định (có thể lấy động từ localStorage nếu app đã có chọn nhóm)
export const DEFAULT_GROUP_ID = Number(localStorage.getItem("current_group_id")) || 1;

// Đường dẫn API cho Tab Quỹ chung (đối chiếu với http://127.0.0.1:8000/docs nếu cần đổi tiền tố)
export const FUND_ENDPOINTS = {
  summary: (groupId) => `/api/v1/groups/${groupId}/fund/summary`,
  campaigns: (groupId) => `/api/v1/groups/${groupId}/fund/campaigns`,
  createIncome: (groupId) => `/api/v1/groups/${groupId}/fund/income`,
  createExpense: (groupId) => `/api/v1/groups/${groupId}/fund/expense`,
};