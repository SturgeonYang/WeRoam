import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        // Auth check
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        
        if (!token) {
            return new NextResponse(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.userId) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid token' }),
                { status: 401 }
            );
        }

        const body = await req.json();
        const { title, content, images, location, tags } = body;

        if (!title || !content) {
            return new NextResponse(
                JSON.stringify({ error: 'Title and content are required' }),
                { status: 400 }
            );
        }

        // Create post
        const post = await prisma.travelPost.create({
            data: {
                title,
                content,
                images: images ? JSON.stringify(images) : null,
                location,
                tags: tags ? JSON.stringify(tags) : null,
                authorId: payload.userId,
                coverImage: images && images.length > 0 ? images[0] : null
            }
        });

        return new NextResponse(JSON.stringify(post), { status: 201 });

    } catch (error) {
        console.error('Create post error:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}
