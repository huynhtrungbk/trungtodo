/**
 * 📝 types/todo.ts - Định nghĩa kiểu dữ liệu Todo
 * 
 * VÌ SAO CẦN FILE NÀY?
 * - TypeScript yêu cầu định nghĩa "hình dạng" của dữ liệu
 * - Giúp IDE gợi ý code chính xác
 * - Phát hiện lỗi TRƯỚC khi chạy app
 */

// ============================================
// 1️⃣ Interface Todo - Mô tả 1 todo item
// ============================================
export interface Todo {
    id: number;           // Mã định danh duy nhất (từ database)
    title: string;        // Tiêu đề todo
    completed: boolean;   // Trạng thái: true = đã hoàn thành
    createdAt: Date;      // Thời gian tạo
    updatedAt: Date;      // Thời gian cập nhật cuối
}

// ============================================
// 2️⃣ Type cho việc TẠO todo mới
// ============================================
// Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> 
// = Lấy Todo nhưng BỎ id, createdAt, updatedAt
// → Vì những field này database tự tạo
export type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================
// 3️⃣ Type cho việc UPDATE todo
// ============================================
// Partial<T> = Tất cả field của T đều OPTIONAL
// → Khi update, chỉ cần gửi field cần thay đổi
export type UpdateTodoInput = Partial<CreateTodoInput>;
