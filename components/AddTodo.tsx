/**
 * 📝 components/AddTodo.tsx - Form thêm todo mới
 * 
 * FORM TRONG REACT:
 * - Cần quản lý "state" của input
 * - Xử lý sự kiện submit
 */

'use client'; // ⚠️ BẮT BUỘC: Đánh dấu đây là Client Component
// Vì dùng useState, event handlers (chỉ chạy trên browser)

import { useState, FormEvent } from 'react';  // Import hooks và types

// ============================================
// 1️⃣ Interface Props
// ============================================
interface AddTodoProps {
    onAdd: (title: string) => void;  // Hàm callback khi submit form
}

// ============================================
// 2️⃣ Component AddTodo
// ============================================
export default function AddTodo({ onAdd }: AddTodoProps) {

    // 3️⃣ STATE: Lưu giá trị đang gõ trong input
    // useState('') → khởi tạo với chuỗi rỗng
    // title: giá trị hiện tại
    // setTitle: hàm để thay đổi giá trị
    const [title, setTitle] = useState('');

    // 4️⃣ Hàm xử lý khi submit form
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();  // ⚠️ Ngăn browser reload trang (hành vi mặc định của form)

        // Kiểm tra không được để trống
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề todo!');
            return;  // Dừng hàm, không thực hiện tiếp
        }

        onAdd(title.trim());  // Gọi callback với title đã trim khoảng trắng
        setTitle('');          // Reset input về rỗng
    };

    return (
        // 5️⃣ Form container
        <form onSubmit={handleSubmit} style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
        }}>

            {/* 6️⃣ Input nhập tiêu đề */}
            <input
                type="text"
                value={title}                           // Giá trị từ state
                onChange={(e) => setTitle(e.target.value)}  // Cập nhật state khi gõ
                placeholder="Nhập việc cần làm..."
                style={{
                    flex: 1,                              // Chiếm hết không gian
                    padding: '12px 16px',
                    fontSize: '16px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    outline: 'none',
                }}
            />

            {/* 7️⃣ Nút submit */}
            <button
                type="submit"                           // Kích hoạt form submit
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#0d6efd',           // Màu xanh
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                Thêm
            </button>
        </form>
    );
}
