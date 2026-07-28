// src/app/api/admin/events/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    const events = await sql`
      SELECT * FROM events
      WHERE is_active = true
        AND (name ILIKE ${'%' + search + '%'} OR city ILIKE ${'%' + search + '%'} OR category ILIKE ${'%' + search + '%'})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = await sql`
      SELECT COUNT(*) as count FROM events WHERE is_active = true
        AND (name ILIKE ${'%' + search + '%'} OR city ILIKE ${'%' + search + '%'} OR category ILIKE ${'%' + search + '%'})
    `;
    return NextResponse.json({ events, total: Number(total[0].count) });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const {
      name, slug, category, description, summary, bannerUrl,
      eventDate, eventTime, venue, city, googleMapUrl,
      isFeatured, isUpcoming, ticketPrices, organizer, rating, reviewCount,
      sponsorshipTiers, stallOptions, adRates, dateIsTentative,
      headliners, faqs, scheduleDays
    } = body;

    const events = await sql`
      INSERT INTO events (name, slug, category, description, summary, banner_url, event_date, event_time, venue, city, google_map_url, is_featured, is_upcoming, ticket_prices, organizer, rating, review_count, sponsorship_tiers, stall_options, ad_rates, date_is_tentative, headliners, faqs, schedule_days)
      VALUES (${name}, ${slug}, ${category}, ${description}, ${summary}, ${bannerUrl}, ${eventDate}, ${eventTime}, ${venue}, ${city}, ${googleMapUrl}, ${isFeatured ?? false}, ${isUpcoming ?? true}, ${JSON.stringify(ticketPrices ?? [])}, ${JSON.stringify(organizer ?? {})}, ${rating ?? 4.6}, ${reviewCount ?? 25}, ${JSON.stringify(sponsorshipTiers ?? [])}, ${JSON.stringify(stallOptions ?? [])}, ${JSON.stringify(adRates ?? [])}, ${dateIsTentative ?? false}, ${JSON.stringify(headliners ?? [])}, ${JSON.stringify(faqs ?? [])}, ${JSON.stringify(scheduleDays ?? [])})
      RETURNING *
    `;
    return NextResponse.json({ event: events[0] }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const {
      id, name, category, description, summary, bannerUrl, eventDate, eventTime, venue, city,
      googleMapUrl, isFeatured, isUpcoming, ticketPrices, organizer, rating, reviewCount,
      sponsorshipTiers, stallOptions, adRates, dateIsTentative,
      headliners, faqs, scheduleDays
    } = body;

    const events = await sql`
      UPDATE events SET
        name = ${name}, category = ${category}, description = ${description},
        summary = ${summary}, banner_url = ${bannerUrl}, event_date = ${eventDate},
        event_time = ${eventTime}, venue = ${venue}, city = ${city},
        google_map_url = ${googleMapUrl ?? ''},
        is_featured = ${isFeatured}, is_upcoming = ${isUpcoming},
        ticket_prices = ${JSON.stringify(ticketPrices ?? [])},
        organizer = ${JSON.stringify(organizer ?? {})},
        rating = ${rating ?? 4.6}, review_count = ${reviewCount ?? 25},
        sponsorship_tiers = ${JSON.stringify(sponsorshipTiers ?? [])},
        stall_options = ${JSON.stringify(stallOptions ?? [])},
        ad_rates = ${JSON.stringify(adRates ?? [])},
        date_is_tentative = ${dateIsTentative ?? false},
        headliners = ${JSON.stringify(headliners ?? [])},
        faqs = ${JSON.stringify(faqs ?? [])},
        schedule_days = ${JSON.stringify(scheduleDays ?? [])},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json({ event: events[0] });
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
    await sql`UPDATE events SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
