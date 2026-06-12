---
description: Quy trình quản lý, khởi chạy và giám sát máy chủ chạy thử (Preview Dev Server) cục bộ.
---

# Workflow Command: /preview

Quy trình quản lý, khởi chạy và giám sát máy chủ chạy thử (Preview Dev Server) cục bộ.

---

## 📋 Mô Tả
Lệnh `/preview` được sử dụng để kiểm soát trạng thái hoạt động của local dev server. Đây là công cụ đắc lực hỗ trợ các Agent chuyên thiết kế/lập trình (như Frontend Specialist) chạy thử ứng dụng và kiểm định trực quan sau khi thay đổi giao diện/logic.

Lệnh này chạy thông qua script bổ trợ [auto_preview.py](file:///d:/work/ag-tool-kit/.agents/scripts/auto_preview.py) dưới nền để đảm bảo dev server chạy không đồng bộ (asynchronous) không làm nghẽn terminal làm việc của Agent.

---

## 🔄 Các Lệnh Hỗ Trợ (Available Actions)

### 1. Xem trạng thái hiện tại (Status Check)
Hiển thị xem preview server có đang chạy hay không, PID của tiến trình và cổng (port) hoạt động.
```bash
/preview
```

### 2. Khởi động Server (Start Preview)
Khởi chạy dev server tương ứng với stack dự án phát hiện được. Hỗ trợ tùy chỉnh cổng (port).
```bash
/preview start [port]
```
*   *Mặc định*: Sử dụng port 3000 hoặc port được định nghĩa trong file cấu hình dự án.
*   *Tự động hóa*: Script tự động detect stack (Node.js, Go, PHP, Python) và chạy lệnh dev tương ứng.

### 3. Dừng Server (Stop Preview)
Tắt hoàn toàn preview server và dọn dẹp các tài nguyên/port đang bị chiếm dụng.
```bash
/preview stop
```
*   *Đặc biệt*: Trên Windows, script sử dụng cơ chế dập tắt cây tiến trình (`taskkill /F /T`) để tránh lỗi tiến trình con (node.exe/php.exe) chạy mồ côi chiếm port.

### 4. Khởi động lại Server (Restart Preview)
```bash
/preview restart [port]
```

### 5. Kiểm tra sức khỏe (Health Check)
Thực hiện ping HTTP request thử đến trang chủ preview để đảm bảo ứng dụng phản hồi bình thường.
```bash
/preview check
```

### 6. Xem nhật ký log của Server (View Logs)
In ra `n` dòng log mới nhất từ server preview để debug lỗi runtime/biên dịch.
```bash
/preview logs [n]
```
*   *Mặc định*: Hiển thị 20 dòng cuối cùng.

---

## 💡 Ví Dụ Sử Dụng (Examples)

### Khởi chạy dự án Node.js/Next.js
```bash
/preview start 3000
```
*Response:*
```plaintext
🚀 Khởi chạy Preview Server...
   - Dự án phát hiện: Node.js (Next.js)
   - Cổng kết nối: 3000
   - Lệnh thực thi: npm run dev -- -p 3000

✅ Máy chủ Preview đã sẵn sàng!
   - Địa chỉ URL: http://localhost:3000
   - Tiến trình PID: 12452 (chạy ngầm)
   - Tệp nhật ký log: .agents/preview.log
```

### Xem log lỗi khi server không phản hồi
```bash
/preview logs 10
```
*Response:*
```plaintext
📋 Hiển thị 10 dòng nhật ký log cuối cùng:
------------------------------------------------------------
[next] ready - started server on 0.0.0.0:3000, url: http://localhost:3000
[next] info  - Loaded env from .env.local
[next] event - compiled client and server successfully in 921ms
[next] error - Hydration failed because the initial UI does not match what was rendered on the server.
```
