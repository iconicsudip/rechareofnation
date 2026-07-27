// src/app/api/sponsors/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const sponsors = await sql`
      SELECT id, name, logo_url, tier, website_url 
      FROM sponsors 
      ORDER BY created_at ASC
    `;
    return NextResponse.json({ sponsors });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
