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
  const { name, logo_url, tier, website_url } = body;
  if (!name || !tier) return NextResponse.json({ error: 'Name and tier required' }, { status: 400 });
  const id = 'sp-' + Date.now();
  const [sponsor] = await sql`
    INSERT INTO sponsors (id, name, logo_url, tier, website_url)
    VALUES (${id}, ${name}, ${logo_url || ''}, ${tier}, ${website_url || ''})
    RETURNING *
  `;
  return NextResponse.json({ success: true, sponsor });
}

export async function PUT(req: NextRequest) {
  await ensureSchema();
  const body = await req.json();
  const { id, name, logo_url, tier, website_url } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const [sponsor] = await sql`
    UPDATE sponsors SET name=${name}, logo_url=${logo_url || ''}, tier=${tier}, website_url=${website_url || ''}
    WHERE id=${id} RETURNING *
  `;
  return NextResponse.json({ success: true, sponsor });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await sql`DELETE FROM sponsors WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
