// =========================================================================
        // 16. USER PROFILE & CHANGE PASSWORD ENGINE (LOCAL + FASTAPI BRIDGE)
        // =========================================================================
        let currentUserProfile = { full_name: '', email: '', phone: '', bank_name: '', bank_account_no: '', bank_account_name: '' };

        function getAuthToken() {
            return sessionStorage.getItem(SQUAD_TOKEN_KEY) || '';
        }

        function fillProfileFormFields(p) {
            document.getElementById('profFullName').value = p.full_name || '';
            document.getElementById('profEmail').value = p.email || '';
            document.getElementById('profPhone').value = p.phone || '';
            document.getElementById('profBankName').value = p.bank_name || '';
            document.getElementById('profBankAccountNo').value = p.bank_account_no || '';
            document.getElementById('profBankAccountName').value = p.bank_account_name || '';
        }

        function syncProfileNameToUI() {
            const shortName = currentUserProfile.full_name || 'Hồ sơ';
            const headerEl = document.getElementById('headerProfileName');
            const bannerEl = document.getElementById('userBannerDisplayName');
            if (headerEl) headerEl.textContent = shortName;
            if (bannerEl) bannerEl.textContent = shortName;
        }

        function switchProfileModalTab(tab) {
            const infoForm = document.getElementById('profileForm-info');
            const pwdForm = document.getElementById('profileForm-password');
            const btnInfo = document.getElementById('profTabBtn-info');
            const btnPwd = document.getElementById('profTabBtn-password');

            if (tab === 'info') {
                infoForm.classList.remove('hidden');
                pwdForm.classList.add('hidden');
                btnInfo.className = 'py-2 px-3 rounded-lg font-display font-bold text-xs bg-lime text-ink border border-ink shadow-bold-sm';
                btnPwd.className = 'py-2 px-3 rounded-lg font-display font-bold text-xs text-muted hover:text-ink';
            } else {
                infoForm.classList.add('hidden');
                pwdForm.classList.remove('hidden');
                btnPwd.className = 'py-2 px-3 rounded-lg font-display font-bold text-xs bg-lime text-ink border border-ink shadow-bold-sm';
                btnInfo.className = 'py-2 px-3 rounded-lg font-display font-bold text-xs text-muted hover:text-ink';
            }
        }

        async function openUserProfileModal() {
            switchProfileModalTab('info');
            fillProfileFormFields(currentUserProfile);
            openModal('modalUserProfile');
            lucide.createIcons();

            const token = getAuthToken();
            if (!token) return;

            try {
                const res = await fetch(`${FASTAPI_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    currentUserProfile = { ...currentUserProfile, ...data };
                    fillProfileFormFields(currentUserProfile);
                    syncProfileNameToUI();
                }
            } catch (err) {}
        }

        async function submitUserProfileUpdate(e) {
            e.preventDefault();
            if (!getAuthToken()) return notify('Vui lòng đăng nhập lại.');
            const payload = {
                full_name: document.getElementById('profFullName').value.trim(),
                phone: document.getElementById('profPhone').value.trim() || null,
                bank_name: document.getElementById('profBankName').value.trim() || null,
                bank_account_no: document.getElementById('profBankAccountNo').value.trim() || null,
                bank_account_name: document.getElementById('profBankAccountName').value.trim().toUpperCase() || null
            };
            try {
                const data = await squadApi('/api/users/me',{method:'PUT',body:payload});
                currentUserProfile = {...currentUserProfile, ...data};
                if (squadSession) squadSession.name = currentUserProfile.full_name;
                syncProfileNameToUI();
                closeModal('modalUserProfile');
                notify('Đã cập nhật hồ sơ và lưu trên Backend.');
            } catch (err) {
                notify('Cập nhật hồ sơ thất bại: ' + err.message);
            }
        }

        async function submitUserPasswordChange(e) {
            e.preventDefault();
            const old_password = document.getElementById('profCurrentPwd').value;
            const new_password = document.getElementById('profNewPwd').value;
            const confirm_password = document.getElementById('profConfirmPwd').value;
            if (new_password !== confirm_password) return notify('Mật khẩu xác nhận chưa khớp');
            try {
                await squadApi('/api/users/me/password', {method:'PUT',body:{old_password,new_password}});
                document.getElementById('profileForm-password').reset();
                closeModal('modalUserProfile');
                await logoutSquad();
                notify('Đã đổi mật khẩu. Vui lòng đăng nhập lại.');
            } catch(err) { notify('Đổi mật khẩu thất bại: ' + err.message); }
        }
