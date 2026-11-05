document.addEventListener("DOMContentLoaded", () => {
  loadItems();
  document.getElementById("item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const price = parseInt(document.getElementById("price").value, 10);
    const description = document.getElementById("description").value;

    try {
      await api.post("/items", { name, price, description });
      document.getElementById("item-form").reset();
      loadItems();
    } catch (err) {
      alert("Lỗi khi thêm: " + err.message);
    }
  });
});

async function loadItems() {
  const tbody = document.getElementById("item-list");
  try {
    const items = await api.get("/items");
    tbody.innerHTML = items
      .map(
        (item) => `
        <tr>
          <td>${item.id}</td>
          <td>${escapeHtml(item.name)}</td>
          <td>${item.price} đ</td>
          <td>${escapeHtml(item.description || "")}</td>
          <td>
            <button onclick="deleteItem(${item.id})">Xoá</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:red">Lỗi tải dữ liệu</td></tr>`;
  }
}

async function deleteItem(id) {
  if (!confirm("Xóa mục này?")) return;
  try {
    await api.delete(`/items/${id}`);
    loadItems();
  } catch (err) {
    alert("Lỗi khi xóa: " + err.message);
  }
}