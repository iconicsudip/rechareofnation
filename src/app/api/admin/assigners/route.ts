// src/app/api/admin/assigners/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || '';

    const rows = await sql`
      SELECT * FROM event_assigners
      WHERE (${eventId} = '' OR event_id = ${eventId})
        AND is_active = true
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ assigners: rows });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { eventId, eventName, userId, userName, userEmail, assignerRole, assignedBy } = body;

    // Check duplicate
    const existing = await sql`
      SELECT id FROM event_assigners WHERE event_id = ${eventId} AND user_id = ${userId} AND is_active = true
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'User already assigned to this event' }, { status: 409 });
    }

    const rows = await sql`
      INSERT INTO event_assigners (event_id, event_name, user_id, user_name, user_email, assigner_role, assigned_by)
      VALUES (${eventId}, ${eventName}, ${userId}, ${userName}, ${userEmail}, ${assignerRole}, ${assignedBy})
      RETURNING *
    `;
    return NextResponse.json({ assigner: rows[0] }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await sql`UPDATE event_assigners SET is_active = false WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
