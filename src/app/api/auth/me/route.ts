import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      nickname: true,
      avatar: true,
      bio: true,
      location: true,
      _count: {
        select: {
          posts: { where: { published: true } },
          comments: true,
          favorites: true,
          followedBy: true, // Followers
          following: true   // Following
        }
      }
    }
  });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    // Only allow updating specific fields
    const { nickname, bio, location, avatar } = data;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        nickname,
        bio,
        location,
        avatar
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
