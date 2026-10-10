// src/app/api/blogs/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { PUBLIC_CACHE_HEADERS } from '@/lib/http-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const blogs = await sql`
      SELECT id, title, slug, summary, content, image_url, category, author, published_at, read_time, subheading, bullets 
      FROM blogs 
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ blogs }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
