
document.addEventListener('DOMContentLoaded', () => {

  // Khởi tạo icon Lucide
  if (window.lucide) {
    lucide.createIcons();
  }


  // Năm hiện tại ở footer
  const yearElement = document.getElementById('currentYear');

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }


  // Menu mobile
  const menuButton = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');

  if (menuButton && mainNav) {

    menuButton.addEventListener('click', () => {
      mainNav.classList.toggle('open');

      const isOpen = mainNav.classList.contains('open');

      menuButton.setAttribute(
        'aria-label',
        isOpen ? 'Đóng menu' : 'Mở menu'
      );

      menuButton.innerHTML = isOpen
        ? '<i data-lucide="x"></i>'
        : '<i data-lucide="menu"></i>';

      if (window.lucide) {
        lucide.createIcons();
      }
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
      });
    });
  }


  // Máy tính chia hóa đơn
  const amountInput = document.getElementById('billAmount');
  const peopleInput = document.getElementById('peopleCount');
  const perPerson = document.getElementById('perPerson');
  const splitSummary = document.getElementById('splitSummary');


  function formatVND(value) {
    return Math.round(value).toLocaleString('vi-VN') + '₫';
  }


  function updateCalculator() {

    if (!amountInput || !peopleInput || !perPerson || !splitSummary) {
      return;
    }

    const amount = Math.max(
      0,
      Number(amountInput.value) || 0
    );

    const people = Math.min(
      100,
      Math.max(
        1,
        Math.floor(Number(peopleInput.value) || 1)
      )
    );

    peopleInput.value = people;

    const result = amount / people;

    perPerson.textContent = formatVND(result);

    splitSummary.textContent =
      `${formatVND(amount)} chia cho ${people} người`;
  }


  amountInput?.addEventListener('input', updateCalculator);

  peopleInput?.addEventListener('input', updateCalculator);


  // Các nút chọn nhanh số tiền
  document.querySelectorAll('[data-amount]').forEach(button => {

    button.addEventListener('click', () => {

      if (!amountInput) return;

      amountInput.value = button.dataset.amount;

      updateCalculator();

    });

  });


  // Tính toán ngay khi mở trang
  updateCalculator();

});
