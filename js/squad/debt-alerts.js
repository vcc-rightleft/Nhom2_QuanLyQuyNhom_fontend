// =========================================================================
        // 10. HOST DEBT REMINDER -> GIANT DEBTOR LOGIN ALERT ENGINE
        // =========================================================================
        // Mark DBT-901 as reminded by default so if the user logs in as User right away, they can see it,
        // and when Host clicks "🔔 Nhắc nợ" on any debt, it triggers a fresh unread giant alert!
        // Không tự tạo nhắc nợ cho tài khoản mới.
        let hasUnreadUrgentReminder = false;

        function playUrgentAlertSound() {
            if (!interactiveFxEnabled) return;
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const now = audioCtx.currentTime;
                // Double attention chime (A5 -> E6 -> A5 -> E6)
                [0, 0.14, 0.32].forEach((offset, i) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(i % 2 === 0 ? 784 : 1046.5, now + offset);
                    gain.gain.setValueAtTime(0.14, now + offset);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
                    osc.start(now + offset);
                    osc.stop(now + offset + 0.13);
                });
            } catch (e) {}
        }

        function sendHostDebtReminder(debtId) {
            notify('Chức năng gửi nhắc nợ chưa có API thông báo được xác thực. Chưa gửi bất kỳ thông báo nào.');
        }

        function getRemindedDebtsForCurrentUser() {
            // Find all unpaid debts for USR-1042 (or any debt that Host explicitly clicked "Nhắc nợ" on during demo)
            const myReminded = groupDebts.filter(d => (d.memberName === squadSession?.name || d.reminded) && (d.total - d.paid) > 0 && d.reminded);
            return myReminded;
        }

        function openUrgentReminderModal() {
            const remindedList = getRemindedDebtsForCurrentUser();
            if (remindedList.length === 0) return;

            let totalRem = 0;
            const listEl = document.getElementById('urgentReminderItemsList');
            listEl.innerHTML = remindedList.map(d => {
                const rem = Math.max(0, d.total - d.paid);
                totalRem += rem;
                return `
                    <div class="p-3.5 rounded-xl bg-rose-50 border-2 border-ink flex items-center justify-between gap-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-mono text-[11px] font-bold bg-coral text-white px-2 py-0.5 rounded border border-ink">${d.id}</span>
                                <span class="font-bold text-sm text-ink">${d.desc}</span>
                            </div>
                            <div class="text-xs text-muted mt-0.5">
                                Thành viên: <strong class="text-ink">${d.memberName}</strong> • Nhắc lần thứ ${d.remindCount || 1} (${d.remindedAt || 'Vừa xong'})
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <div class="font-mono font-bold text-base text-rose-600">${formatVND(rem)}</div>
                            <button type="button" onclick="closeModal('modalUrgentDebtReminder'); openVietQrModal('${d.id}', ${rem}, '${d.desc}')" 
                                class="mt-1 font-mono text-[10px] font-bold bg-lime text-ink px-2 py-0.5 rounded border border-ink">
                                QR Khoản Này
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            document.getElementById('urgentReminderTotalAmount').textContent = formatVND(totalRem);
            document.getElementById('urgentReminderTimestamp').textContent = `Cập nhật: ${remindedList[0].remindedAt || 'Vừa xong'} • Có ${remindedList.length} khoản đang được Host nhắc`;
            document.getElementById('modalUrgentDebtReminder').classList.remove('hidden');
            playUrgentAlertSound();
        }

        function acknowledgeUrgentReminder() {
            hasUnreadUrgentReminder = false;
            closeModal('modalUrgentDebtReminder');
        }

        function payFromUrgentModal() {
            const remindedList = getRemindedDebtsForCurrentUser();
            hasUnreadUrgentReminder = false;
            closeModal('modalUrgentDebtReminder');
            if (remindedList.length > 0) {
                const first = remindedList[0];
                const rem = Math.max(0, first.total - first.paid);
                openVietQrModal(first.id, rem, first.desc);
            }
        }

        function syncUserUrgentBanner() {
            const banner = document.getElementById('userUrgentReminderBanner');
            if (!banner) return;
            const remindedList = getRemindedDebtsForCurrentUser();
            if (remindedList.length === 0) {
                banner.classList.add('hidden');
                return;
            }
            const totalRem = remindedList.reduce((acc, d) => acc + Math.max(0, d.total - d.paid), 0);
            banner.classList.remove('hidden');
            document.getElementById('bannerReminderTitle').textContent = `Host vừa nhắc bạn thanh toán ${remindedList.length} khoản nợ (Tổng: ${formatVND(totalRem)})!`;
        }

        // Hook into User Workspace render & Role Switch so whenever debtor logs in or opens User view, the giant alert pops up!
        const _prevRenderUserWorkspace = renderUserWorkspace;
        renderUserWorkspace = function() {
            _prevRenderUserWorkspace();
            syncUserUrgentBanner();
            if (hasUnreadUrgentReminder && getRemindedDebtsForCurrentUser().length > 0) {
                setTimeout(() => {
                    openUrgentReminderModal();
                }, 180);
            }
        };
