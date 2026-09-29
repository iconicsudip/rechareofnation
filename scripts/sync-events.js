const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function syncAllEvents() {
  console.log('Synchronizing all 9 events with exact user handwritten notes and posters...');

  // 1. Traditional India Classical Dance Competition
  await sql`
    UPDATE events
    SET 
      name = 'Traditional India Classical Dance Competition',
      event_date = '2026-12-16',
      event_time = '10:00 AM - 08:00 PM',
      venue = 'National Heritage Auditorium',
      city = 'Udaipur & Pan-India',
      category = 'Classical Performing Arts',
      summary = 'Nationwide Classical Dance Competition (16 & 17 December) featuring solo and group categories with prominent jury panels and national trophy honors.',
      description = '<h3>About Traditional India Classical Dance Competition</h3><p>Traditional India is a nationwide competitive stage dedicated to celebrating the purity, discipline, and aesthetic magnificence of Indian classical dance. Taking place on <strong>16 & 17 December</strong>, this flagship festival invites exceptional classical prodigies and esteemed dance academies from every state in India.</p><h3>Competitive Categories</h3><ul><li><strong>Solo Classical:</strong> Kathak, Bharatanatyam, Odissi, Kuchipudi, Manipuri, Mohiniyattam</li><li><strong>Duet Classical:</strong> Synchronized classical duets & Jugalbandi</li><li><strong>Group Choreography:</strong> Classical group spectacles and mythological narrative presentations</li></ul><h3>Age Divisions</h3><ul><li>Sub-Junior (Ages 6 to 11)</li><li>Junior (Ages 12 to 17)</li><li>Senior & Open (Ages 18+)</li></ul><h3>Jury & Honors</h3><p>Judged by Sangeet Natak Akademi awardees, national dance gurus, and senior exponents. Winners receive prestigious national trophies, merit certificates, cash honorariums from a ₹5,00,000 prize pool, and sponsored performance slots in our international tours.</p>',
      ticket_prices = ${JSON.stringify([
        { tier: "Audience Daily Pass", price: 499, description: "General admission to all competitive battle rounds for one day" },
        { tier: "2-Day Championship Pass", price: 899, description: "Full 2-day access to all rounds and evening felicitation ceremonies" },
        { tier: "VVIP Patron & Guru Circle Pass", price: 1999, description: "Front-row priority seating, judge lounge reception, and festival souvenir kit" }
      ])}::jsonb,
      event_sections = ${JSON.stringify([
        { id: "exhibit", type: "exhibit", label: "Competition Rules", enabled: true },
        { id: "visit", type: "visit", label: "Audience Guide", enabled: true },
        { id: "gallery", type: "gallery", label: "Gallery", enabled: true },
        { id: "book_space", type: "book_space", label: "Book Passes", enabled: true },
        { id: "sponsorship", type: "sponsorship", label: "Sponsorship", enabled: true }
      ])}::jsonb,
      sponsorship_tiers = ${JSON.stringify([
        { tier: "Title Presenter", amount: "₹5,00,000", benefits: "Title branding across main stage, all certificates, trophies, and broadcast promo" },
        { tier: "Powered By", amount: "₹2,50,000", benefits: "Co-branding on tickets, lanyards, stage backdrops, and judge felicitation" },
        { tier: "Associate Partner", amount: "₹1,00,000", benefits: "Auditorium side banners, social media shoutouts, and 10 VIP passes" }
      ])}::jsonb
    WHERE slug = 'traditional-india-classical-dance';
  `;
  console.log('✅ Updated Traditional India');

  // 2. Udaipur Hospitality, Catering & Food Festival (Food Expo)
  await sql`
    UPDATE events
    SET 
      name = 'Udaipur Hospitality, Catering & Food Festival (Food Expo 2027)',
      event_date = '2027-01-06',
      event_time = '10:00 AM - 07:00 PM',
      venue = 'The Lalit / Shikarbadi Grounds, Udaipur',
      city = 'Udaipur, Rajasthan',
      category = 'Hospitality Conclaves',
      summary = '3rd Edition of Udaipur premier hospitality, catering, tourism and food festival (6, 7 & 8 January 2027) uniting culinary masters, 18 exhibitor sectors, and 16 visitor profiles.',
      ticket_prices = ${JSON.stringify([
        { tier: "Trade Visitor Pass (Free B2B Entry)", price: 0, description: "Complimentary access for caterers, hoteliers, restaurant owners, and trade buyers" },
        { tier: "All-Access 3-Day Conclave Pass", price: 499, description: "Full access to all expo halls, culinary masterclasses, and HoReCa business seminars" },
        { tier: "VIP Delegate & Networking Pass", price: 1999, description: "VIP lounge access, Buyer-Seller private meetings, and evening cultural gala dinner" }
      ])}::jsonb,
      date_is_tentative = false
    WHERE slug = 'udaipur-hospitality-catering-tourism-food-festival-2025';
  `;
  console.log('✅ Updated Udaipur Hospitality, Catering & Food Festival (Food Expo 2027)');

  // 3. Global Educational & EduTech Conclave
  await sql`
    UPDATE events
    SET 
      name = 'Global Educational & EduTech Conclave 2026',
      event_date = '2026-12-18',
      event_time = '09:30 AM - 06:00 PM',
      venue = 'City Palace Convention Hall',
      city = 'Udaipur, Rajasthan',
      category = 'Educational Summits',
      summary = 'Global Educational & EduTech Conclave (December 2026) uniting visionaries, educators, innovators, and edtech leaders to shape the future of learning.',
      description = '<p>Join us at the Global Education Edutech Conclave 2026, where visionaries, university chancellors, school principals, edtech innovators, and policymakers convene to shape the future of learning in India and abroad.</p><h3>Highlights of the Conclave</h3><ul><li>Interactive Panel Discussions on NEP 2020 and AI integration in schools</li><li>Keynote Sessions by Global Education Thought Leaders</li><li>National Education &amp; EdTech Innovation Awards</li><li>B2B Networking with Institutional Procurement Heads</li><li>Showcase of Next-Gen Classroom Tech, LMS, STEM, and Robotic Kits</li></ul><h3>Target Audience</h3><p>School Chairpersons, College Trustees, EduTech Startups, Curriculum Developers, Teachers, and EdTech Investors.</p>',
      ticket_prices = ${JSON.stringify([
        { tier: "Educator & Academic Delegate Pass", price: 999, description: "Access to all conference tracks, keynote panels, and delegate networking lunch" },
        { tier: "EdTech VIP & Awards Gala Pass", price: 2999, description: "Priority auditorium seating, VIP roundtable lounge, and admission to Education Awards Dinner" }
      ])}::jsonb,
      event_sections = ${JSON.stringify([
        { id: "exhibit", type: "exhibit", label: "Exhibit", enabled: true },
        { id: "visit", type: "visit", label: "Visit", enabled: true },
        { id: "gallery", type: "gallery", label: "Gallery", enabled: true },
        { id: "view_pdf", type: "pdf", label: "View PDF", enabled: true },
        { id: "book_space", type: "book_space", label: "Book Passes", enabled: true },
        { id: "sponsorship", type: "sponsorship", label: "Sponsorship", enabled: true }
      ])}::jsonb
    WHERE slug = 'global-educational-edutech-conclave';
  `;
  console.log('✅ Updated Global Educational & EduTech Conclave');

  // 4. International Kathak Festival Udaipur
  await sql`
    UPDATE events
    SET 
      name = 'International Kathak Festival – Udaipur 2027',
      event_date = '2027-02-12',
      event_time = '05:30 PM - 10:00 PM',
      venue = 'City Palace / Shilpgram Courtyards',
      city = 'Udaipur, Rajasthan',
      category = 'Cultural Programs',
      summary = 'A Global Celebration of Indian Classical Dance, Kathak Gharanas, Instrumental Symphonies & Vocal Heritage (February 2027).',
      ticket_prices = ${JSON.stringify([
        { tier: "General Evening Concert Pass", price: 499, description: "Access to the open-air heritage amphitheatre for one evening concert" },
        { tier: "3-Day Festival Classical Pass", price: 1299, description: "Access to all 3 evening recitals across Shilpgram and City Palace courtyards" },
        { tier: "Royal Patron VIP Pass", price: 3499, description: "Front-row Royal Baithak seating, artist lounge meet & greet, and royal souvenir kit" }
      ])}::jsonb
    WHERE slug = 'international-kathak-festival-udaipur-2025';
  `;
  console.log('✅ Updated International Kathak Festival');

  // 5. Udaipur Destination Weddings – Event Saga
  await sql`
    UPDATE events
    SET 
      name = 'Udaipur Destination Weddings – Event Saga Curations',
      event_date = '2026-11-15',
      event_time = 'Regular / Year-Round',
      venue = 'Heritage Palaces & Lakefront Resorts',
      city = 'Udaipur, Rajasthan',
      category = 'Destination Weddings',
      summary = 'Regular Luxury Curations & Bespoke Palace Weddings in collaboration with Event Saga & Tanveer Ji.',
      description = '<h3>Royal Destination Weddings in the City of Lakes</h3><p>Executed in high-touch collaboration with <strong>Event Saga & Tanveer Ji</strong>, Recharge Nation delivers turnkey royal destination wedding management across Udaipur palace and lakefront venues.</p><h3>Partner Palace Venues</h3><ul><li>Jagmandir Island Palace & The City Palace, Udaipur</li><li>The Oberoi Udaivilas & The Leela Palace</li><li>Fateh Garh, Chunda Palace & Shikarbadi</li></ul><h3>Complete Curated Services</h3><ul><li>Turnkey Royal Production & Thematic Mandap Architecture</li><li>Lake Pichola Royal Boat Processions & Fireworks</li><li>Celebrity Artists, Sangeet Choreographers & Royal Bands</li><li>HNI Guest Hospitality, Chauffeur Fleets & Luxury Concierge</li></ul>',
      ticket_prices = ${JSON.stringify([
        { tier: "Wedding Consultation Appointment", price: 0, description: "Complimentary one-on-one session with our senior palace wedding architects" },
        { tier: "Planner & Vendor Showcase Pass", price: 4999, description: "Annual trade access for luxury wedding vendors, decor artisans, and caterers" }
      ])}::jsonb,
      event_sections = ${JSON.stringify([
        { id: "exhibit", type: "exhibit", label: "Palace Venues", enabled: true },
        { id: "visit", type: "visit", label: "Curated Services", enabled: true },
        { id: "gallery", type: "gallery", label: "Royal Gallery", enabled: true },
        { id: "book_space", type: "book_space", label: "Inquire Now", enabled: true },
        { id: "sponsorship", type: "sponsorship", label: "Partnerships", enabled: true }
      ])}::jsonb
    WHERE slug = 'udaipur-destination-weddings-event-saga';
  `;
  console.log('✅ Updated Udaipur Destination Weddings');

  // 6. International Classic Dance Festival (London + Dubai)
  await sql`
    UPDATE events
    SET 
      name = 'International Classic Dance Festival (London + Dubai Tour 2027)',
      event_date = '2027-03-20',
      event_time = '06:00 PM - 09:30 PM',
      venue = 'Cadogan Hall (London) & Dubai Opera (Dubai)',
      city = 'London & Dubai',
      category = 'International Cultural Tour',
      summary = 'Cross-Continental Cultural Tour (March 2027) presenting Indian Classical Dance across iconic world stages in London and Dubai.',
      description = '<h3>A Cross-Continental Cultural Tour</h3><p>The International Classic Dance Festival takes India classical dance to global metropolises. Featuring an elite troupe of master dancers, instrumental virtuosos, and choreographers touring iconic world stages in <strong>London and Dubai</strong> during <strong>March 2027</strong>.</p><h3>Tour Itinerary</h3><ul><li><strong>London:</strong> Cadogan Hall, Chelsea — Gala Evening with British-Indian Cultural Society</li><li><strong>Dubai:</strong> Dubai Opera Main Auditorium — Grand Middle East Cultural Showcase</li></ul><h3>Repertoire</h3><p>Features authentic renditions of Kathak, Bharatanatyam, Odissi, and fusion jugalbandis honoring centuries of aesthetic traditions.</p>',
      ticket_prices = ${JSON.stringify([
        { tier: "Standard Admission (London / Dubai)", price: 2500, description: "Reserved auditorium seat at Cadogan Hall or Dubai Opera" },
        { tier: "Royal Gala Patron Pass", price: 8500, description: "VIP champagne reception with performing maestros and front-tier box seating" }
      ])}::jsonb,
      event_sections = ${JSON.stringify([
        { id: "exhibit", type: "exhibit", label: "Tour Program", enabled: true },
        { id: "visit", type: "visit", label: "Venues & Timings", enabled: true },
        { id: "gallery", type: "gallery", label: "Gallery", enabled: true },
        { id: "book_space", type: "book_space", label: "Reserve Tickets", enabled: true },
        { id: "sponsorship", type: "sponsorship", label: "Sponsorship", enabled: true }
      ])}::jsonb
    WHERE slug = 'international-classic-dance-festival-london-dubai';
  `;
  console.log('✅ Updated International Classic Dance Festival');

  // 7. Rajneeti Ke Stambh
  await sql`
    UPDATE events
    SET 
      name = 'Rajneeti ke Stambh – Print Media & Podcast Series',
      event_date = '2026-10-15',
      event_time = 'Weekly Broadcasts & Quarterly Summits',
      venue = 'National Press Club & Broadcast Studios',
      city = 'New Delhi & Nationwide',
      category = 'Political Insights',
      summary = 'Ongoing National Series: Political Dialogues, Investigative Podcasts, and Analytical Print Publications documenting leaders of Indian democracy.',
      ticket_prices = ${JSON.stringify([
        { tier: "Live Broadcast Studio Audience Pass", price: 999, description: "Attend the live podcast studio recording and audience Q&A session in New Delhi" },
        { tier: "National Leadership Conclave VIP Pass", price: 2999, description: "VIP front-row seating, private networking tea with senior journalists and political guests" }
      ])}::jsonb,
      sponsorship_tiers = ${JSON.stringify([
        { tier: "Podcast Presenting Partner", amount: "₹10,00,000", benefits: "Title sponsor across 24 podcast episodes, intro/outro brand spot, and full-page print ad" },
        { tier: "Print Edition Co-Powered", amount: "₹5,00,000", benefits: "Half-page feature, logo on cover wrap, and distribution across parliament and VIP circuits" },
        { tier: "Episode Segment Sponsor", amount: "₹1,50,000", benefits: "Integrated brand mention in 4 episodes and social media video clips" }
      ])}::jsonb,
      event_sections = ${JSON.stringify([
        { id: "exhibit", type: "exhibit", label: "Series Overview", enabled: true },
        { id: "visit", type: "visit", label: "Broadcast Schedule", enabled: true },
        { id: "gallery", type: "gallery", label: "Episodes & Gallery", enabled: true },
        { id: "view_pdf", type: "pdf", label: "View Publication", enabled: true },
        { id: "book_space", type: "book_space", label: "Attend Recording", enabled: true },
        { id: "sponsorship", type: "sponsorship", label: "Sponsorship", enabled: true }
      ])}::jsonb
    WHERE slug = 'rajneeti-ke-stambh';
  `;
  console.log('✅ Updated Rajneeti Ke Stambh');

  // 8. Mandana Campaign
  await sql`
    UPDATE events
    SET 
      name = 'Mandana Campaign – Rajasthani Folk Art & Mural Revival',
      event_date = '2026-11-20',
      event_time = 'Full Day Workshops & Exhibitions',
      venue = 'Heritage Circuits, Shilpgram & Folk Centres',
      city = 'Rajasthan Heritage Hubs',
      category = 'Cultural Programs',
      summary = 'Cultural Heritage Movement dedicated to Mandana — traditional Rajasthani geometric wall and floor mural art revival.',
      ticket_prices = ${JSON.stringify([
        { tier: "Folk Art Workshop & Masterclass Pass", price: 299, description: "Includes hands-on material kit (red ochre, chalk, canvas) and master artisan guidance" },
        { tier: "Heritage Patron & Exhibition Donor Pass", price: 1499, description: "VIP entry to inaugural gala, signed artisan art piece, and documentary preview screening" }
      ])}::jsonb,
      event_sections = ${JSON.stringify([
        { id: "exhibit", type: "exhibit", label: "Art Tradition", enabled: true },
        { id: "visit", type: "visit", label: "Workshops", enabled: true },
        { id: "gallery", type: "gallery", label: "Mural Gallery", enabled: true },
        { id: "view_pdf", type: "pdf", label: "View Campaign Dossier", enabled: true },
        { id: "book_space", type: "book_space", label: "Join Workshop", enabled: true },
        { id: "sponsorship", type: "sponsorship", label: "CSR Support", enabled: true }
      ])}::jsonb
    WHERE slug = 'mandana-campaign-international-kathak-festival-udaipur-2025';
  `;
  console.log('✅ Updated Mandana Campaign');

  // 9. Invest Udaipur Industrial Conclave
  await sql`
    UPDATE events
    SET 
      name = 'Invest Udaipur Industrial Conclave 2027',
      event_date = '2027-04-10',
      event_time = '09:00 AM - 06:30 PM',
      venue = 'City Convention Centre, Udaipur',
      city = 'Udaipur, Rajasthan',
      category = 'Business & Investment',
      summary = 'Premier Investment, Startup & Industrial Conclave (April 2027) uniting PE funds, industrial houses, and startups in Southern Rajasthan.',
      description = '<h3>Catalyzing Southern Rajasthan Economic Ecosystem</h3><p>Invest Udaipur is the premier annual investment and industrial conclave dedicated to accelerating economic growth, clean industry development, and technological infrastructure across Southern Rajasthan.</p><h3>Focus Industry Tracks</h3><ul><li><strong>Green Mining & Marble Processing:</strong> Sustainable extraction, export logistics, and automated cutting technologies</li><li><strong>Hospitality & Culinary Tourism:</strong> Destination resort investments, heritage property conversion, and eco-tourism</li><li><strong>Renewable Energy & Solar:</strong> Utility-scale solar parks, rooftop incentives, and micro-grid innovations</li><li><strong>Startup Seed Pitch Arena:</strong> Connecting regional tech, edtech, and D2C startups with national Angel and VC funds</li></ul><h3>MoU Signing & B2B Matchmaking</h3><p>Direct platform for corporate MoUs with district authorities, single-window industrial clearances, and pre-scheduled investor-founder deal tables.</p>',
      ticket_prices = ${JSON.stringify([
        { tier: "Delegate Conference Pass", price: 1499, description: "Access to all conference tracks, pitch arena, expo floor, and networking buffet lunch" },
        { tier: "Investor / VIP Round-table Pass", price: 4999, description: "Private CXO roundtable room, pre-scheduled 1-on-1 pitch decks, and evening VIP reception" }
      ])}::jsonb,
      event_sections = ${JSON.stringify([
        { id: "exhibit", type: "exhibit", label: "Industry Tracks", enabled: true },
        { id: "visit", type: "visit", label: "Summit Schedule", enabled: true },
        { id: "gallery", type: "gallery", label: "Gallery", enabled: true },
        { id: "book_space", type: "book_space", label: "Delegate Passes", enabled: true },
        { id: "sponsorship", type: "sponsorship", label: "Corporate Sponsorship", enabled: true }
      ])}::jsonb
    WHERE slug = 'invest-udaipur-industrial-conclave';
  `;
  console.log('✅ Updated Invest Udaipur Industrial Conclave');

  console.log('🎉 All 9 events successfully synchronized in Neon Database!');
}

syncAllEvents().catch((e) => {
  console.error('Fatal error syncing events:', e);
  process.exit(1);
});
