// seed-test.js
// Standalone script to seed dummy event, booking, and registration for integration testing

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.local
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const matches = envContent.match(/DATABASE_URL=['"]?([^'"\r\n]+)['"]?/);
    if (matches && matches[1]) {
      dbUrl = matches[1];
    }
  } catch (err) {
    console.error("Could not read .env.local file:", err.message);
  }
}

if (!dbUrl) {
  console.error("DATABASE_URL is not defined in environment or .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);

async function run() {
  console.log("Connecting to database and seeding test integration data...");

  try {
    // 1. Create a dummy event
    const eventId = 'ev-test-999';
    const eventSlug = 'global-tech-summit-2026';
    const eventName = 'Global Tech & Startup Summit 2026';
    const eventDate = '2026-08-20';
    const eventVenue = 'Hall 5, Pragati Maidan';
    const eventCity = 'New Delhi';

    // Delete existing test event/bookings if any to ensure clean run
    await sql`DELETE FROM ticket_bookings WHERE event_id = ${eventId}`;
    await sql`DELETE FROM competition_registrations WHERE competition_id = ${eventId}`;
    await sql`DELETE FROM events WHERE id = ${eventId}`;

    const ticketPrices = [
      { type: 'General Entry', price: 499, available: 100, description: 'Access to main exhibition' },
      { type: 'VIP Pass', price: 1499, available: 50, description: 'Reserved seating and food coupon' }
    ];

    const organizer = {
      name: 'Recharge Tech Committee',
      contact: 'Aarav Mehta',
      email: 'tech@rechargenation.in',
      phone: '+91 99999 88888'
    };

    console.log(`Inserting event: ${eventName}...`);
    await sql`
      INSERT INTO events (id, name, slug, category, description, summary, banner_url, event_date, event_time, venue, city, is_featured, is_upcoming, ticket_prices, organizer)
      VALUES (
        ${eventId}, 
        ${eventName}, 
        ${eventSlug}, 
        'Startup Conference', 
        ${'The premier conference for tech startups, venture capitalists, developers and founders in South Asia.'}, 
        ${"South Asia's largest technology and startup trade convention of 2026."}, 
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80', 
        ${eventDate}, 
        '10:00', 
        ${eventVenue}, 
        ${eventCity}, 
        true, 
        true, 
        ${JSON.stringify(ticketPrices)}, 
        ${JSON.stringify(organizer)}
      )
    `;

    // 2. Create a dummy ticket booking
    const bookingRef = 'RN-BK-TEST777';
    const visitorEmail = 'testuser@rechargenation.in';
    const visitorName = 'Aryan Kapoor';
    const ticketType = 'VIP Pass';
    const qrHashTicket = `RECHARGE-TICKET:${bookingRef}:${visitorEmail}`;

    console.log(`Inserting ticket booking: ${bookingRef}...`);
    await sql`
      INSERT INTO ticket_bookings (
        booking_ref, event_id, event_name, event_date, event_venue, event_banner,
        visitor_name, visitor_email, visitor_mobile, visitor_city,
        ticket_type, quantity, total_amount, payment_id, status, qr_hash
      )
      VALUES (
        ${bookingRef}, 
        ${eventId}, 
        ${eventName}, 
        ${eventDate}, 
        ${eventVenue}, 
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
        ${visitorName}, 
        ${visitorEmail}, 
        '+91 98765 00000', 
        ${eventCity},
        ${ticketType}, 
        1, 
        1499.00, 
        'pay_mock_777', 
        'confirmed', 
        ${qrHashTicket}
      )
    `;

    // 3. Create a dummy competition registration
    const participantId = 'RN-2026-TECH-777';
    const qrHashReg = `RECHARGE-COMPETITOR:${participantId}:${visitorEmail}`;

    console.log(`Inserting competition registration: ${participantId}...`);
    await sql`
      INSERT INTO competition_registrations (
        participant_id, competition_id, competition_name, competition_date, competition_venue,
        full_name, email, mobile, city, state, organization, category, emergency_contact,
        payment_status, status, qr_hash
      )
      VALUES (
        ${participantId}, 
        ${eventId}, 
        ${eventName}, 
        ${eventDate}, 
        ${eventVenue},
        ${visitorName}, 
        ${visitorEmail}, 
        '+91 98765 00000', 
        ${eventCity}, 
        'Delhi', 
        'IIT Delhi', 
        'AI Hackathon', 
        'Emergency Contact: +91 98765 11111', 
        'paid', 
        'approved', 
        ${qrHashReg}
      )
    `;

    console.log("\n==================================================");
    console.log("🎉 Test Integration Data Seeded Successfully!");
    console.log("==================================================");
    console.log(`Event details page URL: http://localhost:3000/events/${eventSlug}`);
    console.log("--------------------------------------------------");
    console.log("For testing QR Validation on Scanner (/admin/scanner):");
    console.log(`1. Ticket Booking QR Code Hash:`);
    console.log(`   --> ${qrHashTicket}`);
    console.log(`2. Competition Pass QR Code Hash:`);
    console.log(`   --> ${qrHashReg}`);
    console.log("==================================================\n");

  } catch (err) {
    console.error("Database seed failed:", err.message);
  }
}

run();
