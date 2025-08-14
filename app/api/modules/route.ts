// API routes for training modules
import { NextResponse } from "next/server"
import { ModuleModel } from "@/lib/models/Module"
import { requireAuth } from "@/lib/middleware/auth"

// Get all modules with user progress
export const GET = requireAuth(async (request) => {
  try {
    const { user } = request
    const modules = await ModuleModel.findAllWithProgress(user!.userId)

    return NextResponse.json({ modules })
  } catch (error) {
    console.error("Get modules error:", error)
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
  }
})
