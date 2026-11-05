const http = axios.create({
  baseURL: CONFIG.API_BASE_URL,
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