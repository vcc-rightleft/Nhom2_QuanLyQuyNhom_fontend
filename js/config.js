export const API_BASE_URL = "http://127.0.0.1:8000";
export const DEFAULT_GROUP_ID = 1;

export const FUND_ENDPOINTS = {
  summary: (groupId) => `/api/groups/${groupId}/fund-overview`,
  campaigns: (groupId) => `/api/groups/${groupId}/collections`,
  createIncome: (groupId) => `/api/groups/${groupId}/fund-transactions`,
  createExpense: (groupId) => `/api/groups/${groupId}/fund-transactions`,
};