// src/lib/auth.ts
// SERVER-SIDE ONLY — stateless signed admin session tokens (HMAC-SHA256).
// Mirrors the HMAC password-hashing pattern already used in db.ts / admin-login route.

import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || '';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export function signAdminSession(user: { id: string; email: string; name: string; role: string }): string {
  const payload: AdminSessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyAdminSession(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expectedSignature = sign(encoded);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as AdminSessionPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (!['admin', 'scanner', 'coordinator'].includes(payload.role)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_COOKIE = 'rn_admin_session';
export const ADMIN_SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;
