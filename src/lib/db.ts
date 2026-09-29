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

// Global singleton to guarantee ensureSchema executes strictly ONCE in the application lifecycle
const globalForSchema = globalThis as unknown as {
  _schemaDone?: boolean;
  _schemaPromise?: Promise<void> | null;
};

// All placeholder/mock seed data has been removed. Real content is entered
// through the admin panel; ensureSchema() below only creates tables and
// performs migrations — it no longer inserts any dummy rows.

async function runSchemaInitialization() {
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
      qr_stages JSONB DEFAULT '[{"id":"entry","name":"Entry Gate","order":1}]',
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
      scan_history JSONB DEFAULT '[]',
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
      scan_history JSONB DEFAULT '[]',
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
      stage_id TEXT,
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

  await sql`
    CREATE TABLE IF NOT EXISTS _bootstrap_state (
      key TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Schema migrations for existing tables
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.6`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS qr_stages JSONB DEFAULT '[{"id":"entry","name":"Entry Gate","order":1}]'`;
  await sql`ALTER TABLE ticket_bookings ADD COLUMN IF NOT EXISTS scan_history JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE competition_registrations ADD COLUMN IF NOT EXISTS scan_history JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE qr_scan_logs ADD COLUMN IF NOT EXISTS stage_id TEXT`;

  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 25`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsorship_tiers JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS stall_options JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS ad_rates JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS date_is_tentative BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS headliners JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS schedule_days JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT ''`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS brochure_pdf_url TEXT DEFAULT ''`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS exhibit_info TEXT DEFAULT ''`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS visit_info TEXT DEFAULT ''`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_sections JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS booking_form_fields JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS inquiry_form_fields JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE competitions ADD COLUMN IF NOT EXISTS registration_form_fields JSONB DEFAULT '[]'`;
  await sql`ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS industry TEXT`;

  // One-time bootstrap guard: if 'schema_ready' is recorded, NEVER run seed queries on refresh.
  let isBootstrapped = false;
  try {
    const ready = await sql`SELECT 1 FROM _bootstrap_state WHERE key = 'schema_ready'`;
    if (ready.length > 0) {
      isBootstrapped = true;
    }
  } catch {
    // _bootstrap_state was just created
  }

  if (isBootstrapped) {
    return;
  }

  await sql`INSERT INTO _bootstrap_state (key) VALUES ('schema_ready') ON CONFLICT (key) DO NOTHING`;

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

}

/**
 * Ensures schema creation, migrations, and one-time bootstrap execute strictly
 * ONCE in the application lifecycle. Concurrent and subsequent calls return
 * immediately without redundant database round-trips.
 */
export async function ensureSchema(): Promise<void> {
  // If already executed once in this application runtime, return immediately
  if (globalForSchema._schemaDone) {
    return;
  }

  // If already in-flight, return the active promise so concurrent calls wait for the same execution
  if (globalForSchema._schemaPromise) {
    return globalForSchema._schemaPromise;
  }

  globalForSchema._schemaPromise = (async () => {
    try {
      await runSchemaInitialization();
      globalForSchema._schemaDone = true;
    } catch (err) {
      console.error("[DB INIT] ensureSchema error:", err);
      globalForSchema._schemaPromise = null;
      throw err;
    }
  })();

  return globalForSchema._schemaPromise;
}
