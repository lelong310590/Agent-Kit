# Nguyên Tắc Thiết Kế GraphQL

> Truy vấn linh hoạt cho dữ liệu phức tạp và có tính liên kết cao.

## Khi Nào Nên Sử Dụng

```
✅ Phù hợp:
├── Dữ liệu phức tạp, liên kết chặt chẽ
├── Nhiều nền tảng frontend khác nhau
├── Client cần khả năng truy vấn linh hoạt
├── Yêu cầu về dữ liệu liên tục thay đổi
└── Cần tối ưu hóa việc lấy thừa dữ liệu (over-fetching)

❌ Không phù hợp:
├── Các thao tác CRUD đơn giản
├── Tác vụ tải lên file (file upload) chiếm tỷ trọng lớn
├── Bộ đệm HTTP (HTTP caching) đóng vai trò quan trọng
└── Đội ngũ phát triển chưa quen thuộc với GraphQL
```

## Nguyên Tắc Thiết Kế Schema

```
Nguyên tắc:
├── Tư duy theo dạng đồ thị (graph), không phải bảng quan hệ (relational tables)
├── Thiết kế schema dựa trên nhu cầu của giao diện (UI)
├── Sử dụng các kiểu dữ liệu mutation payload có ý nghĩa rõ ràng
└── Sử dụng quy ước đặt tên nhất quán (ví dụ: camelCase)
```
