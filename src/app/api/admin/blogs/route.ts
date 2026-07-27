// src/app/api/admin/blogs/route.ts
import { sql, ensureSchema } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureSchema();
  const blogs = await sql`SELECT * FROM blogs ORDER BY created_at DESC`;
  return NextResponse.json({ blogs });
}

export async function POST(req: NextRequest) {
  await ensureSchema();
  const body = await req.json();
  const { title, slug, summary, content, image_url, category, author, published_at, read_time, subheading, bullets } = body;
  if (!title || !slug) return NextResponse.json({ error: 'Title and slug required' }, { status: 400 });
  const id = 'bl-' + Date.now();
  const [blog] = await sql`
    INSERT INTO blogs (id, title, slug, summary, content, image_url, category, author, published_at, read_time, subheading, bullets)
    VALUES (${id}, ${title}, ${slug}, ${summary || ''}, ${content || ''}, ${image_url || ''}, ${category || ''}, ${author || ''}, ${published_at || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}, ${read_time || '3 min read'}, ${subheading || null}, ${JSON.stringify(bullets || [])})
    RETURNING *
  `;
  return NextResponse.json({ success: true, blog });
}

export async function PUT(req: NextRequest) {
  await ensureSchema();
  const body = await req.json();
  const { id, title, slug, summary, content, image_url, category, author, published_at, read_time, subheading, bullets } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  const [blog] = await sql`
    UPDATE blogs SET title=${title}, slug=${slug}, summary=${summary || ''}, content=${content || ''}, image_url=${image_url || ''}, category=${category || ''}, author=${author || ''}, published_at=${published_at || ''}, read_time=${read_time || '3 min read'}, subheading=${subheading || null}, bullets=${JSON.stringify(bullets || [])}
    WHERE id=${id} RETURNING *
  `;
  return NextResponse.json({ success: true, blog });
}

export async function DELETE(req: NextRequest) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await sql`DELETE FROM blogs WHERE id=${id}`;
  return NextResponse.json({ success: true });
}
