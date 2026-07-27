// src/app/api/admin/taxonomies/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const taxonomies = type
    ? await sql`SELECT * FROM taxonomies WHERE type = ${type} ORDER BY value ASC`
    : await sql`SELECT * FROM taxonomies ORDER BY type ASC, value ASC`;
  return NextResponse.json({ taxonomies });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const { type, value } = await req.json();
  if (!type || !value) return NextResponse.json({ error: 'type and value required' }, { status: 400 });
  const id = `tax-${type}-${value}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const [taxonomy] = await sql`
    INSERT INTO taxonomies (id, type, value)
    VALUES (${id}, ${type}, ${value})
    ON CONFLICT (type, value) DO NOTHING
    RETURNING *
  `;
  return NextResponse.json({ success: true, taxonomy });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await sql`DELETE FROM taxonomies WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
