// src/app/api/auth/register/route.ts
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
    const { name, email, password, mobile, city, state, address, organization } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email address already registered' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    // No email-verification step — accounts are usable immediately after
    // registration (there's no real SMTP sending configured, so gating
    // login behind an emailed code would just lock users out).
    const users = await sql`
      INSERT INTO users (name, email, password_hash, mobile, city, state, address, organization, is_verified)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, ${mobile || null}, ${city || null}, ${state || null}, ${address || null}, ${organization || null}, true)
      RETURNING id, name, email, mobile, city, state, organization, role, is_verified
    `;

    return NextResponse.json({ success: true, user: users[0] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
