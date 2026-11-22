// =========================================================================
        // 8. INTERACTIVE MICRO-INTERACTIONS ENGINE (RIPPLE, SOUND, CONFETTI, API BRIDGE)
        // =========================================================================
        const FASTAPI_URL = 'http://127.0.0.1:8000';
        let interactiveFxEnabled = true;
        let audioCtx = null;

        function playUiSound(type = 'click') {
            if (!interactiveFxEnabled) return;
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                const now = audioCtx.currentTime;
                if (type === 'click') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(520, now);
                    osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
                    osc.start(now);
                    osc.stop(now + 0.05);
                } else if (type === 'success') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, now); // D5
                    osc.frequency.setValueAtTime(880, now + 0.07); // A5
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                    osc.start(now);
                    osc.stop(now + 0.23);
                } else if (type === 'error') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.setValueAtTime(130, now + 0.08);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.21);
                }
            } catch (e) {}
        }

        function launchConfettiBurst() {
            if (!interactiveFxEnabled || typeof confetti !== 'function') return;
            confetti({
                particleCount: 65,
                spread: 70,
                origin: { y: 0.65 },
                colors: ['#D4FF00', '#7C3AED', '#FF5E36', '#38BDF8', '#121212']
            });
        }

        function toggleSoundFx() {
            interactiveFxEnabled = !interactiveFxEnabled;
            const lbl = document.getElementById('soundToggleLabel');
            lbl.textContent = interactiveFxEnabled ? 'FX: BẬT' : 'FX: TẮT';
            if (interactiveFxEnabled) {
                playUiSound('success');
                launchConfettiBurst();
                notify('Đã bật hiệu ứng âm thanh Tactile & Pháo hoa tương tác!');
            } else {
                notify('Đã tạm tắt hiệu ứng âm thanh & pháo hoa.');
            }
        }

        // Global Tactile Ripple & Click Sound on all Buttons
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('button');
            if (!btn) return;
            playUiSound('click');

            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            ripple.className = 'neo-ripple';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 550);
        });

        // Smooth Count-up Number Animation for VND Displays
        function animateVndElement(el, targetAmount, prefix = '') {
            if (!el) return;
            const duration = 650;
            const startTime = performance.now();
            el.classList.remove('value-flash');
            void el.offsetWidth;
            el.classList.add('value-flash');

            function step(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * targetAmount);
                el.textContent = prefix + current.toLocaleString('en-US') + ' ₫';
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        // FastAPI Live Connection Ping + Sync (Optional Live Bridge to http://127.0.0.1:8000)
        async function pingFastApiBackend(silent = false) {
            const dot = document.getElementById('apiPulseDot');
            const lbl = document.getElementById('apiStatusLabel');
            try {
                const res = await fetch(`${FASTAPI_URL}/api/health`, { method: 'GET' });
                if (res.ok) {
                    dot.classList.remove('offline');
                    lbl.textContent = 'FastAPI: ONLINE';
                    if (!silent) {
                        playUiSound('success');
                        notify('Kết nối trực tiếp tới FastAPI (http://127.0.0.1:8000) thành công!');
                    }
                    return true;
                }
            } catch (err) {
                dot.classList.add('offline');
                lbl.textContent = 'Chế độ SRS Local';
                if (!silent) {
                    notify('Đang chạy dữ liệu tương tác SRS trực tiếp trên trình duyệt (Bật Uvicorn 8000 nếu muốn đồng bộ API).');
                }
            }
            return false;
        }

        // Override openModal / closeModal / switchRoleView / notify with smooth animations
        const _origSwitchRoleView = switchRoleView;
        switchRoleView = function(role) {
            _origSwitchRoleView(role);
            const activeMain = document.getElementById(`view-${role}`);
            if (activeMain) {
                activeMain.classList.remove('view-enter');
                void activeMain.offsetWidth;
                activeMain.classList.add('view-enter');
            }
            if (role === 'user') {
                const myDebts = groupDebts.filter(d => d.memberName === squadSession?.name);
                const rem = myDebts.reduce((acc, d) => acc + Math.max(0, d.total - d.paid), 0);
                animateVndElement(document.getElementById('userTotalDebtKpi'), rem);
            } else if (role === 'host') {
                animateVndElement(document.getElementById('hostFundBalanceDisplay'), (userJoinedGroups[0]?.balance || 0));
            }
        };

        openModal = function(id) {
            const modal = document.getElementById(id);
            if (!modal) return;
            modal.classList.remove('hidden');
            const card = modal.querySelector('.card-clean');
            if (card) {
                card.classList.remove('modal-pop');
                void card.offsetWidth;
                card.classList.add('modal-pop');
            }
        };

        notify = function(message) {
            const container = document.getElementById('cleanToastContainer');
            const item = document.createElement('div');
            const isWarn = message.includes('Từ chối') || message.includes('Chặn') || message.includes('Cảnh báo') || message.includes('chưa khớp');
            if (isWarn) {
                playUiSound('error');
            } else {
                playUiSound('success');
            }
            item.className = "pointer-events-auto card-clean overflow-hidden bg-ink text-white shadow-bold modal-pop";
            item.innerHTML = `
                <div class="p-4 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                        <span class="w-2.5 h-2.5 rounded-full shrink-0 ${isWarn ? 'bg-coral' : 'bg-lime'}"></span>
                        <span class="text-xs font-medium leading-relaxed">${escapeSquadHtml(message)}</span>
                    </div>
                    <button onclick="this.closest('.card-clean').remove()" class="font-mono text-[10px] bg-lime text-ink font-bold px-2.5 py-1 rounded border border-ink shrink-0">ĐÓNG</button>
                </div>
                <div class="toast-progress ${isWarn ? '!bg-coral' : ''}"></div>
            `;
            container.appendChild(item);
            setTimeout(() => {
                if (item.parentElement) item.remove();
            }, 4200);
        };

        // Add Confetti & Shake hooks to key business actions
        const _origVerifyInviteCode = verifyInviteCode;
        verifyInviteCode = function() {
            _origVerifyInviteCode();
            const box = document.getElementById('inviteVerifyResult');
            const code = document.getElementById('inviteCodeField').value.trim().toUpperCase().replace('#', '');
            if (code === 'WRONG99' || box.innerHTML.includes('KHÔNG TỒN TẠI')) {
                playUiSound('error');
                box.classList.remove('neo-shake');
                void box.offsetWidth;
                box.classList.add('neo-shake');
            } else {
                playUiSound('success');
                box.classList.remove('modal-pop');
                void box.offsetWidth;
                box.classList.add('modal-pop');
            }
        };

        const _origSaveHostInvoice = saveHostInvoice;
        saveHostInvoice = async function() {
            if (await _origSaveHostInvoice()) launchConfettiBurst();
        };

        const _origSubmitConfirmPayment = submitConfirmPayment;
        submitConfirmPayment = function(e) {
            _origSubmitConfirmPayment(e);
        };

        const _origHandleRecordFundTx = handleRecordFundTx;
        handleRecordFundTx = async function(e) {
            if (await _origHandleRecordFundTx(e)) {
                launchConfettiBurst();
                animateVndElement(document.getElementById('hostFundBalanceDisplay'), (selectedSquadGroup()?.balance || 0));
            }
        };

        document.addEventListener('squad:ready', () => {
            pingFastApiBackend(true);
        });
