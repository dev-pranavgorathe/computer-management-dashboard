import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes that don't require auth
        const publicPaths = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/api/auth']
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true
        }
        
        // API health check is public
        if (pathname === '/api/health/db' || pathname === '/api/health') {
          return true
        }
        
        // All other routes require authentication
        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|icon.svg).*)',
  ],
}
