# AG Tool Kit (ag-tool-kit)

## English Version

Welcome to **AG Tool Kit**! This is an extended standard and structure kit designed to optimize interactions between developers and AI Agents (such as Cursor, Windsurf, Antigravity IDE).

This standard kit is organized into the `.agents/` structure located at the root directory of your programming projects.

---

### 📂 `.agents/` Structure

```plaintext
.agents/
├── ARCHITECTURE.md          # Document describing the architecture of the kit
├── agent/                  # Personas configuring expert Agents (Frontend, Backend, QA...)
├── skills/                  # Conditionally loaded technology skills (NextJS, NestJS, Go...)
├── workflows/               # Interactive slash command workflows (/plan, /debug, /refactor...)
├── rules/                   # Common coding rules/standards (Git workflow, error handling...)
├── memory/                  # Index storing long-term persistent memory for the project
└── scripts/                 # Automated validation scripts (checklist.py, verify_all.py)
```

---

### ⚡ Installation & CLI Usage Guide

#### 1. Quick Installation (Recommended)
You can initialize the tool kit in your project instantly using `npx` without cloning or building manually:
```bash
# Initialize a local copy with validation Git Hooks
npx @longlengoc90/ag-kit init

# Or link to the shared global directory ~/.ag-kit/.agents
npx @longlengoc90/ag-kit init --link

# Or initialize without installing Git Hooks
npx @longlengoc90/ag-kit init --no-hooks
```

#### 2. Local CLI Installation (Manual Build)
You can build and install the CLI globally on your machine from the source code:
```bash
# Navigate to the ag-tool-kit/cli directory
cd d:/work/ag-tool-kit/cli
npm run build
npm link
```

#### 3. Key Management Commands
Once installed (or via `npx`), navigate to your development project directory and use the following commands. Note that if you are using `npx`, prepend `npx @longlengoc90/ag-kit` instead of `longln-ag-kit`.

*   **Configuration Initialization (`init`):**
    ```bash
    # Initialize a local copy with validation Git Hooks
    longln-ag-kit init
    
    # Or link to the shared global directory ~/.ag-kit/.agents
    longln-ag-kit init --link
    
    # Or initialize without installing Git Hooks
    longln-ag-kit init --no-hooks
    ```
*   **Configuration Synchronization (`sync`):**
    Synchronize and update the latest Agents/Rules/Workflows from the original template (keeping the project's `memory/` folder intact):
    ```bash
    longln-ag-kit sync
    ```
*   **Configuration Health Check (`doctor`):**
    Check the symlink, Git Hooks, memory configuration, and automatically fix issues (such as missing Git hooks or Git exclude configurations):
    ```bash
    # Run a diagnostics scan
    longln-ag-kit doctor
    
    # Scan and automatically fix issues
    longln-ag-kit doctor --fix
    ```
*   **Install additional Expert Skills (`add-skill`):**
    Download a skill from local templates or fetch from remote repository:
    ```bash
    longln-ag-kit add-skill nextjs-react-expert
    ```
*   **List Available Skills (`list`):**
    Show all technology skills in the template pool and their installation status:
    ```bash
    longln-ag-kit list
    ```
*   **Create Components (`create`):**
    Generate a new standard structure for an Agent, Skill, or Workflow:
    ```bash
    longln-ag-kit create agent security-specialist
    longln-ag-kit create skill rust-expert
    longln-ag-kit create workflow load-test
    ```
*   **Memory Management (`memory`):**
    Manage, export, or import project learnings, conventions, or architecture decisions locally or globally:
    ```bash
    # Add learning locally
    longln-ag-kit memory add "Gotcha: Do not use inline styles in React native elements"
    
    # Add learning globally
    longln-ag-kit memory add "Architecture: Prefer PostgreSQL over MySQL" --global
    
    # Search memory fuzzy
    longln-ag-kit memory search "PostgreSQL"
    
    # Export memory to JSON (optionally include custom agents and skills)
    longln-ag-kit memory export [output-file.json] --include-agents --include-skills
    
    # Import and merge memory from JSON file (default merge lists, or use -o to overwrite)
    longln-ag-kit memory import <file-path.json>
    ```
*   **Workspace State Snapshots (`snapshot`):**
    Create, restore, or delete progress snapshots of your workspace (including `.agents/memory/`, `task.md`, `implementation_plan.md`, `walkthrough.md`):
    ```bash
    # Save a new snapshot of current progress with description
    longln-ag-kit snapshot save [name] --desc "Setup auth endpoints"
    
    # List all available snapshots
    longln-ag-kit snapshot list
    
    # Restore workspace from a snapshot (creates auto-backup first)
    longln-ag-kit snapshot restore <name>
    
    # Delete a snapshot
    longln-ag-kit snapshot delete <name>
    ```

---

### ⚠️ Important Note on `.gitignore`

If you are using AI-powered code editors (such as **Cursor** or **Windsurf**), adding the `.agents/` directory to your `.gitignore` file will prevent the editor's language analyzer from indexing the workflows. This will disable the autocomplete feature for slash commands (e.g., `/plan`, `/debug`).

#### Optimal Solution:
To prevent the `.agents/` directory from being pushed to the Git remote while preserving full support from the AI editor:
1. Ensure the `.agents/` directory is **NOT** in the project's `.gitignore` file.
2. Instead, add `.agents/` to Git's local exclude file: **`.git/info/exclude`**
   ```bash
   echo ".agents/" >> .git/info/exclude
   ```
   *(The CLI will automatically configure this for you when running `longln-ag-kit init` or `longln-ag-kit doctor --fix`)*

---
---

## Bản Tiếng Việt

Chào mừng bạn đến với **AG Tool Kit**! Đây là bộ quy chuẩn mở rộng và cấu trúc giúp tối ưu hóa tương tác giữa lập trình viên và AI Agent (như Cursor, Windsurf, Antigravity IDE).

Bộ quy chuẩn này được tổ chức thành cấu trúc `.agents/` nằm ở thư mục gốc của các dự án lập trình của bạn.

---

### 📂 Cấu Trúc Bộ Tool Kit `.agents/`

```plaintext
.agents/
├── ARCHITECTURE.md          # Tài liệu mô tả kiến trúc bộ kit
├── agent/                  # Persona cấu hình các Tác nhân chuyên gia (Frontend, Backend, QA...)
├── skills/                  # Các tri thức công nghệ (NextJS, NestJS, Go...) tải có điều kiện
├── workflows/               # Kịch bản lệnh slash tương tác (/plan, /debug, /refactor...)
├── rules/                   # Quy chuẩn lập trình chung (Git workflow, error handling...)
├── memory/                  # Chỉ mục lưu trữ bộ nhớ dài hạn (Persistent Memory) cho dự án
└── scripts/                 # Kịch bản kiểm tra tự động (checklist.py, verify_all.py)
```

---

### ⚡ Hướng Dẫn Cài Đặt & Sử Dụng CLI

#### 1. Cài đặt nhanh (Khuyến nghị)
Bạn có thể khởi tạo nhanh bộ công cụ trực tiếp trong dự án của mình bằng `npx` mà không cần clone hay build thủ công:
```bash
# Khởi tạo bản sao cục bộ có sẵn Git Hooks kiểm định
npx @longlengoc90/ag-kit init

# Hoặc liên kết dùng chung với thư mục global ~/.ag-kit/.agents
npx @longlengoc90/ag-kit init --link

# Hoặc khởi tạo không cài đặt Git Hooks
npx @longlengoc90/ag-kit init --no-hooks
```

#### 2. Cài đặt CLI cục bộ (Build thủ công)
Bạn có thể build và cài đặt CLI toàn cục trên máy của mình từ mã nguồn:
```bash
# Di chuyển đến thư mục chứa ag-tool-kit/cli
cd d:/work/ag-tool-kit/cli
npm run build
npm link
```

#### 3. Các lệnh quản lý chính
Sau khi cài đặt (hoặc sử dụng `npx`), di chuyển đến thư mục dự án phát triển của bạn và sử dụng các lệnh sau. *Lưu ý: Nếu dùng `npx`, hãy thay tiền tố `longln-ag-kit` bằng `npx @longlengoc90/ag-kit`.*

*   **Khởi tạo cấu hình (`init`):**
    ```bash
    # Khởi tạo bản sao cục bộ có sẵn Git Hooks kiểm định
    longln-ag-kit init
    
    # Hoặc liên kết dùng chung với thư mục global ~/.ag-kit/.agents
    longln-ag-kit init --link
    
    # Hoặc khởi tạo không cài đặt Git Hooks
    longln-ag-kit init --no-hooks
    ```
*   **Đồng bộ hóa cấu hình (`sync`):**
    Đồng bộ và cập nhật các Agent/Rules/Workflows mới nhất từ template gốc (bảo toàn nguyên vẹn thư mục `memory/` của dự án):
    ```bash
    longln-ag-kit sync
    ```
*   **Kiểm tra sức khỏe cấu hình (`doctor`):**
    Kiểm tra cấu hình symlink, Git Hooks, bộ nhớ và tự động sửa các lỗi (như thiếu Git hooks hay thiếu cấu hình Git exclude):
    ```bash
    # Quét kiểm tra
    longln-ag-kit doctor
    
    # Quét và tự động sửa lỗi
    longln-ag-kit doctor --fix
    ```
*   **Cài đặt thêm Kỹ năng chuyên môn (`add-skill`):**
    Tải kỹ năng từ local template hoặc tải từ kho GitHub trực tuyến:
    ```bash
    longln-ag-kit add-skill nextjs-react-expert
    ```
*   **Liệt kê kỹ năng mẫu (`list`):**
    ```bash
    longln-ag-kit list
    ```
*   **Tạo nhanh cấu phần (`create`):**
    ```bash
    longln-ag-kit create agent security-specialist
    longln-ag-kit create skill rust-expert
    longln-ag-kit create workflow load-test
    ```
*   **Quản lý bộ nhớ (`memory`):**
    Quản lý, xuất bản hoặc nhập các tri thức dự án, quy ước phát triển cục bộ hoặc toàn cục:
    ```bash
    # Thêm tri thức cục bộ
    longln-ag-kit memory add "Gotcha: Do not use inline styles in React native elements"
    
    # Thêm tri thức toàn cục
    longln-ag-kit memory add "Architecture: Prefer PostgreSQL over MySQL" --global
    
    # Tìm kiếm tri thức
    longln-ag-kit memory search "PostgreSQL"
    
    # Xuất dữ liệu bộ nhớ ra file JSON (tùy chọn đính kèm cả agents và kỹ năng)
    longln-ag-kit memory export [output-file.json] --include-agents --include-skills
    
    # Nhập và tự động gộp tri thức từ file JSON (mặc định gộp lists, dùng -o để ghi đè)
    longln-ag-kit memory import <file-path.json>
    ```
*   **Quản lý trạng thái không gian làm việc (`snapshot`):**
    Sao lưu và khôi phục tiến trình công việc (bao gồm thư mục bộ nhớ tri thức `.agents/memory/`, cùng các file tiến trình `task.md`, `implementation_plan.md`, `walkthrough.md` ở thư mục gốc):
    ```bash
    # Chụp ảnh (snapshot) tiến độ công việc hiện tại kèm mô tả
    longln-ag-kit snapshot save [name] --desc "Hoàn thành API Auth"
    
    # Liệt kê danh sách các bản snapshot hiện có
    longln-ag-kit snapshot list
    
    # Khôi phục trạng thái làm việc từ snapshot (tự động tạo bản backup an toàn trước)
    longln-ag-kit snapshot restore <name>
    
    # Xóa một bản snapshot
    longln-ag-kit snapshot delete <name>
    ```

---

### ⚠️ Lưu ý Quan trọng về `.gitignore`

Nếu bạn đang sử dụng các trình soạn thảo mã nguồn tích hợp sẵn AI (như **Cursor** hoặc **Windsurf**), việc thêm thư mục `.agents/` vào file `.gitignore` sẽ khiến trình phân tích ngôn ngữ của trình soạn thảo không thể lập chỉ mục (index) các workflow. Điều này sẽ làm mất tính năng gợi ý tự động (autocomplete) cho các lệnh slash (ví dụ: `/plan`, `/debug`).

#### Giải pháp tối ưu:
Để thư mục `.agents/` vừa không bị đẩy lên Git remote, vừa giữ nguyên khả năng hỗ trợ đắc lực từ AI editor:
1. Đảm bảo thư mục `.agents/` **KHÔNG** nằm trong file `.gitignore` của dự án.
2. Thay vào đó, hãy thêm `.agents/` vào file loại trừ cục bộ của Git: **`.git/info/exclude`**
   ```bash
   echo ".agents/" >> .git/info/exclude
   ```
   *(CLI sẽ tự động cấu hình điều này cho bạn khi chạy `longln-ag-kit init` hoặc `longln-ag-kit doctor --fix`)*
