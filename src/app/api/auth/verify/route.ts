// src/app/api/auth/verify/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json({ error: 'User ID and code are required' }, { status: 400 });
    }

    const users = await sql`
      SELECT id, verification_code FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (users[0].verification_code !== code) {
      return NextResponse.json({ error: 'Incorrect verification code. Please check simulator log/console.' }, { status: 400 });
    }

    // Set verified = true
    const updated = await sql`
      UPDATE users SET is_verified = true, verification_code = null
      WHERE id = ${userId}
      RETURNING id, name, email, mobile, city, state, organization, role, is_verified
    `;

    return NextResponse.json({ success: true, user: updated[0] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
