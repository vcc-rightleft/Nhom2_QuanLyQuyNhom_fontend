import { API_BASE_URL } from "./config.js";

const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

const api = {
  get: (url, params) => http.get(url, { params }),
  post: (url, data) => http.post(url, data),
  put: (url, data) => http.put(url, data),
  delete: (url) => http.delete(url),
};

window.api = api;
export default api;