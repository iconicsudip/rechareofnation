// API Client for Recharge Nation
// All content is fetched from the Neon PostgreSQL database via Next.js API routes.

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
  rating: number;
  reviewCount: number;
  organizer: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  sponsorshipTiers: { tier: string; amount: string; benefits: string }[];
  stallOptions: { type: string; size: string; rate: string; includes: string }[];
  adRates: { category: string; amount: string }[];
  dateIsTentative: boolean;
  headliners: { name: string; role: string; img: string }[];
  faqs: { q: string; a: string }[];
  scheduleDays: { dayLabel: string; items: { time: string; title: string; desc: string }[] }[];
  sponsors: { name: string; logoUrl: string }[];
  galleryUrls: string[];
}

export interface CompetitionCategory {
  name: string;
  ageGroup?: string;
  fee?: number;
}

export interface CompetitionJudge {
  name: string;
  role: string;
  desc: string;
}

export interface CompetitionFaq {
  q: string;
  a: string;
}

export interface CompetitionRegionalHub {
  city: string;
  venue: string;
  date: string;
}

export interface CompetitionRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  summary: string;
  bannerUrl: string;
  eventDate: string;
  deadline: string;
  venue: string;
  city: string;
  prizePool: string;
  registrationFee: number;
  categories: CompetitionCategory[];
  rules: string[];
  judges: CompetitionJudge[];
  faqs: CompetitionFaq[];
  regionalHubs: CompetitionRegionalHub[];
  organizer: { name: string; contact: string; email: string; phone: string };
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
  description?: string;
  industry?: string;
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
  readTime?: string;
  subheading?: string;
  bullets?: string[];
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl: string;
  title: string;
  event: string;
}


// ─── localStorage helpers (client-side only) ─────────────────────────────────

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try { return JSON.parse(stored); } catch { return defaultValue; }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ─── DB row → Event mapper ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDbEvent = (e: any): Event => ({
  id: e.id,
  name: e.name,
  slug: e.slug,
  category: e.category || '',
  description: e.description || '',
  summary: e.summary || '',
  bannerUrl: e.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  date: String(e.event_date ?? '').slice(0, 10),
  time: e.event_time || '18:00',
  venue: e.venue || '',
  city: e.city || '',
  googleMapEmbedUrl: e.google_map_url || '',
  isFeatured: e.is_featured ?? false,
  isUpcoming: e.is_upcoming ?? true,
  ticketPrices: Array.isArray(e.ticket_prices)
    ? e.ticket_prices
    : (() => { try { return JSON.parse(e.ticket_prices || '[]'); } catch { return []; } })(),
  organizer: (typeof e.organizer === 'object' && e.organizer !== null)
    ? e.organizer
    : (() => { try { return JSON.parse(e.organizer || '{}'); } catch { return { name: '', contact: '', email: '', phone: '' }; } })(),
  rules: Array.isArray(e.rules)
    ? e.rules
    : (() => { try { return JSON.parse(e.rules || '[]'); } catch { return []; } })(),
  rating: e.rating != null ? Number(e.rating) : 4.6,
  reviewCount: e.review_count != null ? Number(e.review_count) : 25,
  sponsorshipTiers: Array.isArray(e.sponsorship_tiers)
    ? e.sponsorship_tiers
    : (() => { try { return JSON.parse(e.sponsorship_tiers || '[]'); } catch { return []; } })(),
  stallOptions: Array.isArray(e.stall_options)
    ? e.stall_options
    : (() => { try { return JSON.parse(e.stall_options || '[]'); } catch { return []; } })(),
  adRates: Array.isArray(e.ad_rates)
    ? e.ad_rates
    : (() => { try { return JSON.parse(e.ad_rates || '[]'); } catch { return []; } })(),
  dateIsTentative: e.date_is_tentative ?? false,
  headliners: Array.isArray(e.headliners)
    ? e.headliners
    : (() => { try { return JSON.parse(e.headliners || '[]'); } catch { return []; } })(),
  faqs: Array.isArray(e.faqs)
    ? e.faqs
    : (() => { try { return JSON.parse(e.faqs || '[]'); } catch { return []; } })(),
  scheduleDays: Array.isArray(e.schedule_days)
    ? e.schedule_days
    : (() => { try { return JSON.parse(e.schedule_days || '[]'); } catch { return []; } })(),
  sponsors: [],
  galleryUrls: [],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDbCompetition = (c: any): CompetitionRecord => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description || '',
  summary: c.summary || '',
  bannerUrl: c.banner_url || '',
  eventDate: String(c.event_date ?? '').slice(0, 10),
  deadline: String(c.deadline ?? '').slice(0, 10),
  venue: c.venue || '',
  city: c.city || '',
  prizePool: c.prize_pool || '',
  registrationFee: c.registration_fee != null ? Number(c.registration_fee) : 0,
  categories: Array.isArray(c.categories) ? c.categories : (() => { try { return JSON.parse(c.categories || '[]'); } catch { return []; } })(),
  rules: Array.isArray(c.rules) ? c.rules : (() => { try { return JSON.parse(c.rules || '[]'); } catch { return []; } })(),
  judges: Array.isArray(c.judges) ? c.judges : (() => { try { return JSON.parse(c.judges || '[]'); } catch { return []; } })(),
  faqs: Array.isArray(c.faqs) ? c.faqs : (() => { try { return JSON.parse(c.faqs || '[]'); } catch { return []; } })(),
  regionalHubs: Array.isArray(c.regional_hubs) ? c.regional_hubs : (() => { try { return JSON.parse(c.regional_hubs || '[]'); } catch { return []; } })(),
  organizer: (typeof c.organizer === 'object' && c.organizer !== null)
    ? c.organizer
    : (() => { try { return JSON.parse(c.organizer || '{}'); } catch { return { name: '', contact: '', email: '', phone: '' }; } })(),
});

// ─── API Client ───────────────────────────────────────────────────────────────

export const ApiClient = {

  getEvents: async (): Promise<Event[]> => {
    const res = await fetch('/api/events');
    if (!res.ok) throw new Error('Failed to load events');
    const data = await res.json();
    return (data.events ?? []).map(mapDbEvent);
  },

  getEventBySlug: async (slug: string): Promise<Event | undefined> => {
    const all = await ApiClient.getEvents();
    return all.find(e => e.slug === slug);
  },

  getEventById: async (id: string): Promise<Event | undefined> => {
    const all = await ApiClient.getEvents();
    return all.find(e => e.id === id);
  },

  getSponsors: async (): Promise<Sponsor[]> => {
    try {
      const res = await fetch('/api/sponsors');
      if (!res.ok) return [];
      const data = await res.json();
      return (data.sponsors ?? []).map((s: any): Sponsor => ({
        id: s.id, name: s.name, logoUrl: s.logo_url, tier: s.tier, websiteUrl: s.website_url,
        description: s.description || '', industry: s.industry || '',
      }));
    } catch { return []; }
  },

  getCompetitions: async (): Promise<CompetitionRecord[]> => {
    try {
      const res = await fetch('/api/competitions');
      if (!res.ok) return [];
      const data = await res.json();
      return (data.competitions ?? []).map(mapDbCompetition);
    } catch { return []; }
  },

  getCompetitionBySlug: async (slug: string): Promise<CompetitionRecord | undefined> => {
    const all = await ApiClient.getCompetitions();
    return all.find(c => c.slug === slug);
  },

  getSiteContent: async <T = Record<string, unknown>>(key: string): Promise<T | null> => {
    try {
      const res = await fetch(`/api/site-content?key=${encodeURIComponent(key)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return (data.content?.value as T) ?? null;
    } catch { return null; }
  },

  getTaxonomy: async (type: string): Promise<string[]> => {
    try {
      const res = await fetch(`/api/taxonomies?type=${encodeURIComponent(type)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.values ?? [];
    } catch { return []; }
  },

  getBlogs: async (): Promise<Blog[]> => {
    try {
      const res = await fetch('/api/blogs');
      if (!res.ok) return [];
      const data = await res.json();
      return (data.blogs ?? []).map((b: any): Blog => ({
        id: b.id, title: b.title, slug: b.slug, summary: b.summary,
        content: b.content, imageUrl: b.image_url, category: b.category,
        author: b.author, publishedAt: b.published_at, readTime: b.read_time,
        subheading: b.subheading,
        bullets: Array.isArray(b.bullets) ? b.bullets : (() => { try { return JSON.parse(b.bullets || '[]'); } catch { return []; } })(),
      }));
    } catch { return []; }
  },

  getBlogBySlug: async (slug: string): Promise<Blog | undefined> => {
    const all = await ApiClient.getBlogs();
    return all.find(b => b.slug === slug);
  },

  getGalleryItems: async (): Promise<GalleryItem[]> => {
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) return [];
      const data = await res.json();
      return (data.items ?? []).map((g: any): GalleryItem => ({
        id: g.id, type: g.type, url: g.url, thumbnailUrl: g.thumbnail_url, title: g.title, event: g.event,
      }));
    } catch { return []; }
  },

  getCurrentUser: (): User | null => {
    return getStorageItem<User | null>('rn_current_user', null);
  },

  registerUser: async (
    name: string, email: string, passwordHash: string, details?: Partial<User>
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: passwordHash, ...details })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStorageItem('rn_current_user', data.user);
        if (data.verificationCode) setStorageItem(`rn_verification_code_${data.user.id}`, data.verificationCode);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err) {
      console.warn('Backend register failed, using localStorage fallback:', err);
    }
    const users = getStorageItem<any[]>('rn_registered_users', []);
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email address already registered' };
    }
    const newUser: User = { id: 'usr-' + Math.random().toString(36).substr(2, 9), name, email, isVerified: false, ...details };
    users.push({ ...newUser, passwordHash });
    setStorageItem('rn_registered_users', users);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setStorageItem(`rn_verification_code_${newUser.id}`, verificationCode);
    console.log(`[MOCK SMTP] OTP for ${email}: ${verificationCode}`);
    setStorageItem('rn_current_user', newUser);
    return { success: true, user: newUser };
  },

  loginUser: async (
    email: string, passwordHash: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordHash })
      });
      const data = await response.json();
      if (response.ok && data.success) { setStorageItem('rn_current_user', data.user); return { success: true, user: data.user }; }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err) {
      console.warn('Backend login failed, using localStorage fallback:', err);
    }
    const users = getStorageItem<any[]>('rn_registered_users', []);
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);
    if (!found) return { success: false, error: 'Invalid email or password' };
    const user: User = {
      id: found.id, name: found.name, email: found.email, mobile: found.mobile,
      city: found.city, state: found.state, address: found.address,
      organization: found.organization, isVerified: found.isVerified, avatarUrl: found.avatarUrl
    };
    setStorageItem('rn_current_user', user);
    return { success: true, user };
  },

  verifyEmailCode: async (
    userId: string, code: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      const data = await response.json();
      if (response.ok && data.success) { setStorageItem('rn_current_user', data.user); return { success: true, user: data.user }; }
      return { success: false, error: data.error || 'Verification failed' };
    } catch (err) {
      console.warn('Backend verification failed, using localStorage fallback:', err);
    }
    const sentCode = getStorageItem<string | null>(`rn_verification_code_${userId}`, null);
    if (!sentCode || sentCode !== code) return { success: false, error: 'Incorrect verification code.' };
    const users = getStorageItem<any[]>('rn_registered_users', []);
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) { users[idx].isVerified = true; setStorageItem('rn_registered_users', users); }
    const currentUser = ApiClient.getCurrentUser();
    if (currentUser && currentUser.id === userId) { currentUser.isVerified = true; setStorageItem('rn_current_user', currentUser); }
    return { success: true, user: currentUser || undefined };
  },

  logoutUser: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rn_current_user');
      localStorage.removeItem('rn_admin');
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User }> => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates })
      });
      const data = await response.json();
      if (response.ok && data.success) { setStorageItem('rn_current_user', data.user); return { success: true, user: data.user }; }
    } catch (err) {
      console.warn('Backend profile update failed:', err);
    }
    const users = getStorageItem<any[]>('rn_registered_users', []);
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx !== -1) { users[idx] = { ...users[idx], ...updates }; setStorageItem('rn_registered_users', users); }
    const currentUser = ApiClient.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      setStorageItem('rn_current_user', updatedUser);
      return { success: true, user: updatedUser };
    }
    return { success: false };
  },

  getBookings: (): TicketBooking[] => {
    const user = ApiClient.getCurrentUser();
    if (!user) return [];
    return getStorageItem<TicketBooking[]>('rn_bookings', []).filter(
      b => b.visitorEmail.toLowerCase() === user.email.toLowerCase()
    );
  },

  createBooking: async (
    bookingData: Omit<TicketBooking, 'id' | 'bookingRef' | 'createdAt' | 'status' | 'qrCodeValue'>
  ): Promise<TicketBooking> => {
    const user = ApiClient.getCurrentUser();
    try {
      const response = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookingData, userId: user?.id })
      });
      const data = await response.json();
      if (response.ok && data.success && data.booking) {
        const db = data.booking;
        const booking: TicketBooking = {
          id: db.id, bookingRef: db.booking_ref, eventId: db.event_id,
          eventName: db.event_name, eventDate: String(db.event_date ?? '').slice(0, 10),
          eventVenue: db.event_venue, eventBanner: db.event_banner,
          visitorName: db.visitor_name, visitorEmail: db.visitor_email,
          visitorMobile: db.visitor_mobile, visitorCity: db.visitor_city,
          ticketType: db.ticket_type, quantity: db.quantity,
          totalAmount: parseFloat(db.total_amount), specialRequests: db.special_requests,
          paymentId: db.payment_id, paymentMethod: db.payment_method,
          status: db.status, createdAt: db.created_at, qrCodeValue: db.qr_hash
        };
        const all = getStorageItem<TicketBooking[]>('rn_bookings', []);
        all.push(booking);
        setStorageItem('rn_bookings', all);
        return booking;
      }
    } catch (err) {
      console.warn('Backend booking failed, using localStorage fallback:', err);
    }
    const all = getStorageItem<TicketBooking[]>('rn_bookings', []);
    const bookingRef = 'RN-BK-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: TicketBooking = {
      ...bookingData, id: 'bk-' + Math.random().toString(36).substr(2, 9),
      bookingRef, createdAt: new Date().toISOString(), status: 'confirmed',
      qrCodeValue: `RECHARGE-TICKET:${bookingRef}:${bookingData.visitorEmail}`
    };
    all.push(newBooking);
    setStorageItem('rn_bookings', all);
    return newBooking;
  },

  getRegistrations: (): CompetitionRegistration[] => {
    const user = ApiClient.getCurrentUser();
    if (!user) return [];
    return getStorageItem<CompetitionRegistration[]>('rn_registrations', []).filter(
      r => r.email.toLowerCase() === user.email.toLowerCase()
    );
  },

  createRegistration: async (
    regData: Omit<CompetitionRegistration, 'id' | 'participantId' | 'createdAt' | 'qrCodeValue' | 'isEmailVerified'>
  ): Promise<CompetitionRegistration> => {
    const user = ApiClient.getCurrentUser();
    try {
      const response = await fetch('/api/user/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...regData, userId: user?.id })
      });
      const data = await response.json();
      if (response.ok && data.success && data.registration) {
        const db = data.registration;
        const reg: CompetitionRegistration = {
          id: db.id, participantId: db.participant_id, competitionId: db.competition_id,
          competitionName: db.competition_name, competitionDate: db.competition_date,
          competitionVenue: db.competition_venue, competitionBanner: db.competition_banner,
          fullName: db.full_name, dob: db.dob, age: db.age, gender: db.gender,
          email: db.email, mobile: db.mobile, city: db.city, state: db.state,
          address: db.address, organization: db.organization, category: db.category,
          emergencyContact: db.emergency_contact, uploads: db.uploads || {},
          paymentId: db.payment_id, paymentStatus: db.payment_status,
          status: db.status, createdAt: db.created_at, qrCodeValue: db.qr_hash, isEmailVerified: true
        };
        const all = getStorageItem<CompetitionRegistration[]>('rn_registrations', []);
        all.push(reg);
        setStorageItem('rn_registrations', all);
        return reg;
      }
    } catch (err) {
      console.warn('Backend registration failed, using localStorage fallback:', err);
    }
    const all = getStorageItem<CompetitionRegistration[]>('rn_registrations', []);
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const categoryCode = regData.category.substring(0, 4).toUpperCase().replace(/s/g, '');
    const participantId = `RN-2026-${categoryCode}-${randDigits}`;
    const newReg: CompetitionRegistration = {
      ...regData, id: 'reg-' + Math.random().toString(36).substr(2, 9),
      participantId, isEmailVerified: true, createdAt: new Date().toISOString(),
      qrCodeValue: `RECHARGE-PARTICIPANT:${participantId}:${regData.email}`
    };
    all.push(newReg);
    setStorageItem('rn_registrations', all);
    return newReg;
  },

  submitContactForm: async (data: { name: string; email: string; phone: string; subject: string; message: string }): Promise<{ success: boolean }> => {
    const submissions = getStorageItem<any[]>('rn_contact_submissions', []);
    submissions.push({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
    setStorageItem('rn_contact_submissions', submissions);
    return { success: true };
  },

  submitSponsorForm: async (data: { companyName: string; contactPerson: string; email: string; phone: string; tierInterest: string; message?: string }): Promise<{ success: boolean }> => {
    const submissions = getStorageItem<any[]>('rn_sponsor_submissions', []);
    submissions.push({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
    setStorageItem('rn_sponsor_submissions', submissions);
    return { success: true };
  }
};
