# Nguyên Tắc Giới Hạn Tần Suất (Rate Limiting Principles)

> Bảo vệ API của bạn khỏi bị lạm dụng và quá tải.

## Tại Sao Cần Giới Hạn Tần Suất

```
Bảo vệ chống lại:
├── Các cuộc tấn công brute force
├── Cạn kiệt tài nguyên hệ thống
├── Vượt hạn mức chi phí (nếu dùng dịch vụ trả phí theo lượng sử dụng)
└── Sử dụng tài nguyên không công bằng
```

## Lựa Chọn Chiến Lược

| Loại chiến lược | Cách thức | Khi nào dùng |
|------|-----|------|
| **Token bucket** | Cho phép đột biến (burst), nạp lại theo thời gian | Hầu hết các API |
| **Sliding window** | Phân phối mượt mà theo cửa sổ trượt | Yêu cầu giới hạn nghiêm ngặt |
| **Fixed window** | Đặt lại (reset) tại các khoảng thời gian cố định | Yêu cầu đơn giản |
