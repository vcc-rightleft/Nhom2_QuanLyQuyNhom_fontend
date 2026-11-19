import api from "../api.js";

export async function renderHome(container) {
  try {
    const res = await api.get("/api/health");
    container.innerHTML = `<p style="color: green;">Kết nối Backend thành công: ${JSON.stringify(res)}</p>`;
  } catch (err) {
    container.innerHTML = `<p style="color: red;">Không kết nối được backend: ${err.message}</p>`;
  }
}