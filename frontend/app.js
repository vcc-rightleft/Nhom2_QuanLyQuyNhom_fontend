const API_BASE_URL = 'http://localhost:8000/api';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + ' ₫';
};

const groupCardsContainer = document.getElementById('groupCardsContainer');
const groupDetailSection = document.getElementById('groupDetailSection');
const createGroupModal = document.getElementById('createGroupModal');

// GỌI API BACKEND
const fetchMyGroups = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/my-groups`);
        if (!response.ok) throw new Error('Không thể tải danh sách nhóm');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

const createGroupAPI = async (groupData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData)
        });
        if (!response.ok) throw new Error('Lỗi khi tạo nhóm');
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Tạo nhóm thất bại!');
        return null;
    }
};

const joinGroupAPI = async (inviteCode) => {
    try {
        const cleanCode = inviteCode.replace('#', '').trim();
        const response = await fetch(`${API_BASE_URL}/groups/join?invite_code=${encodeURIComponent(cleanCode)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Mã mời không hợp lệ hoặc bạn đã ở trong nhóm');
        }
        return await response.json();
    } catch (error) {
        alert(error.message);
        return null;
    }
};

const fetchGroupDetailAPI = async (groupId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
};

const fetchGroupMembersAPI = async (groupId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        return [];
    }
};

// HIỂN THỊ DANH SÁCH CARD NHÓM CHUẨN FIGMA
const stripColors = ['strip-lime', 'strip-blue', 'strip-yellow'];

const renderDashboard = async () => {
    const groups = await fetchMyGroups();
    groupCardsContainer.innerHTML = '';

    if (groups.length === 0) {
        groupCardsContainer.innerHTML = '<div class="empty-cell">Bạn chưa tham gia nhóm nào. Hãy bấm "+ Tạo nhóm mới" ở góc trên!</div>';
        return;
    }

    groups.forEach((group, index) => {
        const stripClass = stripColors[index % stripColors.length];
        const groupId = group.group_id || group.id;
        const groupName = group.group_name || group.name || 'Nhóm chưa đặt tên';
        const inviteCode = group.invite_code ? `#${group.invite_code.replace('#', '')}` : `Vai trò: ${group.role || 'HOST'}`;

        const card = document.createElement('div');
        card.className = 'group-card';
        card.innerHTML = `
            <div class="card-strip ${stripClass}">
                <span>#GRP-${groupId} • ${inviteCode}</span>
                <span class="status-pill">● Hoạt động</span>
            </div>
            <div class="card-content">
                <h3>${groupName}</h3>
                <div class="card-meta">
                    <div>Vai trò của bạn: <b>${group.role || 'HOST'}</b></div>
                    <div>Số thành viên: ${group.member_count || 1} người</div>
                </div>
            </div>
            <div class="card-bottom">
                <div>
                    <div class="balance-caption">Số dư quỹ chung</div>
                    <div class="balance-num">${formatCurrency(group.fund_balance)}</div>
                </div>
                <button class="btn-brutal btn-lime view-detail-btn" data-id="${groupId}" data-name="${groupName}">Xem chi tiết</button>
            </div>
        `;
        groupCardsContainer.appendChild(card);
    });

    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const fallbackName = e.currentTarget.getAttribute('data-name');
            await openGroupDetail(id, fallbackName);
        });
    });
};

// MỞ KHUNG CHI TIẾT NHÓM BÊN DƯỚI
const openGroupDetail = async (groupId, fallbackName) => {
    const [detail, members] = await Promise.all([
        fetchGroupDetailAPI(groupId),
        fetchGroupMembersAPI(groupId)
    ]);

    groupDetailSection.classList.remove('hidden');

    const title = (detail && (detail.group_name || detail.name)) || fallbackName;
    const code = (detail && detail.invite_code) ? `#${detail.invite_code.replace('#', '')}` : `#GRP-${groupId}`;

    document.getElementById('detailGroupTitle').textContent = `${title} (#GRP-${groupId})`;
    document.getElementById('detailInviteCode').textContent = code;

    const tbody = document.getElementById('memberTableBody');
    document.getElementById('memberCountLabel').textContent = members.length;

    if (members.length > 0) {
        tbody.innerHTML = members.map(m => `
            <tr>
                <td><b>${m.full_name || m.username || m.name || 'Thành viên #' + m.user_id}</b></td>
                <td><span class="tag-yellow">${m.role || 'Member'}</span></td>
                <td style="color:#16a34a;">● Đã xác thực</td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-cell">Chưa tải được danh sách thành viên.</td></tr>';
    }

    groupDetailSection.scrollIntoView({ behavior: 'smooth' });
};

// CHUYỂN ĐỔI CÁC TAB TRONG CHI TIẾT NHÓM
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        const target = e.currentTarget.getAttribute('data-target');
        e.currentTarget.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

// CHUYỂN ĐỔI MÀN HÌNH TRÊN THANH NAVBAR
document.querySelectorAll('.nav-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const view = e.currentTarget.getAttribute('data-view');
        if (view === 'view-auth') {
            document.getElementById('view-auth').classList.remove('hidden');
            document.getElementById('view-dashboard').classList.add('hidden');
        } else {
            document.getElementById('view-auth').classList.add('hidden');
            document.getElementById('view-dashboard').classList.remove('hidden');
        }
    });
});

// XỬ LÝ MODAL TẠO NHÓM
const closeModal = () => {
    createGroupModal.classList.add('hidden');
    document.getElementById('newGroupName').value = '';
    document.getElementById('newGroupDesc').value = '';
};

document.getElementById('openCreateModalBtn').addEventListener('click', () => {
    createGroupModal.classList.remove('hidden');
});
document.getElementById('closeModalIcon').addEventListener('click', closeModal);
document.getElementById('cancelCreateBtn').addEventListener('click', closeModal);

document.getElementById('confirmCreateBtn').addEventListener('click', async () => {
    const name = document.getElementById('newGroupName').value.trim();
    const description = document.getElementById('newGroupDesc').value.trim();

    if (!name) {
        alert('Vui lòng nhập tên nhóm quỹ!');
        return;
    }

    const created = await createGroupAPI({ name, description });
    if (created) {
        closeModal();
        await renderDashboard();
    }
});

// XỬ LÝ NHẬP MÃ MỜI VÀO NHÓM
const handleJoin = async (inputId) => {
    const input = document.getElementById(inputId);
    const code = input.value.trim();
    if (!code) return alert('Vui lòng nhập mã mời!');

    const res = await joinGroupAPI(code);
    if (res) {
        alert('Tham gia nhóm thành công!');
        input.value = '';
        document.getElementById('view-auth').classList.add('hidden');
        document.getElementById('view-dashboard').classList.remove('hidden');
        await renderDashboard();
    }
};

document.getElementById('joinGroupBtn').addEventListener('click', () => handleJoin('inviteCodeInput'));
document.getElementById('quickJoinBtn').addEventListener('click', () => handleJoin('quickJoinInput'));

// SAO CHÉP MÃ MỜI
document.getElementById('copyCodeBtn').addEventListener('click', () => {
    const code = document.getElementById('detailInviteCode').textContent.replace('#', '');
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
});

renderDashboard();