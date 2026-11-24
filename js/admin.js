/* Trang Admin kết nối 100% API thật (T3CCB5B) — Không dùng dữ liệu mẫu */
(() => {
  'use strict';

  const API_BASE = (window.SQUAD_API_BASE || window.API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const PAGE_SIZE = 10;

  const state = {
    page: 1,
    totalPages: 1,
    searchTimer: null,
    groupSearchTimer: null,
    reqUsers: 0,
    reqGroups: 0,
    reqDashboard: 0,
    chart: null,
  };

  const $ = (id) => document.getElementById(id);

  const getToken = () =>
    localStorage.getItem('squad_cash_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('squad_cash_token') ||
    sessionStorage.getItem('access_token') ||
    sessionStorage.getItem('token') ||
    '';

  const getStoredUser = () => {
    for (const key of ['squad_cash_user', 'currentUser', 'user']) {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (_) {}
    }
    return null;
  };

  const formatNumber = (n) => Math.round(Number(n) || 0).toLocaleString('vi-VN');
  const formatVND = (n) => `${formatNumber(n)} ₫`;
  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : 'Chưa có');

  const say = (message, bad = false) => {
    const el = $('adminToast');
    if (!el) return;
    el.textContent = message;
    el.className = `fixed bottom-5 right-5 z-[60] max-w-md p-4 rounded-xl border-2 border-ink shadow-bold text-sm font-semibold ${
      bad ? 'bg-rose-100 text-rose-900' : 'bg-lime text-ink'
    }`;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => {
      el.textContent = '';
      el.className = 'fixed bottom-5 right-5 z-[60] max-w-md';
    }, 4500);
  };

  const errorBar = (message) => {
    const el = $('adminError');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
  };

  const clearError = () => {
    const el = $('adminError');
    if (!el) return;
    el.textContent = '';
    el.classList.add('hidden');
  };

  function renderAdminHeaderUser() {
    const badge = $('adminUserBadge');
    if (!badge) return;
    const u = getStoredUser();
    if (!u) {
      badge.textContent = 'Chưa đăng nhập';
      return;
    }
    const name = u.full_name || u.name || u.username || u.email || `User #${u.id || ''}`;
    const role = String(u.role || 'USER').toUpperCase();
    badge.textContent = `${name} (${role})`;
  }

  function logoutAdmin() {
    for (const key of ['squad_cash_token', 'access_token', 'token', 'squad_cash_user', 'currentUser', 'user']) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
    window.location.href = './auth.html';
  }

  async function request(path, opts = {}) {
    const token = getToken();
    if (!token) {
      throw new Error('Chưa có phiên đăng nhập. Hãy đăng nhập tài khoản ADMIN tại trang Đăng nhập.');
    }

    let response;
    try {
      response = await fetch(API_BASE + path, {
        ...opts,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
          ...(opts.headers || {}),
        },
      });
    } catch (_) {
      throw new Error('Không kết nối được Backend FastAPI (http://127.0.0.1:8000). Hãy kiểm tra server đang chạy.');
    }

    let body = null;
    try {
      body = await response.json();
    } catch (_) {}

    if (!response.ok) {
      const detail = body?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : response.status === 403
          ? 'Tài khoản hiện tại không có quyền ADMIN. Hãy cập nhật role = ADMIN trong MySQL rồi đăng nhập lại.'
          : response.status === 401
          ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          : `API lỗi HTTP ${response.status}`;
      throw new Error(message);
    }
    return body;
  }

  function cell(row, value, cls = 'py-3.5 px-4 text-xs') {
    const el = row.insertCell();
    el.className = cls;
    el.textContent = value == null || value === '' ? '—' : String(value);
    return el;
  }

  function btn(text, handler, color = 'btn-outline') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = color + ' px-3 py-2 rounded-lg text-xs font-bold';
    b.textContent = text;
    b.addEventListener('click', handler);
    return b;
  }

  /* ==================== 1. DASHBOARD KPI + CHART.JS ==================== */
  function renderMonthlyChart(items) {
    const canvas = $('admMonthlyGroupsChart');
    const emptyEl = $('admChartEmpty');
    if (!canvas || typeof Chart === 'undefined') return;

    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }

    if (!Array.isArray(items) || items.length === 0) {
      canvas.classList.add('hidden');
      emptyEl?.classList.remove('hidden');
      return;
    }

    canvas.classList.remove('hidden');
    emptyEl?.classList.add('hidden');

    state.chart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: items.map((i) => i.month),
        datasets: [
          {
            label: 'Nhóm mới theo tháng',
            data: items.map((i) => Number(i.count || 0)),
            backgroundColor: '#D4FF00',
            hoverBackgroundColor: '#7C3AED',
            borderColor: '#121212',
            borderWidth: 2,
            borderRadius: 8,
            maxBarThickness: 56,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#121212',
              font: { family: 'JetBrains Mono, monospace', weight: 'bold', size: 12 },
            },
          },
          tooltip: {
            backgroundColor: '#121212',
            titleColor: '#D4FF00',
            bodyColor: '#FFFFFF',
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} nhóm mới`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#121212', font: { family: 'JetBrains Mono, monospace', size: 11 } },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: '#121212',
              font: { family: 'JetBrains Mono, monospace', size: 11 },
            },
          },
        },
      },
    });
  }

  async function loadDashboard() {
    const seq = ++state.reqDashboard;
    const period = $('admPeriodFilter')?.value || 'all';

    try {
      const data = await request(`/api/admin/dashboard?period=${encodeURIComponent(period)}`);
      if (seq !== state.reqDashboard) return;

      const k = data.kpis || data;
      $('admKpiUsers').textContent = formatNumber(k.total_users);
      $('admKpiUsersSub').textContent =
        k.locked_users != null
          ? `${formatNumber(k.active_users)} hoạt động · ${formatNumber(k.locked_users)} bị khóa`
          : 'Tổng tài khoản đã đăng ký';

      $('admKpiGroups').textContent = formatNumber(k.total_groups);
      $('admKpiGroupsSub').textContent =
        k.inactive_30d_count != null
          ? `${formatNumber(k.inactive_30d_count)} nhóm không giao dịch 30 ngày`
          : 'Nhóm đang hoạt động trên server';

      $('admKpiBills').textContent = formatNumber(k.total_bills);
      $('admKpiTransactions').textContent = formatVND(k.total_transaction_amount);

      if ($('admInactive30dBadge') && k.inactive_30d_count != null) {
        $('admInactive30dBadge').textContent = String(k.inactive_30d_count);
      }

      const syncTime = data.synced_at
        ? new Date(data.synced_at).toLocaleString('vi-VN')
        : new Date().toLocaleString('vi-VN');
      $('admLastSync').textContent = syncTime;
      $('authStatus').textContent = 'API: ONLINE';

      renderMonthlyChart(data.monthly_new_groups || []);
    } catch (err) {
      if (seq !== state.reqDashboard) return;
      $('admKpiUsers').textContent = '—';
      $('admKpiGroups').textContent = '—';
      $('admKpiBills').textContent = '—';
      $('admKpiTransactions').textContent = '—';
      renderMonthlyChart([]);
      throw err;
    }
  }

  /* ==================== 2. QUẢN LÝ TÀI KHOẢN (TAB 1) ==================== */
  function setAccountsLoading(message) {
    const tb = $('admAccountsTableBody');
    tb.replaceChildren();
    const tr = tb.insertRow();
    const td = cell(tr, message, 'p-5 text-sm text-muted');
    td.colSpan = 7;
  }

  function renderAccountsPager(data) {
    const el = $('admAccountsPager');
    el.replaceChildren();
    const prev = btn('← Trước', () => {
      state.page--;
      loadAccounts().catch((err) => errorBar(err.message));
    });
    prev.disabled = state.page <= 1;

    const info = document.createElement('span');
    info.className = 'text-xs text-muted';
    info.textContent = `Trang ${data.page}/${Math.max(1, data.total_pages)} · ${data.total} tài khoản`;

    const next = btn('Sau →', () => {
      state.page++;
      loadAccounts().catch((err) => errorBar(err.message));
    });
    next.disabled = state.page >= Math.max(1, data.total_pages);
    el.append(prev, info, next);
  }

  async function loadAccounts() {
    const seq = ++state.reqUsers;
    setAccountsLoading('Đang tải danh sách tài khoản…');
    const query = new URLSearchParams({
      q: $('admUserSearch').value.trim(),
      status: $('admUserStatusFilter').value,
      page: String(state.page),
      page_size: String(PAGE_SIZE),
    });

    try {
      const data = await request('/api/admin/users?' + query);
      if (seq !== state.reqUsers) return;
      if (!data || !Array.isArray(data.items)) {
        throw new Error('API tài khoản trả về dữ liệu không hợp lệ.');
      }

      const tb = $('admAccountsTableBody');
      tb.replaceChildren();
      if (data.items.length === 0) {
        setAccountsLoading('Không có tài khoản phù hợp.');
      }

      for (const u of data.items) {
        const tr = tb.insertRow();
        cell(tr, `#${u.id}`, 'py-3.5 px-4 font-mono text-xs font-bold');
        cell(tr, u.full_name, 'py-3.5 px-4 text-sm font-semibold');
        cell(tr, [u.email_masked, u.phone_masked].filter(Boolean).join(' / '), 'py-3.5 px-4 font-mono text-xs');
        cell(tr, formatDate(u.created_at));
        cell(tr, u.group_count, 'py-3.5 px-4 text-center text-xs font-mono font-bold');

        const statusCell = tr.insertCell();
        statusCell.className = 'py-3.5 px-4 text-center';
        const statusBadge = document.createElement('span');
        statusBadge.className = 'font-mono text-[11px] font-bold px-2.5 py-1 rounded-full inline-block';
        if (u.status === 'ACTIVE') {
          statusBadge.classList.add('bg-emerald-100', 'text-emerald-800');
          statusBadge.textContent = 'Hoạt động';
        } else if (u.status === 'LOCKED') {
          statusBadge.classList.add('bg-rose-100', 'text-rose-800');
          statusBadge.textContent = 'Bị khóa';
          if (u.lock_reason) statusBadge.title = `Lý do: ${u.lock_reason}`;
        } else {
          statusBadge.classList.add('bg-slate-200', 'text-slate-700');
          statusBadge.textContent = u.status || '—';
        }
        statusCell.append(statusBadge);

        const act = tr.insertCell();
        act.className = 'py-3.5 px-4 text-right';
        if (String(u.role || '').toUpperCase() === 'ADMIN') {
          act.textContent = 'ADMIN (bảo vệ)';
          act.classList.add('font-mono', 'text-xs', 'text-muted');
        } else if (u.status === 'ACTIVE') {
          act.append(btn('Khóa TK', () => openLock(u)));
        } else if (u.status === 'LOCKED') {
          act.append(btn('Mở khóa', () => openUnlock(u), 'btn-cta-lime'));
        }
      }

      state.totalPages = data.total_pages || 1;
      renderAccountsPager(data);
      $('authStatus').textContent = 'API: ONLINE';
    } catch (err) {
      if (seq !== state.reqUsers) return;
      setAccountsLoading('Không tải được danh sách tài khoản.');
      $('admAccountsPager').replaceChildren();
      throw err;
    }
  }

  function openLock(u) {
    $('lockTargetUserId').value = u.id;
    $('lockTargetUserName').textContent = `${u.full_name} (#${u.id})`;
    $('lockReasonInput').value = '';
    $('modalAdminLockUser').classList.remove('hidden');
    $('lockReasonInput').focus();
  }

  function closeLock() {
    $('modalAdminLockUser').classList.add('hidden');
  }

  async function doLock(e) {
    e.preventDefault();
    const id = $('lockTargetUserId').value;
    const reason = $('lockReasonInput').value.trim();
    if (reason.length < 5) {
      say('Lý do khóa phải có ít nhất 5 ký tự.', true);
      return;
    }
    const submit = $('modalAdminLockUser').querySelector('[type=submit]');
    submit.disabled = true;
    try {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}/lock`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      closeLock();
      say(res?.message || 'Đã khóa tài khoản thành công.');
      await refreshAll();
    } catch (err) {
      say(err.message, true);
    } finally {
      submit.disabled = false;
    }
  }

  function openUnlock(u) {
    $('unlockTargetUserId').value = u.id;
    $('unlockTargetUserName').textContent = `${u.full_name} (#${u.id})`;
    $('modalAdminUnlockUser')?.classList.remove('hidden');
  }

  function closeUnlock() {
    if ($('unlockTargetUserId')) $('unlockTargetUserId').value = '';
    $('modalAdminUnlockUser')?.classList.add('hidden');
  }

  async function doUnlock(e) {
    e.preventDefault();
    const id = $('unlockTargetUserId')?.value;
    if (!id) return;
    const submit = $('confirmUnlockSubmitBtn') || $('modalAdminUnlockUser')?.querySelector('[type=submit]');
    if (submit) submit.disabled = true;
    try {
      const res = await request(`/api/admin/users/${encodeURIComponent(id)}/unlock`, { method: 'POST' });
      closeUnlock();
      say(res?.message || 'Đã mở khóa tài khoản.');
      await refreshAll();
    } catch (err) {
      say(err.message, true);
    } finally {
      if (submit) submit.disabled = false;
    }
  }

  /* ==================== 3. NHÓM KHÔNG GD 30 NGÀY & XÓA MỀM (TAB 2) ==================== */
  function setGroupsLoading(message) {
    const tb = $('admGroupsTableBody');
    tb.replaceChildren();
    const tr = tb.insertRow();
    const td = cell(tr, message, 'p-5 text-sm text-muted');
    td.colSpan = 7;
  }

  async function loadGroups() {
    const seq = ++state.reqGroups;
    setGroupsLoading('Đang tải danh sách nhóm…');

    const filter = $('admGroupFilter')?.value || 'inactive_30d';
    const q = $('admGroupSearch')?.value.trim() || '';
    const query = new URLSearchParams({ filter, q });

    try {
      const data = await request('/api/admin/groups?' + query);
      if (seq !== state.reqGroups) return;

      const items = Array.isArray(data) ? data : data?.items || [];
      const tb = $('admGroupsTableBody');
      tb.replaceChildren();

      if (filter === 'inactive_30d' && $('admInactive30dBadge')) {
        $('admInactive30dBadge').textContent = String(items.length);
      }

      if (items.length === 0) {
        setGroupsLoading(
          filter === 'inactive_30d'
            ? 'Không có nhóm nào không có giao dịch trong 30 ngày gần nhất.'
            : 'Không tìm thấy nhóm phù hợp.'
        );
        return;
      }

      for (const g of items) {
        const tr = tb.insertRow();
        const unpaidDebt = Number(g.unpaid_debt || 0);
        const isDeleted = Boolean(g.is_deleted || g.status === 'soft_deleted');
        const canSoftDelete = !isDeleted && unpaidDebt === 0 && g.can_soft_delete !== false;

        cell(tr, `#${g.id}`, 'py-3.5 px-4 font-mono text-xs font-bold');

        const nameCell = tr.insertCell();
        nameCell.className = 'py-3.5 px-4';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'font-bold text-ink text-sm';
        titleDiv.textContent = g.name || 'Không tên';
        const hostDiv = document.createElement('div');
        hostDiv.className = 'text-xs text-muted';
        hostDiv.textContent = `Host: ${g.host_name || '—'}`;
        nameCell.append(titleDiv, hostDiv);

        cell(tr, g.member_count ?? 0, 'py-3.5 px-4 text-center font-mono text-xs font-bold');
        cell(tr, formatDate(g.last_transaction_at || g.last_activity_at), 'py-3.5 px-4 font-mono text-xs text-muted');
        cell(
          tr,
          formatVND(unpaidDebt),
          `py-3.5 px-4 text-right font-mono text-xs font-bold ${unpaidDebt > 0 ? 'text-rose-600' : 'text-emerald-700'}`
        );

        const statusCell = tr.insertCell();
        statusCell.className = 'py-3.5 px-4 text-center';
        const badge = document.createElement('span');
        badge.className = 'font-mono text-[11px] font-bold px-2.5 py-1 rounded-full inline-block';
        if (isDeleted) {
          badge.classList.add('bg-slate-200', 'text-slate-700');
          badge.textContent = 'Đã xóa mềm';
        } else if (unpaidDebt > 0) {
          badge.classList.add('bg-rose-100', 'text-rose-800');
          badge.textContent = 'Còn nợ chưa trả';
        } else {
          badge.classList.add('bg-emerald-100', 'text-emerald-800');
          badge.textContent = 'Hết nợ · Được xóa mềm';
        }
        statusCell.append(badge);

        const act = tr.insertCell();
        act.className = 'py-3.5 px-4 text-right';
        if (isDeleted) {
          const done = document.createElement('span');
          done.className = 'font-mono text-xs text-muted';
          done.textContent = 'Đã lưu trữ';
          act.append(done);
        } else if (canSoftDelete) {
          act.append(btn('Xóa mềm nhóm', () => openSoftDelete(g), 'btn-cta-lime'));
        } else {
          const blocked = btn('Chặn xóa (Còn nợ)', () => say(`Nhóm "${g.name}" vẫn còn nợ chưa trả (${formatVND(unpaidDebt)}).`, true));
          blocked.disabled = true;
          blocked.title = 'Chỉ được xóa mềm khi nhóm không còn nợ chưa trả';
          act.append(blocked);
        }
      }
    } catch (err) {
      if (seq !== state.reqGroups) return;
      setGroupsLoading('Không tải được danh sách nhóm.');
      throw err;
    }
  }

  function openSoftDelete(g) {
    if (Number(g.unpaid_debt || 0) > 0) {
      say(`Không thể xóa mềm nhóm "${g.name}" vì vẫn còn nợ chưa trả.`, true);
      return;
    }
    $('softDeleteGroupId').value = g.id;
    const box = $('softDeleteGroupSummary');
    box.replaceChildren();

    const lines = [
      `Nhóm mục tiêu: ${g.name} (#${g.id})`,
      `Host: ${g.host_name || '—'} · Thành viên: ${g.member_count ?? 0} người`,
      `Giao dịch gần nhất: ${formatDate(g.last_transaction_at || g.last_activity_at)}`,
      'Nợ chưa trả hiện tại: 0 ₫ (Đủ điều kiện xóa mềm)',
    ];
    lines.forEach((txt, idx) => {
      const div = document.createElement('div');
      if (idx === 0) div.className = 'font-bold text-ink';
      if (idx === 3) div.className = 'font-mono font-bold text-emerald-700 pt-1';
      div.textContent = txt;
      box.append(div);
    });

    $('softDeleteNotifyCheck').checked = true;
    $('modalAdminSoftDeleteGroup').classList.remove('hidden');
    $('softDeleteReasonInput').focus();
  }

  function closeSoftDelete() {
    $('modalAdminSoftDeleteGroup').classList.add('hidden');
  }

  async function doSoftDelete(e) {
    e.preventDefault();
    const id = $('softDeleteGroupId').value;
    const reason = $('softDeleteReasonInput').value.trim();
    const notifyMembers = $('softDeleteNotifyCheck').checked;
    const submit = $('modalAdminSoftDeleteGroup').querySelector('[type=submit]');

    submit.disabled = true;
    try {
      const res = await request(`/api/admin/groups/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason, notify_members: notifyMembers }),
      });
      closeSoftDelete();
      say(res?.message || 'Đã xóa mềm nhóm và gửi thông báo tới các thành viên.');
      await refreshAll();
    } catch (err) {
      say(err.message, true);
    } finally {
      submit.disabled = false;
    }
  }

  /* ==================== 4. ĐIỀU HƯỚNG & ĐỒNG BỘ ==================== */
  function switchTab(tab) {
    for (const name of ['accounts', 'groups', 'retention']) {
      $('aTabContent-' + name).classList.toggle('hidden', name !== tab);
      const b = $('aTabBtn-' + name);
      b.classList.toggle('bg-ink', name === tab);
      b.classList.toggle('text-white', name === tab);
      b.classList.toggle('text-muted', name !== tab);
    }
  }

  async function refreshAll() {
    clearError();
    renderAdminHeaderUser();
    const results = await Promise.allSettled([loadDashboard(), loadAccounts(), loadGroups()]);
    const firstErr = results.find((r) => r.status === 'rejected');
    if (firstErr) {
      const msg = firstErr.reason?.message || 'Có lỗi khi đồng bộ dữ liệu Admin.';
      $('authStatus').textContent = 'Lỗi kết nối / phân quyền';
      errorBar(msg);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    for (const name of ['accounts', 'groups', 'retention']) {
      $('aTabBtn-' + name).addEventListener('click', () => switchTab(name));
    }

    $('admPeriodFilter').addEventListener('change', () => {
      loadDashboard().catch((err) => errorBar(err.message));
    });

    $('admUserSearch').addEventListener('input', () => {
      clearTimeout(state.searchTimer);
      state.page = 1;
      state.searchTimer = setTimeout(() => loadAccounts().catch((err) => errorBar(err.message)), 300);
    });
    $('admUserStatusFilter').addEventListener('change', () => {
      state.page = 1;
      loadAccounts().catch((err) => errorBar(err.message));
    });

    $('admGroupSearch').addEventListener('input', () => {
      clearTimeout(state.groupSearchTimer);
      state.groupSearchTimer = setTimeout(() => loadGroups().catch((err) => errorBar(err.message)), 300);
    });
    $('admGroupFilter').addEventListener('change', () => {
      loadGroups().catch((err) => errorBar(err.message));
    });

    $('reloadAdmin').addEventListener('click', refreshAll);
    $('adminLogoutBtn')?.addEventListener('click', logoutAdmin);

    $('modalAdminLockUser').querySelector('form').addEventListener('submit', doLock);
    $('modalAdminLockUser').querySelectorAll('button[type=button]').forEach((b) => b.addEventListener('click', closeLock));

    $('unlockUserForm')?.addEventListener('submit', doUnlock);
    $('closeUnlockModalX')?.addEventListener('click', closeUnlock);
    $('cancelUnlockModalBtn')?.addEventListener('click', closeUnlock);

    $('modalAdminSoftDeleteGroup').querySelector('form').addEventListener('submit', doSoftDelete);
    $('modalAdminSoftDeleteGroup').querySelectorAll('button[type=button]').forEach((b) => b.addEventListener('click', closeSoftDelete));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLock();
        closeUnlock();
        closeSoftDelete();
      }
    });

    switchTab('accounts');
    if (window.lucide) window.lucide.createIcons();
    refreshAll();
  });
})();