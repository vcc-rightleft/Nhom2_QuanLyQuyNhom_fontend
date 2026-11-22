// =========================================================================
        // 13. CLEAN TRANSITION FROM INTRO / LANDING -> AUTH (NO COLORFUL RING HERE!
        //     THE COLORFUL PORTAL RING ONLY APPEARS UPON LOGIN / REGISTER SUBMIT)
        // =========================================================================
        function unlockLandingFromSplash() {
            const splash = document.getElementById('cinematicIntroSplash');
            switchRoleView('landing');
            if (splash) {
                splash.classList.add('splash-zoom-exit');
                setTimeout(() => {
                    splash.classList.add('hidden');
                    splash.classList.remove('splash-zoom-exit');
                }, 460);
            }
            playUiSound('click');
            notify('✨ Chào mừng đến với SQUAD.CASH! Hãy khám phá tính năng hoặc bấm Đăng ký / Đăng nhập.');
        }

        function replayIntroSplash() {
            autoTransitionTriggered = false;
            currentStoryChapter = 0;
            currentCameraZ = 0;
            targetCameraZ = 0;
            const splash = document.getElementById('cinematicIntroSplash');
            if (splash) {
                splash.classList.remove('hidden', 'splash-zoom-exit');
                splash.scrollTop = 0;
            }
        }

        // Direct, clean transition to Register / Login / Invite Code (Colorful ring is saved strictly for when user submits Login/Register!)
        function goToAuthFromLanding(authMode = 'register') {
            const toastLabels = {
                register: '🚀 Mời bạn điền thông tin để Đăng ký tài khoản mới (Hiệu ứng vòng sáng sẽ mở khi hoàn tất)!',
                login: '🔐 Chọn nhanh tài khoản mẫu hoặc nhập thông tin để Đăng nhập (Hiệu ứng vòng sáng sẽ mở khi đăng nhập)!',
                invite: '🔑 Nhập mã mời cố định (#DALAT26) để vào thẳng nhóm quỹ!'
            };
            switchRoleView('auth');
            switchAuthTab(authMode);
            playUiSound('click');
            if (toastLabels[authMode]) notify(toastLabels[authMode]);
        }
