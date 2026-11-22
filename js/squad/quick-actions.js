// =========================================================================
        // 9. GEN-Z & YOUNG PRO SMART UX HELPERS (VIETQR, MONEY CHIPS, CTRL+K, PROGRESS)
        // =========================================================================
        function quickAddAmount(inputId, delta, triggerInvoiceCalc = false) {
            const el = document.getElementById(inputId);
            if (!el) return;
            const current = parseInt(el.value) || 0;
            el.value = current + delta;
            el.classList.remove('value-flash');
            void el.offsetWidth;
            el.classList.add('value-flash');
            if (triggerInvoiceCalc) recalculateHostInvoicePreview();
        }

        function quickSetAmount(inputId, val, triggerInvoiceCalc = false) {
            const el = document.getElementById(inputId);
            if (!el) return;
            el.value = val;
            if (triggerInvoiceCalc) recalculateHostInvoicePreview();
        }

        let currentQrMemo = '';
        function openVietQrModal(debtId, amount, desc) {
            notify('VietQR thanh toán thật chưa bật: Backend chưa cung cấp thông tin tài khoản nhận tiền đã xác minh cho công nợ này. Không chuyển tiền theo mã QR mẫu.');
        }

        function copyQrTransferInfo() {
            navigator.clipboard?.writeText(currentQrMemo);
            notify(`Đã sao chép nội dung chuyển khoản "${currentQrMemo}"!`);
        }

        // Update Group Debt Settlement Progress Bar dynamically
        const _origRenderHostDebtsTable = renderHostDebtsTable;
        renderHostDebtsTable = function() {
            _origRenderHostDebtsTable();
            let sumTotal = 0, sumPaid = 0;
            groupDebts.forEach(d => {
                sumTotal += d.total;
                sumPaid += d.paid;
            });
            const pct = sumTotal > 0 ? Math.min(100, Math.round((sumPaid / sumTotal) * 100)) : 100;
            const bar = document.getElementById('hostDebtProgressBar');
            const lbl = document.getElementById('hostDebtProgressLabel');
            if (bar && lbl) {
                bar.style.width = pct + '%';
                lbl.textContent = `${pct}% Đã thu (${formatVND(sumPaid)} / ${formatVND(sumTotal)})`;
            }
        };

        // Command Palette (Ctrl + K) logic
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openModal('modalCmdPalette');
                setTimeout(() => document.getElementById('cmdSearchInput')?.focus(), 60);
            } else if (e.key === 'Escape') {
                closeModal('modalCmdPalette');
                closeModal('modalVietQrPay');
                closeModal('modalUserProfile');
            }
        });

        function filterCmdPalette(q) {
            const term = q.trim().toLowerCase();
            document.querySelectorAll('#cmdPaletteList .cmd-item').forEach(btn => {
                btn.style.display = btn.textContent.toLowerCase().includes(term) ? 'flex' : 'none';
            });
        }

        function runCmdAction(role, subTab) {
            closeModal('modalCmdPalette');
            switchRoleView(role);
            if (role === 'host') switchHostTab(subTab);
            if (role === 'user') switchUserSubTab(subTab);
            if (role === 'admin') switchAdminTab(subTab);
        }
