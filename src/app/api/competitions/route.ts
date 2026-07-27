// src/app/api/competitions/route.ts
// Public read-only access for the competitions page.
import { sql, ensureSchema } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const competitions = await sql`SELECT * FROM competitions WHERE is_active = true ORDER BY created_at DESC`;
  return NextResponse.json({ competitions });
}
