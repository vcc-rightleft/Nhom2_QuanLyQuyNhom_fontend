/* =========================================================
   SQUAD.CASH — PUBLIC LANDING PAGE
   File: js/pages/landing.js
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Footer year
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Mobile navigation
    const menuButton = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');

    if (menuButton && mainNav) {
        menuButton.setAttribute('aria-expanded', 'false');

        menuButton.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.setAttribute('aria-label', isOpen ? 'Đóng menu' : 'Mở menu');
            menuButton.innerHTML = isOpen
                ? '<i data-lucide="x"></i>'
                : '<i data-lucide="menu"></i>';

            if (window.lucide) window.lucide.createIcons();
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.setAttribute('aria-label', 'Mở menu');
                menuButton.innerHTML = '<i data-lucide="menu"></i>';
                if (window.lucide) window.lucide.createIcons();
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 680) {
                mainNav.classList.remove('open');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Smooth scrolling for in-page links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
            const selector = link.getAttribute('href');
            if (!selector || selector === '#') return;

            const target = document.querySelector(selector);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Split-bill calculator
    const amountInput = document.getElementById('billAmount');
    const peopleInput = document.getElementById('peopleCount');
    const perPerson = document.getElementById('perPerson');
    const splitSummary = document.getElementById('splitSummary');

    const formatVND = value =>
        Math.round(value).toLocaleString('vi-VN') + '₫';

    const updateCalculator = () => {
        if (!amountInput || !peopleInput || !perPerson || !splitSummary) return;

        const amount = Math.max(0, Number(amountInput.value) || 0);
        const people = Math.min(100, Math.max(1, Math.floor(Number(peopleInput.value) || 1)));

        peopleInput.value = String(people);
        perPerson.textContent = formatVND(amount / people);
        splitSummary.textContent = `${formatVND(amount)} chia cho ${people} người`;
    };

    amountInput?.addEventListener('input', updateCalculator);
    peopleInput?.addEventListener('input', updateCalculator);

    document.querySelectorAll('[data-amount]').forEach(button => {
        button.addEventListener('click', () => {
            if (!amountInput) return;
            amountInput.value = button.dataset.amount || '0';
            updateCalculator();
        });
    });

    updateCalculator();

    // Reveal sections on scroll; content remains visible if observer is unavailable
    const revealItems = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealItems.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealItems.forEach(item => observer.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('is-visible'));
    }
});
