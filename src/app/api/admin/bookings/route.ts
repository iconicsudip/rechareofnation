// src/app/api/admin/bookings/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const rows = await sql`
      SELECT * FROM ticket_bookings
      WHERE (${status} = '' OR status = ${status})
        AND (visitor_name ILIKE ${'%' + search + '%'} OR visitor_email ILIKE ${'%' + search + '%'}
          OR event_name ILIKE ${'%' + search + '%'} OR booking_ref ILIKE ${'%' + search + '%'})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`
      SELECT COUNT(*) as count FROM ticket_bookings
      WHERE (${status} = '' OR status = ${status})
        AND (visitor_name ILIKE ${'%' + search + '%'} OR visitor_email ILIKE ${'%' + search + '%'}
          OR event_name ILIKE ${'%' + search + '%'} OR booking_ref ILIKE ${'%' + search + '%'})
    `;
    return NextResponse.json({ bookings: rows, total: Number(total[0].count) });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

interface TicketPriceRow {
  [key: string]: unknown;
  type: string;
  price: number;
  available: number;
  description?: string;
}

const parseTicketPrices = (value: unknown): TicketPriceRow[] => {
  if (Array.isArray(value)) return value as TicketPriceRow[];
  try { return JSON.parse((value as string) || '[]'); } catch { return []; }
};

// Mirrors the optimistic-concurrency reservation pattern in
// api/user/bookings/route.ts, in reverse — restores `quantity` units of
// `ticketType` back onto the event when a confirmed booking is cancelled.
async function restockTickets(eventId: string, ticketType: string, quantity: number): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const rows = await sql`SELECT ticket_prices FROM events WHERE id = ${eventId}`;
    if (rows.length === 0) return; // event was deleted — nothing to restock

    const current = parseTicketPrices(rows[0].ticket_prices);
    const tierIndex = current.findIndex((t) => t.type === ticketType);
    if (tierIndex === -1) return; // tier renamed/removed since booking — can't restock safely

    const updated = current.map((t, i) => (i === tierIndex ? { ...t, available: t.available + quantity } : t));

    const result = await sql`
      UPDATE events SET ticket_prices = ${JSON.stringify(updated)}
      WHERE id = ${eventId} AND ticket_prices = ${JSON.stringify(current)}
      RETURNING id
    `;
    if (result.length > 0) return;
    // lost the race to a concurrent write — retry with fresh data
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const existingRows = await sql`SELECT * FROM ticket_bookings WHERE id = ${id}`;
    const existing = existingRows[0];
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const rows = await sql`
      UPDATE ticket_bookings SET status = ${status} WHERE id = ${id} RETURNING *
    `;

    // Cancelling a booking that was actually holding inventory (confirmed, not
    // already cancelled) frees those passes back up for other visitors.
    if (status === 'cancelled' && existing.status !== 'cancelled') {
      await restockTickets(existing.event_id, existing.ticket_type, existing.quantity);
    }

    return NextResponse.json({ booking: rows[0] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
