
import api from '../api.js';

// ==========================================
// 1. STATE & HELPERS
// ==========================================

let debtsState = [];
let selectedProofBase64 = null;

const $ = (id) => document.getElementById(id);

const formatVND = (amount) =>
    `${Number(amount || 0).toLocaleString('vi-VN')} ₫`;

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

function showToast(message, error = false) {
    const container = $('cleanToastContainer');

    if (!container) {
        if (error) alert(message);
        else console.info(message);
        return;
    }

    const toast = document.createElement('div');

    toast.className =
        `pointer-events-auto card-subtle px-4 py-3 text-xs font-bold ${
            error
                ? 'bg-coral text-white'
                : 'bg-lime text-ink'
        }`;

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}


// ==========================================
// 2. LẤY THÔNG TIN NGƯỜI DÙNG
// ==========================================

function getCurrentUserId() {
    try {
        const key =
            window.APP_CONFIG?.USER_KEY || 'squad_cash_user';

        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const user = JSON.parse(raw);
        const id = Number(user?.id ?? user?.user_id);

        return Number.isSafeInteger(id) && id > 0
            ? id
            : null;

    } catch (error) {
        console.error('Không đọc được thông tin user:', error);
        return null;
    }
}


// ==========================================
// 3. CHUẨN HÓA DỮ LIỆU TỪ BACKEND
// ==========================================

function normalizeDebt(raw, type, index) {
    const total = Number(
        raw.amount ?? raw.amount_due ?? 0
    );

    const paid = Number(
        raw.paid_amount ?? raw.amount_paid ?? 0
    );

    const statusRaw = String(
        raw.status || 'unpaid'
    ).toLowerCase();

    let status = 'unpaid';

    if (
        ['paid', 'completed', 'confirmed'].includes(statusRaw)
    ) {
        status = 'paid';
    } else if (
        [
            'pending',
            'partial',
            'waiting',
            'pending_confirmation'
        ].includes(statusRaw)
    ) {
        status = 'pending';
    }

    const bank = raw.receiver_bank || {};

    const id =
        raw.id ??
        raw.debt_id ??
        `unknown-${type}-${index}`;

    const groupId =
        raw.group_id ??
        raw.groupId ??
        'unknown';

    const remaining = Number(
        raw.remaining_amount ??
        Math.max(0, total - paid)
    );

    return {
        id: String(id),

        isRealId: /^\d+$/.test(String(id)),

        groupId: String(groupId),

        groupCode: String(
            raw.group_code ??
            raw.groupCode ??
            `#${groupId}`
        ),

        groupName: String(
            raw.group_name ??
            raw.groupName ??
            `Nhóm quỹ #${groupId}`
        ),

        title: String(
            raw.title ??
            raw.description ??
            `Khoản công nợ #${id}`
        ),

        date: String(
            raw.due_date ??
            raw.date ??
            ''
        ).slice(0, 10),

        type,

        status,

        amount: Math.max(
            0,
            status === 'paid' ? total : remaining
        ),

        counterpartyName: String(
            raw.counterparty_name ??
            raw.payee_name ??
            raw.debtor_name ??
            raw.counterpartyName ??
            'Chưa cập nhật'
        ),

        bankCode: String(
            bank.bank_id ??
            raw.bankCode ??
            ''
        ),

        bankName: String(
            bank.bank_name ??
            raw.bankName ??
            'Chưa cập nhật ngân hàng'
        ),

        accountNumber: String(
            bank.account_number ??
            raw.accountNumber ??
            ''
        ),

        accountName: String(
            bank.account_name ??
            raw.accountName ??
            ''
        )
    };
}

function extractList(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    if (Array.isArray(response?.debts)) {
        return response.debts;
    }

    throw new Error(
        'API công nợ trả dữ liệu không đúng định dạng.'
    );
}


// ==========================================
// 4. TẢI CÔNG NỢ TỪ BACKEND
// ==========================================

async function loadMyDebts() {
    const userId = getCurrentUserId();

    if (!userId) {
        debtsState = [];

        populateGroupFilter();
        renderSummary();

        renderDebtGroups(
            'Vui lòng đăng nhập để xem công nợ.'
        );

        return;
    }

    try {
        const [oweResponse, owedResponse] =
            await Promise.all([
                api.get(
                    `/api/debts/owed-by-me/${userId}`
                ),

                api.get(
                    `/api/debts/owed-to-me/${userId}`
                )
            ]);

        const oweList = extractList(oweResponse);
        const owedList = extractList(owedResponse);

        debtsState = [
            ...oweList.map((item, index) =>
                normalizeDebt(item, 'owe', index)
            ),

            ...owedList.map((item, index) =>
                normalizeDebt(item, 'owed', index)
            )
        ];

        populateGroupFilter();
        renderSummary();
        renderDebtGroups();

    } catch (error) {
        console.error(
            'Không tải được công nợ:',
            error
        );

        debtsState = [];

        populateGroupFilter();
        renderSummary();

        renderDebtGroups(
            'Không tải được công nợ từ Backend. Hãy kiểm tra kết nối và đăng nhập.'
        );

        showToast(
            error.message || 'Không tải được công nợ.',
            true
        );
    }
}


// ==========================================
// 5. BỘ LỌC NHÓM
// ==========================================

function populateGroupFilter() {
    const select = $('filter-group');
    if (!select) return;

    const current = select.value;

    const groups = new Map(
        debtsState.map((debt) => [
            debt.groupId,
            `${debt.groupName} (${debt.groupCode})`
        ])
    );

    select.replaceChildren(
        new Option('Tất cả nhóm', 'all')
    );

    groups.forEach((label, id) => {
        select.add(new Option(label, id));
    });

    select.value = groups.has(current)
        ? current
        : 'all';
}


// ==========================================
// 6. TỔNG HỢP CÔNG NỢ
// ==========================================

function renderSummary() {
    const oweUnpaid = debtsState.filter(
        (debt) =>
            debt.type === 'owe' &&
            debt.status !== 'paid'
    );

    const owedUnpaid = debtsState.filter(
        (debt) =>
            debt.type === 'owed' &&
            debt.status !== 'paid'
    );

    const totalOwe = oweUnpaid.reduce(
        (sum, debt) => sum + debt.amount,
        0
    );

    const totalOwed = owedUnpaid.reduce(
        (sum, debt) => sum + debt.amount,
        0
    );

    const net = totalOwed - totalOwe;

    $('total-i-owe').textContent =
        formatVND(totalOwe);

    $('count-i-owe').textContent =
        `${oweUnpaid.length} khoản chưa hoàn tất`;

    $('total-owed-to-me').textContent =
        formatVND(totalOwed);

    $('count-owed-to-me').textContent =
        `${owedUnpaid.length} khoản đang chờ thu`;

    $('net-balance').textContent =
        `${net >= 0 ? '+' : ''}${formatVND(net)}`;
}


// ==========================================
// 7. HIỂN THỊ TRẠNG THÁI
// ==========================================

function getStatusBadge(debt) {
    const base =
        'font-mono text-[11px] font-bold px-2.5 py-1 rounded-full border border-ink';

    if (debt.status === 'paid') {
        return `
            <span class="${base} bg-mint text-white">
                Đã thanh toán
            </span>
        `;
    }

    if (debt.status === 'pending') {
        return `
            <span class="${base} bg-amber text-ink">
                Chờ duyệt
            </span>
        `;
    }

    if (debt.type === 'owed') {
        return `
            <span class="${base} bg-cyan/40 text-ink">
                Đang chờ thu
            </span>
        `;
    }

    return `
        <span class="${base} bg-coral text-white">
            Chưa trả
        </span>
    `;
}


// ==========================================
// 8. HIỂN THỊ DANH SÁCH CÔNG NỢ
// ==========================================

function renderDebtGroups(overrideMessage = '') {
    const container = $('debt-groups-container');
    if (!container) return;

    const groupFilter =
        $('filter-group')?.value || 'all';

    const typeFilter =
        $('filter-type')?.value || 'all';

    const statusFilter =
        $('filter-status')?.value || 'all';

    const keyword = (
        $('filter-search')?.value || ''
    ).trim().toLowerCase();

    const filtered = debtsState.filter((debt) => {
        if (
            groupFilter !== 'all' &&
            debt.groupId !== groupFilter
        ) {
            return false;
        }

        if (
            typeFilter !== 'all' &&
            debt.type !== typeFilter
        ) {
            return false;
        }

        if (
            statusFilter !== 'all' &&
            debt.status !== statusFilter
        ) {
            return false;
        }

        if (keyword) {
            const searchText = `
                ${debt.id}
                ${debt.title}
                ${debt.counterpartyName}
                ${debt.groupName}
            `.toLowerCase();

            if (!searchText.includes(keyword)) {
                return false;
            }
        }

        return true;
    });

    if (overrideMessage || filtered.length === 0) {
        container.innerHTML = `
            <div class="card-clean p-8 bg-white text-center">
                <p class="font-display font-bold text-base text-ink">
                    ${escapeHTML(
                        overrideMessage ||
                        'Không tìm thấy khoản công nợ nào phù hợp.'
                    )}
                </p>
            </div>
        `;
        return;
    }

    const grouped = new Map();

    filtered.forEach((debt) => {
        if (!grouped.has(debt.groupId)) {
            grouped.set(debt.groupId, {
                name: debt.groupName,
                code: debt.groupCode,
                items: []
            });
        }

        grouped.get(debt.groupId).items.push(debt);
    });

    container.innerHTML = [...grouped.values()]
        .map((group) => `
            <div class="card-clean overflow-hidden bg-white">

                <div class="os-window-bar flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-bold bg-lime border border-ink px-2 py-0.5 rounded">
                            ${escapeHTML(group.code)}
                        </span>

                        <span class="font-display font-bold text-sm sm:text-base text-ink">
                            ${escapeHTML(group.name)}
                        </span>
                    </div>

                    <span class="font-mono text-xs font-bold text-muted">
                        ${group.items.length} khoản
                    </span>
                </div>

                <div class="divide-y-2 divide-line">

                    ${group.items.map((debt) => `
                        <div class="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-canvas/60 transition">

                            <div class="space-y-1">
                                <div class="flex flex-wrap items-center gap-2">

                                    <span class="font-mono text-[11px] font-bold text-muted">
                                        ${escapeHTML(debt.id)}
                                    </span>

                                    <h4 class="font-display font-bold text-sm sm:text-base text-ink">
                                        ${escapeHTML(debt.title)}
                                    </h4>

                                </div>

                                <div class="text-xs text-muted font-medium">
                                    ${debt.type === 'owe'
                                        ? 'Trả cho:'
                                        : 'Nhận từ:'}

                                    <strong class="text-ink">
                                        ${escapeHTML(debt.counterpartyName)}
                                    </strong>

                                    • Ngày ${escapeHTML(debt.date || 'Chưa có')}
                                </div>
                            </div>

                            <div class="flex flex-wrap items-center gap-3">

                                <div class="font-mono font-bold text-base ${
                                    debt.type === 'owe'
                                        ? 'text-coral'
                                        : 'text-mint'
                                }">
                                    ${debt.type === 'owe' ? '-' : '+'}
                                    ${formatVND(debt.amount)}
                                </div>

                                ${getStatusBadge(debt)}

                                ${
                                    debt.type === 'owe' &&
                                    debt.status === 'unpaid'
                                        ? `
                                            <button
                                                type="button"
                                                data-open-pay="${escapeHTML(debt.id)}"
                                                class="btn-cta-indigo px-3.5 py-2 rounded-xl font-display font-bold text-xs"
                                            >
                                                Tôi đã trả
                                            </button>
                                        `
                                        : ''
                                }

                            </div>
                        </div>
                    `).join('')}

                </div>
            </div>
        `)
        .join('');

    container
        .querySelectorAll('[data-open-pay]')
        .forEach((button) => {
            button.addEventListener('click', () => {
                openPayModal(button.dataset.openPay);
            });
        });
}


// ==========================================
// 9. MỞ MODAL THANH TOÁN
// ==========================================

function openPayModal(id) {
    const debt = debtsState.find(
        (item) => item.id === String(id)
    );

    if (!debt) return;

    const note = `SQUADCASH ${debt.id}`;

    $('modal-debt-id').value = debt.id;

    $('modal-debt-title').textContent =
        debt.title;

    $('modal-debt-amount').textContent =
        formatVND(debt.amount);

    $('modal-receiver-name').textContent =
        debt.accountName || debt.counterpartyName;

    $('modal-bank-name').textContent =
        debt.bankName;

    $('modal-account-number').textContent =
        debt.accountNumber || 'Chưa có STK';

    $('modal-transfer-note').textContent =
        note;

    const qr = $('modal-vietqr-img');

    if (
        debt.bankCode &&
        /^\d{6,20}$/.test(debt.accountNumber)
    ) {
        qr.src =
            `https://img.vietqr.io/image/` +
            `${encodeURIComponent(debt.bankCode)}-` +
            `${encodeURIComponent(debt.accountNumber)}-compact2.png` +
            `?amount=${debt.amount}` +
            `&addInfo=${encodeURIComponent(note)}` +
            `&accountName=${encodeURIComponent(debt.accountName)}`;

        qr.classList.remove('hidden');
        qr.style.display = '';

    } else {
        qr.removeAttribute('src');
        qr.classList.add('hidden');
        qr.style.display = 'none';
    }

    selectedProofBase64 = null;

    $('proof-image-input').value = '';

    $('proof-preview').removeAttribute('src');
    $('proof-preview').classList.add('hidden');
    $('proof-preview').style.display = 'none';

    $('payment-note').value = '';

    $('pay-modal').classList.add('active');
}


// ==========================================
// 10. ĐÓNG MODAL THANH TOÁN
// ==========================================

function closePayModal() {
    $('pay-modal').classList.remove('active');
}


// ==========================================
// 11. SAO CHÉP THÔNG TIN
// ==========================================

async function copyText(text, label) {
    try {
        await navigator.clipboard.writeText(text);

        showToast(`Đã sao chép ${label}`);

    } catch (error) {
        showToast(
            'Không thể sao chép tự động. Hãy sao chép thủ công.',
            true
        );
    }
}


// ==========================================
// 12. ĐĂNG KÝ SỰ KIỆN
// ==========================================

function setupEvents() {

    // Bộ lọc
    [
        'filter-group',
        'filter-type',
        'filter-status'
    ].forEach((id) => {
        $(id)?.addEventListener(
            'change',
            () => renderDebtGroups()
        );
    });

    $('filter-search')?.addEventListener(
        'input',
        () => renderDebtGroups()
    );

    // Đóng modal
    $('close-modal-btn')?.addEventListener(
        'click',
        closePayModal
    );

    $('cancel-modal-btn')?.addEventListener(
        'click',
        closePayModal
    );

    // Copy số tài khoản
    $('btn-copy-stk')?.addEventListener(
        'click',
        () => {
            copyText(
                $('modal-account-number').textContent,
                'số tài khoản'
            );
        }
    );

    // Copy nội dung chuyển khoản
    $('btn-copy-note')?.addEventListener(
        'click',
        () => {
            copyText(
                $('modal-transfer-note').textContent,
                'nội dung chuyển khoản'
            );
        }
    );

    // ======================================
    // UPLOAD ẢNH MINH CHỨNG
    // ======================================

    const fileInput = $('proof-image-input');

    $('upload-dropzone')?.addEventListener(
        'click',
        () => fileInput.click()
    );

    fileInput?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (
            !allowedTypes.includes(file.type) ||
            file.size > 5 * 1024 * 1024
        ) {
            fileInput.value = '';
            selectedProofBase64 = null;

            showToast(
                'Chỉ nhận ảnh JPG, PNG hoặc WEBP tối đa 5 MB.',
                true
            );

            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            selectedProofBase64 = String(reader.result);

            $('proof-preview').src =
                selectedProofBase64;

            $('proof-preview').classList.remove('hidden');
            $('proof-preview').style.display = '';
        };

        reader.readAsDataURL(file);
    });

    // ======================================
    // GỬI MINH CHỨNG LÊN BACKEND
    // ======================================

    $('payment-proof-form')?.addEventListener(
        'submit',
        async (event) => {
            event.preventDefault();

            const id = $('modal-debt-id').value;

            const debt = debtsState.find(
                (item) => item.id === id
            );

            if (
                !debt ||
                !debt.isRealId ||
                debt.status !== 'unpaid'
            ) {
                showToast(
                    'Khoản công nợ không hợp lệ hoặc không thể thanh toán.',
                    true
                );
                return;
            }

            if (!selectedProofBase64) {
                showToast(
                    'Vui lòng chọn ảnh minh chứng chuyển khoản.',
                    true
                );
                return;
            }

            const submitBtn = $('submit-proof-btn');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang gửi...';
            }

            try {
                await api.post('/api/debts/payments', {
                    debt_id: Number(id),
                    amount: debt.amount,
                    method: 'BANK_TRANSFER',
                    proof_image_url: selectedProofBase64,
                    note: $('payment-note').value.trim()
                });

                // Chỉ cập nhật sau khi Backend thành công
                debt.status = 'pending';

                closePayModal();

                renderSummary();
                renderDebtGroups();

                showToast(
                    'Đã gửi minh chứng lên Backend, đang chờ duyệt.'
                );

            } catch (error) {
                showToast(
                    `Không gửi được minh chứng: ${error.message}`,
                    true
                );

            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent =
                        'Gửi xác nhận đã trả';
                }
            }
        }
    );
}


// ==========================================
// 13. KHỞI TẠO TRANG
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    setupEvents();
    loadMyDebts();
});
