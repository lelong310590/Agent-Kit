---
name: context-compression
description: Quản lý và nén ngữ cảnh hội thoại trong các phiên làm việc dài. Phát hiện khi ngữ cảnh phình to, tóm tắt các giai đoạn công việc đã hoàn thành, lưu trữ các phát hiện cũ trong khi vẫn bảo toàn các quyết định quan trọng. Giúp ngăn chặn sự suy giảm ngữ cảnh.
when_to_use: "Khi một phiên làm việc có hơn 20 lượt tương tác, khi ngữ cảnh có cảm giác bị lặp lại, khi agent mất dấu các công việc trước đó, hoặc khi người dùng yêu cầu 'tóm tắt những gì chúng ta đã làm'. KHÔNG dùng cho các phiên làm việc ngắn."
allowed-tools: Read, Write, Grep
effort: low
---

# Nén Ngữ Cảnh — Quản Lý Phiên Làm Việc Dài

> Giữ cho các phiên làm việc luôn hiệu quả bằng cách nén các phần công việc đã hoàn thành nhưng vẫn bảo toàn các quyết định quan trọng.

## Tổng quan

Các phiên làm việc dài (hơn 30 lượt tương tác) sẽ gây ra sự suy giảm ngữ cảnh — AI bị mất dấu các công việc trước đó, lặp lại chính mình hoặc quên đi các quyết định. Nén ngữ cảnh sẽ chủ động tóm tắt các giai đoạn đã hoàn thành để cửa sổ ngữ cảnh luôn tập trung vào công việc hiện tại.

**Ảnh hưởng Token:** Thu hồi từ 5.000 - 15.000 token trong các phiên làm việc dài bằng cách thay thế các đầu ra công cụ dài dòng bằng các bản tóm tắt ngữ nghĩa.

---

## Khi Nào Cần Nén

| Tín hiệu | Hành động |
|---|---|
| Phiên làm việc có hơn 20 lượt tương tác | Cân nhắc chủ động nén |
| Agent lặp lại các gợi ý trước đó | Ngữ cảnh đã bão hòa — nén ngay lập tức |
| Người dùng nói "chúng ta đã thảo luận vấn đề này rồi" | Nén ngay lập tức |
| Chuyển sang một giai đoạn công việc mới | Nén giai đoạn công việc đã hoàn thành |
| Đầu ra công cụ lớn (hơn 500 dòng) | Vi-nén (micro-compact) đầu ra đó |

---

## Các Cấp Độ Nén

### Cấp độ 1: Vi-Nén (Micro-Compact - Đầu Ra Công Cụ)

Nén các đầu ra công cụ riêng lẻ trong khi vẫn giữ lại nội dung ngữ nghĩa:

```
❌ Trước (đầu ra grep thô — 200 dòng, ~4.000 tokens):
src/auth/jwt.ts:15: import { verify } from 'jsonwebtoken'
src/auth/jwt.ts:23: export function validateToken(token: string) {
src/auth/jwt.ts:24:   try {
src/auth/jwt.ts:25:     const decoded = verify(token, SECRET)
... (195 dòng khác)

✅ Sau (vi-nén — 5 dòng, ~100 tokens):
Kết quả grep cho "jwt": Tìm thấy 8 file, 42 kết quả trùng khớp.
Các file quan trọng: src/auth/jwt.ts (logic JWT chính), src/middleware/auth.ts (middleware),
src/api/login.ts (tạo token). Xác thực token tại jwt.ts:23-40.
Xử lý lỗi tại jwt.ts:42-55. Secret được nạp từ env tại jwt.ts:8.
```

### Cấp độ 2: Tóm Tắt Giai Đoạn (Phase Summary)

Thay thế một giai đoạn công việc đã hoàn thành bằng một bản tóm tắt:

```
❌ Trước (toàn bộ lịch sử nghiên cứu — ~3.000 tokens):
[logs dài dòng, nhiều lần thử thất bại, thảo luận dài về việc lựa chọn framework...]

✅ Sau (tóm tắt giai đoạn — ~150 tokens):
Giai đoạn 1: Đã hoàn thành việc lựa chọn công nghệ. Quyết định sử dụng Laravel Filament thay vì các Livewire component tự dựng cho trang quản trị vì có sẵn trình dựng bảng (table builder). Các package chính đã cài đặt: filament/filament v3.2.
```

### Cấp độ 3: Tích Hợp Bộ Nhớ (Lưu Trữ - Memory Integration)

Lưu trữ các bài học kinh nghiệm, quyết định hoặc cài đặt quan trọng vào hệ thống bộ nhớ:
- Xác định các quy ước khả thi và ghi chúng vào [.agents/memory/project-conventions.md](file:///d:/work/ag-tool-kit/.agents/memory/project-conventions.md).
- Xác định các lựa chọn kiến trúc chính và ghi chúng vào [.agents/memory/architectural-decisions.md](file:///d:/work/ag-tool-kit/.agents/memory/architectural-decisions.md).
- Xóa ngữ cảnh cuộc hội thoại dài hiện tại bằng cách bắt đầu một phiên làm việc mới sau khi bộ nhớ được tích hợp thành công.
```
