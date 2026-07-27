// src/proxy.ts
// Next.js 16 renamed Middleware -> Proxy (same behavior, runs on Node.js runtime here).
// Single choke point protecting every /admin page and every /api/admin/* route.

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSession(token);

  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
