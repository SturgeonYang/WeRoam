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
        const locations = await prisma.savedLocation.findMany({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(locations);
    } catch (error) {
        console.error('Failed to fetch saved locations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
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
        const body = await req.json();
        const { name, description, type, lat, lng } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check if already saved
        const existing = await prisma.savedLocation.findFirst({
            where: {
                userId: payload.userId,
                name: name
            }
        });

        if (existing) {
            // If exists, delete it (toggle off)
            await prisma.savedLocation.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ action: 'removed', id: existing.id });
        } else {
            // If not exists, create it
            const newLocation = await prisma.savedLocation.create({
                data: {
                    userId: payload.userId,
                    name,
                    description,
                    type,
                    lat,
                    lng
                }
            });
            return NextResponse.json({ action: 'added', location: newLocation });
        }
    } catch (error) {
        console.error('Failed to toggle saved location:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
