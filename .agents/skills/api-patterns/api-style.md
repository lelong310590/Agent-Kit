# Lựa Chọn Phong Cách Thiết Kế API

> REST vs GraphQL vs tRPC - chọn cái nào, khi nào?

## Sơ Đồ Quyết Định

```
Ai là người tiêu dùng API?
│
├── Public API / Đa nền tảng
│   └── REST + OpenAPI (độ tương thích rộng nhất)
│
├── Nhu cầu dữ liệu phức tạp / Nhiều frontend
│   └── GraphQL (truy vấn linh hoạt)
│
├── Frontend + backend đều dùng TypeScript (monorepo)
│   └── tRPC (an toàn kiểu dữ liệu end-to-end)
│
├── Thời gian thực (Real-time) / Hướng sự kiện (Event-driven)
│   └── WebSocket + AsyncAPI
│
└── Microservices nội bộ
    └── gRPC (hiệu năng cao) hoặc REST (đơn giản)
```

## So Sánh

| Yếu tố | REST | GraphQL | tRPC |
|--------|------|---------|------|
| **An toàn kiểu dữ liệu (Type Safety)** | Thủ công / OpenAPI | Tạo tự động từ Schema | End-to-end (TS) |
| **Lấy thừa dữ liệu (Over-fetching)** | Phổ biến | Tối thiểu hóa | Tối thiểu hóa |
| **Bộ nhớ đệm (Caching)** | Tuyệt vời (HTTP) | Phức tạp | Khó hơn |
| **Độ dốc học tập (Learning Curve)** | Thấp | Cao | Thấp (với lập trình viên TS) |
