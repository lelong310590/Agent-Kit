---
name: api-patterns
description: Các nguyên lý thiết kế API và ra quyết định. Lựa chọn giữa REST vs GraphQL vs tRPC, định dạng phản hồi, quản lý phiên bản và phân trang.
when_to_use: "Khi thiết kế API REST/GraphQL/tRPC, định nghĩa định dạng phản hồi, quản lý phiên bản, phân trang hoặc xác thực API. KHÔNG dùng cho công việc UI/frontend."
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Các Mẫu Thiết Kế API (API Patterns)

> Các nguyên lý thiết kế API và ra quyết định.
> **Hãy học cách TƯ DUY, không sao chép máy móc các khuôn mẫu có sẵn.**

## 🎯 Quy Tắc Đọc Có Chọn Lọc

**Chỉ đọc các file liên quan đến yêu cầu!** Hãy kiểm tra sơ đồ nội dung và tìm những gì bạn cần.

---

## 📑 Sơ Đồ Nội Dung

| File | Mô tả | Khi nào cần đọc |
|------|-------------|--------------|
| `api-style.md` | Sơ đồ quyết định giữa REST vs GraphQL vs tRPC | Khi lựa chọn loại API |
| `rest.md` | Đặt tên tài nguyên, phương thức HTTP, mã trạng thái | Khi thiết kế REST API |
| `response.md` | Mô hình bao bọc (envelope pattern), định dạng lỗi, phân trang | Cấu trúc phản hồi API |
| `graphql.md` | Thiết kế schema, khi nào nên dùng, bảo mật | Khi cân nhắc sử dụng GraphQL |
| `trpc.md` | TypeScript monorepo, an toàn kiểu dữ liệu (type safety) | Dự án fullstack TypeScript |
| `versioning.md` | Quản lý phiên bản qua URI/Header/Query | Lập kế hoạch phát triển API |
| `auth.md` | JWT, OAuth, Passkey, API Keys | Lựa chọn cơ chế xác thực |
| `rate-limiting.md` | Token bucket, sliding window | Triển khai bảo vệ API |
