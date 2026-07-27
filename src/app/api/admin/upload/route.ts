// src/app/api/admin/upload/route.ts
// Admin-only (protected by src/proxy.ts). Uploads a file to Vercel Blob and returns its public URL.
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Image upload is not configured yet. Add BLOB_READ_WRITE_TOKEN to .env.local, or paste an image URL directly.' },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name}`;
    const blob = await put(filename, file, { access: 'public' });
    return NextResponse.json({ success: true, url: blob.url });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
