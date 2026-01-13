'use client';

import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import DeletedTodoItem from './DeletedTodoItem';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(false);

    // Load data khi mở modal
    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/todos?status=archived');
            if (res.ok) {
                const data = await res.json();
                setTodos(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>📜 Lịch sử lưu trữ</h2>
                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: '16px',
                    minHeight: '200px'
                }}>
                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Đang tải...</p>
                    ) : todos.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6c757d' }}>Chưa có lịch sử lưu trữ (dữ liệu cũ hơn 3 ngày)</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {todos.map(todo => (
                                <DeletedTodoItem key={todo.id} todo={todo} />
                            ))}
                        </ul>
                    )}
                </div>

                <div style={{ textAlign: 'right' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
