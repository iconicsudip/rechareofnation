// src/app/api/auth/admin-login/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { signAdminSession, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from '@/lib/auth';

function hashPassword(password: string): string {
  const salt = 'RN_STATIC_SALT_2026';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const users = await sql`
      SELECT id, name, email, role, is_verified FROM users
      WHERE email = ${email}
        AND password_hash = ${hashPassword(password)}
        AND role IN ('admin', 'scanner', 'coordinator')
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials or insufficient permissions' }, { status: 401 });
    }

    const user = users[0] as { id: string; email: string; name: string; role: string };
    const token = signAdminSession(user);
    const response = NextResponse.json({ success: true, user });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
    return response;
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
