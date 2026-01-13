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
            {/* 1️⃣ Icon thùng rác */}
            <span style={{ fontSize: '18px' }}>🗑️</span>

            {/* 2️⃣ Nội dung */}
            <div style={{ flex: 1 }}>
                <span style={{
                    display: 'block',
                    textDecoration: 'line-through',
                    color: '#6c757d',
                }}>
                    {todo.title}
                </span>
                <span style={{ fontSize: '12px', color: '#dc3545' }}>
                    Đã xóa: {deletedDate}
                </span>
            </div>
        </li>
    );
}
