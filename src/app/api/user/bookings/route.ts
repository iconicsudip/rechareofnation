// src/app/api/user/bookings/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
