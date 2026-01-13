/**
 * 🔔 components/ConfirmModal.tsx - Modal xác nhận xóa
 * 
 * VÌ SAO KHÔNG DÙNG confirm() CỦA BROWSER?
 * - confirm() gây lỗi flash popup trên một số browser
 * - Không thể tùy chỉnh giao diện
 * - Custom modal đẹp hơn và ổn định hơn
 */

'use client';

interface ConfirmModalProps {
    isOpen: boolean;           // Modal có đang hiển thị không?
    title: string;             // Tiêu đề (VD: "Xác nhận xóa")
    message: string;           // Nội dung (VD: "Bạn có chắc muốn xóa?")
    onConfirm: () => void;     // Hàm gọi khi click OK
    onCancel: () => void;      // Hàm gọi khi click Hủy
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {

    // Không render gì nếu modal đóng
    if (!isOpen) return null;

    return (
        // 1️⃣ Overlay - lớp phủ tối phía sau
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
            onClick={onCancel}  // Click vào overlay = Hủy
        >
            {/* 2️⃣ Modal box */}
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    minWidth: '300px',
                    maxWidth: '400px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                }}
                onClick={(e) => e.stopPropagation()}  // Ngăn click lan ra overlay
            >
                {/* 3️⃣ Tiêu đề */}
                <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#212529',
                }}>
                    {title}
                </h3>

                {/* 4️⃣ Nội dung */}
                <p style={{
                    margin: '0 0 24px 0',
                    color: '#6c757d',
                    fontSize: '15px',
                }}>
                    {message}
                </p>

                {/* 5️⃣ Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                }}>
                    {/* Nút Hủy */}
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#e9ecef',
                            color: '#495057',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        Hủy
                    </button>

                    {/* Nút Xác nhận */}
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}
