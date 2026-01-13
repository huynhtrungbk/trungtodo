/**
 * 🏠 app/page.tsx - Trang chủ của ứng dụng
 * 
 * ĐÂY LÀ SERVER COMPONENT (mặc định):
 * - Render trên server
 * - Không thể dùng hooks (useState, useEffect)
 * - Nhưng có thể import Client Component như TodoList
 */

import TodoList from '@/components/TodoList';

// ============================================
// Metadata cho SEO (chỉ Server Component mới export được)
// ============================================
export const metadata = {
  title: 'Todo App - Quản lý công việc',
  description: 'Ứng dụng quản lý công việc đơn giản với Next.js',
};

// ============================================
// Component trang chủ
// ============================================
export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',                    // Chiều cao tối thiểu = màn hình
      backgroundColor: '#f8f9fa',            // Màu nền xám nhạt
      padding: '40px 20px',                  // Padding
    }}>
      {/* Container giới hạn chiều rộng */}
      <div style={{
        maxWidth: '600px',                   // Chiều rộng tối đa
        margin: '0 auto',                    // Căn giữa
        backgroundColor: 'white',            // Nền trắng
        borderRadius: '16px',                // Bo góc
        padding: '32px',                     // Padding trong
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',  // Đổ bóng
      }}>

        {/* Tiêu đề */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#212529',
        }}>
          📋 Todo App
        </h1>

        {/* Component TodoList - Client Component */}
        <TodoList />

      </div>
    </main>
  );
}
