// src/app/api/user/bookings/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

// Reserves `quantity` units of `ticketType` on `eventId` using optimistic
// concurrency control (compare-and-swap on the whole ticket_prices JSONB
// column), since the neon serverless HTTP driver doesn't give us row locks
// across separate statements. Returns null on success, or an error message.
async function reserveTickets(eventId: string, ticketType: string, quantity: number): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const rows = await sql`SELECT ticket_prices FROM events WHERE id = ${eventId}`;
    if (rows.length === 0) return 'Event not found.';

    const current = parseTicketPrices(rows[0].ticket_prices);
    const tierIndex = current.findIndex((t) => t.type === ticketType);
    if (tierIndex === -1) return 'Selected ticket tier is no longer available for this event.';

    const tier = current[tierIndex];
    if (tier.available < quantity) {
      return tier.available <= 0
        ? `${ticketType} is sold out.`
        : `Only ${tier.available} ${ticketType} pass(es) left — please lower your quantity.`;
    }

    const updated = current.map((t, i) => (i === tierIndex ? { ...t, available: t.available - quantity } : t));

    const result = await sql`
      UPDATE events SET ticket_prices = ${JSON.stringify(updated)}
      WHERE id = ${eventId} AND ticket_prices = ${JSON.stringify(current)}
      RETURNING id
    `;
    if (result.length > 0) return null; // reservation succeeded

    // Someone else wrote to ticket_prices in between — retry with fresh data.
  }
  return 'High demand right now — please try booking again.';
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const {
      eventId, userId, eventName, eventDate, eventVenue, eventBanner,
      visitorName, visitorEmail, visitorMobile, visitorCity,
      ticketType, quantity, totalAmount, specialRequests, paymentId, paymentMethod
    } = body;

    if (!eventId || !visitorName || !visitorEmail || !ticketType || !quantity) {
      return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 });
    }
    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1.' }, { status: 400 });
    }

    const reservationError = await reserveTickets(eventId, ticketType, quantity);
    if (reservationError) {
      return NextResponse.json({ error: reservationError }, { status: 409 });
    }

    const bookingRef = 'RN-BK-' + Math.floor(100000 + Math.random() * 900000);
    const qrHash = `RECHARGE-TICKET:${bookingRef}:${visitorEmail.toLowerCase()}`;

    const bookings = await sql`
      INSERT INTO ticket_bookings (
        booking_ref, event_id, user_id, event_name, event_date, event_venue, event_banner,
        visitor_name, visitor_email, visitor_mobile, visitor_city,
        ticket_type, quantity, total_amount, special_requests, payment_id, payment_method, status, qr_hash
      )
      VALUES (
        ${bookingRef}, ${eventId}, ${userId || null}, ${eventName}, ${eventDate || null}, ${eventVenue || null}, ${eventBanner || null},
        ${visitorName}, ${visitorEmail.toLowerCase()}, ${visitorMobile || null}, ${visitorCity || null},
        ${ticketType}, ${quantity}, ${totalAmount}, ${specialRequests || null}, ${paymentId || null}, ${paymentMethod || 'online'}, 'confirmed', ${qrHash}
      )
      RETURNING *
    `;

    console.log(`[EMAIL SMTP SIMULATOR] Sending Ticket Confirmation to ${visitorEmail} for booking ${bookingRef}`);

    return NextResponse.json({ success: true, booking: bookings[0] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
