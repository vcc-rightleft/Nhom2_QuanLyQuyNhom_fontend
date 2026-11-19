export const API_BASE_URL = "http://127.0.0.1:8000";
export const DEFAULT_GROUP_ID = 1;

export const FUND_ENDPOINTS = {
  summary: (groupId) => `/api/groups/${groupId}/fund/summary`,
  campaigns: (groupId) => `/api/groups/${groupId}/fund/campaigns`,
  createIncome: (groupId) => `/api/groups/${groupId}/fund/income`,
  createExpense: (groupId) => `/api/groups/${groupId}/fund/expense`,
};