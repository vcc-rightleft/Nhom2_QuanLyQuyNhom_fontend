# SQUAD.CASH — Frontend tích hợp giao diện v31

Đã tách file HTML gốc thành các phần trong thư mục `partials/`, CSS thành 3 file `css/squad-*.css` và JavaScript theo 16 khối chức năng trong `js/squad/`. File `index.html` là điểm vào mới và `js/squad-loader.js` tải chúng theo đúng thứ tự để giữ các hàm của giao diện gốc.

## Chạy dự án

Từ thư mục `Fontend` chạy:

```bash
python -m http.server 5500
```

Mở **http://localhost:5500/**. Không mở trực tiếp `index.html` bằng đường dẫn `file://` vì trình duyệt chặn tải các HTML partial bằng `fetch`.

Dự án sử dụng Tailwind CDN, Lucide, Canvas Confetti, Google Fonts và ảnh Wikimedia nên cần internet để hiển thị đầy đủ. Chức năng API gốc sử dụng `http://127.0.0.1:8000`; cần chạy backend FastAPI và cấu hình CORS tương ứng nếu cần kết nối dữ liệu thật. Các tài khoản/dữ liệu mô phỏng trong mẫu v31 không tự biến thành dữ liệu backend thật.

## Cấu trúc mới

- `index.html`: khung ứng dụng và khai báo CSS/dependencies
- `partials/shell.html`: header, intro cinematic, các phần đầu
- `partials/view-landing.html`, `view-auth.html`, `view-user.html`, `view-host.html`, `view-admin.html`: màn hình theo vai trò
- `partials/dialogs.html`: modal, toast và phần HTML chung
- `css/squad-foundation.css`, `squad-components.css`, `squad-motion.css`: CSS gốc được chia tách theo thứ tự
- `js/squad-loader.js`: tải giao diện và module JS theo thứ tự
- `js/squad/*.js`: 16 khối mã chức năng từ file v31
- `legacy/original-index.html`: bản sao trang chủ Frontend trước khi tích hợp
- `pages/`, `css/` và `js/` cũ: giữ nguyên để tránh mất các chức năng sẵn có; các trang cũ vẫn độc lập

**Lưu ý:** Đây là tích hợp UI v31 thành frontend có tổ chức, không phải chuyển đổi sang React/Vue và không tự hợp nhất logic API của các trang cũ với các màn hình mockup v31. Nếu muốn thay hẳn dữ liệu mẫu bằng API, cần mapping endpoint và trạng thái đăng nhập theo backend.

## Bản sửa chuyển hướng giao diện (2026-11-22)

**Vì sao bản trước trông không đổi?** Chỉ `Fontend/index.html` dùng UI v31; các file `pages/*.html` vẫn là trang cũ.

Bản này cập nhật **tất cả 6 điểm vào `pages/*.html`** để điều hướng tới giao diện mới theo vai trò thích hợp, thay vì hiển thị trang cũ. Bản gốc của từng trang được giữ tại `legacy/pages/` và trang chủ cũ ở `legacy/original-index.html`.

Đường dẫn mới: `index.html?view=auth&mode=login`, `index.html?view=user`, `index.html?view=host`, `index.html?view=admin`.

**Giới hạn quan trọng:** giao diện v31 dùng dữ liệu mô phỏng, chưa chuyển logic backend API của các trang cũ sang giao diện mới. Để sử dụng các nghiệp vụ API cũ, có thể xem lại bản sao `legacy/pages/`. Đây là bước đồng bộ hiển thị và đường dẫn, không phải kết nối API hoàn chỉnh.

Chạy HTTP server trong thư mục `Fontend` và truy cập `http://localhost:5500/` (hoặc `http://localhost:5500/pages/auth.html`). Sau khi thay ZIP hãy làm mới trình duyệt bằng Ctrl+Shift+R.
