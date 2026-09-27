// src/app/api/gallery/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const mediaType = searchParams.get('type'); // 'photo' | 'video' | 'all'
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // Paginated request
    if (pageParam || limitParam) {
      const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
      const limit = Math.max(1, Math.min(60, parseInt(limitParam || '12', 10) || 12));
      const offset = (page - 1) * limit;

      const hasCategory = category && category !== 'All';
      const hasType = mediaType && (mediaType === 'photo' || mediaType === 'video');

      let countResult;
      let itemsResult;

      if (hasCategory && hasType) {
        countResult = await sql`
          SELECT COUNT(*) as count FROM gallery_items 
          WHERE event = ${category} AND type = ${mediaType}
        `;
        itemsResult = await sql`
          SELECT id, type, url, thumbnail_url, title, event 
          FROM gallery_items 
          WHERE event = ${category} AND type = ${mediaType}
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (hasCategory) {
        countResult = await sql`
          SELECT COUNT(*) as count FROM gallery_items 
          WHERE event = ${category}
        `;
        itemsResult = await sql`
          SELECT id, type, url, thumbnail_url, title, event 
          FROM gallery_items 
          WHERE event = ${category}
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (hasType) {
        countResult = await sql`
          SELECT COUNT(*) as count FROM gallery_items 
          WHERE type = ${mediaType}
        `;
        itemsResult = await sql`
          SELECT id, type, url, thumbnail_url, title, event 
          FROM gallery_items 
          WHERE type = ${mediaType}
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        countResult = await sql`SELECT COUNT(*) as count FROM gallery_items`;
        itemsResult = await sql`
          SELECT id, type, url, thumbnail_url, title, event 
          FROM gallery_items 
          ORDER BY created_at DESC 
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      return NextResponse.json({
        items: itemsResult,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        }
      });
    }

    // Default: full list (backward compatible)
    const items = await sql`
      SELECT id, type, url, thumbnail_url, title, event 
      FROM gallery_items 
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ items });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
