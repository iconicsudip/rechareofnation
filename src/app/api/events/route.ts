// src/app/api/events/route.ts
// Public read-only access for site pages (homepage, events listing/detail, Navbar search).
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { PUBLIC_CACHE_HEADERS } from '@/lib/http-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ensureSchema();
  // ?id= / ?slug= fetch a single event (detail pages) instead of the whole list.
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');
  if (id || slug) {
    const events = id
      ? await sql`SELECT * FROM events WHERE is_active = true AND id = ${id} LIMIT 1`
      : await sql`SELECT * FROM events WHERE is_active = true AND slug = ${slug} LIMIT 1`;
    return NextResponse.json({ events }, { headers: PUBLIC_CACHE_HEADERS });
  }
  const events = await sql`SELECT * FROM events WHERE is_active = true ORDER BY created_at DESC LIMIT 200`;
  return NextResponse.json({ events }, { headers: PUBLIC_CACHE_HEADERS });
}
