import { API_BASE_URL, FUND_ENDPOINTS } from "./config.js";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  const userRole = (localStorage.getItem("user_role") || "MEMBER").toUpperCase();

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
    const message =
      typeof data.detail === "string"
        ? data.detail
        : data.message || `Lỗi máy chủ (HTTP ${response.status})`;
    throw new Error(message);
  }
  return data;
}

export async function getFundSummary(groupId) {
  const response = await fetch(`${API_BASE_URL}${FUND_ENDPOINTS.summary(groupId)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
}

export async function getCollectionCampaigns(groupId) {
  const response = await fetch(`${API_BASE_URL}${FUND_ENDPOINTS.campaigns(groupId)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return parseResponse(response);
}

export async function createFundIncome(groupId, payload) {
  const response = await fetch(`${API_BASE_URL}${FUND_ENDPOINTS.createIncome(groupId)}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function createFundExpense(groupId, payload) {
  const response = await fetch(`${API_BASE_URL}${FUND_ENDPOINTS.createExpense(groupId)}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}