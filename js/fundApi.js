import { API_BASE_URL, FUND_ENDPOINTS } from "./config.js";

function getStoredToken() {
  return (
    localStorage.getItem("squad_cash_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

export function getStoredUserRole() {
  const directRole = localStorage.getItem("user_role");
  if (directRole) return directRole.toUpperCase();

  try {
    const rawUser = localStorage.getItem("squad_cash_user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.role) return String(user.role).toUpperCase();
    }
  } catch (_) {}

  return "MEMBER";
}

function getAuthHeaders() {
  const token = getStoredToken();
  const userRole = getStoredUserRole();

  const headers = {
    "Content-Type": "application/json",
    "X-User-Role": userRole,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let message = `Lỗi máy chủ (HTTP ${response.status})`;
    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
      message = data.detail
        .map((err) => `${err.loc?.slice(-1)[0] || "field"}: ${err.msg}`)
        .join(" | ");
    } else if (data.message) {
      message = data.message;
    }
    throw new Error(message);
  }
  return data;
}

export async function getFundSummary(groupId) {
  const response = await fetch(
    `${API_BASE_URL}${FUND_ENDPOINTS.summary(groupId)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return parseResponse(response);
}

export async function getCollectionCampaigns(groupId) {
  const response = await fetch(
    `${API_BASE_URL}${FUND_ENDPOINTS.campaigns(groupId)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  return parseResponse(response);
}

export async function createFundIncome(groupId, payload) {
  const body = {
    ...payload,
    type: "INCOME",
    category: payload.category || payload.title || "Thu quỹ",
  };
  const response = await fetch(
    `${API_BASE_URL}${FUND_ENDPOINTS.createIncome(groupId)}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }
  );
  return parseResponse(response);
}

export async function createFundExpense(groupId, payload) {
  const body = {
    ...payload,
    type: "EXPENSE",
    category: payload.category || payload.title || "Chi chung",
  };
  const response = await fetch(
    `${API_BASE_URL}${FUND_ENDPOINTS.createExpense(groupId)}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }
  );
  return parseResponse(response);
}