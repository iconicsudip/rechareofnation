// src/app/api/events/route.ts
// Public read-only access for site pages (homepage, events listing/detail, Navbar search).
import { sql, ensureSchema } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const events = await sql`SELECT * FROM events WHERE is_active = true ORDER BY created_at DESC LIMIT 200`;
  return NextResponse.json({ events });
}
