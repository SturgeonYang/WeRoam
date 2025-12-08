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
    const postId = parseInt(id);

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_postId: {
          userId: payload.userId,
          postId: postId,
        },
      },
    });

    let favorited = false;

    if (existingFavorite) {
      // Unfavorite
      await prisma.favorite.delete({
        where: {
          userId_postId: {
            userId: payload.userId,
            postId: postId,
          },
        },
      });
      favorited = false;
    } else {
      // Favorite
      await prisma.favorite.create({
        data: {
          userId: payload.userId,
          postId: postId,
        },
      });
      favorited = true;
    }

    return NextResponse.json({ favorited });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
