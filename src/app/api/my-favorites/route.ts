import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
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

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                nickname: true,
                avatar: true
              }
            },
            _count: {
              select: {
                comments: true,
                likedBy: true
              }
            }
          }
        }
      }
    });

    const formattedPosts = favorites.map(fav => {
      const post = fav.post;
      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
        images: post.images ? JSON.parse(post.images) : [],
        likeCount: post.likeCount,
        commentCount: post._count.comments,
        favoritedAt: fav.createdAt // Optional: if we want to show when it was favorited
      };
    });

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Get my favorites error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
