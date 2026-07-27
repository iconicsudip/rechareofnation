// src/app/api/admin/competitions/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const competitions = await sql`SELECT * FROM competitions ORDER BY created_at DESC`;
  return NextResponse.json({ competitions });
}

export async function POST(request: NextRequest) {
  await ensureSchema();
  const body = await request.json();
  const {
    name, slug, description, summary, bannerUrl, eventDate, deadline, venue, city,
    prizePool, registrationFee, categories, rules, judges, faqs, regionalHubs, organizer,
  } = body;
  if (!name || !slug) return NextResponse.json({ error: 'name and slug required' }, { status: 400 });

  const id = 'comp-' + Date.now();
  const [competition] = await sql`
    INSERT INTO competitions (id, name, slug, description, summary, banner_url, event_date, deadline, venue, city, prize_pool, registration_fee, categories, rules, judges, faqs, regional_hubs, organizer)
    VALUES (${id}, ${name}, ${slug}, ${description || ''}, ${summary || ''}, ${bannerUrl || ''}, ${eventDate || null}, ${deadline || null}, ${venue || ''}, ${city || ''}, ${prizePool || ''}, ${registrationFee ?? 0}, ${JSON.stringify(categories ?? [])}, ${JSON.stringify(rules ?? [])}, ${JSON.stringify(judges ?? [])}, ${JSON.stringify(faqs ?? [])}, ${JSON.stringify(regionalHubs ?? [])}, ${JSON.stringify(organizer ?? {})})
    RETURNING *
  `;
  return NextResponse.json({ success: true, competition }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  await ensureSchema();
  const body = await request.json();
  const {
    id, name, slug, description, summary, bannerUrl, eventDate, deadline, venue, city,
    prizePool, registrationFee, categories, rules, judges, faqs, regionalHubs, organizer, isActive,
  } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const [competition] = await sql`
    UPDATE competitions SET
      name = ${name}, slug = ${slug}, description = ${description || ''}, summary = ${summary || ''},
      banner_url = ${bannerUrl || ''}, event_date = ${eventDate || null}, deadline = ${deadline || null},
      venue = ${venue || ''}, city = ${city || ''}, prize_pool = ${prizePool || ''},
      registration_fee = ${registrationFee ?? 0}, categories = ${JSON.stringify(categories ?? [])},
      rules = ${JSON.stringify(rules ?? [])}, judges = ${JSON.stringify(judges ?? [])},
      faqs = ${JSON.stringify(faqs ?? [])}, regional_hubs = ${JSON.stringify(regionalHubs ?? [])},
      organizer = ${JSON.stringify(organizer ?? {})}, is_active = ${isActive ?? true}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, competition });
}

export async function DELETE(request: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await sql`UPDATE competitions SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
