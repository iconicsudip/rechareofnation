// src/app/api/admin/qr-scan/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { qrHash, scannedBy, scannedByName } = body;

    if (!qrHash) {
      return NextResponse.json({ result: 'denied', reason: 'Invalid QR code' }, { status: 400 });
    }

    // Check ticket bookings first
    const tickets = await sql`
      SELECT * FROM ticket_bookings WHERE qr_hash = ${qrHash}
    `;

    if (tickets.length > 0) {
      const ticket = tickets[0];

      if (ticket.scanned_at) {
        // Already scanned
        await sql`
          INSERT INTO qr_scan_logs (qr_hash, scan_type, scanned_by, scanned_by_name, attendee_name, event_name, result, reason)
          VALUES (${qrHash}, 'ticket', ${scannedBy}, ${scannedByName}, ${ticket.visitor_name}, ${ticket.event_name}, 'denied', 'Already scanned at ' || ${ticket.scanned_at})
        `;
        return NextResponse.json({
          result: 'denied',
          reason: `Already scanned at ${new Date(ticket.scanned_at).toLocaleString()}`,
          attendee: { name: ticket.visitor_name, type: ticket.ticket_type, event: ticket.event_name }
        });
      }

      // Mark as scanned
      await sql`
        UPDATE ticket_bookings SET scanned_at = NOW(), scanned_by = ${scannedBy} WHERE id = ${ticket.id}
      `;
      await sql`
        INSERT INTO qr_scan_logs (qr_hash, scan_type, scanned_by, scanned_by_name, attendee_name, event_name, result)
        VALUES (${qrHash}, 'ticket', ${scannedBy}, ${scannedByName}, ${ticket.visitor_name}, ${ticket.event_name}, 'allowed')
      `;
      return NextResponse.json({
        result: 'allowed',
        type: 'ticket',
        attendee: {
          name: ticket.visitor_name,
          email: ticket.visitor_email,
          type: ticket.ticket_type,
          quantity: ticket.quantity,
          event: ticket.event_name,
          date: ticket.event_date,
          venue: ticket.event_venue,
          bookingRef: ticket.booking_ref,
        }
      });
    }

    // Check competition registrations
    const regs = await sql`
      SELECT * FROM competition_registrations WHERE qr_hash = ${qrHash}
    `;

    if (regs.length > 0) {
      const reg = regs[0];

      if (reg.status !== 'approved') {
        await sql`
          INSERT INTO qr_scan_logs (qr_hash, scan_type, scanned_by, scanned_by_name, attendee_name, event_name, result, reason)
          VALUES (${qrHash}, 'registration', ${scannedBy}, ${scannedByName}, ${reg.full_name}, ${reg.competition_name}, 'denied', 'Registration status: ' || ${reg.status})
        `;
        return NextResponse.json({
          result: 'denied',
          reason: `Registration not approved (status: ${reg.status})`,
          attendee: { name: reg.full_name, type: reg.category, event: reg.competition_name }
        });
      }

      if (reg.scanned_at) {
        return NextResponse.json({
          result: 'denied',
          reason: `Already scanned at ${new Date(reg.scanned_at).toLocaleString()}`,
          attendee: { name: reg.full_name, type: reg.category, event: reg.competition_name }
        });
      }

      await sql`
        UPDATE competition_registrations SET scanned_at = NOW(), scanned_by = ${scannedBy} WHERE id = ${reg.id}
      `;
      await sql`
        INSERT INTO qr_scan_logs (qr_hash, scan_type, scanned_by, scanned_by_name, attendee_name, event_name, result)
        VALUES (${qrHash}, 'registration', ${scannedBy}, ${scannedByName}, ${reg.full_name}, ${reg.competition_name}, 'allowed')
      `;
      return NextResponse.json({
        result: 'allowed',
        type: 'registration',
        attendee: {
          name: reg.full_name,
          email: reg.email,
          type: reg.category,
          event: reg.competition_name,
          date: reg.competition_date,
          venue: reg.competition_venue,
          participantId: reg.participant_id,
        }
      });
    }

    // Not found
    await sql`
      INSERT INTO qr_scan_logs (qr_hash, scan_type, scanned_by, scanned_by_name, attendee_name, event_name, result, reason)
      VALUES (${qrHash}, 'unknown', ${scannedBy}, ${scannedByName}, 'Unknown', 'Unknown', 'denied', 'QR code not found in database')
    `;
    return NextResponse.json({ result: 'denied', reason: 'QR code not found. This pass is invalid.' }, { status: 404 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
