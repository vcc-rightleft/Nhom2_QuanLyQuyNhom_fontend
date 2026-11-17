function renderHeaderLayout() {
    const headerContainer = document.getElementById("commonAppHeader");
    if (!headerContainer) return;

    const user = getCurrentUser();
    const token = getAccessToken();

    headerContainer.innerHTML = `
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            <!-- Brand Identity -->
            <div class="flex items-center gap-3 cursor-pointer" onclick="switchRoleView('landing')">
                <div class="w-10 h-10 rounded-xl bg-lime text-ink border-2 border-ink shadow-bold-sm flex items-center justify-center font-display font-bold text-xl">
                    $
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-display font-bold text-lg tracking-tight text-ink">SQUAD.CASH</span>
                        <span class="font-mono text-[11px] font-bold bg-lime border-[1.5px] border-ink px-2 py-0.5 rounded-md text-ink">
                            SPRINT 2 • T3CC8A9
                        </span>
                    </div>
                    <p class="text-xs text-muted font-medium">Wiro Renaissance Art × Western Bold FinTech OS</p>
                </div>
            </div>

            <!-- Menu Điều Hướng Chung (Có kiểm tra chặn trang) -->
            <nav class="flex items-center bg-canvas p-1.5 rounded-xl border-2 border-ink overflow-x-auto gap-1">
                <button id="roleBtn-landing" onclick="switchRoleView('landing')" 
                    class="px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all bg-lime text-ink border-2 border-ink shadow-bold-sm">
                    <span>0. Trang Chủ</span>
                </button>
                <button id="roleBtn-auth" onclick="switchRoleView('auth')" 
                    class="px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all text-muted hover:text-ink">
                    <span>1. Đăng nhập / Đăng ký</span>
                </button>
                <button id="roleBtn-user" onclick="switchRoleView('user')" 
                    class="px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all text-muted hover:text-ink">
                    <span>2. Trang User 🔒</span>
                </button>
                <button id="roleBtn-host" onclick="switchRoleView('host')" 
                    class="px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all text-muted hover:text-ink">
                    <span>3. Trang Host 👑</span>
                </button>
                <button id="roleBtn-admin" onclick="switchRoleView('admin')" 
                    class="px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all text-muted hover:text-ink">
                    <span>4. Trang Admin 🛡️</span>
                </button>
                <a href="pages/items.html" class="px-3 py-2 rounded-lg font-mono font-bold text-xs text-indigo hover:underline">
                    Items Page ↗
                </a>
            </nav>

            <!-- Khu vực Trạng thái Đăng nhập / Token & Test 401 -->
            <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="pingFastApiBackend()" class="inline-flex items-center gap-2 bg-white hover:bg-lime/30 px-3 py-2 rounded-xl border-2 border-ink text-xs font-mono font-bold shadow-bold-sm">
                    <span id="apiPulseDot" class="pulse-dot"></span>
                    <span id="apiStatusLabel">API: 127.0.0.1:8000</span>
                </button>

                ${user && token ? `
                    <div class="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl border-2 border-ink text-xs font-mono">
                        <span class="font-bold text-indigo">${user.name} (${user.role.toUpperCase()})</span>
                        <button onclick="simulate401Unauthorized()" class="bg-amber text-ink px-2 py-0.5 rounded border border-ink font-bold text-[10px]" title="Test Axios Interceptor tự động đăng xuất khi gặp lỗi 401">
                            Test 401
                        </button>
                        <button onclick="logoutUser()" class="bg-coral text-white px-2 py-0.5 rounded border border-ink font-bold text-[10px]">
                            Đăng xuất
                        </button>
                    </div>
                ` : `
                    <span class="font-mono text-xs font-bold bg-canvas px-3 py-2 rounded-xl border-2 border-ink text-muted">
                        Chưa đăng nhập
                    </span>
                `}
            </div>
        </div>
    `;
    if (typeof lucide !== "undefined") lucide.createIcons();
}