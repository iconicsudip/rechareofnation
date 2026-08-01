// src/lib/db.ts
// SERVER-SIDE ONLY — Never import this in "use client" files
// Neon serverless connection pool

import { neon, types } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Postgres DATE columns have no time-of-day/timezone component, but the default
// driver type parser builds a JS Date object from them — which then gets
// interpreted in the server process's local timezone and shifts by that offset
// when serialized to JSON (e.g. "2025-12-17" becoming "2025-12-16T18:30:00.000Z"
// under IST). Keeping DATE columns as plain "YYYY-MM-DD" strings sidesteps any
// timezone ambiguity entirely.
types.setTypeParser(types.builtins.DATE, (value: string) => value);

export const sql = neon(process.env.DATABASE_URL);

// Run migrations once on first request
let migrated = false;

// Static Seed Data
const MOCK_EVENTS = [
  {
    id: 'ev-1',
    name: 'Recharge Cultural Odyssey 2026',
    slug: 'recharge-cultural-odyssey-2026',
    category: 'Cultural Programs',
    summary: 'A grand celebration of Indian heritage, featuring classical dances, folk music, theatrical displays, and artisanal crafts.',
    description: 'Welcome to the biggest cultural festival of the year! Recharge Cultural Odyssey 2026 brings together the finest artists, classical musicians, and theatrical groups from across India. Experience the vibrant tapestry of Indian folklore, street art, culinary delights, and breathtaking stage performances over three spectacular days. Organized at the heart of New Delhi, this premium event is a must-attend for families, art lovers, and culture enthusiasts alike.',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-15',
    time: '17:00',
    venue: 'Jawaharlal Nehru Stadium',
    city: 'New Delhi',
    googleMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.743126749008!2d77.2325852!3d28.5849826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d04b68ffbf5a7%3A0xe5413346cd6848e0!2sJawaharlal%20Nehru%20Stadium!5e0!3m2!1sen!2sin!4v1689250000000!5m2!1sen!2sin',
    isFeatured: true,
    isUpcoming: true,
    ticketPrices: [
      { type: 'General Entry', price: 299, available: 150, description: 'Standard ground level entry for 1 person' },
      { type: 'Student Pass', price: 149, available: 80, description: 'Valid with school/college physical ID verification' },
      { type: 'Family Pass', price: 999, available: 40, description: 'Admit up to 4 family members' },
      { type: 'VIP Pass', price: 1499, available: 30, description: 'Front-row seating, event merchandise kit, and complimentary lounge access' },
      { type: 'VVIP Pass', price: 2999, available: 15, description: 'VIP Lounge, meet-and-greet with headlining artists, premium catering, and valet parking' }
    ],
    rules: [
      'Tickets are non-refundable and non-transferable.',
      'A valid photo ID must be presented along with Student Passes.',
      'Re-entry is permitted only with valid wristbands.',
      'Outside food, beverages, and illegal substances are strictly prohibited.',
      'Gates close at 8:00 PM.'
    ],
    organizer: {
      name: 'Recharge Nation Event Committee',
      contact: 'Siddharth Sharma',
      email: 'events@rechargenation.in',
      phone: '+91 98765 43210'
    }
  },
  {
    id: 'ev-2',
    name: 'National Vibe & Rhythm Dance Cup 2026',
    slug: 'national-vibe-rhythm-dance-cup',
    category: 'Dance Competitions',
    summary: 'The ultimate battlefield for classical, contemporary, and hip-hop dancers competing for India\'s biggest dance crown.',
    description: 'Recharge Nation presents the Vibe & Rhythm National Dance Cup 2026. This prestigious competition showcases top solo acts, duos, and dance troupes from schools, colleges, and professional studios. Witness dynamic choreographies across Classical/Semi-classical fusion, Contemporary, and Street/Hip-hop categories. Winners walk away with cash prizes, trophies, and opportunities for professional training.',
    bannerUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    date: '2026-11-08',
    time: '09:00',
    venue: 'Ravindra Bharathi Auditorium',
    city: 'Hyderabad',
    googleMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.1652756857945!2d78.4682054!3d17.4038167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9779df52cf23%3A0xe5413346cd6848e1!2sRavindra%20Bharathi!5e0!3m2!1sen!2sin!4v1689250000001!5m2!1sen!2sin',
    isFeatured: true,
    isUpcoming: true,
    ticketPrices: [
      { type: 'General Entry', price: 199, available: 200, description: 'Audience ticket for general seating' },
      { type: 'Student Pass', price: 99, available: 120, description: 'Student audience entry pass' },
      { type: 'VIP Pass', price: 499, available: 50, description: 'Reserved premium seating in front rows' }
    ],
    rules: [
      'Competitors must arrive at the venue at 7:30 AM for registration verification.',
      'Soundtracks must be uploaded 7 days prior via the dashboard in MP3 format.',
      'Props must be declared during registration and approved by the technical crew.',
      'Decision of the judges is final and binding.'
    ],
    organizer: {
      name: 'Recharge Dance Association',
      contact: 'Malini Iyer',
      email: 'dance@rechargenation.in',
      phone: '+91 98450 12345'
    }
  },
  {
    id: 'ev-3',
    name: 'India Tech & Startup Trade Expo 2026',
    slug: 'india-tech-startup-trade-expo-2026',
    category: 'Trade Expos',
    summary: 'Connecting high-growth startups, venture capitalists, corporate sponsors, and technology enthusiasts under one roof.',
    description: 'The Recharge Business Trade Expo 2026 is the premier marketplace for innovators, founders, and industry leaders. Set in Mumbai\'s state-of-the-art exhibition center, this event hosts over 200+ startups exhibiting next-generation solutions in AI, FinTech, Green Energy, E-Commerce, and SaaS. Features include a Pitch Competition, panel discussions with unicorns, and exclusive 1-on-1 VC speed dating rounds.',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    date: '2026-12-05',
    time: '10:00',
    venue: 'Jio World Convention Centre',
    city: 'Mumbai',
    googleMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.48834924734!2d72.8624131!3d19.0642514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8efb132e0bf%3A0xe5413346cd6848e2!2sJio%20World%20Convention%20Centre!5e0!3m2!1sen!2sin!4v1689250000002!5m2!1sen!2sin',
    isFeatured: true,
    isUpcoming: true,
    ticketPrices: [
      { type: 'General Entry', price: 499, available: 300, description: 'Visitor pass for exhibition area' },
      { type: 'Corporate Pass', price: 1999, available: 150, description: 'Access to panel rooms, VIP networking lounge, and corporate dinner' },
      { type: 'Student Pass', price: 199, available: 100, description: 'Discounted access for young tech minds' }
    ],
    rules: [
      'Badges must be worn at all times inside the expo halls.',
      'Corporate passholders must verify their corporate email/credentials at the desk.',
      'Recording panel discussions with high-end camera rigs requires prior media accreditation.'
    ],
    organizer: {
      name: 'Recharge Business Forum',
      contact: 'Anil Mehta',
      email: 'expo@rechargenation.in',
      phone: '+91 90000 88888'
    }
  },
  {
    id: 'ev-4',
    name: 'India Culinary & Food Festival 2026',
    slug: 'india-culinary-food-festival-2026',
    category: 'Food Festivals',
    summary: 'A grand feast of street eats, live cooking masterclasses by celebrity chefs, and amateur baking pageants.',
    description: 'Get ready for the ultimate foodie heaven! The Recharge Food Festival brings the culinary diversity of India right to your plate. Taste street food gems, organic local produce, innovative fusion dishes, and watch live cooking masterclasses from India\'s top Michelin Star and MasterChef creators. Includes a live home-cook competition with cash awards.',
    bannerUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    date: '2026-09-20',
    time: '12:00',
    venue: 'Palace Grounds',
    city: 'Bengaluru',
    googleMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.234151740924!2d77.587843!3d12.998495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae164e2978ffab%3A0xe5413346cd6848e3!2sPalace%20Grounds!5e0!3m2!1sen!2sin!4v1689250000003!5m2!1sen!2sin',
    isFeatured: false,
    isUpcoming: true,
    ticketPrices: [
      { type: 'General Entry', price: 150, available: 400, description: 'Basic entry. Food purchases are extra.' },
      { type: 'Family Pass', price: 499, available: 100, description: 'Admit 4. Includes 2 complimentary beverage tokens.' },
      { type: 'VIP Pass', price: 799, available: 50, description: 'Exclusive entry to chef interaction lounges and 2 premium plates' }
    ],
    rules: [
      'Alcohol will only be served to visitors of legal age with a valid physical age proof.',
      'Pet dogs are allowed but must be kept on short leashes at all times.',
      'Do not bring external cutlery or food items into the arena.'
    ],
    organizer: {
      name: 'Recharge Culinary Alliance',
      contact: 'Chef Sameer Sen',
      email: 'food@rechargenation.in',
      phone: '+91 94440 56789'
    }
  },
  {
    id: 'ev-5',
    name: 'Glow Music & Fusion Carnival 2025',
    slug: 'glow-music-fusion-carnival-2025',
    category: 'Cultural Programs',
    summary: 'Highlights from the spectacular 2025 festival with over 15,000+ attendees dancing to fusion rhythms.',
    description: 'The Glow Music & Fusion Carnival 2025 was a high-energy celebration of indie music, Sufi rock, and EDM, held at Goa. Relive the electric atmosphere, visual lasers, delicious sea-food arrays, and headlining concerts from globally acclaimed artists.',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    date: '2025-11-20',
    time: '16:00',
    venue: 'Vagator Beach Arena',
    city: 'Goa',
    googleMapEmbedUrl: '',
    isFeatured: false,
    isUpcoming: false,
    ticketPrices: [
      { type: 'General Entry', price: 999, available: 0, description: 'Sold Out' }
    ],
    organizer: {
      name: 'Recharge Nation Goa Chapter',
      contact: 'Roy Fernandes',
      email: 'goa@rechargenation.in',
      phone: '+91 99999 11111'
    }
  },
  {
    id: 'ev-6',
    name: 'National Quiz & Talent Hunt 2025',
    slug: 'national-quiz-talent-hunt-2025',
    category: 'Educational Events',
    summary: 'A cerebral arena where 300 schools battled for the ultimate brainiac championship cup.',
    description: 'The 2025 Recharge National Quiz was a grand success in Chennai, testing critical analysis, science, and history. Congratulations to DAV Public School, Chennai, for clinching the national championship shield and Rs. 2 Lakh cash reward.',
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    date: '2025-08-14',
    time: '10:00',
    venue: 'Anna University Auditorium',
    city: 'Chennai',
    googleMapEmbedUrl: '',
    isFeatured: false,
    isUpcoming: false,
    ticketPrices: [],
    organizer: {
      name: 'Recharge Academy',
      contact: 'Prof. K. Swamy',
      email: 'academy@rechargenation.in',
      phone: '+91 94440 22222'
    }
  },
  {
    id: 'ev-7',
    name: 'Recharge Voice of India 2026',
    slug: 'recharge-voice-of-india-2026',
    category: 'Singing Competitions',
    summary: 'The biggest national talent hunt for vocalists, classical singers, and indie musicians with a live orchestra.',
    description: 'Calling all singers! Recharge Voice of India 2026 is the premier platform to showcase your vocal talents. Participate across Indian Classical, Western Pop, or Light Music categories. Perform in front of renowned music directors and win cash rewards, professional recording contracts, and trophies.',
    bannerUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-22',
    time: '18:00',
    venue: 'Kala Mandir Auditorium',
    city: 'Kolkata',
    googleMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.845341253456!2d88.3565012!3d22.5475143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027715f5c18c1b%3A0xe5413346cd6848e5!2sKala%20Mandir!5e0!3m2!1sen!2sin!4v1689250000005!5m2!1sen!2sin',
    isFeatured: false,
    isUpcoming: true,
    ticketPrices: [
      { type: 'General Entry', price: 250, available: 150, description: 'Audience gallery seating' },
      { type: 'Student Pass', price: 120, available: 50, description: 'Valid student ID pass' },
      { type: 'VIP Pass', price: 599, available: 30, description: 'Front rows & artist meet-and-greet' }
    ],
    rules: [
      'Contestants must submit a 1-minute performance audio clip during registration.',
      'Only acoustic guitars and keyboards are permitted as self-accompaniment.',
      'Tracks or backing arrangements must be uploaded in MP3 format 5 days in advance.'
    ],
    organizer: {
      name: 'Recharge Musical Alliance',
      contact: 'Swarup Sen',
      email: 'vocals@rechargenation.in',
      phone: '+91 93333 44444'
    }
  },
  {
    id: 'ev-8',
    name: 'India Youth Haute Couture Fashion Week 2026',
    slug: 'india-youth-haute-couture-fashion-week-2026',
    category: 'Fashion Shows',
    summary: 'Spotlight on sustainable fabrics and modern ethnic collections designed by India\'s brightest design minds.',
    description: 'Welcome to the couture runway of Recharge Nation. The 2026 Fashion Show brings together pioneering designers, models, and fashion houses. Witness collections centered around sustainable fabrics, traditional handloom weaves, and modern streetwear crossovers.',
    bannerUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    date: '2026-11-20',
    time: '19:00',
    venue: 'Taj Lands End Ballroom',
    city: 'Mumbai',
    googleMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.698348924734!2d72.8164214!3d19.0425143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c92b2ff8ffab%3A0xe5413346cd6848e6!2sTaj%20Lands%20End!5e0!3m2!1sen!2sin!4v1689250000006!5m2!1sen!2sin',
    isFeatured: false,
    isUpcoming: true,
    ticketPrices: [
      { type: 'General Entry', price: 499, available: 100, description: 'Row C & D standard seating' },
      { type: 'VIP Pass', price: 1499, available: 40, description: 'Row A & B front runway pass + designer lounge access' },
      { type: 'VVIP Pass', price: 3499, available: 15, description: 'Front-row velvet VIP seats + champagne reception (21+) & luxury hampers' }
    ],
    rules: [
      'Dress code: Formal/Chic required at check-in.',
      'Photographers must secure official media press tags at the helpdesk.'
    ],
    organizer: {
      name: 'Recharge Style Bureau',
      contact: 'Rhea Kapoor',
      email: 'style@rechargenation.in',
      phone: '+91 91111 22222'
    }
  },
  {
    id: 'ev-9',
    name: 'Artisanal Craft & Art Expressions Exhibition 2026',
    slug: 'artisanal-craft-art-expressions-exhibition-2026',
    category: 'Art & Craft',
    summary: 'A vibrant bazaar showcasing traditional folk paintings, hand-spun textiles, clay pottery, and modern canvas works.',
    description: 'Explore, support, and acquire the finest artisanal craftworks. The Art Expressions Exhibition brings over 100 award-winning painters, sculptors, and handicraft creators directly to Bangalore. Participate in live clay throwing, block printing, and watercolor masterclasses.',
    bannerUrl: 'https://images.unsplash.com/photo-1459908272638-55f467b2f7a9?auto=format&fit=crop&w=1200&q=80',
    date: '2026-10-05',
    time: '11:00',
    venue: 'Chitrakala Parishath',
    city: 'Bengaluru',
    googleMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.698348924734!2d77.5814214!3d12.9825143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae167b2ff8ffab%3A0xe5413346cd6848e7!2sKarnataka%20Chitrakala%20Parishath!5e0!3m2!1sen!2sin!4v1689250000007!5m2!1sen!2sin',
    isFeatured: false,
    isUpcoming: true,
    ticketPrices: [
      { type: 'General Entry', price: 99, available: 300, description: 'Access to craft stalls and painting galleries' },
      { type: 'Student Pass', price: 49, available: 150, description: 'Student craft pass' }
    ],
    rules: [
      'Purchased craft works are safely packed and delivered to the pick-up counter.',
      'No sketching or flash photography near heritage paintings.'
    ],
    organizer: {
      name: 'Recharge Heritage Trust',
      contact: 'Dr. Devika Iyer',
      email: 'heritage@rechargenation.in',
      phone: '+91 97777 55555'
    }
  }
];

const MOCK_SPONSORS = [
  { id: 'sp-1', name: 'Airtel', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Title', websiteUrl: 'https://airtel.in' },
  { id: 'sp-2', name: 'Tata Motors', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Platinum', websiteUrl: 'https://tatamotors.com' },
  { id: 'sp-3', name: 'Red Bull', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Gold', websiteUrl: 'https://redbull.com' },
  { id: 'sp-4', name: 'Razorpay', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Partner', websiteUrl: 'https://razorpay.com' },
  { id: 'sp-5', name: 'Times of India', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Media', websiteUrl: 'https://timesofindia.indiatimes.com' }
];

const MOCK_BLOGS = [
  {
    id: 'bl-1',
    title: 'LUXURY STAYS IN MEWAR: THE DEFINITIVE GUIDE TO LAKEFRONT HAVELIS',
    slug: 'luxury-stays-mewar-lakefront-havelis',
    summary: 'Unveiling Mew\'s Finest Stays Rajasthan is known for its incredible heritage, and Udaipur stands as the jewel of Mewar....',
    content: 'Rajasthan is known for its incredible heritage, and Udaipur stands as the jewel of Mewar. Experiencing it from a lakefront haveli is a bucket-list journey.',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    category: 'Luxury Stays',
    author: 'GoRidez Editorial Team',
    publishedAt: 'July 12, 2026',
    readTime: '1 min read',
    subheading: 'UNVEILING MEWAR\'S FINEST STAYS',
    bullets: [
      'Aravalli Grande Palace: Infinity pool and helipad capabilities.',
      'Blue City Haveli Estate: Nestled under Mehrangarh\'s shadows in Jodhpur.'
    ]
  },
  {
    id: 'bl-2',
    title: 'NAVIGATING KUMBALGARH FORT VIA SCENIC MOUNTAIN PASSES IN BREZZA',
    slug: 'navigating-kumbalgarh-fort-mountain-passes',
    summary: 'Discover Kumbalgarh Fort via scenic mountain roads, mapping driving speeds, vistas, and timing details....',
    content: 'Map out your next road trip to the second-longest wall in the world. This route guide details driving speeds, mountain road conditions, scenic vistas, and the best time of year to visit Kumbalgarh Fort.',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    category: 'Travel Guide',
    author: 'GoRidez Editorial Team',
    publishedAt: 'July 15, 2026',
    readTime: '2 min read',
    subheading: 'EXPLORING SCENIC PASSES',
    bullets: [
      'Brezza Performance: Excellent low-end torque for mountain loops.',
      'Kumbalgarh Fort Wall: Walk the historic 36km battlements.'
    ]
  },
  {
    id: 'bl-3',
    title: 'TECHNICAL DRIVING: MASTER THE TIGHT HAIRPINS OF MOUNT ABU',
    slug: 'technical-driving-hairpins-mount-abu',
    summary: 'Master the Mount Abu passes with expert braking, steering lines, and engine cooling guides....',
    content: 'Mount Abu\'s winding passes demand strict vehicle preparation. Learn engine brake techniques, lines of entry for blind curves, and suspension settings required for a smooth mountain driving experience.',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    category: 'Technical Driving',
    author: 'GoRidez Editorial Team',
    publishedAt: 'July 18, 2026',
    readTime: '3 min read',
    subheading: 'MOUNTAIN TRACTION PROTOCOLS',
    bullets: [
      'Lower Gears: Maintain 2nd gear for descent control.',
      'Brake Cooling: Stop at mid-way points to avoid disc fading.'
    ]
  },
  {
    id: 'bl-4',
    title: 'HERITAGE RETREATS OF JAIPUR: LIVING AMONG ROYAL CONSERVERS',
    slug: 'heritage-retreats-jaipur-royal-conservers',
    summary: 'A guide to staying in private heritage suites managed directly by the royal descendants of Jaipur.',
    content: 'Discover Jaipur\'s finest ancestral homes and city palaces converted into luxury boutique hotels. Meet the royal families preserving these architectures and enjoy hand-cooked royal recipes passed down through generations.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    category: 'Luxury Stays',
    author: 'GoRidez Editorial Team',
    publishedAt: 'July 20, 2026',
    readTime: '2 min read',
    subheading: 'ROYAL HOMESTAYS',
    bullets: [
      'City Palace Suite: Private access to historical arms galleries.',
      'Mewari Cuisine: Family-hosted dinners with royal stories.'
    ]
  },
  {
    id: 'bl-5',
    title: 'SCENIC DESERT SAFARI: UNVEILING THE SAND DUNES OF JAISALMER',
    slug: 'scenic-desert-safari-jaisalmer-dunes',
    summary: 'Navigating local routes through the Thar desert to catch golden hour sunsets over sand dunes.',
    content: 'Prepare your off-road vehicles for a journey into the heart of the Thar Desert. This guide details Sam Sand Dunes entry regulations, dune-bashing safety protocols, and premium luxury camp recommendations.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=800&q=80',
    category: 'Travel Guide',
    author: 'GoRidez Editorial Team',
    publishedAt: 'July 22, 2026',
    readTime: '3 min read',
    subheading: 'THAR ROAD TRIP GUIDES',
    bullets: [
      'Sam Dunes Entry: Pre-register vehicles at Jaisalmer checkpost.',
      'Luxury Camp Tent: Star-gazing over active sand dunes.'
    ]
  },
  {
    id: 'bl-6',
    title: 'OFF-ROAD TRAIL GUIDE: NAVIGATION STRATEGIES FOR THE THAR DUNES',
    slug: 'off-road-trail-guide-thar-dunes',
    summary: 'Understanding tire deflation, traction gear, and sand recovery tracks for sand dune exploration.',
    content: 'Off-road driving on loose desert sand requires specialised techniques. Learn the proper tyre pressure adjustments, sand entry speeds, and recovery shovel setups to ensure a safe sand-duning trail run.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    category: 'Technical Driving',
    author: 'GoRidez Editorial Team',
    publishedAt: 'July 24, 2026',
    readTime: '4 min read',
    subheading: 'OFF-ROAD TACTICS',
    bullets: [
      'Tyre Deflation: Maintain 15 PSI for sand flotation.',
      'Recovery Tracks: Carry sand boards and heavy-duty tow ropes.'
    ]
  }
];

const MOCK_GALLERY = [
  { id: 'g-1', type: 'photo', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=300&q=80', title: 'Odyssey Grand Stage', event: 'Cultural Odyssey 2025' },
  { id: 'g-2', type: 'photo', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=300&q=80', title: 'Sufi Rock Performance', event: 'Fusion Carnival 2025' },
  { id: 'g-3', type: 'photo', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80', title: 'Choreography Contest Soloist', event: 'Dance Cup 2025' },
  { id: 'g-4', type: 'photo', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=300&q=80', title: 'Startup Pitch Arena', event: 'Tech Trade Expo 2025' }
];

// Site content seed (generic key/value JSONB blocks for admin-editable page copy)
const MOCK_SITE_CONTENT: { key: string; value: unknown }[] = [
  {
    key: 'homepage_hero',
    value: {
      slides: [
        {
          badge: '✦ ELITE AUTOMOTIVE CLASH', titleLine1: 'REV UP THE', titleLine2: 'CYBER ENGINE',
          accent: 'CYBERPUNK SPEED EXPO',
          desc: "Witness India's most aggressive tuning clash, custom supercars, drift spec showcases, and hypercar networking setups.",
          image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
          tier: 'PADDOCK EXHIBITOR VIP', multipass: 'MULTIPASS 2.4GHZ', eventDate: 'OCT 12-14, 2026',
          venue: 'BIC Arena, Greater Noida', gate: 'GATE 03 / PITS', price: '₹1,499', code: 'PASS-AUTO-992',
          slug: 'recharge-cultural-odyssey-2026',
        },
        {
          badge: '✦ NATARAJA DANCE CLASH', titleLine1: 'FEEL THE VIBE', titleLine2: 'AND RHYTHM',
          accent: 'NATIONAL CHOREO BATTLE',
          desc: 'Compete or witness the ultimate choreography battle where elite street, classical, and contemporary crews clash for the national shield.',
          image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
          tier: 'STAGE SIDE CONTESTANT VIP', multipass: 'STAGEPASS 5.8GHZ', eventDate: 'NOV 08, 2026',
          venue: 'Ravindra Bharathi, Hyderabad', gate: 'STAGE DOOR BACKSTAGE', price: '₹500', code: 'PASS-DNC-4214',
          slug: 'national-vibe-rhythm-dance-cup',
        },
        {
          badge: '✦ ABHYUDAYA MEGA FEST', titleLine1: 'CELEBRATE THE', titleLine2: 'CULTURAL ODYSSEY',
          accent: 'INDIAN HERITAGE CARNIVAL',
          desc: 'A massive celebration of folk dances, local street foods, multi-state music ensembles, and handmade artisan craft markets.',
          image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
          tier: 'GENERAL ENTRY BADGE', multipass: 'ADMIT 4 FAMILY', eventDate: 'OCT 15, 2026',
          venue: 'Jawaharlal Nehru Stadium, Delhi', gate: 'GATE 06 / GROUND', price: '₹299', code: 'PASS-ODY-5524',
          slug: 'recharge-cultural-odyssey-2026',
        },
      ],
    },
  },
  {
    key: 'homepage_testimonials',
    value: {
      testimonials: [
        { quote: "Booking the VIP tickets for Abhyudaya was incredibly smooth on Recharge Nation. The Smart QR wristband scanned immediately at Gates 1 and 3 without any check-in friction. Best ticketing experience in India.", author: 'Rajesh Malhotra', role: 'Auto Expo Sponsor' },
        { quote: 'I registered as a participant for Mr. Traditional India. The Participant ID Badge looked beautiful with my headshot, and security scanned me straight backstage in seconds. Extremely organized platform.', author: 'Divya Nair', role: 'Contestant Dancer' },
        { quote: 'We booked visitor passes for our college coding club to visit the Mumbai Tech Trade Expo. Scanning was extremely rapid. The interactive floor plan links inside our dashboard saved us so much time.', author: 'Karthik Subramaniam', role: 'General Badge Holder' },
        { quote: 'The runway coordinators at Miss & Mr. Traditional India 2026 were top-tier. My designer dress was handled with premium care, and our profile was broadcasted to major fashion agency sponsors.', author: 'Ananya Sharma', role: 'Fashion Designer' },
        { quote: 'Managing a corporate panel at Pragati Maidan can be chaotic, but the real-time registration desk dashboard let us track attendee metrics and check-in speeds with absolute accuracy.', author: 'Vikram Seth', role: 'Summit Convener' },
        { quote: 'Sunburn Goa beach carnival was unmatched! Getting my pass verified digitally via the WhatsApp ticket bot took less than 15 seconds. No queues, no hassle, just pure music vibes.', author: 'Priya Patel', role: 'Festival Visitor' },
        { quote: 'I love the clean interface of the national events portal. Filtering events by category (Expos, Carnivals, Arenas) is fast, and the layout looks so beautiful in both light and dark backgrounds.', author: 'Rohan Gupta', role: 'Tech Enthusiast' },
        { quote: 'Our college cultural committee partnered with Recharge of Nation to host our regional zonal qualifiers. The platform helped us sell 3,000 passes in less than 48 hours without any downtime.', author: 'Sneha Reddy', role: 'College Ambassador' },
        { quote: 'Highly recommend getting the Premium VIP pass! The exclusive lounge access, early check-in at the stadium, and complimentary delegate kit made the entire event feel extremely high-end.', author: 'Amit Verma', role: 'VIP Pass Holder' },
      ],
    },
  },
  { key: 'homepage_partner_logos', value: { logos: ['TATA', 'Airtel', 'Paytm', 'Reliance', 'Bisleri', 'BookMyShow'] } },
  {
    key: 'about_page',
    value: {
      eyebrow: 'Recharge Nation', heading: 'About Our Platform',
      subheading: 'Providing a premium digital gateway for discovering high-energy cultural, business, and entertainment events across metropolitan India.',
      introParagraphs: [
        "Founded in 2024, Recharge Nation has grown to become India's leading event integration platform. We connect student bodies, professional artists, corporate sponsors, and local communities through customized, premium-tier event management interfaces.",
        'Whether you are a college student looking to battle in nationwide dance cups, a startup founder pitching to venture capitalists at trade expos, or a family seeking weekends at street food festivals, Recharge Nation delivers a premium, secure user experience.',
      ],
      milestones: [
        { title: '50+', desc: 'Premium Events Hosted' },
        { title: '250K+', desc: 'Tickets Booked Successfully' },
        { title: '10K+', desc: 'Registered Competitors' },
      ],
      coreValuesHeading: 'Our Core Values',
      coreValues: [
        { title: 'Premium Visual Experience', desc: 'Every component is crafted to provide a premium modern aesthetic, ensuring a seamless user flow.' },
        { title: 'Secure Transactions', desc: 'Integrate trusted gateways like Razorpay to support cards, UPI, net banking, and wallets.' },
        { title: 'Verification Standards', desc: 'Verify registrations, credentials, and uploads to keep auditions and expos high quality.' },
        { title: 'SMTP Automation', desc: 'Instant automated receipt deliveries, QR pass generation, and SMS notifications.' },
      ],
    },
  },
  {
    key: 'contact_info',
    value: {
      eyebrow: 'Communication', heading: 'Get in Touch',
      subheading: "Have a question or request? Submit your message and we'll reply shortly.",
      address: 'Level 4, Corporate Towers, MG Road, Bengaluru, Karnataka - 560001',
      phone: '+91 98765 43210', phoneHours: 'Mon - Sat: 9:00 AM to 6:00 PM',
      supportEmail: 'support@rechargenation.in', salesEmail: 'info@rechargenation.in',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9734335503835!2d77.6083818!3d12.9735417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1684c30c8ef3%3A0xe5413346cd6848e4!2sMG%20Road%20Bengaluru!5e0!3m2!1sen!2sin!4v1689250000004!5m2!1sen!2sin',
      formHeading: 'Send Enquiry Message',
      formHelperText: 'Fill the fields and pass the captcha validation check to trigger submission.',
      successHeading: 'Message Sent Successfully!',
      successBody: 'A simulated auto-acknowledgement response notification email has been triggered via SMTP.',
    },
  },
  {
    key: 'legal_terms',
    value: {
      heading: 'Terms & Conditions', lastUpdated: 'Last Updated: July 14, 2026',
      introText: 'By accessing the Recharge Nation website and booking tickets or registering for competitions, you agree to comply with and be bound by the following Terms & Conditions.',
      sections: [
        { title: '1. Ticket Booking Regulations', body: '<ul><li>Audience passes booked online are non-refundable and non-transferable unless explicitly stated by the event managers.</li><br/><li>Each visitor pass displays a unique reference code and QR symbol which is scanned for validation at the venue gates. Re-entry is subject to wristband checks.</li><br/><li>Student discount passes are only valid upon physical presentation of current school/college identification cards at the verification desk.</li></ul>' },
        { title: '2. Competition Registrations', body: '<ul><li>Participants must supply accurate date of birth, age-classification, and emergency contacts. False information triggers immediate disqualification without fee refunds.</li><br/><li>All uploaded files (photographs, Aadhaar IDs, performance audios, portfolios) are vetted by the jury. Jury decisions are final and binding.</li><br/><li>Submitting a participant form does not provide entrance passes for parents or guardians unless tickets are separately booked.</li></ul>' },
        { title: '3. Online Payment Integrity', body: 'Payments are handled via secure integration with Razorpay. Any transaction disputes, refund queries, or wallet failures must be directed to payments@rechargenation.in along with merchant payment reference details.' },
        { title: '4. Code of Conduct', body: 'Recharge Nation reserves the right to deny entry or revoke passes for individuals behaving disruptively or breaching security protocols at the physical venues.' },
        { title: '5. Amendments', body: 'We reserve the right to modify schedules, venue locations, pricing tiers, and guidelines at our discretion. Registrants will be notified via email or dashboard announcements.' },
      ],
    },
  },
  {
    key: 'legal_privacy',
    value: {
      heading: 'Privacy Policy', lastUpdated: 'Last Updated: July 14, 2026',
      introText: 'Welcome to Recharge Nation. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you visit our website or book tickets and register for competitions.',
      sections: [
        { title: '1. Information We Collect', body: 'When you use our services, we may collect:<ul><li><strong>Visitor Details:</strong> Full Name, Email Address, Mobile Number, City, State, Special Requests.</li><br/><li><strong>Participant Details:</strong> Photograph, Government ID, Performance Video, Portfolio, Certificates, Emergency Contact, and Institution Details.</li><br/><li><strong>Payment Details:</strong> Transaction IDs and methods processed via Razorpay. We do not store card credentials directly.</li></ul>' },
        { title: '2. How We Use Information', body: 'We use the collected information to:<ul><li>Process ticket bookings and competition registrations.</li><br/><li>Send booking confirmations and QR entry passes via simulated SMTP mail servers.</li><br/><li>Verify participant details and school/college credentials for audition classifications.</li><br/><li>Improve website speed and customize layout aesthetics.</li></ul>' },
        { title: '3. Data Security', body: 'We implement SSL certification, protected client endpoints, and secure local storage encryption to shield your user profile and booking history from malicious access.' },
        { title: '4. Third-Party Integrations', body: 'Our platform integrates third-party services like Razorpay payment widgets, Google Maps embeds, and Google Analytics tracking tags. These services abide by their respective privacy regulations.' },
        { title: '5. Contact Us', body: 'For privacy inquiries, please mail support@rechargenation.in.' },
      ],
    },
  },
  {
    key: 'footer',
    value: {
      brandName: 'RECHARGENATION', brandTagline: 'JOIN THE ALERT CREW',
      brandDescription: 'Recharge Nation is the central portal for premium cultural programs, nationwide dance and singing clashes, style showcases, culinary festivals, and industrial exhibitions across India.',
      newsletterHeading: 'JOIN THE ALERT CREW', newsletterPlaceholder: 'Enter email for secret drop alerts',
      columns: [
        { title: 'For Audiences', links: [
          { label: 'All Live Events', href: '/events' },
          { label: 'Abhyudaya Mega Fest', href: '/events/recharge-cultural-odyssey-2026' },
          { label: 'Exhibitions & Expos', href: '/events?category=Trade%20Expos' },
          { label: 'My Ticket Badges', href: '/dashboard' },
        ] },
        { title: 'For Participants', links: [
          { label: 'Mr/Miss Traditional 2026', href: '/competitions' },
          { label: 'Nataraja Dance Clash', href: '/events/national-vibe-rhythm-dance-cup' },
          { label: 'Become a Sponsor', href: '/sponsors' },
          { label: 'Download Participant ID', href: '/dashboard' },
          { label: 'Admin Portal Access', href: '/admin/login' },
        ] },
      ],
    },
  },
  {
    key: 'nav_links',
    value: {
      brandName: 'RECHARGENATION', brandTagline: 'Experience India',
      items: [
        { name: 'Explore Events', href: '/events' },
        { name: 'Mr/Miss Traditional', href: '/competitions' },
        { name: 'Sponsors', href: '/sponsors' },
        { name: 'Gallery', href: '/gallery' },
        { name: 'Blogs', href: '/blogs' },
      ],
    },
  },
  {
    key: 'sponsorship_tiers',
    value: {
      TITLE: { name: 'Title Sponsor', price: 2500000, baseImpressions: 5200000, space: '300 sq.ft Premium Front-Center Trackside Pavilion', allotments: '40 Full Pass Badges', entitlements: ['Exclusive category rights (No competitor brands allowed)', 'Live onstage representative keynote greeting (2 mins)', 'Push notifications to all 2,00,000+ app users during event'], placements: 'All Main Stage banners, Official App Splash Screen, Co-branded National PR & Media coverage' },
      PLATINUM: { name: 'Platinum Partner', price: 1500000, baseImpressions: 3000000, space: '200 sq.ft Premium Trackside Pavilion', allotments: '25 Full Pass Badges', entitlements: ['Co-branding on official credentials and lanyards', '15-second promo video broadcast during main stage transitions', 'Dedicated sponsor booth in high-traffic exhibition hall'], placements: 'Premium App Banner, Main Stage Side Banners, Co-branded PR & Media coverage' },
      GOLD: { name: 'Gold Partner', price: 800000, baseImpressions: 1500000, space: '100 sq.ft Trackside Pavilion', allotments: '12 Full Pass Badges', entitlements: ['Logo on general ticketing page and email confirmations', 'Social media shout-out and dedicated brand story coverage', 'Standard expo booth with electric & Wi-Fi support'], placements: 'General Category Banners, App Partner Section, Standard PR & Media coverage' },
      ASSOCIATE: { name: 'Associate Partner', price: 400000, baseImpressions: 700000, space: '50 sq.ft Shared Pavilion', allotments: '6 Full Pass Badges', entitlements: ['Logo on all official co-branded marketing materials', 'In-app sponsor directory inclusion', 'Distribution of corporate flyers in visitor goodie bags'], placements: 'App Partner Section, Shared Banners, Standard PR & Media coverage' },
    },
  },
  {
    key: 'homepage_hubs',
    value: {
      hubs: [
        { category: 'Cultural Programs', desc: 'Grand cultural beats & live stage arts.' },
        { category: 'Dance Competitions', desc: 'Elite choreography clashes & dance battles.' },
        { category: 'Trade Expos', desc: 'Smart city tech, gadgets & showcases.' },
        { category: 'Food Festivals', desc: 'Culinary trails, street food fairs & tastings.' },
        { category: 'Fashion Shows', desc: 'Runway showcases & style spectacles.' },
        { category: 'Educational Events', desc: 'Masterclasses & interactive learning jams.' },
        { category: 'Business Expo', desc: 'Strategic leadership summits & founder mixers.' },
      ],
    },
  },
  {
    key: 'homepage_stats',
    value: {
      stats: [
        { value: '50+', label: 'Premium Events Hosted' },
        { value: '250K+', label: 'Tickets Booked Successfully' },
        { value: '7+', label: 'Cities Live Nationwide' },
        { value: '12+', label: 'Event Categories' },
      ],
    },
  },
  {
    key: 'homepage_newsletter',
    value: {
      eyebrow: 'VIP GATEWAY',
      heading: 'GET SECRET PRE-SALE ACCESS ALERTS',
      description: 'Enter your corporate or student email to secure discount codes and early-bird notifications before tickets sell out.',
      ctaLabel: 'JOIN CREW',
      successMessage: 'Secret alert pass activated. Welcome to the crew!',
    },
  },
  {
    key: 'sponsors_page',
    value: {
      heroBadge: 'Brand Alignment & Ecosystem Expansion',
      heroTitle: "CATALYZING INDIA'S LIVE & EXPERIENTIAL MARKETS",
      heroDescription: 'Recharge Nation is proud to collaborate with industry-leading corporate brands driving technological development, sustainability, and cultural preservation. Together, we power secure smart admissions, high-speed regional networking, and luxury handloom revival across South Asia.',
      stats: [
        { label: 'Total Audience Reach', value: '15 Lakhs+' },
        { label: 'Allied Brands', value: '50+ Active' },
        { label: 'Weaver Payouts', value: '₹85,00,000+' },
        { label: 'Gate Transits', value: '99.98% Smooth' },
      ],
      enlistEyebrow: 'B2B Co-Creation & Media',
      enlistHeading: 'ENLIST YOUR BRAND',
      enlistDescription: 'Gain premier brand recall and highly localized exposure to massive energetic audiences. We offer physical experiential stalls, interactive app integrations, visual custom stage banners, and direct category sponsorships.',
      enlistBullets: [
        'Access over 2,00,000+ highly active demographics',
        'Custom physical experiential display zones',
        'Live app telemetry-integrated promotional badges',
      ],
    },
  },
  {
    key: 'gallery_page',
    value: {
      eyebrow: 'Moments Captured',
      heading: 'Experience Highlights',
      description: 'Witness spectacular frames from our biggest past editions. Concert arenas, traditional runways, and dense technology presentations.',
    },
  },
  {
    key: 'blogs_page',
    value: {
      heading: 'Blog',
      description: 'Curated road trip itineraries, expert driving guides, and premium destination logs across Mewar and Rajasthan.',
    },
  },
];

const MOCK_COMPETITIONS = [
  {
    id: 'comp-1', name: 'Miss & Mr. Traditional India 2026', slug: 'miss-mr-traditional-india-2026',
    description: "The ultimate country-wide hunt for young icons who elegantly synthesize traditional ethnic grace, linguistic eloquence, regional sartorial heritage, and cultural intellect. Organized across 28 regional auditions, the grand national runway finals are the peak showcase of Indian handloom revival and individual talent. More than just a pageant, this is a celebration of cultural ambassadorship.",
    summary: 'Miss & Mr. Traditional India is not a standard beauty pageant. It is a country-wide cultural movement dedicated to mainstreaming regional weavers, handloom fabrics, and linguistic lineages. Contenders are evaluated strictly on their sartorial research (identifying real weaver cooperatives), verbal fluency in their native mother tongue, and overall poise.',
    bannerUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    eventDate: '2026-11-28', deadline: '2026-11-28', venue: 'Grand Pavilion, Palace Grounds', city: 'Bengaluru',
    prizePool: '₹25,00,000 + Modelling Contracts', registrationFee: 1500,
    categories: [
      { name: 'Miss Traditional India (Female)', ageGroup: '18 - 28 years', fee: 1500 },
      { name: 'Mr. Traditional India (Male)', ageGroup: '18 - 28 years', fee: 1500 },
    ],
    rules: [
      'Age bracket: 18 - 28 years (as of Jan 1, 2026).',
      'Citizens of India or OCI Cardholders.',
      'Must prepare one regional handloom-based apparel for the runway round.',
      'Submission of 3 high-res portfolio headshots + 1-minute performance introduction video.',
      'Sartorial authenticity carries 40% weight in round 1 scoring.',
      'Intellect & Cultural Q&A carries 40% weight in finals scoring.',
      'Decision of the grand jury panels (consisting of top national fashion designers and cinema veterans) is final.',
    ],
    judges: [
      { name: 'DR. VASUNDHARA SEN', role: 'TEXTILE HISTORIAN', desc: 'Curation Curator of National Handloom Museum.' },
      { name: 'RAGHVENDRA RATHORE', role: 'ROYAL COUTURIER', desc: 'Pioneered traditional Indian heritage runway apparel.' },
      { name: 'PROF. ALOK CHATURVEDI', role: 'LINGUISTIC SCHOLAR', desc: 'Head of Classical Languages at Delhi University.' },
    ],
    faqs: [
      { q: 'WHAT DOCUMENTS MUST I UPLOAD DURING THE FORMAL APPLICATION STAGE?', a: 'Contenders must upload high-resolution headshots, a scanned photocopy of age proof (18-28 bracket), and a 1-minute regional language introduction clip.' },
      { q: 'DO I HAVE TO WEAVE THE TRADITIONAL OUTFIT MYSELF?', a: 'No, weaving is not required by contestants. However, the outfit must be sourced from authentic handloom clusters, and you must verify the weavers cooperative detail during review.' },
      { q: 'ARE TRAVEL AND ACCOMMODATION EXPENSES COMPENSATED?', a: 'For regional auditions, travel is self-funded. For candidates selected to represent their state in the Grand Finals in Bengaluru, all lodging and boarding will be covered by the committee.' },
    ],
    regionalHubs: [
      { city: 'NEW DELHI AUDITIONS', venue: 'Kamani Auditorium', date: 'Sept 12 - 13, 2026' },
      { city: 'CHANDIGARH AUDITIONS', venue: 'Tagore Theatre', date: 'Sept 19, 2026' },
      { city: 'LUCKNOW AUDITIONS', venue: 'Sangeet Natak Akademi', date: 'Sept 26, 2026' },
      { city: 'BENGALURU AUDITIONS', venue: 'Grand Pavilion, Palace Grounds', date: 'Oct 04 - 05, 2026' },
      { city: 'CHENNAI AUDITIONS', venue: 'Music Academy Hall', date: 'Oct 10, 2026' },
      { city: 'HYDERABAD AUDITIONS', venue: 'Ravindra Bharathi Hall', date: 'Oct 17, 2026' },
      { city: 'KOLKATA AUDITIONS', venue: 'Rabindra Sadan', date: 'Oct 24 - 25, 2026' },
      { city: 'MUMBAI AUDITIONS', venue: 'Sophia Bhabha Auditorium', date: 'Nov 01 - 02, 2026' },
      { city: 'GUWAHATI AUDITIONS', venue: 'Pragjyotish Cultural Complex', date: 'Nov 08, 2026' },
    ],
    organizer: { name: 'India Weaves & Heritage Council', contact: 'A philanthropic trust promoting the survival of traditional weaving clusters through modern luxury exposure and pageantry.', email: 'pageant@indiaweaves.org', phone: '+91 80 3456 7890' },
  },
];

const MOCK_TAXONOMIES: { type: string; value: string }[] = [
  ...['Cultural Programs', 'Dance Competitions', 'Trade Expos', 'Food Festivals', 'Educational Events', 'Singing Competitions', 'Fashion Shows', 'Art & Craft', 'Talent Hunt', 'Business Expo', 'Startup Conference', 'Sports']
    .map(value => ({ type: 'event_category', value })),
  ...['New Delhi', 'Hyderabad', 'Mumbai', 'Bengaluru', 'Goa', 'Chennai', 'Kolkata']
    .map(value => ({ type: 'city', value })),
  ...['Luxury Stays', 'Travel Guide', 'Technical Driving']
    .map(value => ({ type: 'blog_category', value })),
  ...['Abhyudaya', 'Miss Traditional', 'Expos', 'Competitions', 'Conferences']
    .map(value => ({ type: 'gallery_category', value })),
  ...['Miss Traditional India (Female)', 'Mr. Traditional India (Male)']
    .map(value => ({ type: 'competition_category', value })),
];

// Extra gallery items (real content from the public gallery page, merged in without disturbing existing rows)
const EXTRA_GALLERY_ITEMS = [
  { id: 'gal-1', type: 'photo', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', title: 'Stellar live concert crowd at Abhyudaya 2025 opening night.', event: 'Abhyudaya' },
  { id: 'gal-2', type: 'photo', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', title: 'The stunning ethnic couture runway designs during Miss Traditional India.', event: 'Miss Traditional' },
  { id: 'gal-3', type: 'photo', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', title: 'Full house panel briefing on critical internet security infrastructure at INDO-SEC.', event: 'Conferences' },
  { id: 'gal-4', type: 'photo', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', title: 'Exhibitors demoing automated smart city transit pods at Mumbai Convention Hall.', event: 'Expos' },
  { id: 'gal-5', type: 'photo', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', title: 'Nataraja Dance fusion classical performers on the Sir Shankarlal stage.', event: 'Competitions' },
  { id: 'gal-6', type: 'video', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', title: 'Crowd dancing under heavy lasers at Nucleya Bass EDM Day 2.', event: 'Abhyudaya' },
  { id: 'gal-7', type: 'photo', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80', title: 'Euphoric fans cheering at the open-air festival main stage.', event: 'Abhyudaya' },
  { id: 'gal-8', type: 'photo', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', title: 'Detailed closeup of heritage brocade silk textures on the runway.', event: 'Miss Traditional' },
  { id: 'gal-9', type: 'photo', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', title: 'Interactive brand display pavilion at the National Trade Expo.', event: 'Expos' },
  { id: 'gal-10', type: 'photo', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', title: 'Core innovation teams collaborating in the final hours of the hackathon.', event: 'Competitions' },
  { id: 'gal-11', type: 'photo', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80', title: 'Keynote presentation discussing global clean tech infrastructure.', event: 'Conferences' },
  { id: 'gal-12', type: 'photo', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80', title: 'Sunset acoustic session overlooking the main arena crowd.', event: 'Abhyudaya' },
  { id: 'gal-13', type: 'photo', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', title: 'Traditional bridal collection showcase in handloom silk.', event: 'Miss Traditional' },
  { id: 'gal-14', type: 'photo', url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80', title: 'Demonstrating augmented reality design tools at the tech hub.', event: 'Expos' },
  { id: 'gal-15', type: 'photo', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80', title: 'Classical instrumentalist delivering a solo performance.', event: 'Competitions' },
  { id: 'gal-16', type: 'photo', url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80', title: 'Interactive Q&A session with a panel of clean energy delegates.', event: 'Conferences' },
  { id: 'gal-17', type: 'video', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80', title: 'Live vocal performance under dramatic stadium stage lasers.', event: 'Abhyudaya' },
  { id: 'gal-18', type: 'photo', url: 'https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=800&q=80', title: 'Folk embroidery collection displaying authentic regional textiles.', event: 'Miss Traditional' },
  { id: 'gal-19', type: 'photo', url: 'https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=800&q=80', title: 'Electric transit concept pods display at the future mobility arena.', event: 'Expos' },
  { id: 'gal-20', type: 'photo', url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80', title: 'Awarding ceremony for the national handloom championship.', event: 'Competitions' },
  { id: 'gal-21', type: 'photo', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80', title: 'Active business networking session inside the convention hall.', event: 'Conferences' },
  { id: 'gal-22', type: 'photo', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', title: 'Grand finale confetti shower across the full concert field.', event: 'Abhyudaya' },
  { id: 'gal-23', type: 'photo', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', title: 'Classic hand-block printing showcase during runway design review.', event: 'Miss Traditional' },
  { id: 'gal-24', type: 'photo', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', title: 'Technical innovators hacking custom smart city software prototypes.', event: 'Competitions' },
];

// Extra sponsor showcase cards (real content from the public sponsors page, merged in without disturbing existing rows)
const EXTRA_SPONSORS = [
  { id: 'sp-title-1', name: 'Tata Motors EV', logoUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80', tier: 'Title', websiteUrl: 'https://tatamotors.com', description: "Driving India's green transit with cutting-edge clean electric mobility solutions.", industry: 'Automotive' },
  { id: 'sp-plat-1', name: 'Airtel 5G Plus', logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80', tier: 'Platinum', websiteUrl: 'https://airtel.in', description: 'Supercharging experiential connectivity, high-fidelity live streaming, & smart paddock telemetry.', industry: 'Telecom' },
  { id: 'sp-plat-2', name: 'Paytm Checkout', logoUrl: '', tier: 'Platinum', websiteUrl: 'https://paytm.com', description: 'Securing millions of instant ledger transfers for frictionless track and gate checkouts.', industry: 'FinTech' },
  { id: 'sp-gold-1', name: 'Reliance Trends', logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80', tier: 'Gold', websiteUrl: 'https://trends.ajio.com', description: "Connecting modern demographics with premium fashion collections across India's cities.", industry: 'Retail' },
  { id: 'sp-assoc-1', name: 'Bisleri Vedica', logoUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80', tier: 'Partner', websiteUrl: 'https://bisleri.com', description: 'Premium natural mountain water.', industry: 'F&B' },
  { id: 'sp-assoc-2', name: 'BookMyShow', logoUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80', tier: 'Partner', websiteUrl: 'https://bookmyshow.com', description: 'Online movie and event tickets.', industry: 'Entertainment' },
];

export async function ensureSchema() {
  if (migrated) return;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      mobile TEXT,
      city TEXT,
      state TEXT,
      address TEXT,
      organization TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      is_verified BOOLEAN NOT NULL DEFAULT false,
      verification_code TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      summary TEXT,
      banner_url TEXT,
      event_date DATE NOT NULL,
      event_time TEXT,
      venue TEXT,
      city TEXT,
      google_map_url TEXT,
      is_featured BOOLEAN DEFAULT false,
      is_upcoming BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      ticket_prices JSONB DEFAULT '[]',
      organizer JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ticket_bookings (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      booking_ref TEXT UNIQUE NOT NULL,
      event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      event_name TEXT NOT NULL,
      event_date TEXT,
      event_venue TEXT,
      event_banner TEXT,
      visitor_name TEXT NOT NULL,
      visitor_email TEXT NOT NULL,
      visitor_mobile TEXT,
      visitor_city TEXT,
      ticket_type TEXT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      special_requests TEXT,
      payment_id TEXT,
      payment_method TEXT DEFAULT 'online',
      status TEXT NOT NULL DEFAULT 'confirmed',
      qr_hash TEXT UNIQUE NOT NULL,
      scanned_at TIMESTAMPTZ,
      scanned_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS competition_registrations (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      participant_id TEXT UNIQUE NOT NULL,
      competition_id TEXT,
      competition_name TEXT NOT NULL,
      competition_date TEXT,
      competition_venue TEXT,
      competition_banner TEXT,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      full_name TEXT NOT NULL,
      dob TEXT,
      age INT,
      gender TEXT,
      email TEXT NOT NULL,
      mobile TEXT,
      city TEXT,
      state TEXT,
      address TEXT,
      organization TEXT,
      category TEXT,
      emergency_contact TEXT,
      uploads JSONB DEFAULT '{}',
      payment_id TEXT,
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      status TEXT NOT NULL DEFAULT 'pending',
      qr_hash TEXT UNIQUE NOT NULL,
      scanned_at TIMESTAMPTZ,
      scanned_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS event_assigners (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      event_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      assigner_role TEXT NOT NULL DEFAULT 'Scanner',
      assigned_by TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS qr_scan_logs (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      qr_hash TEXT NOT NULL,
      scan_type TEXT NOT NULL,
      scanned_by TEXT,
      scanned_by_name TEXT,
      attendee_name TEXT,
      event_name TEXT,
      result TEXT NOT NULL,
      reason TEXT,
      scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sponsors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      tier TEXT NOT NULL,
      website_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      published_at TEXT NOT NULL,
      read_time TEXT NOT NULL,
      subheading TEXT,
      bullets JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      title TEXT NOT NULL,
      event TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS competitions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      summary TEXT,
      banner_url TEXT,
      event_date DATE,
      deadline DATE,
      venue TEXT,
      city TEXT,
      prize_pool TEXT,
      registration_fee NUMERIC(10,2) DEFAULT 0,
      categories JSONB DEFAULT '[]',
      rules JSONB DEFAULT '[]',
      judges JSONB DEFAULT '[]',
      faqs JSONB DEFAULT '[]',
      regional_hubs JSONB DEFAULT '[]',
      organizer JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS taxonomies (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(type, value)
    )
  `;

  // Schema migrations for existing tables
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.6`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 25`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsorship_tiers JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS stall_options JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS ad_rates JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS date_is_tentative BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS headliners JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS schedule_days JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS industry TEXT`;

  // Auto-seed events
  const eventCount = await sql`SELECT COUNT(*) as count FROM events`;
  if (Number(eventCount[0].count) === 0) {
    for (const ev of MOCK_EVENTS) {
      await sql`
        INSERT INTO events (id, name, slug, category, description, summary, banner_url, event_date, event_time, venue, city, google_map_url, is_featured, is_upcoming, ticket_prices, organizer)
        VALUES (${ev.id}, ${ev.name}, ${ev.slug}, ${ev.category}, ${ev.description}, ${ev.summary}, ${ev.bannerUrl}, ${ev.date}, ${ev.time}, ${ev.venue}, ${ev.city}, ${ev.googleMapEmbedUrl}, ${ev.isFeatured}, ${ev.isUpcoming}, ${JSON.stringify(ev.ticketPrices)}, ${JSON.stringify(ev.organizer)})
      `;
    }
    console.log("[DB INIT] Seeded events table.");
  }

  // Auto-seed sponsors
  const sponsorCount = await sql`SELECT COUNT(*) as count FROM sponsors`;
  if (Number(sponsorCount[0].count) === 0) {
    for (const sp of MOCK_SPONSORS) {
      await sql`
        INSERT INTO sponsors (id, name, logo_url, tier, website_url)
        VALUES (${sp.id}, ${sp.name}, ${sp.logoUrl}, ${sp.tier}, ${sp.websiteUrl})
      `;
    }
    console.log("[DB INIT] Seeded sponsors table.");
  }

  // Auto-seed blogs
  const blogCount = await sql`SELECT COUNT(*) as count FROM blogs`;
  if (Number(blogCount[0].count) === 0) {
    for (const bl of MOCK_BLOGS) {
      await sql`
        INSERT INTO blogs (id, title, slug, summary, content, image_url, category, author, published_at, read_time, subheading, bullets)
        VALUES (${bl.id}, ${bl.title}, ${bl.slug}, ${bl.summary}, ${bl.content}, ${bl.imageUrl}, ${bl.category}, ${bl.author}, ${bl.publishedAt}, ${bl.readTime}, ${bl.subheading || null}, ${JSON.stringify(bl.bullets || [])})
      `;
    }
    console.log("[DB INIT] Seeded blogs table.");
  }

  // Auto-seed gallery
  const galleryCount = await sql`SELECT COUNT(*) as count FROM gallery_items`;
  if (Number(galleryCount[0].count) === 0) {
    for (const g of MOCK_GALLERY) {
      await sql`
        INSERT INTO gallery_items (id, type, url, thumbnail_url, title, event)
        VALUES (${g.id}, ${g.type}, ${g.url}, ${g.thumbnailUrl}, ${g.title}, ${g.event})
      `;
    }
    console.log("[DB INIT] Seeded gallery_items table.");
  }

  // Merge in extra real gallery items (idempotent, doesn't disturb existing rows)
  for (const g of EXTRA_GALLERY_ITEMS) {
    await sql`
      INSERT INTO gallery_items (id, type, url, thumbnail_url, title, event)
      VALUES (${g.id}, ${g.type}, ${g.url}, ${g.url}, ${g.title}, ${g.event})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // Merge in extra real sponsor showcase cards (idempotent, doesn't disturb existing rows)
  for (const sp of EXTRA_SPONSORS) {
    await sql`
      INSERT INTO sponsors (id, name, logo_url, tier, website_url, description, industry)
      VALUES (${sp.id}, ${sp.name}, ${sp.logoUrl}, ${sp.tier}, ${sp.websiteUrl}, ${sp.description}, ${sp.industry})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // Auto-seed site_content — per-key upsert so newly introduced keys get seeded
  // on future deploys without ever overwriting a key an admin has already edited.
  for (const sc of MOCK_SITE_CONTENT) {
    await sql`
      INSERT INTO site_content (key, value)
      VALUES (${sc.key}, ${JSON.stringify(sc.value)})
      ON CONFLICT (key) DO NOTHING
    `;
  }

  // Auto-seed competitions
  const competitionCount = await sql`SELECT COUNT(*) as count FROM competitions`;
  if (Number(competitionCount[0].count) === 0) {
    for (const c of MOCK_COMPETITIONS) {
      await sql`
        INSERT INTO competitions (id, name, slug, description, summary, banner_url, event_date, deadline, venue, city, prize_pool, registration_fee, categories, rules, judges, faqs, regional_hubs, organizer)
        VALUES (${c.id}, ${c.name}, ${c.slug}, ${c.description}, ${c.summary}, ${c.bannerUrl}, ${c.eventDate}, ${c.deadline}, ${c.venue}, ${c.city}, ${c.prizePool}, ${c.registrationFee}, ${JSON.stringify(c.categories)}, ${JSON.stringify(c.rules)}, ${JSON.stringify(c.judges)}, ${JSON.stringify(c.faqs)}, ${JSON.stringify(c.regionalHubs)}, ${JSON.stringify(c.organizer)})
      `;
    }
    console.log("[DB INIT] Seeded competitions table.");
  }

  // Auto-seed taxonomies
  const taxonomyCount = await sql`SELECT COUNT(*) as count FROM taxonomies`;
  if (Number(taxonomyCount[0].count) === 0) {
    for (const t of MOCK_TAXONOMIES) {
      const id = `tax-${t.type}-${t.value}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await sql`
        INSERT INTO taxonomies (id, type, value)
        VALUES (${id}, ${t.type}, ${t.value})
        ON CONFLICT (type, value) DO NOTHING
      `;
    }
    console.log("[DB INIT] Seeded taxonomies table.");
  }

  // Auto-create default admin account if environment variables are set
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  if (defaultEmail && defaultPassword) {
    const existing = await sql`SELECT id FROM users WHERE email = ${defaultEmail.toLowerCase()}`;
    if (existing.length === 0) {
      const crypto = await import('crypto');
      const salt = 'RN_STATIC_SALT_2026';
      const passwordHash = crypto.createHmac('sha256', salt).update(defaultPassword).digest('hex');
      await sql`
        INSERT INTO users (name, email, password_hash, role, is_verified)
        VALUES ('Admin', ${defaultEmail.toLowerCase()}, ${passwordHash}, 'admin', true)
      `;
      console.log(`[DB INIT] Default admin account (${defaultEmail}) auto-created.`);
    }
  }

  migrated = true;
}
