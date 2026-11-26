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

        
function validateSquadPassword(password) {
    const length = Array.from(password).length;

    if (/\s|\u0085|[\u001c-\u001f]/u.test(password)) {
        return 'M\u1eadt kh\u1ea9u kh\u00f4ng \u0111\u01b0\u1ee3c ch\u1ee9a kho\u1ea3ng tr\u1eafng.';
    }

    if (length < 6 || length > 64) {
        return 'M\u1eadt kh\u1ea9u ph\u1ea3i t\u1eeb 6 \u0111\u1ebfn 64 k\u00fd t\u1ef1.';
    }

    if (new TextEncoder().encode(password).length > 72) {
        return 'M\u1eadt kh\u1ea9u kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 72 byte.';
    }

    if (!/\p{L}/u.test(password)) {
        return 'M\u1eadt kh\u1ea9u ph\u1ea3i c\u00f3 \u00edt nh\u1ea5t m\u1ed9t ch\u1eef c\u00e1i.';
    }

    if (!/[\p{Nd}\u00b2\u00b3\u00b9]/u.test(password)) {
        return 'M\u1eadt kh\u1ea9u ph\u1ea3i c\u00f3 \u00edt nh\u1ea5t m\u1ed9t ch\u1eef s\u1ed1.';
    }

    return null;
}

async function handleRegisterSubmit(e) {
            e.preventDefault();
            try {
                const full_name = document.getElementById('regDisplayNameInput').value.trim();
                const email = document.getElementById('regContactInput').value.trim().toLowerCase();
                const password = document.getElementById('regPasswordInput').value;
                const passwordError = validateSquadPassword(password);
                if (passwordError) {
                    notify(passwordError, true);
                    document.getElementById('regPasswordInput').focus();
                    return;
                }

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
