import { API_BASE_URL } from "./config.js";

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getStoredToken() {
  return (
    localStorage.getItem("squad_cash_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

http.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

const api = {
  get: (url, params) => http.get(url, { params }),
  post: (url, data) => http.post(url, data),
  put: (url, data) => http.put(url, data),
  patch: (url, data) => http.patch(url, data),
  delete: (url) => http.delete(url),
};

window.api = api;
export default api;