import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await params;
    
    if (!username) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive'
        }
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUserId = targetUser.id;

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: targetUserId
          }
        }
      });
      return NextResponse.json({ isFollowed: false });
    } else {
      // Follow
      await prisma.follows.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      });
      return NextResponse.json({ isFollowed: true });
    }

  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
