# Nguyên Tắc tRPC

> An toàn kiểu dữ liệu end-to-end cho các dự án TypeScript monorepo.

## Khi Nào Nên Sử Dụng

```
✅ Phù hợp hoàn hảo:
├── TypeScript được sử dụng ở cả hai đầu (frontend và backend)
├── Cấu trúc dự án dạng Monorepo
├── Các công cụ nội bộ (internal tools)
├── Phát triển sản phẩm nhanh chóng (rapid development)
└── Yêu cầu cao về an toàn kiểu dữ liệu (type safety)

❌ Không phù hợp:
├── Các client không sử dụng TypeScript
├── API công khai (Public API)
├── Yêu cầu tuân thủ các quy ước của REST
└── Backend được viết bằng nhiều ngôn ngữ khác nhau
```

## Lợi Ích Chính

```
Tại sao dùng tRPC:
├── Không cần bảo trì schema (Zero schema maintenance)
├── Tự động suy luận kiểu dữ liệu end-to-end (type inference)
├── IDE tự động gợi ý code (autocomplete) trên toàn bộ stack
├── Các thay đổi API được phản ánh ngay lập tức
└── Không yêu cầu bước tạo code trung gian (code generation)
```

## Các Mẫu Thiết Kế Tích Hợp

```
Các thiết lập phổ biến:
├── Next.js + tRPC (phổ biến nhất)
├── Monorepo với các kiểu dữ liệu dùng chung (shared types)
├── Remix + tRPC
└── Bất kỳ frontend + backend TS nào
```
