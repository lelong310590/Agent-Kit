# Chiến Lược Quản Lý Phiên Bản (Versioning Strategies)

> Lập kế hoạch cho sự phát triển của API ngay từ ngày đầu tiên.

## Các Yếu Tố Quyết Định

| Chiến lược | Triển khai | Đánh đổi |
|----------|---------------|------------|
| **URI** | /v1/users | Rõ ràng, dễ cấu hình cache |
| **Header** | Accept-Version: 1 | URL gọn gàng hơn, khó tự động khám phá hơn |
| **Query** | ?version=1 | Dễ dàng thêm mới, nhưng gây lộn xộn |
| **None** | Phát triển cẩn thận | Tốt nhất cho nội bộ, rủi ro cao cho API công khai |

## Thực Hành Tốt Nhất (Best Practices)

- Tránh các thay đổi phá vỡ tương thích (breaking changes) trừ khi thực sự bắt buộc.
- Sử dụng phiên bản trên URL (/v1) cho các API công khai hoặc hướng ngoại để đảm bảo tính đơn giản.
- Giữ các phiên bản cũ hoạt động song song kèm theo chính sách ngừng hỗ trợ (deprecation policy) rõ ràng.
