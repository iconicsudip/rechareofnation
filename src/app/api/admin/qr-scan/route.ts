// src/app/api/admin/qr-scan/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const { qrHash, eventId, scannedBy, scannedByName } = body;

    if (!qrHash || !eventId) {
      return NextResponse.json({ result: 'denied', reason: 'Missing QR code or event selection.' }, { status: 400 });
    }

    // Check ticket bookings first
    const tickets = await sql`
      SELECT * FROM ticket_bookings WHERE qr_hash = ${qrHash}
    `;

    if (tickets.length > 0) {
      const ticket = tickets[0];

      if (ticket.event_id && ticket.event_id !== eventId) {
        return NextResponse.json({ result: 'denied', reason: 'This pass belongs to a different event.' });
      }

      const events = await sql`SELECT qr_stages FROM events WHERE id = ${ticket.event_id || eventId}`;
      let qrStages = [{ id: "entry", name: "Entry Gate", order: 1 }];
      if (events.length > 0 && Array.isArray(events[0].qr_stages)) {
        qrStages = events[0].qr_stages;
      }

      // Sort stages by order
      qrStages.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      const history = Array.isArray(ticket.scan_history) ? ticket.scan_history : [];
      
      // Auto-detect next stage
      let nextStage = null;
      for (const stage of qrStages) {
        if (!history.find((h: any) => h.stageId === stage.id)) {
          nextStage = stage;
          break;
        }
      }

      if (!nextStage) {
        // All stages scanned
        await sql`
          INSERT INTO qr_scan_logs (qr_hash, scan_type, scanned_by, scanned_by_name, attendee_name, event_name, result, reason)
          VALUES (${qrHash}, 'ticket', ${scannedBy}, ${scannedByName}, ${ticket.visitor_name}, ${ticket.event_name}, 'denied', 'All stages already passed')
        `;
        return NextResponse.json({
          result: 'denied',
          reason: `All stages have already been passed.`,
          attendee: { name: ticket.visitor_name, type: ticket.ticket_type, event: ticket.event_name }
        });
      }

      // Mark as scanned for this stage
      history.push({
        stageId: nextStage.id,
        stageName: nextStage.name,
        timestamp: new Date().toISOString(),
        scannedBy,
        scannedByName
      });

      await sql`
        UPDATE ticket_bookings SET scan_history = ${JSON.stringify(history)}::jsonb WHERE id = ${ticket.id}
      `;
      await sql`
        INSERT INTO qr_scan_logs (qr_hash, scan_type, stage_id, scanned_by, scanned_by_name, attendee_name, event_name, result)
        VALUES (${qrHash}, 'ticket', ${nextStage.id}, ${scannedBy}, ${scannedByName}, ${ticket.visitor_name}, ${ticket.event_name}, 'allowed')
      `;
      return NextResponse.json({
        result: 'allowed',
        type: 'ticket',
        reason: `Marked as passed for: ${nextStage.name}`,
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

      // Competitions don't have dynamic stages yet, use default "entry"
      const qrStages = [{ id: "entry", name: "Entry Gate", order: 1 }];
      const history = Array.isArray(reg.scan_history) ? reg.scan_history : [];
      
      let nextStage = null;
      for (const stage of qrStages) {
        if (!history.find((h: any) => h.stageId === stage.id)) {
          nextStage = stage;
          break;
        }
      }

      if (!nextStage) {
        return NextResponse.json({
          result: 'denied',
          reason: `All stages have already been passed.`,
          attendee: { name: reg.full_name, type: reg.category, event: reg.competition_name }
        });
      }

      history.push({
        stageId: nextStage.id,
        stageName: nextStage.name,
        timestamp: new Date().toISOString(),
        scannedBy,
        scannedByName
      });

      await sql`
        UPDATE competition_registrations SET scan_history = ${JSON.stringify(history)}::jsonb WHERE id = ${reg.id}
      `;
      await sql`
        INSERT INTO qr_scan_logs (qr_hash, scan_type, stage_id, scanned_by, scanned_by_name, attendee_name, event_name, result)
        VALUES (${qrHash}, 'registration', ${nextStage.id}, ${scannedBy}, ${scannedByName}, ${reg.full_name}, ${reg.competition_name}, 'allowed')
      `;
      return NextResponse.json({
        result: 'allowed',
        type: 'registration',
        reason: `Marked as passed for: ${nextStage.name}`,
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
