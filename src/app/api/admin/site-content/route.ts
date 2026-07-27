// src/app/api/admin/site-content/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key) {
    const rows = await sql`SELECT * FROM site_content WHERE key = ${key}`;
    return NextResponse.json({ content: rows[0] ?? null });
  }
  const rows = await sql`SELECT * FROM site_content ORDER BY key ASC`;
  return NextResponse.json({ contents: rows });
}

export async function PUT(request: NextRequest) {
  await ensureSchema();
  const { key, value } = await request.json();
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
  const [content] = await sql`
    INSERT INTO site_content (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = NOW()
    RETURNING *
  `;
  return NextResponse.json({ success: true, content });
}
