// src/app/api/gallery/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSchema();
    const items = await sql`
      SELECT id, type, url, thumbnail_url, title, event 
      FROM gallery_items 
      ORDER BY created_at ASC
    `;
    return NextResponse.json({ items });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
