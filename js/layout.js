document.addEventListener("DOMContentLoaded", () => {
  const root = document.body.getAttribute("data-root") || "./";
  const navHtml = `
    <nav style="padding: 10px; background: #eee; margin-bottom: 20px;">
      <a href="${root}index.html" style="margin-right: 15px;">Trang chủ</a>
      <a href="${root}pages/items.html">Items (CRUD mẫu)</a>
    </nav>
  `;
  document.body.insertAdjacentHTML("afterbegin", navHtml);
});