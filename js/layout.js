document.addEventListener("DOMContentLoaded", () => {
  const root = document.body.getAttribute("data-root") || "./";
  const navHtml = `
    <nav style="padding: 10px; background: #eee; margin-bottom: 20px;">
      <a href="${root}index.html" style="margin-right: 15px;">Trang chủ</a>
      <a href="${root}pages/items.html" style="margin-right: 15px;">Items (CRUD mẫu)</a>
      <a href="${root}pages/debts.html">Công nợ của tôi</a>
    </nav>
  `;
  document.body.insertAdjacentHTML("afterbegin", navHtml);
});