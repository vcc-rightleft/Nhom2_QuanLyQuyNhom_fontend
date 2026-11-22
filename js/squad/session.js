/* Quản lý phiên HIỂN THỊ frontend. Backend phải xác thực token và phân quyền trên API. */
const SQUAD_SESSION_KEY = 'squad.cash.session.v1';
let squadSession = null;
try {
  const saved = JSON.parse(sessionStorage.getItem(SQUAD_SESSION_KEY) || 'null');
  if (saved && saved.signedIn === true) squadSession = { signedIn: true, role: saved.role === 'admin' && saved.verifiedByServer === true ? 'admin' : 'user', verifiedByServer: saved.verifiedByServer === true, name: saved.name || '', accountId: saved.accountId || '' };
} catch (_) { sessionStorage.removeItem(SQUAD_SESSION_KEY); }
function isSquadSignedIn() { return Boolean(squadSession?.signedIn); }
function canViewSquad(role) {
  if (role === 'landing' || role === 'auth') return !isSquadSignedIn();
  if (role === 'user' || role === 'host') return isSquadSignedIn();
  if (role === 'admin') return isSquadSignedIn() && squadSession.role === 'admin' && squadSession.verifiedByServer === true;
  return false;
}
function refreshSquadNavigation() {
  ['landing','auth','user','host','admin'].forEach(role => {
    const btn = document.getElementById('roleBtn-' + role);
    if (btn) btn.classList.toggle('hidden', !canViewSquad(role));
  });
  document.getElementById('squadLogoutBtn')?.classList.toggle('hidden', !isSquadSignedIn());
  document.querySelectorAll('[data-squad-auth-only]').forEach(el => el.classList.toggle('hidden', !isSquadSignedIn()));
  document.querySelectorAll('[data-squad-admin-only]').forEach(el => el.classList.toggle('hidden', !canViewSquad('admin')));
}
function startSquadSession(name, role = 'user', verifiedByServer = false, accountId = '') {
  // Không cấp quyền admin nếu thiếu xác minh từ server.
  squadSession = { signedIn: true, name: String(name || ''), role: role === 'admin' && verifiedByServer ? 'admin' : 'user', verifiedByServer: verifiedByServer === true, accountId: String(accountId || name || '').trim().toLowerCase() };
  sessionStorage.setItem(SQUAD_SESSION_KEY, JSON.stringify(squadSession));
  clearSquadWorkingData();
  if (typeof currentUserProfile !== 'undefined') { currentUserProfile = { full_name: squadSession.name, email: squadSession.accountId.includes('@') ? squadSession.accountId : '', phone: '', bank_name: '', bank_account_no: '', bank_account_name: '' }; syncProfileNameToUI(); }
  refreshSquadNavigation();
}
async function logoutSquad() {
  let revoked = false;
  if (sessionStorage.getItem(SQUAD_TOKEN_KEY)) {
    try { await squadApi('/auth/logout', {method:'POST'}); revoked = true; }
    catch(err) { console.warn('Không thu hồi được token trên Backend:', err); }
  }
  clearSquadWorkingData();
  squadSession = null;
  sessionStorage.removeItem(SQUAD_SESSION_KEY);
  sessionStorage.removeItem("squad_cash_token");
  // Dọn token từ các luồng xác thực trước nếu đang dùng cùng ứng dụng.
  ['access_token','squadcash_token','token','refresh_token'].forEach(key => localStorage.removeItem(key));
  refreshSquadNavigation();
  const splash = document.getElementById('cinematicIntroSplash');
  if (splash) splash.classList.add('hidden');
  const overlay = document.getElementById('portalRevealOverlay');
  if (overlay) overlay.classList.add('hidden');
  switchRoleView('auth');
  if (typeof switchAuthTab === 'function') switchAuthTab('login');
  if (typeof notify === 'function') notify(revoked ? 'Đã đăng xuất và thu hồi phiên trên Backend.' : 'Đã xóa phiên trên thiết bị; chưa xác nhận thu hồi token ở Backend.');
}

// Dữ liệu nghiệp vụ CHỈ lấy từ FastAPI/MySQL, không ghi lại localStorage.
function clearSquadWorkingData() {
  groupMembers.length = 0;
  userJoinedGroups = [];
  groupDebts = [];
  groupInvoices = [];
  fundTransactions = [];
  itemizedRows = [];
  currentGroupSingleCode = '';
  if (typeof squadSelectedGroupId !== 'undefined') squadSelectedGroupId = null;
}
