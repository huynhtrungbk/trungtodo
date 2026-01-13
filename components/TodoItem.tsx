/**
 * 🎨 components/TodoItem.tsx - Component hiển thị 1 todo item
 * 
 * COMPONENT LÀ GÌ?
 * - Một "khối" UI có thể tái sử dụng
 * - Nhận data qua props, trả về JSX (HTML trong JS)
 * 
 * VÌ SAO TÁCH RIÊNG?
 * - Dễ test, dễ bảo trì
 * - Có thể dùng lại nhiều nơi
 */

import { Todo } from '@/types/todo';  // Import type Todo đã định nghĩa

// ============================================
// 1️⃣ Interface Props - Định nghĩa INPUT của component
// ============================================
interface TodoItemProps {
    todo: Todo;                          // Dữ liệu todo để hiển thị
    onToggle: (id: number) => void;       // Hàm gọi khi click checkbox
    onDelete: (id: number) => void;       // Hàm gọi khi click nút xóa
}

// ============================================
// 2️⃣ Component TodoItem
// ============================================
export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
    // 👆 Destructuring: lấy todo, onToggle, onDelete từ props

    return (
        // 3️⃣ Container của 1 todo item
        <li style={{
            display: 'flex',           // Flexbox: xếp ngang
            alignItems: 'center',      // Căn giữa theo chiều dọc
            gap: '12px',               // Khoảng cách giữa các phần tử
            padding: '12px 16px',      // Đệm trong
            backgroundColor: '#f8f9fa', // Màu nền
            borderRadius: '8px',       // Bo góc
            marginBottom: '8px',       // Margin dưới
        }}>

            {/* 4️⃣ Checkbox - đánh dấu hoàn thành */}
            <input
                type="checkbox"
                checked={todo.completed}          // ✅ Tick nếu completed = true
                onChange={() => onToggle(todo.id)} // Gọi onToggle khi click
                style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                }}
            />

            {/* 5️⃣ Tiêu đề todo */}
            <span style={{
                flex: 1,                          // Chiếm hết không gian còn lại
                textDecoration: todo.completed ? 'line-through' : 'none', // Gạch ngang nếu hoàn thành
                color: todo.completed ? '#6c757d' : '#212529',            // Màu xám nếu hoàn thành
                fontSize: '16px',
            }}>
                {todo.title}                      {/* Hiển thị tiêu đề */}
            </span>

            {/* 6️⃣ Nút xóa */}
            <button
                onClick={() => onDelete(todo.id)} // Gọi onDelete khi click
                style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',     // Màu đỏ
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                }}
            >
                Xóa
            </button>
        </li>
    );
}
