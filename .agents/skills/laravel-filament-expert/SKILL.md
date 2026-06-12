---
name: laravel-filament-expert
description: Chuyên gia phát triển ứng dụng web PHP sử dụng Filament Admin Panel & Form/Table Builder cho Laravel. Định hình thiết kế Resources, Forms, Tables, Relation Managers, Widgets và tối ưu hóa hiệu năng Livewire.
when_to_use: "Dự án phát hiện có file composer.json chứa 'filament/' hoặc các file PHP định nghĩa Filament Resources, Pages, Widgets."
---

# Kỹ Năng: Laravel Filament Expert

Chỉ dẫn chuyên sâu này được tự động nạp khi phát hiện dự án sử dụng Laravel Filament Framework (TALL Stack - Tailwind CSS, Alpine.js, Laravel, Livewire).

---

## 🏗️ 1. Cấu Trúc Filament Resource & Pages

*   **Tạo Resource**: Luôn sử dụng lệnh Artisan chuẩn để sinh Resource:
    ```bash
    php artisan make:filament-resource Product --generate
    ```
    *(Tùy chọn `--generate` giúp tự động đọc database schema để gen form/table cơ bản).*
*   **Tổ Chức Thư Mục**: Đảm bảo các Page con (`CreateProduct`, `EditProduct`, `ListProducts`, `ViewProduct`) được tổ chức gọn gàng trong thư mục `Pages` của Resource.
*   **Clusters**: Đối với các dự án lớn, sử dụng **Clusters** để nhóm các Resources liên quan lại với nhau trên thanh điều hướng, giúp UI không bị quá tải.

---

## 📝 2. Form Builder (Thiết Kế Form)

*   **Tổ Chức Bố Cục (Layout)**:
    *   Không để tất cả các field trên một cột dọc dài. Sử dụng `Grid`, `Section`, `Tabs` hoặc `Card` để nhóm các thông tin liên quan (ví dụ: Thông tin chung, Giá cả, Media).
    *   Sử dụng section phụ (sidebar layout) cho các thông tin trạng thái hoặc siêu dữ liệu bằng cách sử dụng `Grid::make(['default' => 1, 'lg' => 3])` kết hợp với `Group` để chia tỉ lệ cột 2:1.
*   **Tối Ưu Hóa Select Field (Hiệu Năng)**:
    *   Với các bảng liên kết lớn (như User, Product có hàng ngàn bản ghi), **bắt buộc** phải sử dụng `searchable()` kết hợp với `preload(false)` để tránh overload bộ nhớ server khi load trang.
    *   Sử dụng `getOptionLabelFromRecordUsing()` hoặc `getSearchResultsUsing()` để tùy chỉnh câu truy vấn tìm kiếm một cách tối ưu.
*   **Reactive & Dynamic Fields**:
    *   Sử dụng `reactive()` và `afterStateUpdated()` để thay đổi động giá trị của các field khác dựa trên field hiện tại (ví dụ: tự động điền Slug từ Title).
    *   Sử dụng `debounce()` hoặc `lazy()` trên các trường text input trigger reactive để tránh gửi quá nhiều request Livewire khi người dùng đang gõ.
*   **Validation**:
    *   Định nghĩa validation trực tiếp trên các component (`required()`, `maxLength()`, `unique()`, `numeric()`).
    *   Sử dụng `validationAttribute()` để Việt hóa tên thuộc tính hiển thị trong thông báo lỗi nếu cần thiết.

---

## 📊 3. Table Builder (Danh Sách Dữ Liệu)

*   **Columns**:
    *   Sử dụng đúng loại Column đại diện cho kiểu dữ liệu: `TextColumn` cho chuỗi/số, `ImageColumn` cho hình ảnh, `ToggleColumn` hoặc `IconColumn` cho giá trị boolean.
    *   Định dạng dữ liệu rõ ràng bằng các phương thức như `money()`, `date()`, `dateTime()`, `badge()`.
*   **Tìm Kiếm & Bộ Lọc (Filters)**:
    *   Chỉ cấu hình `searchable()` trên các cột thực sự cần tìm kiếm và đã được đánh index trong database.
    *   Sử dụng các bộ lọc chuyên biệt (`SelectFilter`, `TernaryFilter`) để giúp người dùng lọc nhanh danh sách dữ liệu.
    *   Với filter quan hệ phức tạp, hãy viết câu truy vấn rõ ràng trong phương thức `query()` của Filter.
*   **Eager Loading**:
    *   Khi hiển thị cột dữ liệu từ bảng quan hệ (ví dụ: `category.name`), hãy chắc chắn rằng bạn đã định nghĩa eager load trong phương thức `getTableQuery()` của Page hoặc Resource để tránh lỗi truy vấn N+1:
      ```php
      protected static function getTableQuery(): Builder
      {
          return parent::getTableQuery()->with(['category']);
      }
      ```
*   **Actions**:
    *   Sử dụng Filament Actions (`EditAction`, `DeleteAction`, `ViewAction`) thay vì tự tạo route/controller riêng cho các logic CRUD.
    *   Sử dụng `BulkActions` để xử lý hàng loạt dữ liệu một cách an toàn. Luôn yêu cầu xác nhận trước khi thực hiện các hành động nguy hiểm bằng `requiresConfirmation()`.

---

## 🔗 4. Relation Managers (Quản Lý Quan Hệ)

*   **Thiết Kế**:
    *   Sử dụng `RelationManager` (`php artisan make:filament-relation-manager`) để quản lý các mối quan hệ `hasMany` hoặc `belongsToMany` trực tiếp trên trang Edit/View của bản ghi cha.
    *   Điều này giúp giao diện mạch lạc và tránh việc phải tạo quá nhiều trang quản lý rời rạc.
*   **Tách Biệt State**:
    *   Tránh load quá nhiều Relation Manager cùng một lúc nếu dữ liệu lớn. Cân nhắc sử dụng cấu hình lazy loading hoặc hiển thị dưới dạng tab.

---

## 🛡️ 5. Phân Quyền & Bảo Mật

*   **Laravel Policies Integration**:
    *   Filament mặc định tự động nhận diện các Policy của Laravel. Luôn tạo Policy cho mỗi Model được quản lý bởi Filament để phân quyền cụ thể (`viewAny`, `create`, `update`, `delete`).
*   **Field-level Authorization**:
    *   Sử dụng `visible()` hoặc `hidden()` để ẩn/hiện các trường thông tin hoặc action nhạy cảm dựa trên quyền của user hiện tại:
      ```php
      TextInput::make('cost_price')
          ->visible(fn () => auth()->user()->can('view_cost_price')),
      ```

---

## ⚡ 6. Tối Ưu Hóa Hiệu Năng & Livewire State

*   **Livewire State Management**:
    *   Hạn chế lưu trữ các object lớn hoặc các mảng dữ liệu quá phức tạp trực tiếp trong các thuộc tính Livewire công khai (`public properties`), vì chúng sẽ được tuần tự hóa (serialized) và gửi qua lại giữa Client và Server trong mỗi request.
*   **Caching**:
    *   Với các Widgets hiển thị biểu đồ hoặc thống kê phức tạp, hãy sử dụng Laravel Cache để lưu trữ kết quả truy vấn trong một khoảng thời gian ngắn (ví dụ: 5-10 phút) thay vì chạy lại các câu lệnh SQL nặng nề mỗi khi tải trang Dashboard.
