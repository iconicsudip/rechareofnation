// src/app/api/admin/registrations/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const rows = await sql`
      SELECT * FROM competition_registrations
      WHERE (${status} = '' OR status = ${status})
        AND (full_name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'} OR competition_name ILIKE ${'%' + search + '%'})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`
      SELECT COUNT(*) as count FROM competition_registrations
      WHERE (${status} = '' OR status = ${status})
        AND (full_name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'} OR competition_name ILIKE ${'%' + search + '%'})
    `;
    return NextResponse.json({ registrations: rows, total: Number(total[0].count) });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { id, status, ids } = body; // ids for bulk

    if (ids && Array.isArray(ids)) {
      await sql`UPDATE competition_registrations SET status = ${status} WHERE id = ANY(${ids})`;
      return NextResponse.json({ success: true, updated: ids.length });
    }

    const rows = await sql`
      UPDATE competition_registrations SET status = ${status} WHERE id = ${id} RETURNING *
    `;
    return NextResponse.json({ registration: rows[0] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
