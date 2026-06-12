---
name: code-review-graph
description: Đánh giá mã nguồn tối ưu hóa token bằng sơ đồ cây AST Tree-sitter và MCP. Giảm mức tiêu thụ token của AI trên các codebase lớn bằng cách tính toán vùng ảnh hưởng (blast radius) của các thay đổi thay vì đọc toàn bộ codebase. Sử dụng cơ sở dữ liệu đồ thị SQLite để phân tích cấu trúc.
when_to_use: "Khi đánh giá mã nguồn trong các codebase lớn (trên 500 file), khi chi phí token cao, khi thực hiện các thay đổi trên nhiều file có phụ thuộc chéo giữa các module hoặc trong các monorepo. Đồng thời dùng để phát hiện code chết (dead code), trực quan hóa kiến trúc và xem trước kết quả refactor. KHÔNG dùng cho các dự án nhỏ dưới 200 file với các thay đổi đơn lẻ và cô lập."
allowed-tools: Read, Grep, Glob, Bash
effort: medium
---

# Bản Đồ Đánh Giá Mã Nguồn (Code Review Graph) — Tối Ưu Hóa Ngữ Cảnh Qua MCP

> Giảm đáng kể lượng token tiêu thụ trên các codebase lớn bằng cách cung cấp cho AI một bản đồ cấu trúc thay vì bắt nó đọc toàn bộ mã nguồn. Lợi ích tỷ lệ thuận với quy mô dự án.

## Tổng quan

`code-review-graph` là một máy chủ MCP sử dụng **Tree-sitter** để phân tích cú pháp tĩnh codebase của bạn thành một sơ đồ đồ thị AST và lưu trữ trong **SQLite**. Khi trợ lý AI cần ngữ cảnh để thực hiện tác vụ, nó sẽ truy vấn đồ thị trước để chỉ lấy ra các file nằm trong **vùng ảnh hưởng (blast radius)** của thay đổi, thay vì đọc mọi file trong thư mục.

**Ảnh hưởng Token (minh họa - thay đổi tùy theo codebase):**

| Loại Codebase | Đặc điểm |
|---------------|---------|
| Monorepo lớn (10K+ file) | Tiết kiệm lớn nhất — đồ thị chỉ đọc một phần nhỏ các file liên quan |
| Dự án quy mô trung bình (1K-5K file) | Giảm thiểu đáng kể token trên các thay đổi đa file |
| Dự án nhỏ (<200 file) | Ít lợi ích — chi phí quản lý đồ thị có thể vượt quá lượng token tiết kiệm |

> **Về chất lượng:** Việc giới hạn phạm vi của AI trong vùng ảnh hưởng giúp giảm nhiễu thông tin, từ đó nâng cao độ tập trung và chất lượng đánh giá mã nguồn. Hãy đo lường thực tế trên kho mã nguồn của bạn thay vì dựa vào các hệ số cố định.

---

## Giao Thức Khởi Tạo (Bootstrap Protocol - Opt-in)

Khi được kích hoạt trong quy trình lập kế hoạch `/plan` hoặc sử dụng thông thường trên một dự án quy mô trung bình đến lớn, hãy kiểm tra xem phân tích đồ thị có khả dụng hay không trước khi phụ thuộc vào nó:
1. **Bước 1:** Kiểm tra xem công cụ đã được cài đặt chưa: chạy `Get-Command code-review-graph` (trên Windows) hoặc `which code-review-graph` (trên macOS/Linux).
2. **Bước 2:** Kiểm tra xem thư mục cấu hình `.code-review-graph/` có tồn tại trong không gian làm việc hay không.
3. **Bước 3:** Nếu công cụ đã được cài đặt nhưng chưa có cơ sở dữ liệu chỉ mục, hãy hỏi ý kiến người dùng trước khi chạy lệnh `code-review-graph build` (quá trình này sẽ quét toàn bộ dự án).
4. **Bước 4:** Nếu chưa cài đặt và dự án có quy mô lớn, hãy hỏi người dùng: *"Bạn có muốn cài đặt `code-review-graph` (qua pip) và xây dựng bản đồ cục bộ để tiết kiệm token cho dự án này không?"*. Tuyệt đối không tự ý cài đặt hoặc chạy lệnh build mà không có sự xác nhận của người dùng.

---

## Khi Nào Nên Dùng vs Khi Nào Nên Bỏ Qua

### ✅ Nên cài đặt nếu:
- Codebase có từ **500+ file** trở lên.
- Bạn thường xuyên thực hiện **thay đổi trên nhiều file** có quan hệ phụ thuộc chéo giữa các module.
- Bạn chi tiêu nhiều chi phí token cho trợ lý AI hàng tháng.
- Bạn làm việc với **monorepos**, microservices, hoặc các dự án TypeScript đa package.
- Bạn muốn **nâng cao chất lượng đánh giá mã nguồn** bên cạnh việc tiết kiệm chi phí.

### ❌ Bỏ qua nếu:
- Codebase có **dưới ~200 file** và các thay đổi chỉ mang tính cô lập trên từng file đơn lẻ.
- Sử dụng nhiều **cú pháp động** (dynamic patterns như reflection, sinh code runtime, dynamic imports) khiến phân tích tĩnh không hiệu quả.
- Bạn muốn hệ thống **không cần bảo trì** — vì đồ thị cần được đồng bộ định kỳ khi code thay đổi.

### ⚠️ Cần đánh giá kỹ nếu:
- Codebase có quy mô từ **200–500 file** — hãy chạy đo lường thử nghiệm trước khi quyết định áp dụng lâu dài.
- Có sự kết hợp giữa **cú pháp tĩnh và cú pháp động** — hãy thử nghiệm trên các commit đại diện để đánh giá độ chính xác.

---

## Cách Thức Hoạt Động (4 Tầng)

```
Tầng 1: PHÂN TÍCH (PARSE)  ──> Tree-sitter dựng cây AST từ 19 ngôn ngữ hỗ trợ
Tầng 2: LƯU TRỮ (STORE)   ──> Các nút (nodes) + cạnh (edges) được lưu vào đồ thị SQLite
Tầng 3: DÒ VẾT (TRACE)    ──> Thuật toán BFS tính toán vùng ảnh hưởng (blast radius)
Tầng 4: CUNG CẤP (SERVE)  ──> Giao thức MCP cung cấp dữ liệu đồ thị cho trợ lý AI
```

### Đồ thị chứa những thông tin gì?
- **Các Nút (Nodes):** File, hàm (functions), phương thức (methods), lớp (classes), lệnh import, các file kiểm thử (tests).
- **Các Cạnh (Edges):** Mô tả quan hệ như "A gọi B", "X import Y", "Test Z kiểm thử cho Hàm W", "Lớp A kế thừa Lớp B".
- **Siêu dữ liệu (Metadata):** Tên, kiểu dữ liệu, đường dẫn file, phạm vi dòng code của từng nút.
- **Tính riêng tư (Privacy):** Chỉ lưu trữ siêu dữ liệu cấu trúc — **KHÔNG** lưu nội dung mã nguồn thực tế trong đồ thị.

### Danh sách 19 ngôn ngữ được hỗ trợ
Python, TypeScript, JavaScript, Go, Rust, Java, C#, Ruby, Kotlin, Swift, PHP, C/C++, Vue SFC, Solidity, Dart, R, Perl, Lua, Jupyter/Databricks notebooks.

---

## Cài đặt & Cấu hình

### Yêu cầu hệ thống
- Python 3.9+ (`python3 --version`)
- Đã cài đặt `pip` hoặc `pipx`
- Trình khách AI hỗ trợ MCP (AG Kit, Claude Code, Cursor, Windsurf, Zed)
- Codebase được quản lý bằng Git (để hỗ trợ cập nhật gia tăng - incremental updates)

### Bước 1: Cài đặt Gói phần mềm
```bash
# Khuyến nghị: Cài đặt trong môi trường cô lập bằng pipx
pipx install code-review-graph

# Cách khác: Cài đặt và chạy nhanh bằng uv (không cài vĩnh viễn)
uvx code-review-graph install

# Cách khác: Cài đặt toàn cục qua pip
pip install code-review-graph
```

### Bước 2: Cấu hình MCP Client
Cấu hình máy chủ MCP bằng cách chạy lệnh tự động phát hiện và đăng ký vào client:
```bash
# Tự động phát hiện và cấu hình cho các công cụ được hỗ trợ trên hệ thống
code-review-graph install

# Hoặc chỉ định cụ thể cho một nền tảng client
code-review-graph install --platform cursor
code-review-graph install --platform claude
code-review-graph install --platform zed
```

Nếu cấu hình thủ công, bạn thêm cấu hình sau vào file cấu hình MCP của client (ví dụ `mcp.json` hoặc `cursor-settings.json`):
```json
{
  "mcpServers": {
    "code-review-graph": {
      "command": "code-review-graph",
      "args": ["run"]
    }
  }
}
```

---

## Hướng dẫn Sử Dụng & Vận Hành

### 1. Khởi tạo đồ thị lần đầu
Di chuyển vào thư mục dự án và chạy lệnh sau để quét và dựng đồ thị:
```bash
code-review-graph build
```
Lệnh này sẽ tạo ra thư mục `.code-review-graph/` chứa file cơ sở dữ liệu `graph.db` cục bộ.

### 2. Cập nhật đồ thị khi code thay đổi
Đồ thị hỗ trợ cập nhật gia tăng siêu nhanh bằng cách chỉ phân tích các file có thay đổi so với Git:
```bash
code-review-graph update
```
*Khuyến nghị:* Thêm lệnh này vào Git hook `post-commit` của dự án để đồ thị luôn được đồng bộ tự động.

### 3. Các Công Cụ MCP được cung cấp cho AI
Sau khi cài đặt thành công, máy chủ MCP sẽ cung cấp cho trợ lý AI các công cụ sau:
*   `get_blast_radius(files: string[])`: Tính toán và trả về danh sách các file/hàm liên đới bị ảnh hưởng trực tiếp và gián tiếp bởi danh sách file đầu vào.
*   `find_dependents(file: string)`: Tìm các file đang import hoặc phụ thuộc vào file hiện tại.
*   `get_call_graph(function_name: string)`: Trả về cây gọi hàm (call graph) của hàm được chỉ định.
*   `show_architecture_summary()`: Trực quan hóa cấu trúc thư mục và các mối quan hệ module chính trong hệ thống.
