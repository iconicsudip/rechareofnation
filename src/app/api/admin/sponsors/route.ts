// src/app/api/admin/sponsors/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const sponsors = await sql`SELECT * FROM sponsors ORDER BY created_at ASC`;
  return NextResponse.json({ sponsors });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const body = await req.json();

  // Support bulk creation
  if (Array.isArray(body.sponsors) && body.sponsors.length > 0) {
    const inserted = [];
    for (const sp of body.sponsors) {
      if (!sp.name?.trim()) continue;
      const id = 'sp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const [sponsor] = await sql`
        INSERT INTO sponsors (id, name, logo_url, tier, website_url)
        VALUES (${id}, ${sp.name.trim()}, ${sp.logo_url || ''}, ${sp.tier || 'Partner'}, ${sp.website_url || ''})
        RETURNING *
      `;
      inserted.push(sponsor);
    }
    return NextResponse.json({ success: true, count: inserted.length, sponsors: inserted });
  }

  // Single creation
  const { name, logo_url, tier, website_url } = body;
  if (!name || !tier) return NextResponse.json({ error: 'Name and tier required' }, { status: 400 });
  const id = 'sp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const [sponsor] = await sql`
    INSERT INTO sponsors (id, name, logo_url, tier, website_url)
    VALUES (${id}, ${name.trim()}, ${logo_url || ''}, ${tier}, ${website_url || ''})
    RETURNING *
  `;
  return NextResponse.json({ success: true, sponsor });
}

export async function PUT(req: NextRequest) {
  await ensureSchema();
  const body = await req.json();

  // Support bulk tier change
  if (Array.isArray(body.ids) && body.ids.length > 0 && typeof body.tier === 'string') {
    const updated = await sql`
      UPDATE sponsors 
      SET tier = ${body.tier}
      WHERE id = ANY(${body.ids})
      RETURNING *
    `;
    return NextResponse.json({ success: true, count: updated.length, sponsors: updated });
  }

  // Single update
  const { id, name, logo_url, tier, website_url } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const [sponsor] = await sql`
    UPDATE sponsors SET name=${name.trim()}, logo_url=${logo_url || ''}, tier=${tier}, website_url=${website_url || ''}
    WHERE id=${id} RETURNING *
  `;
  return NextResponse.json({ success: true, sponsor });
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
    // Ignore JSON parse errors for query param deletes
  }

  if (idsToDelete.length === 0) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids');
    if (ids) {
      idsToDelete = ids.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (id) {
      idsToDelete = [id];
    }
  }

  if (idsToDelete.length === 0) {
    return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });
  }

  await sql`DELETE FROM sponsors WHERE id = ANY(${idsToDelete})`;
  return NextResponse.json({ success: true, count: idsToDelete.length });
}
