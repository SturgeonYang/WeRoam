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

    const user = await prisma.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        location: true,
        createdAt: true,
        _count: {
          select: {
            followedBy: true, // Followers count
            following: true,  // Following count
            posts: { where: { published: true } }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if current user is following this user
    let isFollowed = false;
    const currentUser = await getSessionUser();
    
    if (currentUser) {
      const follow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: user.id
          }
        }
      });
      isFollowed = !!follow;
    }

    return NextResponse.json({
      ...user,
      followersCount: user._count.followedBy,
      followingCount: user._count.following,
      postsCount: user._count.posts,
      isFollowed
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
