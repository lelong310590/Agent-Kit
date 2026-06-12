# Nguyên Tắc Thiết Kế REST

> Thiết kế API hướng tài nguyên - sử dụng danh từ, không dùng động từ.

## Quy Tắc Đặt Tên Tài Nguyên

```
Nguyên tắc:
├── Sử dụng DANH TỪ, không dùng động từ (tài nguyên, không phải hành động)
├── Sử dụng danh từ số NHIỀU (/users thay vì /user)
├── Sử dụng chữ thường kết hợp dấu gạch ngang (/user-profiles)
├── Lồng ghép cho các mối quan hệ (/users/123/posts)
└── Giữ cấu trúc nông (tối đa 3 cấp độ lồng nhau)
```

## Lựa Chọn Phương Thức HTTP

| Phương thức | Mục đích | Idempotent (Khả trùng)? | Có Body (Thân tin nhắn)? |
|--------|---------|-------------|-------|
| **GET** | Đọc (các) tài nguyên | Có | Không |
| **POST** | Tạo tài nguyên mới | Không | Có |
| **PUT** | Thay thế toàn bộ tài nguyên | Có | Có |
| **PATCH** | Cập nhật một phần tài nguyên | Không | Có |
| **DELETE** | Xóa tài nguyên | Có | Không |
