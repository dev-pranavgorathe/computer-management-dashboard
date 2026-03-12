import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        const { pathname } = req.nextUrl
        if (pathname.startsWith("/auth/") || pathname.startsWith("/api/auth/")) {
          return true
        }

        // Let API routes handle auth themselves (returning 401 JSON),
        // instead of middleware redirecting to /auth/signin (HTML) which breaks fetch().
        if (pathname.startsWith("/api/")) {
          return true
        }

        // Require token for all other pages
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
