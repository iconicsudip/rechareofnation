// src/app/api/user/profile/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { userId, name, mobile, city, state, organization } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const users = await sql`
      UPDATE users SET
        name = COALESCE(${name || null}, name),
        mobile = COALESCE(${mobile || null}, mobile),
        city = COALESCE(${city || null}, city),
        state = COALESCE(${state || null}, state),
        organization = COALESCE(${organization || null}, organization)
      WHERE id = ${userId}
      RETURNING id, name, email, mobile, city, state, organization, role, is_verified
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: users[0] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
