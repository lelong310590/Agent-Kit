# @longlengoc90/ag-kit

Bộ công cụ CLI cục bộ để khởi tạo và cấu hình nhanh **AG Tool Kit** (`.agents/`), giúp tối ưu hóa tương tác giữa lập trình viên và các AI Agent (như Cursor, Windsurf, Antigravity IDE).

---

## ⚡ Hướng Dẫn Sử Dụng Nhanh

Bạn có thể chạy trực tiếp bằng `npx` mà không cần cài đặt trước trên hệ thống:

### Cách 1: Khởi tạo sao chép cục bộ (Standard Copy)
Sao chép toàn bộ thư mục cấu hình mẫu `.agents/` trực tiếp vào thư mục dự án hiện tại của bạn:
```bash
npx @longlengoc90/ag-kit init
```

### Cách 2: Liên kết dùng chung (Centralized Global Link)
Để dùng chung một bộ quy chuẩn cho tất cả các dự án mà không cần sao chép thư mục `.agents/` lặp đi lặp lại:
```bash
npx @longlengoc90/ag-kit init --link
```
*Lệnh này sẽ tự động tạo thư mục gốc tập trung tại `~/.ag-kit/.agents` và thiết lập một liên kết (symlink/junction) trỏ về `.agents` trong dự án hiện tại của bạn.*

---

## 📂 Cấu Trúc Bộ Tool Kit `.agents/` được sinh ra

Thư mục `.agents/` được sinh ra chứa cấu trúc chuẩn hóa sau:
```plaintext
.agents/
├── ARCHITECTURE.md          # Tài liệu mô tả kiến trúc bộ kit
├── agent/                  # Persona cấu hình các Tác nhân chuyên gia (Frontend, Backend, Security...)
├── skills/                  # Các module tri thức kỹ năng (NextJS, NestJS, Go...) tải có điều kiện
├── workflows/               # Kịch bản các lệnh slash tương tác (/plan, /debug, /verify...)
├── rules/                   # Quy chuẩn lập trình chung (Git workflow, error handling...)
├── memory/                  # Chỉ mục lưu trữ bộ nhớ dài hạn (Persistent Memory) cho dự án
└── scripts/                 # Kịch bản kiểm tra tự động (checklist.py, verify_all.py)
```

---

## ⚠️ Lưu ý Quan trọng về `.gitignore`

Nếu bạn đang sử dụng các trình soạn thảo mã nguồn tích hợp sẵn AI (như **Cursor** hoặc **Windsurf**), việc thêm thư mục `.agents/` vào file `.gitignore` sẽ khiến trình phân tích ngôn ngữ của trình soạn thảo không thể lập chỉ mục (index) các workflow. Điều này sẽ làm mất tính năng gợi ý tự động (autocomplete) cho các lệnh slash (ví dụ: `/plan`, `/debug`).

### Giải pháp tối ưu:
Để thư mục `.agents/` vừa không bị đẩy lên Git remote, vừa giữ nguyên khả năng hỗ trợ đắc lực từ AI editor:
1. Đảm bảo thư mục `.agents/` **KHÔNG** nằm trong file `.gitignore` của dự án.
2. Thay vào đó, hãy thêm `.agents/` vào file loại trừ cục bộ của Git: **`.git/info/exclude`**
   ```bash
   echo ".agents/" >> .git/info/exclude
   ```
