// src/app/api/media/[id]/route.ts
// Serves uploaded photos directly from the database table (Neon Postgres BYTEA)
import { NextRequest, NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return new NextResponse('Media ID missing', { status: 400 });
    }

    const rows = await sql`
      SELECT filename, mime_type, size_bytes, data, created_at
      FROM uploaded_photos
      WHERE id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return new NextResponse('Media not found', { status: 404 });
    }

    const row = rows[0];
    const buffer = Buffer.isBuffer(row.data)
      ? row.data
      : Buffer.from(row.data);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': row.mime_type || 'image/webp',
        'Content-Length': String(row.size_bytes || buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${encodeURIComponent(row.filename || 'media')}"`,
      },
    });
  } catch (error) {
    console.error('[API /api/media/[id]] Error serving media:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
