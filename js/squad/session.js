
/* ==========================================================
   SQUAD.CASH - QUẢN LÝ PHIÊN ĐĂNG NHẬP VÀ PHÂN QUYỀN
   Backend phải xác thực token và phân quyền trên API.
========================================================== */

const SQUAD_SESSION_KEY = 'squad.cash.session.v1';

let squadSession = null;


// ==========================================================
// KHÔI PHỤC PHIÊN ĐĂNG NHẬP
// ==========================================================

try {
    const saved = JSON.parse(
        sessionStorage.getItem(SQUAD_SESSION_KEY) || 'null'
    );

    if (saved && saved.signedIn === true) {
        squadSession = {
            signedIn: true,

            role:
                String(saved.role || '').toLowerCase() === 'admin' &&
                saved.verifiedByServer === true
                    ? 'admin'
                    : 'user',

            verifiedByServer: saved.verifiedByServer === true,

            name: saved.name || '',

            accountId: saved.accountId || ''
        };
    }

} catch (_) {
    sessionStorage.removeItem(SQUAD_SESSION_KEY);
}


// ==========================================================
// KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
// ==========================================================

function isSquadSignedIn() {
    return Boolean(squadSession?.signedIn);
}


// ==========================================================
// KIỂM TRA QUYỀN TRUY CẬP
// ==========================================================

function canViewSquad(role) {
    role = String(role || '').toLowerCase();

    if (role === 'landing' || role === 'auth') {
        return !isSquadSignedIn();
    }

    if (role === 'user' || role === 'host') {
        return isSquadSignedIn();
    }

    if (role === 'admin') {
        return (
            isSquadSignedIn() &&
            squadSession.role === 'admin' &&
            squadSession.verifiedByServer === true
        );
    }

    return false;
}


// ==========================================================
// CẬP NHẬT THANH ĐIỀU HƯỚNG THEO QUYỀN
// ==========================================================

function refreshSquadNavigation() {

    const roles = [
        'landing',
        'auth',
        'user',
        'host',
        'admin'
    ];

    roles.forEach(role => {

        const btn = document.getElementById(
            'roleBtn-' + role
        );

        if (btn) {
            btn.classList.toggle(
                'hidden',
                !canViewSquad(role)
            );
        }
    });


    // Hiển thị nút đăng xuất khi đã đăng nhập
    document
        .getElementById('squadLogoutBtn')
        ?.classList.toggle(
            'hidden',
            !isSquadSignedIn()
        );


    // Các chức năng yêu cầu đăng nhập
    document
        .querySelectorAll('[data-squad-auth-only]')
        .forEach(el => {
            el.classList.toggle(
                'hidden',
                !isSquadSignedIn()
            );
        });


    // Các chức năng chỉ dành cho ADMIN
    document
        .querySelectorAll('[data-squad-admin-only]')
        .forEach(el => {
            el.classList.toggle(
                'hidden',
                !canViewSquad('admin')
            );
        });
}


// ==========================================================
// MỞ DASHBOARD ADMIN MỚI
// ==========================================================

async function openAdminDashboard() {

    // Kiểm tra quyền tại Frontend
    if (!canViewSquad('admin')) {

        if (typeof notify === 'function') {
            notify('Bạn không có quyền ADMIN.');
        }

        return;
    }

    try {

        // Xác minh tài khoản thực tế từ Backend
        const user = await squadApi('/auth/me');

        const serverRole = String(
            user?.role || ''
        ).trim().toUpperCase();


        // Từ chối nếu Backend xác nhận không phải ADMIN
        if (serverRole !== 'ADMIN') {

            squadSession.role = 'user';

            sessionStorage.setItem(
                SQUAD_SESSION_KEY,
                JSON.stringify(squadSession)
            );

            refreshSquadNavigation();

            if (typeof notify === 'function') {
                notify('Bạn không có quyền ADMIN.');
            }

            return;
        }


        // Chuyển hướng đến Dashboard Admin mới
        window.location.href = './pages/admin.html';

    } catch (err) {

        console.error(
            'Lỗi mở Dashboard Admin:',
            err
        );

        if (typeof notify === 'function') {
            notify(
                'Không thể mở trang Admin: ' +
                (err.message || 'Lỗi xác thực')
            );
        }
    }
}


// ==========================================================
// KHỞI TẠO PHIÊN ĐĂNG NHẬP
// ==========================================================

function startSquadSession(
    name,
    role = 'user',
    verifiedByServer = false,
    accountId = ''
) {

    const normalizedRole = String(
        role || 'user'
    ).trim().toLowerCase();


    // Không cấp quyền ADMIN nếu chưa được xác minh
    squadSession = {

        signedIn: true,

        name: String(name || ''),

        role:
            normalizedRole === 'admin' &&
            verifiedByServer === true
                ? 'admin'
                : 'user',

        verifiedByServer: verifiedByServer === true,

        accountId: String(
            accountId || name || ''
        ).trim().toLowerCase()

    };


    // Lưu phiên hiển thị
    sessionStorage.setItem(
        SQUAD_SESSION_KEY,
        JSON.stringify(squadSession)
    );


    // Dọn dữ liệu nghiệp vụ của tài khoản trước
    clearSquadWorkingData();


    // Đồng bộ thông tin hồ sơ
    if (typeof currentUserProfile !== 'undefined') {

        currentUserProfile = {

            full_name: squadSession.name,

            email: squadSession.accountId.includes('@')
                ? squadSession.accountId
                : '',

            phone: '',

            bank_name: '',

            bank_account_no: '',

            bank_account_name: ''

        };

        syncProfileNameToUI();
    }


    // Cập nhật giao diện theo quyền
    refreshSquadNavigation();
}


// ==========================================================
// ĐĂNG XUẤT VÀ THU HỒI TOKEN
// ==========================================================

async function logoutSquad() {

    let revoked = false;

    if (sessionStorage.getItem(SQUAD_TOKEN_KEY)) {

        try {

            await squadApi('/auth/logout', {
                method: 'POST'
            });

            revoked = true;

        } catch (err) {

            console.warn(
                'Không thu hồi được token trên Backend:',
                err
            );

        }
    }


    // Xóa dữ liệu nghiệp vụ đang hiển thị
    clearSquadWorkingData();


    // Xóa phiên đăng nhập
    squadSession = null;

    sessionStorage.removeItem(SQUAD_SESSION_KEY);

    sessionStorage.removeItem(SQUAD_TOKEN_KEY);

    sessionStorage.removeItem('squad_cash_token');

    sessionStorage.removeItem('squad_cash_user');


    // Dọn token từ các luồng xác thực trước
    const authKeys = [
        'access_token',
        'squadcash_token',
        'token',
        'refresh_token'
    ];

    authKeys.forEach(key => {

        localStorage.removeItem(key);

        sessionStorage.removeItem(key);

    });


    // Cập nhật thanh điều hướng
    refreshSquadNavigation();


    // Ẩn màn hình giới thiệu
    const splash = document.getElementById(
        'cinematicIntroSplash'
    );

    if (splash) {
        splash.classList.add('hidden');
    }


    const overlay = document.getElementById(
        'portalRevealOverlay'
    );

    if (overlay) {
        overlay.classList.add('hidden');
    }


    // Trở về trang đăng nhập
    switchRoleView('auth');

    if (typeof switchAuthTab === 'function') {
        switchAuthTab('login');
    }


    // Thông báo kết quả đăng xuất
    if (typeof notify === 'function') {

        notify(
            revoked
                ? 'Đã đăng xuất và thu hồi phiên trên Backend.'
                : 'Đã xóa phiên trên thiết bị; chưa xác nhận thu hồi token ở Backend.'
        );
    }
}


// ==========================================================
// XÓA DỮ LIỆU NGHIỆP VỤ TRÊN FRONTEND
// Dữ liệu thật được lưu tại FastAPI/MySQL
// ==========================================================

function clearSquadWorkingData() {

    groupMembers.length = 0;

    userJoinedGroups = [];

    groupDebts = [];

    groupInvoices = [];

    fundTransactions = [];

    itemizedRows = [];

    currentGroupSingleCode = '';

    if (typeof squadSelectedGroupId !== 'undefined') {
        squadSelectedGroupId = null;
    }
}
