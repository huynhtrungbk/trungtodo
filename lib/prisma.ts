/**
 * 📦 lib/prisma.ts - Prisma Client Singleton với Driver Adapter (Prisma 7)
 * 
 * PRISMA 7 YÊU CẦU:
 * - Sử dụng driver adapter để kết nối database
 * - Không còn dùng env("DATABASE_URL") trong schema.prisma
 * - Connection string được cấu hình trong code
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// ============================================
// 1️⃣ Khai báo global type để tránh tạo nhiều instance
// ============================================
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// ============================================
// 2️⃣ Hàm tạo Prisma Client với adapter
// ============================================
function createPrismaClient() {
    // Lấy DATABASE_URL từ environment
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL is not defined');
    }

    // Tạo Pool connection từ thư viện pg
    const pool = new Pool({ connectionString });

    // Tạo adapter từ pool
    const adapter = new PrismaPg(pool);

    // Tạo PrismaClient với adapter
    return new PrismaClient({ adapter });
}

// ============================================
// 3️⃣ Tạo hoặc lấy lại singleton instance
// ============================================
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Lưu vào globalThis trong development để tránh hot reload issues
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
