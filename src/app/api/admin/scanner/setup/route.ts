// src/app/api/admin/scanner/setup/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = verifyAdminSession(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let events;
    if (session.role === 'admin') {
      // Admins get all active events
      events = await sql`
        SELECT id, name, qr_stages FROM events WHERE is_active = true ORDER BY event_date DESC
      `;
    } else {
      // Scanners/Coordinators get events they are assigned to
      events = await sql`
        SELECT e.id, e.name, e.qr_stages 
        FROM events e
        JOIN event_assigners a ON e.id = a.event_id
        WHERE a.user_id = ${session.id} AND e.is_active = true AND a.is_active = true
        ORDER BY e.event_date DESC
      `;
    }

    return NextResponse.json({ events });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
