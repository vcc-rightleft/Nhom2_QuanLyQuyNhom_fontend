# Kết nối SQUAD.CASH với FastAPI

## Đã nối với Backend
- Đăng ký: POST /auth/register
- Đăng nhập: POST /auth/login, lưu JWT trong sessionStorage
- Khôi phục phiên: GET /auth/me
- Lấy nhóm theo tài khoản: GET /api/groups/my-groups
- Tạo nhóm: POST /api/groups/
- Tham gia nhóm: POST /api/groups/join?invite_code=...
- API nhóm Backend lấy user từ JWT, không còn user_id=1.

## CHƯA hoàn tất
- Hóa đơn, công nợ, quỹ và phần lớn bảng Host/User vẫn còn logic UI cục bộ hoặc ví dụ. Không dùng để ghi dữ liệu tiền thật.
- Các route nghiệp vụ khác của Backend cần audit quyền theo group_id (đặc biệt bill, fund, expense, debt).
- Đăng xuất xóa token tại browser; chưa gọi /auth/logout.
- Không kiểm thử được MySQL đang chạy trong môi trường này.
- Để chạy: khởi động MySQL; cd Backend && uvicorn app.main:app --reload; serve Fontend bằng python -m http.server 5500.
- Nếu đã có dữ liệu thử nghiệm cũ trong localStorage, xóa bằng DevTools > Application > Local Storage khi cần.

## Cảnh báo
- Không đưa file .env thật lên Github hoặc gửi công khai.
- Giao diện User và Host là cùng tài khoản hệ thống; Host là vai trò theo từng nhóm.
