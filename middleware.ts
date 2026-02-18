import { type NextRequest, NextResponse } from 'next/server'

// Routes that don't require tenant context
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/', '/pricing', '/about']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes through
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if the route includes a tenantId parameter (e.g., /app/tenant-123/...)
  const tenantMatch = pathname.match(/^\/app\/([a-zA-Z0-9-]+)(?:\/|$)/)

  if (!tenantMatch) {
    // If trying to access /app/* without tenantId, redirect to login
    if (pathname.startsWith('/app/')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Pass tenantId via header for use in components
  const response = NextResponse.next()
  if (tenantMatch) {
    response.headers.set('x-tenant-id', tenantMatch[1])
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
