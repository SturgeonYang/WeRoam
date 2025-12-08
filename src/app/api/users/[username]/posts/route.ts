import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    const currentUser = await getSessionUser();

    const posts = await prisma.travelPost.findMany({
      where: {
        author: {
          username: {
            equals: username,
            mode: 'insensitive'
          }
        },
        published: true
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get liked and favorited posts for current user
    let likedPostIds = new Set<number>();
    let favoritedPostIds = new Set<number>();

    if (currentUser) {
      const likes = await prisma.postLike.findMany({
        where: { userId: currentUser.id },
        select: { postId: true },
      });
      likedPostIds = new Set(likes.map(l => l.postId));

      const favorites = await prisma.favorite.findMany({
        where: { userId: currentUser.id },
        select: { postId: true },
      });
      favoritedPostIds = new Set(favorites.map(f => f.postId));
    }

    // Transform data to match TravelPosts component expectation
    const formattedPosts = posts.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      images: post.images ? JSON.parse(post.images) : [],
      likeCount: post.likeCount,
      commentCount: post._count.comments,
      isLiked: likedPostIds.has(post.id),
      isFavorited: favoritedPostIds.has(post.id)
    }));

    return NextResponse.json(formattedPosts);

  } catch (error) {
    console.error('Error fetching user posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
