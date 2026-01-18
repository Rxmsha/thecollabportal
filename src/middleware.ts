import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/invite']

// Routes that require specific roles
const adminRoutes = ['/admin']
const agentRoutes = ['/agent']
const realtorRoutes = ['/realtor']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // For protected routes, we'll rely on client-side auth checks
  // since we're using client-side auth state with Xano
  // The layout components handle the actual auth redirects

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
