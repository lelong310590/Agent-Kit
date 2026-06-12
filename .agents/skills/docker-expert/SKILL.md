---
name: docker-expert
description: Chuyên gia thiết lập môi trường Docker, viết Dockerfile tối ưu, docker-compose cấu hình đa dịch vụ và các quy chuẩn bảo mật/hiệu năng container.
when_to_use: "Dự án phát hiện có file 'Dockerfile', 'docker-compose.yml', 'compose.yaml', hoặc thư mục '.docker'."
---

# Kỹ Năng: Docker & Containerization Expert

Chỉ dẫn chuyên sâu này được tự động nạp khi phát hiện dự án sử dụng Docker để container hóa ứng dụng.

---

## 🐋 1. Tối Ưu Hóa Dockerfile

*   **Multi-stage Builds (Xây dựng đa tầng)**:
    *   **Bắt buộc** áp dụng multi-stage builds để tách biệt môi trường build (chứa compiler, package manager, SDK) khỏi môi trường runtime (chỉ chứa file build và runtime engine).
    *   Mục tiêu: Giảm thiểu dung lượng Image đầu ra xuống mức thấp nhất và hạn chế các lỗ hổng bảo mật từ các công cụ phát triển thừa.
*   **Tối Ưu Hóa Layer Caching**:
    *   Sắp xếp các lệnh trong Dockerfile theo tần suất thay đổi: Các lệnh ít thay đổi ở phía trên, các lệnh thường xuyên thay đổi ở phía dưới.
    *   Ví dụ: COPY các file quản lý dependency (`package.json`, `composer.json`, `go.mod`) và chạy cài đặt package trước khi COPY toàn bộ source code của dự án.
*   **Lựa Chọn Base Image Tối Ưu**:
    *   Ưu tiên sử dụng các image tối giản, chính thức như Alpine Linux (`-alpine`) hoặc Debian Slim (`-slim`) để làm giảm dung lượng image và diện tích tấn công (attack surface).
*   **Chạy Với Quyền User Thường (Non-root User)**:
    *   Tránh chạy ứng dụng dưới quyền `root` trong container.
    *   Luôn tạo user mới hoặc sử dụng user có sẵn của base image (ví dụ: `USER node` cho Node.js, `USER www-data` cho PHP) trước khi chỉ định lệnh khởi chạy (`CMD` hoặc `ENTRYPOINT`).
*   **Sử Dụng `.dockerignore`**:
    *   Luôn tạo file `.dockerignore` ở root dự án để loại bỏ các thư mục và file không cần thiết cho quá trình build (ví dụ: `.git`, `node_modules`, `vendor`, `.env`, `dist`, logs).
    *   Điều này giúp tăng tốc độ gửi build context từ client lên Docker daemon và giảm dung lượng image.

---

## 🎼 2. Quy Chuẩn Docker Compose (Multi-container Orchestration)

*   **Quản Lý Biến Môi Trường**:
    *   Không hardcode các thông tin cấu hình nhạy cảm trực tiếp trong `docker-compose.yml`.
    *   Sử dụng cú pháp `${VARIABLE_NAME}` và nạp dữ liệu từ file `.env` cục bộ.
*   **Volume & Dữ Liệu Lâu Bền (Data Persistence)**:
    *   Sử dụng **Named Volumes** để lưu trữ các dữ liệu cần bảo toàn giữa các lần khởi tạo lại container (như database files, public uploads).
    *   Chỉ sử dụng **Bind Mounts** (`./host:/container`) cho môi trường phát triển (development) để hỗ trợ tính năng hot-reload code trực tiếp từ máy local.
*   **Cấu Hình Network**:
    *   Sử dụng network riêng biệt (`networks`) cho các nhóm service để tăng tính bảo mật (ví dụ: `frontend-network`, `backend-network`, `db-network`).
    *   Chỉ export các port thực sự cần giao tiếp ra ngoài máy host (ví dụ: port 80/443 của reverse proxy), các port database hoặc backend API nội bộ nên giữ kín trong docker network.
*   **Quản Lý Khởi Động & Dependency**:
    *   Sử dụng `depends_on` để định nghĩa thứ tự khởi động của các service (ví dụ: web phụ thuộc vào database).
    *   Sử dụng `healthcheck` trên các service nền (như MySQL, PostgreSQL, Redis) kết hợp với `condition: service_healthy` ở dịch vụ phụ thuộc để đảm bảo ứng dụng chỉ start khi database đã thực sự sẵn sàng nhận kết nối.

---

## 🛡️ 3. Bảo Mật & Quản Lý Container

*   **Gán Tag Cụ Thể (Pinning Version)**:
    *   Không sử dụng tag `latest` cho base images trong môi trường production.
    *   Luôn chỉ định tag phiên bản cụ thể (ví dụ: `node:20.11-alpine` thay vì `node:alpine` hoặc `node:latest`) để đảm bảo tính nhất quán của build build-output (Reproducible builds).
*   **ReadOnly Filesystem**:
    *   Với môi trường production, cân nhắc cấu hình container chạy với filesystem chỉ đọc (`read_only: true` trong compose hoặc `--read-only` trong docker run) và mount volume tạm thời (`tmpfs`) cho các thư mục ghi log hoặc cache để hạn chế hacker sửa đổi source code container khi bị xâm nhập.
