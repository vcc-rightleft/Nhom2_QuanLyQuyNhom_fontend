/* T3CC8F7 — Authenticated notifications. All data comes from FastAPI/MySQL. */
(function () {
  'use strict';
  const ROOT = '/api/notifications';
  const PAGE_SIZE = 15;
  const REFRESH_MS = 30000;
  let intervalId = null;
  let activeAccount = '';
  let generation = 0;
  let dropdownOpen = false;
  let page = 0;
  let filter = 'all';
  let records = [];
  let lastPageHasNext = false;
  let loadRequest = 0;

  function loggedIn() {
    return typeof isSquadSignedIn === 'function' && isSquadSignedIn() &&
      !!sessionStorage.getItem('squad_cash_token');
  }
  function identity() { return loggedIn() ? String(squadSession?.accountId || '') : ''; }
  function messageError(error) {
    if (typeof notify === 'function') notify('Thông báo: ' + error.message);
    else console.error('[Thông báo]', error);
  }
  function text(value) { return escapeSquadHtml(value == null ? '' : value); }
  function time(value) {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('vi-VN');
  }
  function setBadge(value) {
    const badge = document.getElementById('squadUnreadBadge');
    if (!badge) return;
    const count = Number(value);
    if (!Number.isFinite(count) || count <= 0) {
      badge.textContent = '';
      badge.classList.add('hidden');
    } else {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.classList.remove('hidden');
    }
  }
  function closeDropdown() {
    dropdownOpen = false;
    document.getElementById('squadNotificationDropdown')?.classList.add('hidden');
    document.getElementById('squadBellButton')?.setAttribute('aria-expanded', 'false');
  }
  function reset() {
    generation++;
    loadRequest++;
    records = [];
    page = 0;
    filter = 'all';
    lastPageHasNext = false;
    setBadge(0);
    closeDropdown();
    const preview = document.getElementById('squadNotificationPreview');
    if (preview) preview.textContent = '';
    const all = document.getElementById('squadAllNotifications');
    if (all) all.textContent = '';
  }
  async function refreshCount() {
    if (!loggedIn()) { setBadge(0); return; }
    const gen = generation;
    const who = identity();
    try {
      const result = await squadApi(ROOT + '/unread-count');
      if (gen === generation && who === identity()) setBadge(result.unread_count);
    } catch (error) {
      if (gen === generation && who === identity()) {
        setBadge(0); // Don't display a stale count as if it were current.
        console.warn('[Thông báo] Không cập nhật được số chưa đọc', error);
      }
    }
  }
  function notificationMarkup(n) {
    const unread = !n.is_read;
    return `<button type="button" data-notif-id="${Number(n.id)}" class="w-full text-left block px-4 py-3 hover:bg-indigo/5 transition-colors ${unread ? 'bg-indigo/5' : 'bg-white'}">
      <div class="flex justify-between gap-3">
        <strong class="text-sm font-bold text-ink">${text(n.title)}</strong>
        ${unread ? '<span class="mt-1 shrink-0 w-2.5 h-2.5 rounded-full bg-indigo" aria-label="Chưa đọc"></span>' : ''}
      </div>
      <p class="text-xs text-muted mt-1 whitespace-pre-wrap break-words">${text(n.message)}</p>
      <time class="text-[11px] text-muted block mt-2">${text(time(n.created_at))}</time>
    </button>`;
  }
  function renderPreview(list) {
    const root = document.getElementById('squadNotificationPreview');
    if (!root) return;
    root.innerHTML = list.length ? list.map(notificationMarkup).join('') : '<p class="text-center py-5 text-sm text-muted">Chưa có thông báo</p>';
    root.querySelectorAll('[data-notif-id]').forEach(el => el.addEventListener('click', () => openSquadNotification(Number(el.dataset.notifId), list)));
  }
  async function refreshPreview() {
    if (!loggedIn()) return;
    const gen = generation;
    const who = identity();
    const root = document.getElementById('squadNotificationPreview');
    if (root) root.textContent = 'Đang tải thông báo...';
    try {
      const list = await squadApi(ROOT + '/?skip=0&limit=5');
      if (gen !== generation || who !== identity()) return;
      if (!Array.isArray(list)) throw new Error('Dữ liệu thông báo không hợp lệ');
      renderPreview(list);
    } catch (err) {
      if (gen !== generation || who !== identity()) return;
      if (root) root.textContent = 'Không tải được thông báo. Vui lòng thử lại.';
      console.warn('[Thông báo]', err);
    }
  }
  window.toggleSquadNotificationDropdown = function () {
    if (!loggedIn()) return;
    dropdownOpen = !dropdownOpen;
    const dropdown = document.getElementById('squadNotificationDropdown');
    dropdown?.classList.toggle('hidden', !dropdownOpen);
    document.getElementById('squadBellButton')?.setAttribute('aria-expanded', String(dropdownOpen));
    if (dropdownOpen) refreshPreview();
  };
  window.showAllSquadNotifications = function () {
    closeDropdown();
    if (!loggedIn()) return;
    page = 0;
    filter = 'all';
    switchRoleView('notifications');
  };
  window.filterSquadNotifications = function (choice) {
    if (!loggedIn() || !['all', 'unread'].includes(choice)) return;
    filter = choice;
    page = 0;
    loadAllSquadNotifications();
  };
  function setFilterButtons() {
    for (const [name, id] of [['all','notificationFilterAll'], ['unread','notificationFilterUnread']]) {
      const b = document.getElementById(id);
      if (!b) continue;
      b.classList.toggle('bg-lime', filter === name);
      b.setAttribute('aria-pressed', String(filter === name));
    }
  }
  window.loadAllSquadNotifications = async function () {
    if (!loggedIn()) return;
    const current = ++loadRequest;
    const gen = generation;
    const who = identity();
    const root = document.getElementById('squadAllNotifications');
    if (root) root.innerHTML = '<p class="p-6 text-muted">Đang tải thông báo...</p>';
    setFilterButtons();
    try {
      const url = `${ROOT}/?skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE + 1}${filter === 'unread' ? '&unread_only=true' : ''}`;
      const result = await squadApi(url);
      if (gen !== generation || who !== identity() || current !== loadRequest) return;
      if (!Array.isArray(result)) throw new Error('Dữ liệu thông báo không hợp lệ');
      lastPageHasNext = result.length > PAGE_SIZE;
      records = result.slice(0, PAGE_SIZE);
      if (root) {
        root.innerHTML = records.length ? records.map(notificationMarkup).join('') : '<p class="p-7 text-center text-muted">Không có thông báo nào.</p>';
        root.querySelectorAll('[data-notif-id]').forEach(el => el.addEventListener('click', () => openSquadNotification(Number(el.dataset.notifId), records)));
      }
      document.getElementById('squadNotificationPrev').disabled = page === 0;
      document.getElementById('squadNotificationNext').disabled = !lastPageHasNext;
      document.getElementById('squadNotificationPageLabel').textContent = `Trang ${page + 1}`;
    } catch (err) {
      if (gen !== generation || who !== identity() || current !== loadRequest) return;
      if (root) root.innerHTML = '<p class="p-6 text-red-700">Không tải được thông báo. Kiểm tra kết nối Backend rồi thử lại.</p>';
      document.getElementById('squadNotificationNext').disabled = true;
      messageError(err);
    }
  };
  window.navigateSquadNotificationPage = function (step) {
    if (!Number.isInteger(step) || Math.abs(step) !== 1) return;
    if (step > 0 && !lastPageHasNext) return;
    if (page + step < 0) return;
    page += step;
    loadAllSquadNotifications();
  };
  window.markAllSquadNotificationsRead = async function () {
    if (!loggedIn()) return;
    try {
      await squadApi(ROOT + '/read-all', {method: 'PUT'});
      page = 0;
      await Promise.all([refreshCount(), loadAllSquadNotifications(), dropdownOpen ? refreshPreview() : Promise.resolve()]);
    } catch (err) { messageError(err); }
  };
  // Route is an internal query string generated by Backend; never follow arbitrary URLs.
  async function followInternalTarget(path) {
    if (typeof path !== 'string' || !path.startsWith('?')) return;
    const params = new URLSearchParams(path.slice(1));
    if (params.get('view') !== 'user') return;
    const tab = params.get('tab');
    if (!['invoices', 'debts', 'ledger'].includes(tab)) return;
    switchRoleView('user');
    const groupId = Number(params.get('group_id'));
    if (Number.isSafeInteger(groupId) && groupId > 0 &&
        userJoinedGroups.some(g => Number(g.id) === groupId)) {
      await selectSquadGroup(groupId);
    }
    if (typeof switchUserSubTab === 'function') switchUserSubTab(tab);
    const billId = Number(params.get('bill_id'));
    if (tab === 'invoices' && Number.isSafeInteger(billId) && billId > 0 &&
        groupInvoices.some(b => b.id === 'INV-' + billId) && typeof openUserInvoiceModal === 'function') {
      openUserInvoiceModal('INV-' + billId);
    }
  }
  async function openSquadNotification(id, source) {
    if (!loggedIn()) return;
    const record = source.find(r => Number(r.id) === id);
    if (!record) return;
    const who = identity();
    try {
      if (!record.is_read) await squadApi(`${ROOT}/${id}/read`, {method: 'PUT'});
      if (who !== identity()) return;
      record.is_read = true;
      closeDropdown();
      await refreshCount();
      if (document.getElementById('view-notifications')?.classList.contains('hidden') === false) {
        await loadAllSquadNotifications();
      }
      if (record.target_path) await followInternalTarget(record.target_path);
    } catch (err) { messageError(err); }
  }
  window.squadNotificationsAuthChanged = function () {
    const user = identity();
    if (user === activeAccount && (user === '' || intervalId !== null)) return;
    activeAccount = user;
    if (intervalId !== null) clearInterval(intervalId);
    intervalId = null;
    reset();
    if (user) {
      refreshCount();
      intervalId = setInterval(() => {
        if (identity() !== activeAccount) { squadNotificationsAuthChanged(); return; }
        refreshCount();
      }, REFRESH_MS);
    }
  };
  document.addEventListener('squad:ready', window.squadNotificationsAuthChanged);
  document.addEventListener('click', event => {
    const root = document.getElementById('squadBellRoot');
    if (dropdownOpen && root && !root.contains(event.target)) closeDropdown();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDropdown(); });
})();
