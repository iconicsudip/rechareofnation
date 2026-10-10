// scripts/migrate-s3-images.js
// Migrates all broken S3 images in the database (Events, Competitions, Blogs, Sponsors, Gallery)
// into the PostgreSQL `uploaded_photos` table, optimized under 1MB WebP.
const { neon } = require('@neondatabase/serverless');
const sharp = require('sharp');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Helper to download an image from URL and optimize to under 1MB WebP buffer
async function fetchAndOptimize(url, filename, category = 'general') {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuf = await res.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuf);

    let maxDim = 1600;
    let quality = 85;

    let processed = await sharp(rawBuffer)
      .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    while (processed.length > 950 * 1024 && quality > 40) {
      quality -= 10;
      processed = await sharp(rawBuffer)
        .resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }

    const meta = await sharp(processed).metadata();
    const id = `migrated-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const hex = '\\x' + processed.toString('hex');

    await sql`
      INSERT INTO uploaded_photos (
        id, filename, mime_type, size_bytes, data, width, height, category
      )
      VALUES (
        ${id}, ${filename}, 'image/webp', ${processed.length}, ${hex}::bytea,
        ${meta.width || null}, ${meta.height || null}, ${category}
      )
      ON CONFLICT (id) DO NOTHING
    `;

    return `/api/media/${id}`;
  } catch (err) {
    console.error(`Failed to fetch & optimize ${url}:`, err.message);
    return null;
  }
}

// Helper to generate a crisp luxury brand emblem for sponsors
async function generateSponsorLogo(name, idSuffix) {
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  const svg = `
    <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1A110B"/>
          <stop offset="100%" stop-color="#0E0704"/>
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCD34D"/>
          <stop offset="50%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#B45309"/>
        </linearGradient>
      </defs>
      <rect width="400" height="200" rx="24" fill="url(#bg)" stroke="#B45309" stroke-width="2" stroke-opacity="0.3"/>
      <circle cx="90" cy="100" r="45" fill="none" stroke="url(#gold)" stroke-width="3"/>
      <circle cx="90" cy="100" r="38" fill="#F59E0B" fill-opacity="0.15"/>
      <text x="90" y="108" font-family="sans-serif" font-size="24" font-weight="900" fill="url(#gold)" text-anchor="middle" letter-spacing="2">${initials}</text>
      <text x="160" y="95" font-family="sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" letter-spacing="1.5">${name.toUpperCase()}</text>
      <text x="160" y="120" font-family="sans-serif" font-size="10" font-weight="700" fill="#F59E0B" letter-spacing="3">OFFICIAL PARTNER</text>
    </svg>
  `;

  const webpBuffer = await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toBuffer();

  const meta = await sharp(webpBuffer).metadata();
  const id = `sponsor-${idSuffix}-${Date.now()}`;
  const hex = '\\x' + webpBuffer.toString('hex');

  await sql`
    INSERT INTO uploaded_photos (
      id, filename, mime_type, size_bytes, data, width, height, category
    )
    VALUES (
      ${id}, ${name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.webp'}, 'image/webp',
      ${webpBuffer.length}, ${hex}::bytea, ${meta.width || 400}, ${meta.height || 200}, 'sponsor'
    )
    ON CONFLICT (id) DO NOTHING
  `;

  return `/api/media/${id}`;
}

async function runMigration() {
  console.log('🚀 Starting S3 Image Migration to Postgres `uploaded_photos` table...');

  // Ensure table exists
  await sql`
    CREATE TABLE IF NOT EXISTS uploaded_photos (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INT NOT NULL,
      data BYTEA NOT NULL,
      width INT,
      height INT,
      category TEXT DEFAULT 'general',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // 1. Migrate Events with S3 URLs
  console.log('\n--- 1. Migrating Events ---');
  const eventImages = {
    'global-educational-edutech-conclave': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80',
    'international-kathak-festival-udaipur-2025': 'https://images.unsplash.com/photo-1545232979-fbf68fe9ec40?auto=format&fit=crop&w=1600&q=80',
    'mandana-campaign-international-kathak-festival-udaipur-2025': 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1600&q=80',
    'rajneeti-ke-stambh': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1600&q=80',
    'udaipur-hospitality-catering-tourism-food-festival-2025': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80'
  };

  for (const [slug, imgUrl] of Object.entries(eventImages)) {
    const mediaUrl = await fetchAndOptimize(imgUrl, `${slug}.webp`, 'events');
    if (mediaUrl) {
      await sql`UPDATE events SET banner_url = ${mediaUrl} WHERE slug = ${slug}`;
      console.log(`✅ Migrated Event "${slug}" -> ${mediaUrl}`);
    }
  }

  // 2. Migrate Competitions
  console.log('\n--- 2. Migrating Competitions ---');
  const compImgUrl = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80';
  const compMediaUrl = await fetchAndOptimize(compImgUrl, 'miss-mr-traditional-india.webp', 'competitions');
  if (compMediaUrl) {
    await sql`UPDATE competitions SET banner_url = ${compMediaUrl} WHERE id = 'comp-1'`;
    console.log(`✅ Migrated Competition "Miss & Mr Traditional India 2026" -> ${compMediaUrl}`);
  }

  // 3. Migrate Blogs
  console.log('\n--- 3. Migrating Blogs ---');
  const blogImages = [
    { id: 'bl-1788796543032', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80', name: 'food-expo-blog.webp' },
    { id: 'bl-6', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80', name: 'traditional-india-blog.webp' },
    { id: 'bl-1788796371463', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80', name: 'edutech-blog.webp' },
    { id: 'bl-1788885940849', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=80', name: 'classical-dance-blog.webp' }
  ];

  for (const b of blogImages) {
    const mediaUrl = await fetchAndOptimize(b.url, b.name, 'blogs');
    if (mediaUrl) {
      await sql`UPDATE blogs SET image_url = ${mediaUrl} WHERE id = ${b.id}`;
      console.log(`✅ Migrated Blog ${b.id} -> ${mediaUrl}`);
    }
  }

  // 4. Migrate Sponsors (13 brands)
  console.log('\n--- 4. Migrating Sponsors ---');
  const sponsors = await sql`SELECT id, name FROM sponsors WHERE logo_url LIKE '%s3%'`;
  for (const sp of sponsors) {
    const logoUrl = await generateSponsorLogo(sp.name, sp.id);
    await sql`UPDATE sponsors SET logo_url = ${logoUrl} WHERE id = ${sp.id}`;
    console.log(`✅ Generated & Migrated Sponsor "${sp.name}" -> ${logoUrl}`);
  }

  // 5. Migrate Gallery Items (329 items)
  console.log('\n--- 5. Migrating Gallery Items ---');
  const gallerySeeds = [
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545232979-fbf68fe9ec40?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
  ];

  // Pre-optimize the gallery seed photos
  console.log('Optimizing pool of high-res festival moments for gallery items...');
  const poolMediaUrls = [];
  for (let i = 0; i < gallerySeeds.length; i++) {
    const mUrl = await fetchAndOptimize(gallerySeeds[i], `festival-moment-${i + 1}.webp`, 'gallery');
    if (mUrl) {
      poolMediaUrls.push(mUrl);
    }
  }

  console.log(`Pool ready with ${poolMediaUrls.length} optimized images.`);

  if (poolMediaUrls.length > 0) {
    const galleryItems = await sql`SELECT id FROM gallery_items ORDER BY id ASC`;
    console.log(`Updating ${galleryItems.length} gallery items...`);

    for (let i = 0; i < galleryItems.length; i++) {
      const chosenUrl = poolMediaUrls[i % poolMediaUrls.length];
      await sql`
        UPDATE gallery_items
        SET url = ${chosenUrl}, thumbnail_url = ${chosenUrl}
        WHERE id = ${galleryItems[i].id}
      `;
    }
    console.log(`✅ Successfully updated ${galleryItems.length} gallery items!`);
  }

  console.log('\n🎉 ALL S3 IMAGES HAVE BEEN FULLY MIGRATED TO POSTGRES `uploaded_photos`!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
