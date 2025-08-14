// Admin API for user management
import { NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import { requireRole } from "@/lib/middleware/auth"
import { z } from "zod"

// User creation schema for admin
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "admin"]).default("user"),
  consent_rgpd: z.boolean().default(true),
})

// Get all users (admin only)
export const GET = requireRole("admin")(async (request) => {
  try {
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    const users = await UserModel.findAll(limit, offset)
    const stats = await UserModel.getStats()

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: stats.total,
        pages: Math.ceil(stats.total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
})

// Create new user (admin only)
export const POST = requireRole("admin")(async (request) => {
  try {
    const body = await request.json()

    // Validate input
    const validation = createUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.errors }, { status: 400 })
    }

    const userData = validation.data

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(userData.email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create user
    const user = await UserModel.create(userData)

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
})
