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

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = hashPassword(password);

    const users = await sql`
      INSERT INTO users (name, email, password_hash, mobile, city, state, address, organization, is_verified, verification_code)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, ${mobile || null}, ${city || null}, ${state || null}, ${address || null}, ${organization || null}, false, ${verificationCode})
      RETURNING id, name, email, mobile, city, state, organization, role, is_verified
    `;

    console.log(`[EMAIL SMTP SIMULATOR] Verification code for ${email} is ${verificationCode}`);

    return NextResponse.json({ success: true, user: users[0], verificationCode });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
