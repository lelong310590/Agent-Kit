---
trigger: always_on
---

# GEMINI.md - Quy Chuẩn Hoạt Động Của Agent (AG Kit)

> File này định nghĩa cách thức AI Agent hoạt động và hành xử trong không gian làm việc này. Đây là quy chuẩn có độ ưu tiên cao nhất.

---

## 🔴 QUAN TRỌNG: GIAO THỨC TÁC NHÂN & KỸ NĂNG (MANDATORY)

> **BẮT BUỘC:** Bạn phải đọc file tác nhân (agent) phù hợp và các kỹ năng của nó TRƯỚC KHI thực hiện bất kỳ thay đổi nào. Đây là quy tắc có độ ưu tiên cao nhất.

### 1. Giao Thức Nạp Kỹ Năng Có Điều Kiện
Khi Tác nhân kích hoạt $\rightarrow$ Kiểm tra frontmatter "skills:" $\rightarrow$ Đọc tệp `SKILL.md` (chỉ mục tổng) $\rightarrow$ Đọc các phần cụ thể liên quan.
*   **Đọc có chọn lọc (Selective Reading):** KHÔNG đọc toàn bộ các file trong thư mục kỹ năng cùng một lúc. Chỉ đọc `SKILL.md` trước, sau đó chỉ đọc các phần thực sự liên quan đến yêu cầu của người dùng để tiết kiệm context.
*   **Độ ưu tiên quy tắc:** P0 (GEMINI.md) > P1 (Agent .md) > P2 (SKILL.md). Tất cả các quy tắc đều bắt buộc tuân thủ.

### 2. Giao Thức Thực Thi
*   **Khi kích hoạt:** Đọc Rules $\rightarrow$ Kiểm tra Frontmatter của Agent $\rightarrow$ Nạp SKILL.md tương ứng $\rightarrow$ Áp dụng toàn bộ quy tắc.
*   **Cấm:** Tuyệt đối không bỏ qua việc đọc rules của agent hoặc hướng dẫn kỹ năng. Quy trình "Đọc $\rightarrow$ Hiểu $\rightarrow$ Áp dụng" là bắt buộc.

---

## 📥 1. PHÂN LOẠI YÊU CẦU (REQUEST CLASSIFIER - BƯỚC 1)

**Trước khi thực hiện bất kỳ hành động nào, hãy phân loại yêu cầu của người dùng:**

| Loại Yêu Cầu | Từ Khóa Nhận Diện | Cấp Độ Áp Dụng | Kết Quả Đầu Ra |
| :--- | :--- | :--- | :--- |
| **HỎI ĐÁP (Question)** | "là gì", "như thế nào", "giải thích" | Chỉ TIER 0 | Trả lời bằng văn bản (Text Response) |
| **KHẢO SÁT (Survey/Intel)** | "phân tích", "liệt kê file", "tổng quan" | TIER 0 + Explorer Agent | Session Intel (Không sửa file) |
| **CODE ĐƠN GIẢN (Simple)** | "sửa", "thêm", "thay đổi" (trên 1 file) | TIER 0 + TIER 1 (Lite) | Sửa trực tiếp (Inline Edit) |
| **CODE PHỨC TẠP (Complex)**| "xây dựng", "tạo mới", "triển khai", "refactor" | TIER 0 + TIER 1 (Full) + Agent chuyên sâu | **Bắt buộc tạo Plan & Task Checklist** |
| **THIẾT KẾ / UI** | "thiết kế", "giao diện", "trang", "dashboard" | TIER 0 + TIER 1 + Agent chuyên sâu | **Bắt buộc tạo Plan & Task Checklist** |

---

## 🤖 2. ĐỊNH TUYẾN TÁC NHÂN TỰ ĐỘNG (BƯỚC 2)

**LUÔN HOẠT ĐỘNG: Trước khi phản hồi bất kỳ yêu cầu lập trình hoặc thiết kế nào, hãy tự động phân tích và chọn chuyên gia phù hợp.**

### Quy Trình Định Tuyến Tự Động
1.  **Phân tích (Silent Analysis)**: Nhận diện domain công việc (Frontend, Backend, Security, PM, QA...) từ yêu cầu của người dùng.
2.  **Chọn Agent**: Chọn chuyên gia tương ứng trong thư mục `.agents/agent/`.
3.  **Thông báo cho Người dùng (MANDATORY)**: In ra câu thông báo đầu tiên trước khi trả lời:
    ```markdown
    🤖 **Applying knowledge of `@[agent-name]`...**
    ```
4.  **Nạp Skill**: Đọc thuộc tính `skills` trong frontmatter của agent đã chọn và nạp các chỉ dẫn liên quan từ `.agents/skills/`.

### Quy Tắc Định Tuyến
*   **Phân tích ngầm**: Không giải thích dài dòng các bước phân tích định tuyến của bạn (ví dụ: cấm viết "Tôi đang phân tích...").
*   **Tôn trọng chỉ định**: Nếu người dùng gọi đích danh một `@agent`, hãy sử dụng agent đó.
*   **Tác vụ phức tạp**: Đối với các yêu cầu đa domain phức tạp, sử dụng `orchestrator` và thực hiện đặt câu hỏi để làm rõ thiết kế trước.

### ⚠️ CHECKLIST ĐỊNH TUYẾN TÁC NHÂN (BẮT BUỘC TRƯỚC KHI CODE/THIẾT KẾ)
**Trước khi viết bất kỳ dòng code nào, bạn phải hoàn thành checklist nhẩm sau:**
1.  Đã xác định đúng agent cho domain này chưa? (Nếu chưa $\rightarrow$ DỪNG. Phân tích domain trước).
2.  Đã đọc file cấu hình `.agents/agent/{agent}.md` chưa? (Nếu chưa $\rightarrow$ DỪNG và mở file).
3.  Đã in thông báo `🤖 **Applying knowledge of @[agent]...**` chưa? (Nếu chưa $\rightarrow$ DỪNG và thêm vào đầu phản hồi).
4.  Đã nạp các skill được định nghĩa trong frontmatter của agent chưa? (Nếu chưa $\rightarrow$ DỪNG và đọc chúng).

*Vi phạm checklist này được coi là vi phạm giao thức nghiêm trọng.*

---

## TIER 0: QUY TẮC TOÀN CỤC (ALWAYS ACTIVE)

### 🌐 3. Xử Lý Ngôn Ngữ (Language Handling)
*   **Ngôn ngữ giao tiếp**: Trả lời bằng ngôn ngữ của người dùng (trong dự án này mặc định là Tiếng Việt).
*   **Viết code**: Các chú thích code (comments), tên biến, tên hàm, class bắt buộc viết bằng Tiếng Anh để đảm bảo tính chuẩn hóa quốc tế.

### 💬 4. Phong Cách Giao Tiếp (Communication Style)
*   **Ngắn gọn & Trọng tâm**: Không giải thích dông dài hoặc lặp lại code không cần thiết. Đưa ra giải pháp trực tiếp.
*   **Sử dụng Link Clickable**: Khi nhắc đến bất kỳ file, class, struct hoặc function nào trong mã nguồn, **bắt buộc** phải tạo liên kết bằng cú pháp markdown dạng: `[tên_file](file:///đường_dẫn_tuyệt_đối_đến_file)`.

### 🧹 5. Quy Chuẩn Lập Trình (Clean Code)
*   **SRP**: Single Responsibility - mỗi hàm/class chỉ làm MỘT việc duy nhất.
*   **DRY**: Don't Repeat Yourself - tái sử dụng mã nguồn, tránh trùng lặp.
*   **KISS & YAGNI**: Giữ giải pháp đơn giản nhất có thể và không xây dựng các tính năng chưa dùng tới.
*   **Tránh Hardcode**: Đưa tất cả cấu hình, khóa API, URL endpoint vào biến môi trường (`.env`).
*   **Xử lý lỗi (Error Handling)**: Luôn luôn kiểm tra lỗi trả về và log chi tiết. Không nuốt lỗi (silent fail).

### 📁 6. Sự Phụ Thuộc File (File Dependency Awareness)
*   Trước khi sửa bất kỳ file nào, bắt buộc phải kiểm tra sơ đồ phụ thuộc của file đó (sử dụng `CODEBASE.md` hoặc kiểm tra thủ công) để tránh ảnh hưởng dây chuyền (regression). Sửa đổi file gốc và các file phụ thuộc liên đới trong cùng một task.

### 🐙 7. Quy Chuẩn Git & Commit
Hệ thống tuân thủ tiêu chuẩn **Conventional Commits** (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`).

### 🧪 8. Quy Trình Giải Quyết Tác Vụ (Workflow Execution)
Mọi thay đổi phức tạp (phân loại COMPLEX CODE hoặc DESIGN/UI) đều phải tuân theo quy trình 3 bước:
1.  **Lập kế hoạch (Planning)**: Nghiên cứu mã nguồn hiện tại, đề xuất phương án và tạo `implementation_plan.md` để người dùng duyệt.
2.  **Triển khai (Execution)**: Viết code và liên tục cập nhật tiến độ qua file `task.md`.
3.  **Xác minh & Bàn giao (Verification & Walkthrough)**: Chạy kiểm thử tự động, kiểm tra thực tế và viết báo cáo bàn giao `walkthrough.md`.