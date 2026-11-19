document.addEventListener("DOMContentLoaded", () => {
  const root = document.body.getAttribute("data-root") || "./";
  const currentPath = window.location.pathname;
  const isFund = currentPath.includes("fund.html");
  const isItems = currentPath.includes("items.html");
  const isHome = !isFund && !isItems;

  const navHtml = `
    <header class="main-header">
      <div class="header-container">
        <a href="${root}index.html" class="logo">Quản Lý Quỹ Nhóm</a>
        <nav class="nav-links">
          <a href="${root}index.html" class="${isHome ? "active" : ""}">Trang chủ</a>
          <a href="${root}pages/fund.html" class="${isFund ? "active" : ""}">Quỹ chung</a>
          <a href="${root}pages/items.html" class="${isItems ? "active" : ""}">Items (CRUD mẫu)</a>
        </nav>
      </div>
    </header>
  `;
  document.body.insertAdjacentHTML("afterbegin", navHtml);
});
