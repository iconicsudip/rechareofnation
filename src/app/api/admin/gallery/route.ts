// src/app/api/admin/gallery/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const items = await sql`SELECT * FROM gallery_items ORDER BY created_at DESC`;
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const body = await req.json();
  const { type, url, thumbnail_url, title, event } = body;
  if (!url || !title) return NextResponse.json({ error: 'URL and title required' }, { status: 400 });
  const id = 'g-' + Date.now();
  const [item] = await sql`
    INSERT INTO gallery_items (id, type, url, thumbnail_url, title, event)
    VALUES (${id}, ${type || 'photo'}, ${url}, ${thumbnail_url || url}, ${title}, ${event || ''})
    RETURNING *
  `;
  return NextResponse.json({ success: true, item });
}

export async function PUT(req: NextRequest) {
  await ensureSchema();
  const body = await req.json();
  const { id, type, url, thumbnail_url, title, event } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const [item] = await sql`
    UPDATE gallery_items SET type=${type || 'photo'}, url=${url}, thumbnail_url=${thumbnail_url || url}, title=${title}, event=${event || ''}
    WHERE id=${id} RETURNING *
  `;
  return NextResponse.json({ success: true, item });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await sql`DELETE FROM gallery_items WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
