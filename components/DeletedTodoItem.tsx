import { Todo } from '@/types/todo';

interface DeletedTodoItemProps {
    todo: Todo;
}

export default function DeletedTodoItem({ todo }: DeletedTodoItemProps) {
    // Format ngày xóa
    const deletedDate = todo.deletedAt
        ? new Date(todo.deletedAt).toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        })
        : '';

    return (
        <li style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#fee2e2', // Nền màu hồng nhạt để phân biệt
            borderRadius: '8px',
            marginBottom: '8px',
            opacity: 0.8, // Làm mờ nhẹ
        }}>
            {/* 1️⃣ Checkbox hiển thị trạng thái (Disabled) */}
            <input
                type="checkbox"
                checked={todo.completed}
                readOnly
                disabled
                style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'not-allowed',
                    opacity: 0.6
                }}
            />

            {/* 2️⃣ Nội dung */}
            <div style={{ flex: 1 }}>
                <span style={{
                    display: 'block',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: '#6c757d',
                }}>
                    {todo.title}
                </span>
                <span style={{ fontSize: '12px', color: '#dc3545', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🗑️ Đã xóa: {deletedDate}
                </span>
            </div>
        </li>
    );
}
