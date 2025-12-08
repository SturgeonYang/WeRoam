import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `avatar-${session.userId}-${Date.now()}${path.extname(file.name)}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  
  // Ensure directory exists (simple check, might need mkdir if not exists, but usually public exists)
  // For robustness, let's try to create it if it doesn't exist, but fs/promises doesn't have existsSync.
  // We'll just assume public/uploads needs to be created or exists.
  // Let's use a try/catch for mkdir
  try {
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (e) {
    console.error("Error creating upload dir", e);
  }

  try {
    await writeFile(path.join(uploadDir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
