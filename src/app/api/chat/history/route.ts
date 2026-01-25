import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sessionIdParam = searchParams.get('sessionId');

    let session;

    if (sessionIdParam) {
      const sessionId = parseInt(sessionIdParam);
      if (!isNaN(sessionId)) {
        session = await prisma.chatSession.findUnique({
          where: { 
            id: sessionId,
            userId: payload.userId // Ensure user owns the session
          },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        });
      }
    } else {
      // Get the most recent session
      session = await prisma.chatSession.findFirst({
        where: { userId: payload.userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });
    }

    if (!session) {
      return NextResponse.json({ messages: [], sessionId: null });
    }

    return NextResponse.json({ 
      messages: session.messages, 
      sessionId: session.id,
      destination: session.destination // Return destination
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}