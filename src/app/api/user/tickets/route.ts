// src/app/api/user/tickets/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    if (!userId && !email) return NextResponse.json({ error: 'userId or email required' }, { status: 400 });

    const tickets = await sql`
      SELECT * FROM ticket_bookings 
      WHERE (${userId}::TEXT IS NOT NULL AND user_id = ${userId}) 
         OR (${email}::TEXT IS NOT NULL AND visitor_email = ${email?.toLowerCase()})
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ tickets });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
