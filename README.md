# AG Tool Kit (ag-tool-kit)

Chào mừng bạn đến với **AG Tool Kit**! Đây là bộ quy chuẩn mở rộng và cấu trúc giúp tối ưu hóa tương tác giữa lập trình viên và AI Agent (như Cursor, Windsurf, Antigravity IDE).

Bộ quy chuẩn này được tổ chức thành cấu trúc `.agents/` nằm ở thư mục gốc của các dự án lập trình của bạn.

---

## 📂 Cấu Trúc Bộ Tool Kit `.agents/`

```plaintext
.agents/
├── ARCHITECTURE.md          # Tài liệu mô tả kiến trúc bộ kit
├── agent/                  # Persona cấu hình 20 Tác nhân chuyên gia (Frontend, Backend, Security...)
├── skills/                  # Các module tri thức kỹ năng (NextJS, API, Database...) tải có điều kiện
├── workflows/               # Kịch bản các lệnh slash tương tác (/plan, /debug, /verify...)
├── rules/                   # Quy chuẩn lập trình chung và riêng cho từng công nghệ
├── memory/                  # File MEMORY.md lưu trữ bộ nhớ dài hạn (persistent memory) cho dự án
└── scripts/                 # Kịch bản kiểm tra tự động (checklist.py, verify_all.py)
```

---

## ⚡ Hướng Dẫn Cài Đặt Nhanh

### Cách 1: Sử dụng công cụ CLI cục bộ (Khuyên dùng)
Bạn có thể cài đặt và khởi chạy CLI để tự động copy cấu trúc mẫu `.agents/` vào bất kỳ dự án mới nào:
```bash
# Di chuyển đến thư mục chứa ag-tool-kit
cd d:/work/ag-tool-kit/cli
npm run build
npm link

# Di chuyển đến dự án mới của bạn và khởi tạo
cd path/to/your/new-project
longln-ag-kit init
```

### Cách 2: Symlink Toàn Cục (Global Shared Setup)
Để dùng chung một bộ quy chuẩn cho tất cả các dự án mà không cần sao chép thư mục `.agents/` lặp đi lặp lại:

1. **Khởi tạo thư mục gốc tập trung** (ví dụ: tạo tại `~/.ag-kit`):
   ```bash
   mkdir -p ~/.ag-kit && cd ~/.ag-kit
   # Sao chép thư mục .agents từ ag-tool-kit vào đây
   ```

2. **Tạo Symlink cục bộ** từ thư mục gốc của dự án bạn đang làm việc:
   *   **Windows (PowerShell - Chạy với quyền Administrator)**:
       ```powershell
       New-Item -ItemType SymbolicLink -Path ".agents" -Target "$env:USERPROFILE\.ag-kit\.agents"
       ```
   *   **macOS / Linux**:
       ```bash
       ln -s ~/.ag-kit/.agents .agents
       ```

---

## ⚠️ Lưu ý Quan trọng về `.gitignore`

Nếu bạn đang sử dụng các trình soạn thảo mã nguồn tích hợp sẵn AI (như **Cursor** hoặc **Windsurf**), việc thêm thư mục `.agents/` vào file `.gitignore` sẽ khiến trình phân tích ngôn ngữ của trình soạn thảo không thể lập chỉ mục (index) các workflow. Điều này sẽ làm mất tính năng gợi ý tự động (autocomplete) cho các lệnh slash (ví dụ: `/plan`, `/debug`).

### Giải pháp tối ưu:
Để thư mục `.agents/` vừa không bị đẩy lên Git remote, vừa giữ nguyên khả năng hỗ trợ đắc lực từ AI editor:
1. Đảm bảo thư mục `.agents/` **KHÔNG** nằm trong file `.gitignore` của dự án.
2. Thay vào đó, hãy thêm `.agents/` vào file loại trừ cục bộ của Git: **`.git/info/exclude`**
