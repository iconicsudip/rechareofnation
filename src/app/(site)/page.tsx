import { unstable_cache } from "next/cache";
import { sql, ensureSchema } from "@/lib/db";
import HomeClient, { type HomeInitialData } from "./HomeClient";

// Rendered on the server from cached DB rows (refreshed at most once a minute),
// so the HTML arrives with content instead of waiting on client-side API calls.
const getHomeData = unstable_cache(
  async (): Promise<HomeInitialData> => {
    await ensureSchema();
    const [siteContent, events, gallery, blogs, sponsors] = await Promise.all([
      sql`SELECT key, value FROM site_content`,
      sql`SELECT * FROM events WHERE is_active = true ORDER BY created_at DESC LIMIT 200`,
      sql`SELECT id, type, url, thumbnail_url, title, event FROM gallery_items ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT id, title, slug, summary, content, image_url, category, author, published_at, read_time, subheading, bullets FROM blogs ORDER BY created_at DESC LIMIT 3`,
      sql`SELECT id, name, logo_url, tier, website_url FROM sponsors ORDER BY created_at ASC`,
    ]);
    // Round-trip through JSON so Dates etc. are plain serializable values.
    return JSON.parse(JSON.stringify({ siteContent, events, gallery, blogs, sponsors }));
  },
  ["home-data"],
  { revalidate: 60 }
);

export default async function HomePage() {
  const initial = await getHomeData();
  return <HomeClient initial={initial} />;
}
