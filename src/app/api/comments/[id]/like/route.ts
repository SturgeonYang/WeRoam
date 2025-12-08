import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    const userId = payload.userId;

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.commentLike.delete({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.$transaction([
        prisma.commentLike.create({
          data: {
            userId,
            commentId,
          },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    console.error('Like comment error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      details: error.toString()
    }, { status: 500 });
  }
}
