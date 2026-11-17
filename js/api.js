function switchRoleView(role) {
    // Kiểm tra Route Guard (Chặn trang cần đăng nhập & Chặn trang Admin)
    if (!checkRouteAccess(role)) {
        return;
    }

    ["landing", "auth", "user", "host", "admin"].forEach(r => {
        document.getElementById(`view-${r}`)?.classList.add("hidden");
        const btn = document.getElementById(`roleBtn-${r}`);
        if (btn) {
            btn.className = "px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all text-muted hover:text-ink";
        }
    });

    document.getElementById(`view-${role}`)?.classList.remove("hidden");
    const activeBtn = document.getElementById(`roleBtn-${role}`);
    if (activeBtn) {
        activeBtn.className = "px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all bg-lime text-ink border-2 border-ink shadow-bold-sm";
    }

    if (role === "user") renderUserWorkspace();
    if (role === "host") renderHostWorkspace();
    if (role === "admin") renderAdminWorkspace();

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof lucide !== "undefined") lucide.createIcons();
}

function goToAuthFromLanding(mode = "login") {
    switchRoleView("auth");
    switchAuthTab(mode);
}

window.addEventListener("DOMContentLoaded", () => {
    renderHeaderLayout();
    pingFastApiBackend(true);
    const user = getCurrentUser();
    if (user && getAccessToken()) {
        switchRoleView(user.role);
    } else {
        switchRoleView("landing");
    }
});