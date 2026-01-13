/**
 * 🔧 app/api/todos/route.ts - API Endpoints cho /api/todos
 * 
 * ĐÃ NÂNG CẤP: Kết nối với PostgreSQL qua Prisma
 * - Trước: Dùng mock data (mảng trong memory)
 * - Sau: Dùng database thật (PostgreSQL)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';  // 👈 Import Prisma client

// ============================================
// 📥 GET /api/todos - Lấy danh sách todos từ database
// ============================================
export async function GET() {
    try {
        // 🔍 prisma.todo.findMany() = SELECT * FROM "Todo"
        // orderBy: sắp xếp theo createdAt giảm dần (mới nhất trước)
        const todos = await prisma.todo.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(todos);

    } catch (error) {
        console.error('GET /api/todos error:', error);
        return NextResponse.json(
            { error: 'Không thể lấy danh sách todos' },
            { status: 500 }
        );
    }
}

// ============================================
// ➕ POST /api/todos - Tạo todo mới trong database
// ============================================
export async function POST(request: NextRequest) {
    try {
        // 1️⃣ Đọc data từ request body
        const body = await request.json();

        // 2️⃣ Validate: kiểm tra title có tồn tại không
        if (!body.title || typeof body.title !== 'string') {
            return NextResponse.json(
                { error: 'Title là bắt buộc' },
                { status: 400 }
            );
        }

        // 3️⃣ Tạo todo mới trong database
        // prisma.todo.create() = INSERT INTO "Todo" (...) VALUES (...)
        const newTodo = await prisma.todo.create({
            data: {
                title: body.title.trim(),
                completed: body.completed ?? false,
                // createdAt và updatedAt tự động được set
            },
        });

        // 4️⃣ Trả về todo vừa tạo với status 201 Created
        return NextResponse.json(newTodo, { status: 201 });

    } catch (error) {
        console.error('POST /api/todos error:', error);
        return NextResponse.json(
            { error: 'Không thể tạo todo' },
            { status: 500 }
        );
    }
}
