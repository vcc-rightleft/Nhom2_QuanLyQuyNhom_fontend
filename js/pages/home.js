document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status");
  try {
    const res = await api.get("/health");
    if (res.database === "connected") {
      statusEl.innerHTML = "<b style='color: green;'> Backend OK · MySQL: connected</b>";
    } else {
      statusEl.innerHTML = "<b style='color: orange;'> Backend OK · MySQL: disconnected</b>";
    }
  } catch (err) {
    statusEl.innerHTML = "<b style='color: red;'> Không kết nối được backend</b>";
  }
});