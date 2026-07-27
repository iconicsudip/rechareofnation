// src/app/api/admin/stats/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSchema();

    const [eventsRes, ticketsRes, registrationsRes, usersRes, revenueRes, recentRes] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM events WHERE is_active = true`,
      sql`SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_qty FROM ticket_bookings WHERE status = 'confirmed'`,
      sql`SELECT COUNT(*) as count, COUNT(CASE WHEN status='approved' THEN 1 END) as approved, COUNT(CASE WHEN status='pending' THEN 1 END) as pending FROM competition_registrations`,
      sql`SELECT COUNT(*) as count FROM users WHERE role = 'user'`,
      sql`SELECT COALESCE(SUM(total_amount), 0) as total FROM ticket_bookings WHERE status = 'confirmed'`,
      sql`
        SELECT 'ticket' as type, visitor_name as name, event_name, created_at, status FROM ticket_bookings
        UNION ALL
        SELECT 'registration' as type, full_name as name, competition_name as event_name, created_at, status FROM competition_registrations
        ORDER BY created_at DESC LIMIT 10
      `
    ]);

    return NextResponse.json({
      events: Number(eventsRes[0]?.count ?? 0),
      ticketsSold: Number(ticketsRes[0]?.total_qty ?? 0),
      ticketBookings: Number(ticketsRes[0]?.count ?? 0),
      registrations: Number(registrationsRes[0]?.count ?? 0),
      approvedRegistrations: Number(registrationsRes[0]?.approved ?? 0),
      pendingRegistrations: Number(registrationsRes[0]?.pending ?? 0),
      users: Number(usersRes[0]?.count ?? 0),
      revenue: Number(revenueRes[0]?.total ?? 0),
      recentActivity: recentRes,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
