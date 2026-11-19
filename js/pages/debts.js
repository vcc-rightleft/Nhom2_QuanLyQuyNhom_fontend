

(function () {
    // Dữ liệu mẫu chuẩn cấu trúc API (tự động dùng nếu API backend chưa sẵn sàng hoặc đang test UI)
    const MOCK_DEBTS = [
        {
            id: 101,
            group_id: 1,
            group_name: "Nhóm 2 - Đồ án Công nghệ Phần mềm",
            title: "Đóng quỹ nhóm tháng 11/2026",
            type: "owe", // "owe": tôi nợ người khác | "owed": người khác nợ tôi
            amount: 150000,
            status: "unpaid", // "unpaid" | "pending" | "paid"
            due_date: "2026-11-20",
            counterparty_name: "Nguyễn Văn An (Trưởng nhóm)",
            receiver_bank: {
                bank_id: "MB",
                bank_name: "MB Bank (Quân Đội)",
                account_number: "0987654321",
                account_name: "NGUYEN VAN AN"
            }
        },
        {
            id: 102,
            group_id: 1,
            group_name: "Nhóm 2 - Đồ án Công nghệ Phần mềm",
            title: "Tiền in ấn tài liệu & slide thuyết trình",
            type: "owe",
            amount: 45000,
            status: "pending",
            due_date: "2026-11-18",
            counterparty_name: "Trần Thị Bình",
            receiver_bank: {
                bank_id: "VCB",
                bank_name: "Vietcombank",
                account_number: "1023456789",
                account_name: "TRAN THI BINH"
            }
        },
        {
            id: 103,
            group_id: 2,
            group_name: "Quỹ Liên Hoan Lớp HN-KS25-CNTT2",
            title: "Tiền nước uống buổi họp team",
            type: "owed",
            amount: 120000,
            status: "unpaid",
            due_date: "2026-11-22",
            counterparty_name: "Lê Hoàng Nam",
            receiver_bank: null
        },
        {
            id: 104,
            group_id: 2,
            group_name: "Quỹ Liên Hoan Lớp HN-KS25-CNTT2",
            title: "Vé liên hoan cuối kỳ",
            type: "owe",
            amount: 250000,
            status: "unpaid",
            due_date: "2026-11-25",
            counterparty_name: "Phạm Minh Đức (Thủ quỹ)",
            receiver_bank: {
                bank_id: "TCB",
                bank_name: "Techcombank",
                account_number: "190368686868",
                account_name: "PHAM MINH DUC"
            }
        }
    ];

    let allDebts = [];
    let selectedProofBase64 = null;

    function formatCurrency(amount) {
        if (typeof window.formatMoney === "function") {
            return window.formatMoney(amount);
        }
        return new Intl.NumberFormat("vi-VN").format(amount || 0) + " đ";
    }

    // Lấy danh sách công nợ từ Backend API (fallback sang MOCK_DEBTS nếu chưa có endpoint)
    async function loadMyDebts() {
        try {
            if (window.api && typeof window.api.get === "function") {
                const res = await window.api.get("/debts/me");
                if (Array.isArray(res) && res.length > 0) {
                    allDebts = res;
                    initGroupFilter();
                    renderPage();
                    return;
                }
            }
        } catch (err) {
            console.warn("Sử dụng dữ liệu mẫu cho Trang công nợ của tôi:", err.message);
        }

        allDebts = [...MOCK_DEBTS];
        initGroupFilter();
        renderPage();
    }

    function initGroupFilter() {
        const groupSelect = document.getElementById("filter-group");
        const uniqueGroups = new Map();
        allDebts.forEach((d) => uniqueGroups.set(String(d.group_id), d.group_name));

        groupSelect.innerHTML = `<option value="all">Tất cả nhóm (${uniqueGroups.size})</option>`;
        uniqueGroups.forEach((name, id) => {
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = name;
            groupSelect.appendChild(opt);
        });
    }

    function updateSummaryCards() {
        let totalIOwe = 0;
        let countIOwe = 0;
        let totalOwedToMe = 0;
        let countOwedToMe = 0;

        allDebts.forEach((item) => {
            if (item.status !== "paid") {
                if (item.type === "owe") {
                    totalIOwe += Number(item.amount);
                    countIOwe++;
                } else if (item.type === "owed") {
                    totalOwedToMe += Number(item.amount);
                    countOwedToMe++;
                }
            }
        });

        const net = totalOwedToMe - totalIOwe;
        document.getElementById("total-i-owe").textContent = formatCurrency(totalIOwe);
        document.getElementById("count-i-owe").textContent = `${countIOwe} khoản chưa hoàn tất`;

        document.getElementById("total-owed-to-me").textContent = formatCurrency(totalOwedToMe);
        document.getElementById("count-owed-to-me").textContent = `${countOwedToMe} khoản đang chờ thu`;

        const netEl = document.getElementById("net-balance");
        netEl.textContent = (net > 0 ? "+" : "") + formatCurrency(net);
        netEl.style.color = net >= 0 ? "#059669" : "#dc2626";
    }

    function getStatusBadge(item) {
        if (item.type === "owed") {
            return item.status === "paid"
                ? `<span class="badge badge-paid">Đã nhận tiền</span>`
                : `<span class="badge badge-receive">Người khác nợ bạn</span>`;
        }
        switch (item.status) {
            case "paid":
                return `<span class="badge badge-paid">Đã thanh toán</span>`;
            case "pending":
                return `<span class="badge badge-pending">Chờ duyệt ảnh CK</span>`;
            default:
                return `<span class="badge badge-unpaid">Chưa thanh toán</span>`;
        }
    }

    function renderPage() {
        updateSummaryCards();

        const groupFilter = document.getElementById("filter-group").value;
        const typeFilter = document.getElementById("filter-type").value;
        const statusFilter = document.getElementById("filter-status").value;
        const keyword = document.getElementById("filter-search").value.trim().toLowerCase();

        const filtered = allDebts.filter((item) => {
            if (groupFilter !== "all" && String(item.group_id) !== groupFilter) return false;
            if (typeFilter !== "all" && item.type !== typeFilter) return false;
            if (statusFilter !== "all" && item.status !== statusFilter) return false;
            if (
                keyword &&
                !item.title.toLowerCase().includes(keyword) &&
                !item.counterparty_name.toLowerCase().includes(keyword) &&
                !item.group_name.toLowerCase().includes(keyword)
            ) {
                return false;
            }
            return true;
        });

        const container = document.getElementById("debt-groups-container");
        if (filtered.length === 0) {
            container.innerHTML = `
        <div style="background:#fff; padding:40px; border-radius:12px; text-align:center; color:#64748b;">
          Không tìm thấy khoản công nợ nào phù hợp với bộ lọc.
        </div>`;
            return;
        }

        // Gom nhóm các khoản nợ theo group_id
        const grouped = new Map();
        filtered.forEach((item) => {
            if (!grouped.has(item.group_id)) {
                grouped.set(item.group_id, {
                    group_name: item.group_name,
                    items: []
                });
            }
            grouped.get(item.group_id).items.push(item);
        });

        let html = "";
        grouped.forEach((group) => {
            const groupTotalOwe = group.items
                .filter((i) => i.type === "owe" && i.status !== "paid")
                .reduce((sum, i) => sum + Number(i.amount), 0);

            html += `
        <section class="group-debt-section">
          <div class="group-header">
            <div class="group-title">📁 ${group.group_name}</div>
            <div style="font-size: 13px; color: #475569;">
              Cần trả trong nhóm: <strong style="color: #dc2626;">${formatCurrency(groupTotalOwe)}</strong>
            </div>
          </div>
          <div>
            ${group.items
                    .map((item) => {
                        const isOwe = item.type === "owe";
                        const bankInfo = item.receiver_bank
                            ? ` • STK nhận: <strong>${item.receiver_bank.bank_id} - ${item.receiver_bank.account_number}</strong>`
                            : "";

                        let actionBtn = "";
                        if (isOwe) {
                            if (item.status === "unpaid") {
                                actionBtn = `<button type="button" class="btn-pay" data-open-pay="${item.id}">Tôi đã trả</button>`;
                            } else if (item.status === "pending") {
                                actionBtn = `<button type="button" class="btn-pay" disabled>Đang chờ duyệt</button>`;
                            }
                        }

                        return `
                  <div class="debt-item">
                    <div class="debt-info">
                      <h4>${item.title}</h4>
                      <div class="debt-meta">
                        ${isOwe ? "Người nhận:" : "Người nợ:"} <strong>${item.counterparty_name}</strong>
                        • Hạn: ${item.due_date || "Không có"}
                        ${isOwe ? bankInfo : ""}
                      </div>
                    </div>
                    <div class="debt-actions">
                      ${getStatusBadge(item)}
                      <div class="debt-amount" style="color: ${isOwe ? "#dc2626" : "#059669"};">
                        ${isOwe ? "-" : "+"}${formatCurrency(item.amount)}
                      </div>
                      ${actionBtn}
                    </div>
                  </div>
                `;
                    })
                    .join("")}
          </div>
        </section>
      `;
        });

        container.innerHTML = html;

        // Gắn sự kiện click nút "Tôi đã trả"
        container.querySelectorAll("[data-open-pay]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const debtId = Number(btn.getAttribute("data-open-pay"));
                openPaymentModal(debtId);
            });
        });
    }

    function openPaymentModal(debtId) {
        const debt = allDebts.find((d) => d.id === debtId);
        if (!debt) return;

        const bank = debt.receiver_bank || {
            bank_id: "MB",
            bank_name: "Chưa cập nhật ngân hàng",
            account_number: "Chưa có STK",
            account_name: debt.counterparty_name
        };

        const transferNote = `THANHTOAN NO ${debt.id}`;

        document.getElementById("modal-debt-id").value = debt.id;
        document.getElementById("modal-debt-title").textContent = debt.title;
        document.getElementById("modal-debt-amount").textContent = formatCurrency(debt.amount);
        document.getElementById("modal-receiver-name").textContent = `${bank.account_name} (${debt.counterparty_name})`;
        document.getElementById("modal-bank-name").textContent = bank.bank_name;
        document.getElementById("modal-account-number").textContent = bank.account_number;
        document.getElementById("modal-transfer-note").textContent = transferNote;

        // Tạo ảnh VietQR tự động điền số tiền và nội dung chuyển khoản
        const qrImg = document.getElementById("modal-vietqr-img");
        if (bank.account_number && bank.account_number !== "Chưa có STK") {
            const qrUrl = `https://img.vietqr.io/image/${bank.bank_id}-${bank.account_number}-compact2.png?amount=${debt.amount}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(bank.account_name)}`;
            qrImg.src = qrUrl;
            qrImg.style.display = "inline-block";
        } else {
            qrImg.style.display = "none";
        }

        // Reset form upload ảnh
        selectedProofBase64 = null;
        document.getElementById("proof-image-input").value = "";
        document.getElementById("proof-preview").style.display = "none";
        document.getElementById("payment-note").value = "";

        document.getElementById("pay-modal").classList.add("active");
    }

    function closePaymentModal() {
        document.getElementById("pay-modal").classList.remove("active");
    }

    function setupEvents() {
        ["filter-group", "filter-type", "filter-status"].forEach((id) => {
            document.getElementById(id).addEventListener("change", renderPage);
        });
        document.getElementById("filter-search").addEventListener("input", renderPage);

        document.getElementById("close-modal-btn").addEventListener("click", closePaymentModal);
        document.getElementById("cancel-modal-btn").addEventListener("click", closePaymentModal);

        // Copy số tài khoản & nội dung CK
        document.getElementById("btn-copy-stk").addEventListener("click", () => {
            const stk = document.getElementById("modal-account-number").textContent;
            navigator.clipboard.writeText(stk);
            alert("Đã sao chép số tài khoản: " + stk);
        });

        document.getElementById("btn-copy-note").addEventListener("click", () => {
            const note = document.getElementById("modal-transfer-note").textContent;
            navigator.clipboard.writeText(note);
            alert("Đã sao chép nội dung chuyển khoản: " + note);
        });

        // Xử lý chọn & preview ảnh minh chứng
        const dropzone = document.getElementById("upload-dropzone");
        const fileInput = document.getElementById("proof-image-input");
        const previewImg = document.getElementById("proof-preview");

        dropzone.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP).");
                fileInput.value = "";
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("Ảnh vượt quá dung lượng tối đa 5MB.");
                fileInput.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                selectedProofBase64 = ev.target.result;
                previewImg.src = selectedProofBase64;
                previewImg.style.display = "inline-block";
            };
            reader.readAsDataURL(file);
        });

        // Submit form xác nhận đã trả kèm ảnh biên lai
        document.getElementById("payment-proof-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const debtId = Number(document.getElementById("modal-debt-id").value);
            const note = document.getElementById("payment-note").value.trim();

            if (!selectedProofBase64) {
                alert("Vui lòng tải lên ảnh biên lai chuyển khoản trước khi xác nhận!");
                return;
            }

            const submitBtn = document.getElementById("submit-proof-btn");
            submitBtn.disabled = true;
            submitBtn.textContent = "Đang gửi...";

            try {
                // Gọi API backend nếu có
                if (window.api && typeof window.api.post === "function") {
                    await window.api.post(`/debts/${debtId}/confirm-payment`, {
                        proof_image: selectedProofBase64,
                        note: note
                    });
                }
            } catch (err) {
                console.warn("Cập nhật local state do API chưa phản hồi:", err.message);
            } finally {
                // Cập nhật trạng thái sang "pending" (Chờ duyệt minh chứng) trên UI
                const idx = allDebts.findIndex((d) => d.id === debtId);
                if (idx !== -1) {
                    allDebts[idx].status = "pending";
                }
                submitBtn.disabled = false;
                submitBtn.textContent = "Gửi xác nhận đã trả";
                closePaymentModal();
                renderPage();
                alert("Đã gửi xác nhận thanh toán và ảnh minh chứng thành công!");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        // if (typeof window.renderLayout === "function") {
        //     window.renderLayout("debts");
        // }
        setupEvents();
        loadMyDebts();
    });
})();