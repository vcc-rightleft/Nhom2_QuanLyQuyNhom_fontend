// ---------------- 2. TOP NAVIGATION & SRS BADGE TOGGLE ----------------
        function switchRoleView(role) {
            if (!canViewSquad(role)) {
                const fallback = isSquadSignedIn() ? 'user' : 'auth';
                if (role !== fallback) return switchRoleView(fallback);
            }
            refreshSquadNavigation();
            ['landing', 'auth', 'user', 'host', 'admin'].forEach(r => {
                const viewEl = document.getElementById(`view-${r}`);
                if (viewEl) viewEl.classList.add('hidden');
                const btn = document.getElementById(`roleBtn-${r}`);
                if (btn) btn.className = "px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all text-muted hover:text-ink";
            });

            const target = document.getElementById(`view-${role}`);
            if (!target) return;
            target.classList.remove('hidden');
            const activeBtn = document.getElementById(`roleBtn-${role}`);
            if (activeBtn) activeBtn.className = "px-3.5 py-2 rounded-lg font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all bg-lime text-ink border-2 border-ink shadow-bold-sm";

            if (role === 'user') {
                renderUserWorkspace();
            } else if (role === 'host') {
                renderHostWorkspace();
            } else if (role === 'admin') {
                renderAdminWorkspace();
            }
            refreshSquadNavigation();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            lucide.createIcons();
        }

        function toggleFrBadges(show) {
            if (show) {
                document.body.classList.remove('hide-fr-badges');
            } else {
                document.body.classList.add('hide-fr-badges');
            }
        }
