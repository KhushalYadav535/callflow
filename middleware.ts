import { type NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Routes that don't require auth
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/', '/pricing', '/about']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ROUTES.some((route) => pathname === route || (route !== '/' && pathname.startsWith(route)))) {
    return NextResponse.next()
  }

  const tenantMatch = pathname.match(/^\/app\/([a-zA-Z0-9-]+)(?:\/|$)/)

  if (!tenantMatch && pathname.startsWith('/app/')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (tenantMatch) {
    const token = request.cookies.get('rembo_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const secret = process.env.JWT_SECRET
    if (secret) {
      try {
        await jwtVerify(token, new TextEncoder().encode(secret))
      } catch {
        const res = NextResponse.redirect(new URL('/auth/login', request.url))
        res.cookies.set('rembo_token', '', { path: '/', maxAge: 0 })
        return res
      }
    }
    const response = NextResponse.next()
    response.headers.set('x-tenant-id', tenantMatch[1])
    return response
  }

  return NextResponse.next()
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
