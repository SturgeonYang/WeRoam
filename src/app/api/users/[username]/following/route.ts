import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const following = await prisma.follows.findMany({
      where: {
        followerId: user.id
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
            bio: true
          }
        }
      }
    });

    const formattedFollowing = following.map(f => f.following);

    return NextResponse.json(formattedFollowing);
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
