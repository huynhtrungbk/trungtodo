/**
 * 📋 components/TodoList.tsx - Component chính quản lý danh sách todos
 * 
 * ĐÂY LÀ "SMART COMPONENT":
 * - Quản lý state (dữ liệu)
 * - Gọi API
 * - Truyền data xuống các component con
 */

'use client'; // ⚠️ Client Component vì dùng hooks

import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';
import ConfirmModal from './ConfirmModal';  // 👈 Import modal mới

export default function TodoList() {

    // ============================================
    // 1️⃣ STATE: Quản lý dữ liệu
    // ============================================
    const [todos, setTodos] = useState<Todo[]>([]);     // Danh sách todos
    const [loading, setLoading] = useState(true);        // Đang tải?
    const [error, setError] = useState<string | null>(null);  // Lỗi (nếu có)

    // State cho modal xác nhận xóa
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [todoIdToDelete, setTodoIdToDelete] = useState<number | null>(null);

    // ============================================
    // 2️⃣ useEffect: Chạy khi component MOUNT (hiển thị lần đầu)
    // ============================================
    useEffect(() => {
        fetchTodos();  // Gọi API lấy danh sách todos
    }, []);  // [] = chỉ chạy 1 lần khi mount

    // ============================================
    // 3️⃣ Hàm gọi API lấy danh sách todos
    // ============================================
    const fetchTodos = async () => {
        try {
            setLoading(true);                              // Bắt đầu loading
            const response = await fetch('/api/todos');     // Gọi API

            if (!response.ok) {
                throw new Error('Không thể tải danh sách todos');
            }

            const data = await response.json();            // Parse JSON
            setTodos(data);                                // Cập nhật state
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setLoading(false);                             // Kết thúc loading
        }
    };

    // ============================================
    // 4️⃣ Hàm thêm todo mới
    // ============================================
    const handleAddTodo = async (title: string) => {
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',                              // HTTP POST
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, completed: false }),  // Data gửi đi
            });

            if (!response.ok) {
                throw new Error('Không thể thêm todo');
            }

            const newTodo = await response.json();
            setTodos([newTodo, ...todos]);                 // Thêm vào đầu danh sách
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        }
    };

    // ============================================
    // 5️⃣ Hàm toggle trạng thái completed
    // ============================================
    const handleToggle = async (id: number) => {
        const todo = todos.find(t => t.id === id);       // Tìm todo cần update
        if (!todo) return;

        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PATCH',                             // HTTP PATCH = update một phần
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !todo.completed }),  // Đảo ngược trạng thái
            });

            if (!response.ok) {
                throw new Error('Không thể cập nhật todo');
            }

            const updatedTodo = await response.json();
            // Cập nhật state: thay todo cũ bằng todo mới
            setTodos(todos.map(t => t.id === id ? updatedTodo : t));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        }
    };

    // ============================================
    // 6️⃣ Hàm mở modal xác nhận xóa
    // ============================================
    const handleDeleteClick = (id: number) => {
        setTodoIdToDelete(id);      // Lưu ID todo cần xóa
        setDeleteModalOpen(true);   // Mở modal
    };

    // ============================================
    // 7️⃣ Hàm xác nhận xóa (gọi khi click "Xác nhận" trong modal)
    // ============================================
    const handleConfirmDelete = async () => {
        if (todoIdToDelete === null) return;

        try {
            const response = await fetch(`/api/todos/${todoIdToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Không thể xóa todo');
            }

            // Cập nhật state: lọc bỏ todo đã xóa
            setTodos(todos.filter(t => t.id !== todoIdToDelete));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            // Đóng modal và reset state
            setDeleteModalOpen(false);
            setTodoIdToDelete(null);
        }
    };

    // ============================================
    // 8️⃣ Hàm hủy xóa (đóng modal)
    // ============================================
    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setTodoIdToDelete(null);
    };

    // ============================================
    // 9️⃣ RENDER UI
    // ============================================

    // Hiển thị loading
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>⏳ Đang tải...</p>
            </div>
        );
    }

    // Hiển thị lỗi
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                <p>❌ {error}</p>
                <button onClick={fetchTodos}>Thử lại</button>
            </div>
        );
    }

    // Hiển thị danh sách
    return (
        <div>
            {/* Form thêm todo */}
            <AddTodo onAdd={handleAddTodo} />

            {/* Danh sách todos */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {todos.length === 0 ? (
                    <li style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                        📝 Chưa có việc gì cần làm. Thêm việc mới nhé!
                    </li>
                ) : (
                    todos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggle}
                            onDelete={handleDeleteClick}  // 👈 Gọi hàm mở modal
                        />
                    ))
                )}
            </ul>

            {/* Thống kê */}
            {todos.length > 0 && (
                <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '8px',
                    textAlign: 'center',
                }}>
                    <p>
                        ✅ Hoàn thành: {todos.filter(t => t.completed).length} / {todos.length}
                    </p>
                </div>
            )}

            {/* 🔔 Modal xác nhận xóa */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa công việc này không?"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}
