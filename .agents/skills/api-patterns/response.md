# Nguyên Tắc Định Dạng Phản Hồi (Response Format Principles)

> Tính nhất quán là chìa khóa - hãy chọn một định dạng và kiên trì áp dụng nó.

## Các Mô Hình Phổ Biến

```
Chọn một:
├── Mô hình bao bọc - Envelope pattern ({ success, data, error })
├── Dữ liệu trực tiếp - Direct data (chỉ trả về tài nguyên)
└── HAL/JSON:API (hypermedia)
```

## Phản Hồi Lỗi

```
Cần bao gồm:
├── Mã lỗi - Error code (để xử lý bằng code)
├── Thông điệp người dùng - User message (để hiển thị lên giao diện)
├── Chi tiết lỗi - Details (phục vụ debug, lỗi cụ thể ở từng trường dữ liệu)
├── ID yêu cầu - Request ID (để hỗ trợ, tra cứu log)
└── KHÔNG bao gồm chi tiết nội bộ/hệ thống (vấn đề bảo mật!)
```

## Các Loại Phân Trang

| Loại | Ưu điểm | Nhược điểm | Trường hợp sử dụng |
|------|------|------|----------|
| **Dựa trên Offset (Offset-based)** | Đơn giản, biết được tổng số trang | Chậm khi offset lớn, dữ liệu có thể bị trùng lặp/bỏ sót khi có thay đổi | Tập dữ liệu nhỏ |
| **Dựa trên Con trỏ (Cursor-based)** | Nhanh, dữ liệu nhất quán | Không biết được tổng số bản ghi, phức tạp hơn | Tập dữ liệu lớn, cuộn vô hạn (infinite scroll) |
