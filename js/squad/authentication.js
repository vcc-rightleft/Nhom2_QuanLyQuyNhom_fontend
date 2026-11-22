// ---------------- 3. AUTH & INVITE CODE LOGIC ----------------
        function switchAuthTab(tab) {
            ['login', 'register', 'invite'].forEach(t => {
                document.getElementById(`authForm-${t}`).classList.add('hidden');
                document.getElementById(`authTab-${t}`).className = "py-2.5 px-3 rounded-lg font-display font-bold text-xs sm:text-sm text-muted hover:text-ink flex items-center justify-center gap-1.5";
            });
            document.getElementById(`authForm-${tab}`).classList.remove('hidden');
            document.getElementById(`authTab-${tab}`).className = "py-2.5 px-3 rounded-lg font-display font-bold text-xs sm:text-sm bg-white text-ink border border-ink shadow-clean flex items-center justify-center gap-1.5";
        }

        function setAuthFrame(mode) {
            const wrapper = document.getElementById('authWrapper');
            const left = document.getElementById('authLeftCol');
            const right = document.getElementById('authRightCol');
            const btnD = document.getElementById('authVpDesktop');
            const btnM = document.getElementById('authVpMobile');

            if (mode === 'mobile') {
                wrapper.classList.add('auth-mobile-frame');
                wrapper.classList.remove('lg:grid-cols-12');
                left.classList.remove('lg:col-span-5', 'lg:border-r-[1.5px]');
                right.classList.remove('lg:col-span-7');
                btnM.className = "px-3 py-1 rounded-lg font-mono text-xs font-bold bg-ink text-white";
                btnD.className = "px-3 py-1 rounded-lg font-mono text-xs font-bold text-muted hover:text-ink";
            } else {
                wrapper.classList.remove('auth-mobile-frame');
                wrapper.classList.add('lg:grid-cols-12');
                left.classList.add('lg:col-span-5', 'lg:border-r-[1.5px]');
                right.classList.add('lg:col-span-7');
                btnD.className = "px-3 py-1 rounded-lg font-mono text-xs font-bold bg-ink text-white";
                btnM.className = "px-3 py-1 rounded-lg font-mono text-xs font-bold text-muted hover:text-ink";
            }
        }

        function fillDemoLogin() {
            notify('Không sử dụng tài khoản mẫu. Vui lòng đăng nhập bằng tài khoản thật.');
        }

        async function handleAuthSubmit(e) {
            e.preventDefault();
            try {
                const email = document.getElementById('loginEmailInput').value.trim().toLowerCase();
                const password = document.getElementById('loginPasswordInput').value;
                const result = await squadApi('/auth/login', { method:'POST', body:{email, password} });
                sessionStorage.setItem(SQUAD_TOKEN_KEY, result.access_token);
                startSquadSession(result.user.full_name, result.user.role === 'ADMIN' ? 'admin' : 'user', true, String(result.user.id));
                clearSquadWorkingData();
                await refreshServerGroups();
                runCurtainRoleTransition('user', 'ĐANG TẢI DỮ LIỆU...', 'Đăng nhập thành công');
            } catch (err) { notify('Đăng nhập thất bại: ' + err.message); }
        }

        async function handleRegisterSubmit(e) {
            e.preventDefault();
            try {
                const full_name = document.getElementById('regDisplayNameInput').value.trim();
                const email = document.getElementById('regContactInput').value.trim().toLowerCase();
                const password = document.getElementById('regPasswordInput').value;
                await squadApi('/auth/register', {method:'POST', body:{full_name,email,password}});
                const result = await squadApi('/auth/login', {method:'POST',body:{email,password}});
                sessionStorage.setItem(SQUAD_TOKEN_KEY, result.access_token);
                startSquadSession(result.user.full_name, 'user', true, String(result.user.id));
                clearSquadWorkingData();
                await refreshServerGroups();
                switchRoleView('user');
                notify('Đã đăng ký thành công! Danh sách nhóm của bạn đang trống.');
            } catch (err) { notify('Đăng ký thất bại: ' + err.message); }
        }

        function testInviteCode(code) {
            document.getElementById('inviteCodeField').value = code;
            verifyInviteCode();
        }

        async function verifyInviteCode() {
            const code = document.getElementById('inviteCodeField').value.trim().toUpperCase().replace('#','');
            const box = document.getElementById('inviteVerifyResult');
            if (!isSquadSignedIn()) { notify('Hãy đăng nhập trước khi tham gia nhóm.'); return; }
            if (!code) { notify('Vui lòng nhập mã nhóm'); return; }
            box.innerHTML = `<p class="text-sm font-semibold">Mã ${escapeSquadHtml(code)} sẽ được máy chủ xác minh khi tham gia.</p><button type="button" onclick="confirmJoinGroupByCode()" class="btn-cta-lime px-4 py-2 rounded-lg">Tham gia nhóm</button>`;
        }

        async function confirmJoinGroupByCode() {
            if (!isSquadSignedIn()) return notify('Vui lòng đăng nhập trước.');
            try {
                const code = document.getElementById('inviteCodeField').value.trim().toUpperCase().replace('#','');
                await squadApi('/api/groups/join?invite_code=' + encodeURIComponent(code), {method:'POST'});
                await refreshServerGroups();
                notify('Đã tham gia nhóm thành công');
                switchRoleView('user');
            } catch(err) { notify('Không thể tham gia nhóm: ' + err.message); }
        }


        // Giao diện tham gia nhóm sau khi đăng nhập; API luôn xác thực thành viên qua JWT.
        async function joinGroupFromUser(e) {
            e.preventDefault();
            if (!isSquadSignedIn()) return notify('Vui lòng đăng nhập trước khi tham gia nhóm.');
            const input = document.getElementById('userJoinCodeInput');
            const code = input.value.trim().toUpperCase().replace(/^#/, '');
            if (!/^[A-Z0-9]{8}$/.test(code)) return notify('Mã nhóm gồm 8 chữ hoặc số.');
            const button = e.currentTarget.querySelector('button[type="submit"]');
            if (button) button.disabled = true;
            try {
                const joined = await squadApi('/api/groups/join?invite_code=' + encodeURIComponent(code), {method:'POST'});
                await refreshServerGroups(joined.group_id);
                input.value = '';
                notify('Đã tham gia nhóm thành công và tải dữ liệu từ MySQL.');
            } catch (err) {
                notify('Không thể tham gia nhóm: ' + err.message);
            } finally { if (button) button.disabled = false; }
        }
