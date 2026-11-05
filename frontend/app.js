
const API_URL = "http://127.0.0.1:8000/members";

const memberForm = document.getElementById("memberForm");
const memberList = document.getElementById("memberList");
const memberId = document.getElementById("memberId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const message = document.getElementById("message");

// Lấy danh sách thành viên từ API
async function loadMembers() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Không lấy được danh sách");
        }

        const members = await response.json();

        memberList.innerHTML = "";

        if (members.length === 0) {
            memberList.innerHTML = `
                <tr>
                    <td colspan="4">Chưa có thành viên</td>
                </tr>
            `;
            return;
        }

        members.forEach(member => {
            memberList.innerHTML += `
                <tr>
                    <td>${member.id}</td>
                    <td>${member.name}</td>
                    <td>${member.email}</td>
                    <td>
                        <button class="edit-btn"
                            onclick="editMember(${member.id}, '${encodeURIComponent(member.name)}', '${encodeURIComponent(member.email)}')">
                            Sửa
                        </button>
                        <button class="delete-btn"
                            onclick="deleteMember(${member.id})">
                            Xóa
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        memberList.innerHTML = `
            <tr><td colspan="4">Không kết nối được API</td></tr>
        `;
        showMessage(error.message, "red");
    }
}

// Thêm hoặc cập nhật thành viên
memberForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim()
    };

    const id = memberId.value;

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Có lỗi xảy ra");
        }

        showMessage(id ? "Cập nhật thành công!" : "Thêm thành viên thành công!", "green");

        resetForm();
        loadMembers();

    } catch (error) {
        showMessage(error.message, "red");
    }
});

// Chuyển thành viên sang chế độ sửa
function editMember(id, name, email) {
    memberId.value = id;
    nameInput.value = decodeURIComponent(name);
    emailInput.value = decodeURIComponent(email);

    formTitle.textContent = "Cập nhật thành viên";
    submitBtn.textContent = "Lưu thay đổi";
    cancelBtn.hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Xóa thành viên
async function deleteMember(id) {
    if (!confirm("Bạn có chắc muốn xóa thành viên này?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Xóa thất bại");
        }

        showMessage("Xóa thành viên thành công!", "green");
        loadMembers();

    } catch (error) {
        showMessage(error.message, "red");
    }
}

// Đưa form về trạng thái thêm mới
function resetForm() {
    memberForm.reset();
    memberId.value = "";

    formTitle.textContent = "Thêm thành viên";
    submitBtn.textContent = "Thêm thành viên";
    cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", resetForm);

// Hiển thị thông báo
function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}

// Tải dữ liệu khi mở trang
loadMembers();
