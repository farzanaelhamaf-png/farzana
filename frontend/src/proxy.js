import { NextResponse } from 'next/server';
import { getLocale } from './lib/locales';

export function proxy(request) {
  const firstSegment = request.nextUrl.pathname.split('/').filter(Boolean)[0];
  const locale = getLocale(firstSegment)?.code || 'en';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-locale', locale);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
