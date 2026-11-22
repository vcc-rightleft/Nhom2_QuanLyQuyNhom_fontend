lucide.createIcons();

        // ---------------- 1. SRS STATE & INTEGER VND DATA ----------------
        const groupMembers = [];

        let userJoinedGroups = [];

        // Debts list shared between Host (FR-HOST-005/006) & User (FR-USER-002)
        let groupDebts = [];

        let groupInvoices = [];

        let fundTransactions = [];

        // Mỗi nhóm chỉ có duy nhất 1 mã mời cố định
        let currentGroupSingleCode = '';

        let currentSplitMode = 'equal';
        let itemizedRows = [];

        // Admin Server Datasets (FR-ADM-001 to 006)
        // Admin phải lấy dữ liệu từ API quản trị có JWT và phân quyền ADMIN.
        // Không đưa dữ liệu tài khoản/quỹ mẫu lên giao diện đăng nhập thực.
        let adminAccounts = [];
        let adminServerGroups = [];

        // Format Integer VND helper (SRS 2.3)
        function formatVND(amount) {
            return Math.round(amount).toLocaleString('en-US') + ' ₫';
        }
