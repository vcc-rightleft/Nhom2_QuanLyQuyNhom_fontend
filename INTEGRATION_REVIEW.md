# Bản tích hợp thử nghiệm — chưa phải merge Git hoàn chỉnh

Nguồn: frontend-dev.zip (nền code đã commit), frontend-T3CCB32.zip (trang quản lý nhóm), frontend-statement.zip và frontend-host-debts.zip (đối chiếu chức năng; module Host/sao kê đã tồn tại ở dev).

## Đã xử lý
- Khởi động giao diện SQUAD.CASH theo module `js/squad-loader.js` từ index.html.
- Bổ sung `pages/group.html`, `js/group.js`, `css/group.css` từ nhánh T3CCB32.
- Không đưa năm file đang conflict của `frontend-current.zip` vào bản build thử nghiệm.
- Ngừng tạo token `mock_jwt_token` của trang auth cũ.
- Xóa `DEFAULT_ITEMS`, `GROUP_MEMBERS`, `DEMO_PROFILES`, `MOCK_TRANSACTIONS` và không dùng localStorage hóa đơn như nguồn dữ liệu.
- Sao kê có API lỗi hiển thị lỗi, không thay bằng dữ liệu mẫu; tài khoản chưa có nhóm hiển thị trống.

## Chưa hoàn tất / Cần kiểm tra
- Chưa xác nhận endpoint và schema trực tiếp với bản Backend đang chạy.
- Chưa kiểm thử thực tế qua trình duyệt / FastAPI / MySQL.
- Các nhánh chứa những cách tổ chức UI và chức năng khác nhau; đây là bản hợp nhất mã nguồn có chọn lọc, KHÔNG phải chứng nhận đã merge đủ lịch sử Git.
- `pages/group.html`/`js/group.js` có API riêng; cần đối chiếu khi Backend được cung cấp.
- File `.git` không có trong ZIP. Hãy giải quyết trạng thái Git merge riêng trước khi chép vào repository.
- Những điều khiển demo / nút minh họa có thể vẫn còn trong phần giao diện; không dùng các thao tác đó làm căn cứ xác nhận thay đổi DB.

## Chạy thử
Tại thư mục chứa `index.html`: `python -m http.server 5500`, truy cập `http://localhost:5500/`. Khởi chạy Backend riêng trên cổng API đã cấu hình, kiểm tra API và CORS.
