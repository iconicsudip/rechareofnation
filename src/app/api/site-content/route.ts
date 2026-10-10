// src/app/api/site-content/route.ts
// Public read-only access for site pages (homepage, about, contact, footer, legal, etc).
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { PUBLIC_CACHE_HEADERS } from '@/lib/http-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key) {
    const rows = await sql`SELECT * FROM site_content WHERE key = ${key}`;
    return NextResponse.json({ content: rows[0] ?? null }, { headers: PUBLIC_CACHE_HEADERS });
  }
  const rows = await sql`SELECT * FROM site_content ORDER BY key ASC`;
  return NextResponse.json({ contents: rows }, { headers: PUBLIC_CACHE_HEADERS });
}
