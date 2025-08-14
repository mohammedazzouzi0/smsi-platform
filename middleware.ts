import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { extractTokenFromHeader } from "@/lib/auth"
import { verifyJwtHS256 } from "@/lib/edge-jwt"

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, limit = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get client IP
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  // Apply rate limiting
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  // Security headers
  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Protected routes
  const protectedPaths = ["/dashboard", "/quiz", "/certificates", "/admin"]
  const adminPaths = ["/admin"]

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    try {
      // Read JWT from secure cookie or Authorization header
      const cookieToken = request.cookies.get("auth-token")?.value || null
      const headerToken = extractTokenFromHeader(request.headers.get("authorization"))
      const token = cookieToken || headerToken

      const secret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
      const payload = token ? await verifyJwtHS256(token, secret) : null

      if (!payload) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Admin-only routes
      if (adminPaths.some((path) => pathname.startsWith(path)) && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Add user info to headers for API routes
      response.headers.set("x-user-id", String(payload.userId))
      response.headers.set("x-user-role", payload.role)
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
}
