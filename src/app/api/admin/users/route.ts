// src/app/api/admin/users/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = 'RN_STATIC_SALT_2026';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = searchParams.get('all') ? null : 20;
    const offset = (page - 1) * (limit || 20);

    let rows;
    if (limit) {
      rows = await sql`
        SELECT id, name, email, mobile, city, state, organization, role, is_verified, created_at
        FROM users
        WHERE (name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT id, name, email, mobile, city, state, organization, role, is_verified, created_at
        FROM users
        WHERE (name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'})
        ORDER BY created_at DESC
      `;
    }
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

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { name, email, password, mobile, city, organization, role, isVerified } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
    }

    const hashed = hashPassword(password);

    const rows = await sql`
      INSERT INTO users (name, email, password_hash, mobile, city, organization, role, is_verified)
      VALUES (${name}, ${email}, ${hashed}, ${mobile || null}, ${city || null}, ${organization || null}, ${role}, ${isVerified ?? true})
      RETURNING id, name, email, role, is_verified
    `;
    return NextResponse.json({ user: rows[0] });
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
