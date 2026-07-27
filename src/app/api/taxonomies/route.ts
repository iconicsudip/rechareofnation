// src/app/api/taxonomies/route.ts
// Public read-only access, for populating filter dropdowns on site pages.
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const taxonomies = type
    ? await sql`SELECT value FROM taxonomies WHERE type = ${type} ORDER BY value ASC`
    : await sql`SELECT type, value FROM taxonomies ORDER BY type ASC, value ASC`;
  return NextResponse.json({ values: taxonomies.map((t) => (t as { value: string }).value), taxonomies });
}
