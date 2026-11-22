/* SQUAD.CASH modular bootstrap — tải HTML trước, JavaScript sau. */
(async function bootstrapSquad() {
  const partials = ["shell", "view-landing", "view-auth", "view-user", "view-host", "view-admin", "dialogs"];
  const scripts = ["js/squad/state.js", "js/squad/session.js", "js/squad/backend-api.js", "js/squad/navigation.js", "js/squad/authentication.js", "js/squad/user-workspace.js", "js/squad/host-workspace.js", "js/squad/admin-workspace.js", "js/squad/dialogs.js", "js/squad/interactions.js", "js/squad/quick-actions.js", "js/squad/debt-alerts.js", "js/squad/host-transfer.js", "js/squad/onboarding.js", "js/squad/transitions.js", "js/squad/cinematic-intro.js", "js/squad/workspace-animations.js", "js/squad/profile.js"];
  const loading = document.getElementById('squad-loading');
  try {
    for (const name of partials) {
      const response = await fetch('./partials/' + name + '.html');
      if (!response.ok) throw new Error('Không tải được ' + name + '.html (' + response.status + ')');
      const fragment = document.createElement('template');
      fragment.innerHTML = await response.text();
      document.body.insertBefore(fragment.content, loading);
    }
    for (const src of scripts) {
      await new Promise((resolve, reject) => {
        const tag = document.createElement('script');
        tag.src = './' + src;
        tag.onload = resolve;
        tag.onerror = () => reject(new Error('Không tải được ' + src));
        document.body.appendChild(tag);
      });
    }
    loading.remove();
    if (isSquadSignedIn()) {
      clearSquadWorkingData();
      try {
        if (!sessionStorage.getItem(SQUAD_TOKEN_KEY)) throw new Error('Phiên đăng nhập không có token');
        const me = await squadApi('/auth/me');
        startSquadSession(me.full_name, me.role === 'ADMIN' ? 'admin' : 'user', true, String(me.id));
        currentUserProfile = {...currentUserProfile,...me};
        syncProfileNameToUI();
        await refreshServerGroups();
      } catch(err) {
        console.warn('Không tải được phiên Backend:', err);
        squadSession = null;
        clearSquadWorkingData();
        sessionStorage.removeItem(SQUAD_SESSION_KEY);
        sessionStorage.removeItem(SQUAD_TOKEN_KEY);
      }
    }
    refreshSquadNavigation();
    document.dispatchEvent(new CustomEvent('squad:ready'));
    // Điều hướng đến giao diện mới khi truy cập từ các đường dẫn pages/ cũ.
    const params = new URLSearchParams(window.location.search);
    const role = params.get('view');
    if (role && canViewSquad(role)) {
      const splash = document.getElementById('cinematicIntroSplash');
      if (splash) { splash.classList.add('hidden'); splash.style.display = 'none'; }
      if (typeof switchRoleView === 'function') switchRoleView(role);
      const mode = params.get('mode');
      if (role === 'auth' && ['login', 'register'].includes(mode) && typeof switchAuthTab === 'function') switchAuthTab(mode);
      const tab = params.get('tab');
      if (role === 'user' && tab === 'debts' && typeof switchUserSubTab === 'function') {
        try { switchUserSubTab('debts'); } catch (e) { console.warn('Không chuyển được tab công nợ', e); }
      }
      if (role === 'host' && tab === 'invoice' && typeof switchHostTab === 'function') {
        try { switchHostTab('invoice'); } catch (e) { console.warn('Không chuyển được tab hóa đơn', e); }
      }
    } else if (isSquadSignedIn()) {
      document.getElementById('cinematicIntroSplash')?.classList.add('hidden');
      switchRoleView('user');
    } else if (role && !canViewSquad(role)) {
      document.getElementById('cinematicIntroSplash')?.classList.add('hidden');
      switchRoleView('auth');
    }
  } catch (error) {
    console.error('[SQUAD.CASH]',error);
    loading.innerHTML = '<div style="padding:32px;max-width:600px"><h2>Không thể khởi động giao diện</h2><p>' + String(error.message).replace(/[&<>]/g, '') + '</p><p>Hãy chạy dự án bằng một HTTP server (ví dụ <code>python -m http.server 5500</code>), không mở trực tiếp file://.</p></div>';
  }
})();
