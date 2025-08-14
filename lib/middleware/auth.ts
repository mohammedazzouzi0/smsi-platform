// Authentication middleware for protecting routes
import type { NextRequest } from "next/server"
import { verifyToken, extractTokenFromHeader } from "@/lib/auth"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number
    email: string
    role: "user" | "admin"
  }
}

export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean
  user?: { userId: number; email: string; role: "user" | "admin" }
  error?: string
}> {
  try {
    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get("auth-token")?.value
    const headerToken = extractTokenFromHeader(request.headers.get("authorization"))
    const token = cookieToken || headerToken

    if (!token) {
      return { success: false, error: "No authentication token provided" }
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return { success: false, error: "Invalid or expired token" }
    }

    return {
      success: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export function requireAuth<TContext = any>(
  handler: (request: AuthenticatedRequest, context: TContext) => Promise<Response>,
) {
  return async (request: NextRequest, context: TContext) => {
    const auth = await authenticateRequest(request)

    if (!auth.success) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = auth.user

    return handler(authenticatedRequest, context)
  }
}

export function requireRole<TContext = any>(role: "admin" | "user") {
  return (handler: (request: AuthenticatedRequest, context: TContext) => Promise<Response>) =>
    async (request: NextRequest, context: TContext) => {
    const auth = await authenticateRequest(request)

    if (!auth.success) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (auth.user!.role !== role && role !== "user") {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = auth.user

    return handler(authenticatedRequest, context)
  }
}
