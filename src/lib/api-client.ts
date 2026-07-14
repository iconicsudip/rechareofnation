// Mock API Client for Recharge Nation (Laravel REST API abstraction)
// Uses LocalStorage to persist data for a fully interactive experience.

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  city?: string;
  state?: string;
  address?: string;
  organization?: string;
  isVerified: boolean;
  avatarUrl?: string;
}

export type TicketType = 
  | 'General Entry' 
  | 'VIP Pass' 
  | 'VVIP Pass' 
  | 'Student Pass' 
  | 'Family Pass' 
  | 'Corporate Pass' 
  | 'Early Bird Ticket' 
  | 'Complimentary Pass';

export interface TicketPriceInfo {
  type: TicketType;
  price: number;
  available: number;
  description: string;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  summary: string;
  bannerUrl: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  googleMapEmbedUrl: string;
  isFeatured: boolean;
  isUpcoming: boolean;
  ticketPrices: TicketPriceInfo[];
  registrationFee?: number; // For competitions
  rules?: string[];
  organizer: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  sponsors: { name: string; logoUrl: string }[];
  galleryUrls: string[];
}

export interface TicketBooking {
  id: string;
  bookingRef: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  eventBanner: string;
  visitorName: string;
  visitorEmail: string;
  visitorMobile: string;
  visitorCity: string;
  ticketType: TicketType;
  quantity: number;
  totalAmount: number;
  specialRequests?: string;
  paymentId: string;
  paymentMethod: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
  qrCodeValue: string;
}

export interface CompetitionCategoryInfo {
  name: string;
  ageGroup: string;
  fee: number;
}

export interface Competition {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string;
  date: string;
  venue: string;
  city: string;
  categories: CompetitionCategoryInfo[];
  rules: string[];
  prizes: string[];
  deadline: string;
  registrationFee: number;
}

export interface CompetitionRegistration {
  id: string;
  participantId: string; // Generated e.g., RN-2026-COMP-XXXX
  competitionId: string;
  competitionName: string;
  competitionDate: string;
  competitionVenue: string;
  competitionBanner: string;
  fullName: string;
  dob: string;
  age: number;
  gender: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  address: string;
  organization: string; // School/College/Org
  category: string;
  emergencyContact: string;
  uploads: {
    photograph?: string; // Filenames or mock base64
    govId?: string;
    performanceVideo?: string;
    portfolio?: string;
    certificates?: string;
  };
  isEmailVerified: boolean;
  verificationCode?: string;
  paymentId?: string;
  paymentStatus: 'paid' | 'unpaid' | 'waived';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  qrCodeValue: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  tier: 'Title' | 'Platinum' | 'Gold' | 'Media' | 'Partner';
  websiteUrl: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl: string;
  category: string;
  author: string;
  publishedAt: string;
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl: string;
  title: string;
  event: string;
}

// Static Seed Data
const MOCK_EVENTS: Event[] = [
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
    },
    sponsors: [
      { name: 'Airtel', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=100&h=50&q=80' },
      { name: 'Tata Cliq', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=100&h=50&q=80' }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80'
    ]
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
    registrationFee: 500, // For competitors
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
    },
    sponsors: [
      { name: 'RedBull', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=100&h=50&q=80' }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'
    ]
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
    },
    sponsors: [
      { name: 'Razorpay', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=100&h=50&q=80' },
      { name: 'AWS', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=100&h=50&q=80' }
    ],
    galleryUrls: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80'
    ]
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
    registrationFee: 350, // For competitor
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
    },
    sponsors: [
      { name: 'Zomato', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=100&h=50&q=80' }
    ],
    galleryUrls: []
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
    isUpcoming: false, // PAST EVENT
    ticketPrices: [
      { type: 'General Entry', price: 999, available: 0, description: 'Sold Out' }
    ],
    organizer: {
      name: 'Recharge Nation Goa Chapter',
      contact: 'Roy Fernandes',
      email: 'goa@rechargenation.in',
      phone: '+91 99999 11111'
    },
    sponsors: [],
    galleryUrls: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    ]
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
    isUpcoming: false, // PAST EVENT
    ticketPrices: [],
    organizer: {
      name: 'Recharge Academy',
      contact: 'Prof. K. Swamy',
      email: 'academy@rechargenation.in',
      phone: '+91 94440 22222'
    },
    sponsors: [],
    galleryUrls: []
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
    registrationFee: 400,
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
    },
    sponsors: [{ name: 'Sennheiser', logoUrl: '' }],
    galleryUrls: []
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
    registrationFee: 1000,
    rules: [
      'Dress code: Formal/Chic required at check-in.',
      'Photographers must secure official media press tags at the helpdesk.'
    ],
    organizer: {
      name: 'Recharge Style Bureau',
      contact: 'Rhea Kapoor',
      email: 'style@rechargenation.in',
      phone: '+91 91111 22222'
    },
    sponsors: [{ name: 'Vogue India', logoUrl: '' }],
    galleryUrls: []
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
    registrationFee: 250,
    rules: [
      'Purchased craft works are safely packed and delivered to the pick-up counter.',
      'No sketching or flash photography near heritage paintings.'
    ],
    organizer: {
      name: 'Recharge Heritage Trust',
      contact: 'Dr. Devika Iyer',
      email: 'heritage@rechargenation.in',
      phone: '+91 97777 55555'
    },
    sponsors: [],
    galleryUrls: []
  }
];

const MOCK_SPONSORS: Sponsor[] = [
  { id: 'sp-1', name: 'Airtel', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Title', websiteUrl: 'https://airtel.in' },
  { id: 'sp-2', name: 'Tata Motors', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Platinum', websiteUrl: 'https://tatamotors.com' },
  { id: 'sp-3', name: 'Red Bull', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Gold', websiteUrl: 'https://redbull.com' },
  { id: 'sp-4', name: 'Razorpay', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Partner', websiteUrl: 'https://razorpay.com' },
  { id: 'sp-5', name: 'Times of India', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=200&h=100&q=80', tier: 'Media', websiteUrl: 'https://timesofindia.indiatimes.com' }
];

const MOCK_BLOGS: Blog[] = [
  {
    id: 'bl-1',
    title: 'Top 5 Highlights to Expect at Recharge Odyssey 2026',
    slug: 'top-5-highlights-odyssey-2026',
    summary: 'From classical ensembles to local cuisine stalls, here is everything you need to map out for Delhi\'s premium event.',
    content: 'Recharge Cultural Odyssey 2026 is around the corner. To make sure you do not miss the finest experiences, we have curated the ultimate check-list. Number one is the opening night Classical Fusion performance featuring world-renowned sitarists. Second, explore the Crafts Pavilion showcasing lost art forms from rural India. Third, check out the specialized kids workshop arena. Fourth, indulge in authentic native street foods from 20 different states. Lastly, grab the official merchandise before they sell out.',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    category: 'Event Guides',
    author: 'Sunita Roy',
    publishedAt: '2026-07-10'
  },
  {
    id: 'bl-2',
    title: 'How to Prepare Your Dance Crew for National Competitions',
    slug: 'prepare-dance-crew-national-competitions',
    summary: 'Expert choreography, prop checks, and breathing hacks to keep your team stage-ready under high pressure.',
    content: 'Competing in the Vibe & Rhythm Dance Cup is an exciting milestone. Preparation requires careful discipline. Ensure your sound cues are perfectly edited. Standardize costumes to avoid wardrobe slips. Keep stage sizes in mind while pacing movements. Practice with full props to gain spatial confidence. Finally, support each member and maintain a healthy physical routine leading up to the main day.',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    category: 'Tips & Tricks',
    author: 'Vikram Bose',
    publishedAt: '2026-07-01'
  }
];

const MOCK_GALLERY: GalleryItem[] = [
  { id: 'g-1', type: 'photo', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=300&q=80', title: 'Odyssey Grand Stage', event: 'Cultural Odyssey 2025' },
  { id: 'g-2', type: 'photo', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=300&q=80', title: 'Sufi Rock Performance', event: 'Fusion Carnival 2025' },
  { id: 'g-3', type: 'photo', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80', title: 'Choreography Contest Soloist', event: 'Dance Cup 2025' },
  { id: 'g-4', type: 'photo', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=300&q=80', title: 'Startup Pitch Arena', event: 'Tech Trade Expo 2025' }
];

// Helper methods for localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// API Implementation
export const ApiClient = {
  // Static queries
  getEvents: async (): Promise<Event[]> => {
    return MOCK_EVENTS;
  },
  getEventBySlug: async (slug: string): Promise<Event | undefined> => {
    return MOCK_EVENTS.find(e => e.slug === slug);
  },
  getEventById: async (id: string): Promise<Event | undefined> => {
    return MOCK_EVENTS.find(e => e.id === id);
  },
  getSponsors: async (): Promise<Sponsor[]> => {
    return MOCK_SPONSORS;
  },
  getBlogs: async (): Promise<Blog[]> => {
    return MOCK_BLOGS;
  },
  getBlogBySlug: async (slug: string): Promise<Blog | undefined> => {
    return MOCK_BLOGS.find(b => b.slug === slug);
  },
  getGalleryItems: async (): Promise<GalleryItem[]> => {
    return MOCK_GALLERY;
  },

  // Auth Operations
  getCurrentUser: (): User | null => {
    return getStorageItem<User | null>('rn_current_user', null);
  },

  registerUser: async (name: string, email: string, passwordHash: string, details?: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> => {
    const users = getStorageItem<any[]>('rn_registered_users', []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email address already registered' };
    }
    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      isVerified: false,
      ...details
    };
    users.push({ ...newUser, passwordHash });
    setStorageItem('rn_registered_users', users);
    
    // Set verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setStorageItem(`rn_verification_code_${newUser.id}`, verificationCode);
    console.log(`[MOCK EMAIL SMTP] Verification code for ${email} is ${verificationCode}`);

    // Auto-login as unverified
    setStorageItem('rn_current_user', newUser);

    return { success: true, user: newUser };
  },

  loginUser: async (email: string, passwordHash: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const users = getStorageItem<any[]>('rn_registered_users', []);
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);
    if (!found) {
      return { success: false, error: 'Invalid email or password' };
    }
    const user: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      mobile: found.mobile,
      city: found.city,
      state: found.state,
      address: found.address,
      organization: found.organization,
      isVerified: found.isVerified,
      avatarUrl: found.avatarUrl
    };
    setStorageItem('rn_current_user', user);
    return { success: true, user };
  },

  verifyEmailCode: async (userId: string, code: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const sentCode = getStorageItem<string | null>(`rn_verification_code_${userId}`, null);
    if (!sentCode || sentCode !== code) {
      return { success: false, error: 'Incorrect verification code. Please check your simulated log/console.' };
    }
    
    // Update verification in registered list
    const users = getStorageItem<any[]>('rn_registered_users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].isVerified = true;
      setStorageItem('rn_registered_users', users);
    }

    // Update current user
    const currentUser = ApiClient.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.isVerified = true;
      setStorageItem('rn_current_user', currentUser);
    }
    
    return { success: true, user: currentUser || undefined };
  },

  logoutUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rn_current_user');
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User }> => {
    const users = getStorageItem<any[]>('rn_registered_users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      setStorageItem('rn_registered_users', users);
    }

    const currentUser = ApiClient.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      setStorageItem('rn_current_user', updatedUser);
      return { success: true, user: updatedUser };
    }
    return { success: false };
  },

  // Ticket Bookings Operations
  getBookings: (): TicketBooking[] => {
    const user = ApiClient.getCurrentUser();
    if (!user) return [];
    const allBookings = getStorageItem<TicketBooking[]>('rn_bookings', []);
    return allBookings.filter(b => b.visitorEmail.toLowerCase() === user.email.toLowerCase());
  },

  createBooking: async (bookingData: Omit<TicketBooking, 'id' | 'bookingRef' | 'createdAt' | 'status' | 'qrCodeValue'>): Promise<TicketBooking> => {
    const allBookings = getStorageItem<TicketBooking[]>('rn_bookings', []);
    const bookingRef = 'RN-BK-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: TicketBooking = {
      ...bookingData,
      id: 'bk-' + Math.random().toString(36).substr(2, 9),
      bookingRef,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      qrCodeValue: `RECHARGE-TICKET:${bookingRef}:${bookingData.visitorEmail}`
    };
    allBookings.push(newBooking);
    setStorageItem('rn_bookings', allBookings);

    // Mock Email Trigger
    console.log(`[MOCK EMAIL SMTP] Sending Ticket Confirmation to ${bookingData.visitorEmail} for booking ${bookingRef}`);
    return newBooking;
  },

  // Competition Registrations Operations
  getRegistrations: (): CompetitionRegistration[] => {
    const user = ApiClient.getCurrentUser();
    if (!user) return [];
    const allRegs = getStorageItem<CompetitionRegistration[]>('rn_registrations', []);
    return allRegs.filter(r => r.email.toLowerCase() === user.email.toLowerCase());
  },

  createRegistration: async (regData: Omit<CompetitionRegistration, 'id' | 'participantId' | 'createdAt' | 'qrCodeValue' | 'isEmailVerified'>): Promise<CompetitionRegistration> => {
    const allRegs = getStorageItem<CompetitionRegistration[]>('rn_registrations', []);
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const categoryCode = regData.category.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const participantId = `RN-2026-${categoryCode}-${randDigits}`;
    
    const newReg: CompetitionRegistration = {
      ...regData,
      id: 'reg-' + Math.random().toString(36).substr(2, 9),
      participantId,
      isEmailVerified: true, // Auto verified for current authenticated user flow
      createdAt: new Date().toISOString(),
      qrCodeValue: `RECHARGE-PARTICIPANT:${participantId}:${regData.email}`
    };
    allRegs.push(newReg);
    setStorageItem('rn_registrations', allRegs);

    // Mock Email Trigger
    console.log(`[MOCK EMAIL SMTP] Sending Competition Registration ID ${participantId} confirmation to ${regData.email}`);
    return newReg;
  },

  // Contact Form Submissions
  submitContactForm: async (data: { name: string; email: string; phone: string; subject: string; message: string }): Promise<{ success: boolean }> => {
    const submissions = getStorageItem<any[]>('rn_contact_submissions', []);
    submissions.push({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
    setStorageItem('rn_contact_submissions', submissions);
    console.log(`[MOCK EMAIL SMTP] Received contact enquiry from ${data.email}. Sending auto-acknowledgement.`);
    return { success: true };
  },

  // Sponsor Form Submissions
  submitSponsorForm: async (data: { companyName: string; contactPerson: string; email: string; phone: string; tierInterest: string; message?: string }): Promise<{ success: boolean }> => {
    const submissions = getStorageItem<any[]>('rn_sponsor_submissions', []);
    submissions.push({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
    setStorageItem('rn_sponsor_submissions', submissions);
    console.log(`[MOCK EMAIL SMTP] Received sponsor request from ${data.companyName} (${data.email}). Sending sales team alert.`);
    return { success: true };
  }
};
