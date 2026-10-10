// Shared Cache-Control for public, read-only JSON endpoints. Lets the CDN / browser
// serve repeat hits instantly and revalidate in the background, so admin edits show
// up within ~1 minute instead of every visitor paying a Neon round-trip.
export const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=600',
};
