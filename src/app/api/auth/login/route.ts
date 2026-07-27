// src/app/api/auth/login/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string): string {
  const salt = 'RN_STATIC_SALT_2026';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = await sql`
      SELECT id, name, email, mobile, city, state, organization, role, is_verified
      FROM users
      WHERE email = ${email.toLowerCase()} AND password_hash = ${hashPassword(password)}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];
    return NextResponse.json({ success: true, user });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
