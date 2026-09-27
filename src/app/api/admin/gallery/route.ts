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

  // Support bulk creation
  if (Array.isArray(body.items) && body.items.length > 0) {
    const inserted = [];
    for (const it of body.items) {
      if (!it.url || !it.title) continue;
      const id = 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const [res] = await sql`
        INSERT INTO gallery_items (id, type, url, thumbnail_url, title, event)
        VALUES (${id}, ${it.type || 'photo'}, ${it.url}, ${it.thumbnail_url || it.url}, ${it.title}, ${it.event || ''})
        RETURNING *
      `;
      inserted.push(res);
    }
    return NextResponse.json({ success: true, count: inserted.length, items: inserted });
  }

  // Single creation
  const { type, url, thumbnail_url, title, event } = body;
  if (!url || !title) return NextResponse.json({ error: 'URL and title required' }, { status: 400 });
  const id = 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
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

  // Support bulk category / event update
  if (Array.isArray(body.ids) && body.ids.length > 0 && typeof body.event === 'string') {
    const updated = await sql`
      UPDATE gallery_items 
      SET event = ${body.event}
      WHERE id = ANY(${body.ids})
      RETURNING *
    `;
    return NextResponse.json({ success: true, count: updated.length, items: updated });
  }

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
  let idsToDelete: string[] = [];

  try {
    const body = await req.json().catch(() => null);
    if (body?.ids && Array.isArray(body.ids)) {
      idsToDelete = body.ids;
    }
  } catch {
    // Ignore JSON parse errors for DELETE requests without body
  }

  if (idsToDelete.length === 0) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');
    if (ids) {
      idsToDelete = ids.split(',').map(s => s.trim()).filter(Boolean);
    } else if (id) {
      idsToDelete = [id];
    }
  }

  if (idsToDelete.length === 0) {
    return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });
  }

  await sql`DELETE FROM gallery_items WHERE id = ANY(${idsToDelete})`;
  return NextResponse.json({ success: true, count: idsToDelete.length });
}
