---
name: memory-system
description: Quản lý bộ nhớ lưu trữ phiên chéo (cross-session). Cho phép các agent ghi nhớ tùy chọn của người dùng, quy ước dự án và các quyết định trước đó giữa các phiên làm việc khác nhau thông qua tệp chỉ mục MEMORY.md và các tệp chủ đề có cấu trúc.
when_to_use: "Khi người dùng nói 'hãy ghi nhớ điều này', 'lưu lại cái này để dùng sau', 'đừng quên', hoặc khi bắt đầu một phiên làm việc mới và cần gợi nhớ lại ngữ cảnh cũ. Đồng thời áp dụng khi quy trình /remember được kích hoạt."
allowed-tools: Read, Write, Grep, Glob
effort: low
---

# Hệ Thống Bộ Nhớ — Bộ Nhớ Phiên Chéo Lưu Trữ Lâu Dài

> Cho phép các agent ghi nhớ thông tin giữa các phiên làm việc. Không bao giờ phải tìm hiểu lại những gì đã biết.

## Tổng quan

Hệ thống Bộ nhớ cung cấp **bộ nhớ lưu trữ lâu dài và có thể tìm kiếm** tồn tại qua các phiên làm việc khác nhau. Thay vì phải giải thích lại các tùy chọn, quy ước và quyết định trước đó mỗi lần bắt đầu, agent chỉ cần đọc tệp chỉ mục `MEMORY.md` có cấu trúc và các tệp chủ đề (topic files).

**Ảnh hưởng Token:** +1.000 token để nạp chỉ mục, nhưng tiết kiệm được từ 3.000 - 10.000 token nhờ loại bỏ việc phải tìm hiểu lại thông tin từ đầu.

---

## Kiến Trúc

```
.agents/memory/
├── MEMORY.md              ← Chỉ mục dung lượng nhẹ (tối đa 200 dòng)
├── user-preferences.md    ← Tệp chủ đề: vai trò người dùng, phong cách, công cụ
├── project-conventions.md ← Tệp chủ đề: tiêu chuẩn lập trình, các mẫu thiết kế
├── tech-decisions.md      ← Tệp chủ đề: các quyết định kiến trúc trước đây
├── feedback-history.md    ← Tệp chủ đề: những gì người dùng thích/không thích
└── [topic-name].md        ← Các tệp chủ đề bổ sung khi cần thiết
```

---

## Định Dạng Chỉ Mục MEMORY.md

Tệp chỉ mục là một **tệp con trỏ dung lượng nhẹ** — bao gồm các mục ngắn tham chiếu đến các tệp chủ đề để biết thêm chi tiết.

**Quy tắc:**
- Tổng dung lượng tối đa **200 dòng**
- Mỗi mục: **tối đa khoảng 150 ký tự**
- Định dạng: `- [loại] tóm tắt → tệp-chủ-đề.md`
- Các loại (types): `[user]` `[feedback]` `[project]` `[reference]`

**Ví dụ:**
```markdown
# Chỉ Mục Bộ Nhớ (Memory Index)

## User
- [user] Thích chế độ dark mode, sử dụng Windows 11, PowerShell → user-preferences.md
- [user] Kỹ sư DevOps cấp cao, 8 năm kinh nghiệm → user-preferences.md
- [user] Ngôn ngữ chính: Tiếng Anh, thỉnh thoảng dùng Tiếng Thổ Nhĩ Kỳ → user-preferences.md

## Project
- [project] Luôn sử dụng bun thay vì npm → project-conventions.md
- [project] Ưu tiên sử dụng Tailwind v4, không dùng v3 → tech-decisions.md
- [project] Không sử dụng màu tím/violet trong giao diện (UI) → project-conventions.md

## Feedback
- [feedback] Người dùng thích câu trả lời ngắn gọn, không rườm rà → feedback-history.md
- [feedback] Người dùng không thích giải thích dài dòng → feedback-history.md
- [feedback] Người dùng thích bảng biểu hơn là danh sách gạch đầu dòng → feedback-history.md

## Reference
- [reference] Squid proxy chạy trên cổng 3128 → infrastructure-notes.md
- [reference] Quy trình Git: nhánh tính năng (feature) → main → project-conventions.md
```

---

## Định Dạng Tệp Chủ Đề (Topic File)

Mỗi tệp chủ đề chứa phần **frontmatter** và **nội dung có cấu trúc**:

```markdown
---
topic: [tên-chủ-đề]
last_updated: YYYY-MM-DD
---

# Tiêu Đề Chủ Đề

Các ghi chú chi tiết, cấu hình, tùy chọn hoặc quyết định liên quan đến chủ đề này. Sử dụng các danh sách gạch đầu dòng rõ ràng và khối mã nếu cần thiết.
```
