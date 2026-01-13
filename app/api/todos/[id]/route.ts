/**
 * 🔧 app/api/todos/[id]/route.ts - API cho từng todo cụ thể
 * 
 * ĐÃ NÂNG CẤP: Kết nối với PostgreSQL qua Prisma
 * - Trước: Dùng mock data
 * - Sau: Dùng database thật
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================
// 🔍 GET /api/todos/[id] - Lấy 1 todo theo ID
// ============================================
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const todoId = parseInt(id);

    // Validate ID
    if (isNaN(todoId)) {
        return NextResponse.json(
            { error: 'ID không hợp lệ' },
            { status: 400 }
        );
    }

    try {
        // prisma.todo.findUnique() = SELECT * FROM "Todo" WHERE id = ?
        const todo = await prisma.todo.findUnique({
            where: { id: todoId },
        });

        if (!todo) {
            return NextResponse.json(
                { error: 'Không tìm thấy todo' },
                { status: 404 }
            );
        }

        return NextResponse.json(todo);

    } catch (error) {
        console.error('GET /api/todos/[id] error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra' },
            { status: 500 }
        );
    }
}

// ============================================
// ✏️ PATCH /api/todos/[id] - Cập nhật todo
// ============================================
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const todoId = parseInt(id);

    if (isNaN(todoId)) {
        return NextResponse.json(
            { error: 'ID không hợp lệ' },
            { status: 400 }
        );
    }

    try {
        const body = await request.json();

        // prisma.todo.update() = UPDATE "Todo" SET ... WHERE id = ?
        const updatedTodo = await prisma.todo.update({
            where: {
                id: todoId,
                deletedAt: null  // 🛡️ Chỉ update nếu chưa bị xóa
            },
            data: {
                // Chỉ update các field được gửi lên
                ...(body.title !== undefined && { title: body.title }),
                ...(body.completed !== undefined && { completed: body.completed }),
                // updatedAt tự động được cập nhật
            },
        });

        return NextResponse.json(updatedTodo);

    } catch (error) {
        console.error('PATCH /api/todos/[id] error:', error);

        // Prisma ném lỗi nếu record không tồn tại
        if ((error as { code?: string }).code === 'P2025') {
            return NextResponse.json(
                { error: 'Không tìm thấy todo' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra' },
            { status: 500 }
        );
    }
}

// ============================================
// 🗑️ DELETE /api/todos/[id] - Xóa todo
// ============================================
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const todoId = parseInt(id);

    if (isNaN(todoId)) {
        return NextResponse.json(
            { error: 'ID không hợp lệ' },
            { status: 400 }
        );
    }

    try {
        // SOFT DELETE: Không xóa hẳn, chỉ đánh dấu ngày xóa
        // prisma.todo.update()
        await prisma.todo.update({
            where: { id: todoId },
            data: {
                deletedAt: new Date(),
            },
        });

        // 204 No Content = thành công, không có body
        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error('DELETE /api/todos/[id] error:', error);

        if ((error as { code?: string }).code === 'P2025') {
            return NextResponse.json(
                { error: 'Không tìm thấy todo' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Có lỗi xảy ra' },
            { status: 500 }
        );
    }
}
