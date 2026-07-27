// src/app/api/user/registrations/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const body = await request.json();
    const {
      competitionId, competitionName, competitionDate, competitionVenue, competitionBanner,
      userId, fullName, dob, age, gender, email, mobile, city, state, address,
      organization, category, emergencyContact, uploads, paymentId, paymentStatus
    } = body;

    if (!competitionName || !fullName || !email || !category) {
      return NextResponse.json({ error: 'Missing required registration details' }, { status: 400 });
    }

    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const categoryCode = category.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const participantId = `RN-2026-${categoryCode}-${randDigits}`;
    const qrHash = `RECHARGE-COMPETITOR:${participantId}:${email.toLowerCase()}`;

    const registrations = await sql`
      INSERT INTO competition_registrations (
        participant_id, competition_id, competition_name, competition_date, competition_venue, competition_banner,
        user_id, full_name, dob, age, gender, email, mobile, city, state, address,
        organization, category, emergency_contact, uploads, payment_id, payment_status, status, qr_hash
      )
      VALUES (
        ${participantId}, ${competitionId || null}, ${competitionName}, ${competitionDate || null}, ${competitionVenue || null}, ${competitionBanner || null},
        ${userId || null}, ${fullName}, ${dob || null}, ${age || null}, ${gender || null}, ${email.toLowerCase()}, ${mobile || null}, ${city || null}, ${state || null}, ${address || null},
        ${organization || null}, ${category}, ${emergencyContact || null}, ${JSON.stringify(uploads || {})}, ${paymentId || null}, ${paymentStatus || 'unpaid'}, 'pending', ${qrHash}
      )
      RETURNING *
    `;

    console.log(`[EMAIL SMTP SIMULATOR] Registration created for ${fullName} (${participantId})`);

    return NextResponse.json({ success: true, registration: registrations[0] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    if (!userId && !email) return NextResponse.json({ error: 'userId or email required' }, { status: 400 });

    const registrations = await sql`
      SELECT * FROM competition_registrations 
      WHERE (${userId}::TEXT IS NOT NULL AND user_id = ${userId})
         OR (${email}::TEXT IS NOT NULL AND email = ${email?.toLowerCase()})
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ registrations });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
