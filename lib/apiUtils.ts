import type { NextRequest } from 'next/server';

/** Extracts the best-available client IP from standard proxy headers. */
export function getClientId(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  );
}
