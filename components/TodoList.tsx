/**
 * 📋 components/TodoList.tsx - Component chính quản lý danh sách todos
 * 
 * ĐÂY LÀ "SMART COMPONENT":
 * - Quản lý state (dữ liệu)
 * - Gọi API
 * - Truyền data xuống các component con
 */

'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';
import ConfirmModal from './ConfirmModal';
import DeletedTodoItem from './DeletedTodoItem'; // 👈 Import mới
import HistoryModal from './HistoryModal';       // 👈 Import mới

export default function TodoList() {

    // ============================================
    // 1️⃣ STATE
    // ============================================
    const [todos, setTodos] = useState<Todo[]>([]);          // Active todos
    const [recentTodos, setRecentTodos] = useState<Todo[]>([]); // Recently deleted
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [todoIdToDelete, setTodoIdToDelete] = useState<number | null>(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false); // 👈 State cho modal lịch sử

    // ============================================
    // 2️⃣ EFFECT
    // ============================================
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchTodos(),
                fetchRecentDeleted()
            ]);
        } catch (err) {
            setError('Có lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách đang active
    const fetchTodos = async () => {
        const res = await fetch('/api/todos?status=active');
        if (res.ok) setTodos(await res.json());
    };

    // Lấy danh sách vừa xóa (3 ngày)
    const fetchRecentDeleted = async () => {
        const res = await fetch('/api/todos?status=recent');
        if (res.ok) setRecentTodos(await res.json());
    };

    // ============================================
    // 3️⃣ HANDLERS
    // ============================================
    const handleAddTodo = async (title: string) => {
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, completed: false }),
            });
            if (response.ok) {
                const newTodo = await response.json();
                setTodos([newTodo, ...todos]);
            }
        } catch (err) {
            alert('Lỗi thêm todo');
        }
    };

    const handleToggle = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !todo.completed }),
            });
            if (response.ok) {
                const updatedTodo = await response.json();
                setTodos(todos.map(t => t.id === id ? updatedTodo : t));
            }
        } catch (err) {
            alert('Lỗi cập nhật');
        }
    };

    const handleDeleteClick = (id: number) => {
        setTodoIdToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (todoIdToDelete === null) return;
        try {
            const response = await fetch(`/api/todos/${todoIdToDelete}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Xóa khỏi danh sách active
                const deletedTodo = todos.find(t => t.id === todoIdToDelete);
                setTodos(todos.filter(t => t.id !== todoIdToDelete));

                // Thêm vào danh sách recent (giả lập UI luôn cho nhanh)
                if (deletedTodo) {
                    const now = new Date();
                    setRecentTodos([{ ...deletedTodo, deletedAt: now }, ...recentTodos]);
                }

                // Hoặc gọi lại fetchRecentDeleted() để chắc chắn đồng bộ server
                // fetchRecentDeleted();
            }
        } catch (err) {
            alert('Lỗi xóa todo');
        } finally {
            setDeleteModalOpen(false);
            setTodoIdToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setTodoIdToDelete(null);
    };

    // ============================================
    // 4️⃣ RENDER
    // ============================================
    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Đang tải...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>❌ {error}</div>;

    return (
        <div>


            <AddTodo onAdd={handleAddTodo} />

            {/* DANH SÁCH CHÍNH */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {todos.length === 0 ? (
                    <li style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                        📝 Chưa có việc gì cần làm.
                    </li>
                ) : (
                    todos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggle}
                            onDelete={handleDeleteClick}
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
                    <p>✅ Hoàn thành: {todos.filter(t => t.completed).length} / {todos.length}</p>
                </div>
            )}

            {/* DANH SÁCH VỪA XÓA (RECENTLY DELETED BOX) */}
            {recentTodos.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    backgroundColor: '#fff5f5',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px dashed #ffc9c9'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{
                            fontSize: '16px',
                            color: '#dc3545',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            🗑️ Vừa xóa gần đây <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>(Lưu 3 ngày)</span>
                        </h3>

                        <button
                            onClick={() => setHistoryModalOpen(true)}
                            style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            📜 Lịch sử cũ
                        </button>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {recentTodos.map(todo => (
                            <DeletedTodoItem key={todo.id} todo={todo} />
                        ))}
                    </ul>
                </div>
            )}

            {recentTodos.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={() => setHistoryModalOpen(true)}
                        style={{
                            color: '#6c757d',
                            fontSize: '14px',
                            background: 'none',
                            border: 'none',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}
                    >
                        📜 Xem lịch sử cũ
                    </button>
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Xác nhận xóa"
                message="Công việc này sẽ được chuyển vào mục 'Vừa xóa'."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <HistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
            />
        </div>
    );
}
