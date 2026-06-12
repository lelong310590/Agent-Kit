---
name: performance-profiling
description: Hướng dẫn phân tích hiệu năng và đo lường hệ thống. Cách sử dụng các công cụ profiling, đo lường Core Web Vitals, chẩn đoán CPU và bộ nhớ.
when_to_use: "Khi cần đo lường, phân tích hiệu năng, benchmark, tìm nguyên nhân gây chậm CPU/RAM hoặc tối ưu hóa Core Web Vitals."
allowed-tools: Read, Write, Grep
---

# Kỹ Năng: Phân Tích Hiệu Năng (Performance Profiling)

> Hướng dẫn đo lường và phân tích hiệu năng trước khi tối ưu hóa.

## 🛠️ Công Cụ Đo Lường Khuyên Dùng

1.  **Lighthouse / PageSpeed Insights**: Đo lường Core Web Vitals và đề xuất tối ưu hóa tổng quan cho ứng dụng web.
2.  **Chrome DevTools (Performance Tab)**:
    *   Sử dụng để ghi lại quá trình tương tác và tìm các "Long Tasks" (> 50ms) chặn luồng chính.
    *   Kiểm tra Layout Shifts để xác định nguyên nhân gây tăng CLS.
3.  **Chrome DevTools (Memory Tab)**:
    *   Chụp **Heap Snapshot** để so sánh mức độ sử dụng bộ nhớ trước và sau một hành động nhằm tìm kiếm rò rỉ bộ nhớ (memory leaks).
4.  **Laravel Debugbar / Telescope / Clockwork**:
    *   Kiểm tra số lượng truy vấn SQL, thời gian thực thi của controller và việc sử dụng bộ nhớ RAM ở phía Backend.

## 📈 Quy Trình Đo Lường 3 Bước

### Bước 1: Thiết Lập Baseline (Mốc So Sánh)
*   Chạy đo lường ở môi trường production-like hoặc build local ở chế độ production (đối với frontend).
*   Ghi nhận các số liệu hiện tại (ví dụ: LCP = 4.2s, INP = 350ms).

### Bước 2: Thực Hiện Thay Đổi & Kiểm Tra Lại
*   Áp dụng thay đổi tối ưu hóa cho vấn đề lớn nhất.
*   Chạy lại đo lường với cùng một điều kiện test (cùng cấu hình mạng, cùng thiết bị giả lập).

### Bước 3: So Sánh Đối Chiếu
*   Chỉ xác nhận tối ưu hóa thành công khi các số liệu thực tế được cải thiện rõ rệt mà không gây ra lỗi hồi quy (regression).
