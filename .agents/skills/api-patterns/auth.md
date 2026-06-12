# Các Mẫu Thiết Kế Xác Thực (Authentication Patterns)

> Chọn cơ chế xác thực dựa trên từng trường hợp sử dụng.

## Hướng Dẫn Lựa Chọn

| Cơ chế | Phù hợp nhất cho |
|---------|----------|
| **JWT** | Không lưu trạng thái (Stateless), microservices |
| **Session** | Web truyền thống, ứng dụng đơn giản |
| **OAuth 2.0** | Tích hợp bên thứ ba |
| **API Keys** | Giao tiếp server-to-server, API công khai |
| **Passkey** | Đăng nhập không mật khẩu hiện đại (2025+) |

## Nguyên Tắc Sử Dụng JWT

```
Triển khai:
├── Giữ thời gian sống của token ngắn (ví dụ: 15 phút)
├── Sử dụng refresh token được lưu trữ an toàn trong HTTP-only cookie
├── Xác thực chữ ký trên mỗi request
└── Không lưu trữ thông tin nhạy cảm trong payload (JWT chỉ được mã hóa base64)
```
