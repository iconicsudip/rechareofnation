// src/app/api/admin/users/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const rows = await sql`
      SELECT id, name, email, mobile, city, state, organization, role, is_verified, created_at
      FROM users
      WHERE (name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`
      SELECT COUNT(*) as count FROM users
      WHERE (name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'})
    `;
    return NextResponse.json({ users: rows, total: Number(total[0].count) });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { id, role, isVerified } = body;

    const rows = await sql`
      UPDATE users SET
        role = COALESCE(${role ?? null}, role),
        is_verified = COALESCE(${isVerified ?? null}, is_verified)
      WHERE id = ${id}
      RETURNING id, name, email, role, is_verified
    `;
    return NextResponse.json({ user: rows[0] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
