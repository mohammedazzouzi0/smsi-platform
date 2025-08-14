// Admin API for module management
import { NextResponse } from "next/server"
import { ModuleModel } from "@/lib/models/Module"
import { requireRole } from "@/lib/middleware/auth"
import { z } from "zod"

const createModuleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  duration_minutes: z.number().min(5).max(180).default(30),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  is_active: z.boolean().default(true),
})

// Get all modules (admin only)
export const GET = requireRole("admin")(async (request) => {
  try {
    const modules = await ModuleModel.findAll()
    const stats = await ModuleModel.getStats()

    return NextResponse.json({
      modules,
      stats,
    })
  } catch (error) {
    console.error("Get modules error:", error)
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
})

// Create new module (admin only)
export const POST = requireRole("admin")(async (request) => {
  try {
    const body = await request.json()

    // Validate input
    const validation = createModuleSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.errors }, { status: 400 })
    }

    const moduleData = validation.data

    // Create module
    const module = await ModuleModel.create(moduleData)

    return NextResponse.json({
      message: "Module created successfully",
      module,
    })
  } catch (error) {
    console.error("Create module error:", error)
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
  }
})
