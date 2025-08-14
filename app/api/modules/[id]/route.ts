// API route for individual module details
import { NextResponse } from "next/server"
import { ModuleModel } from "@/lib/models/Module"
import { requireAuth } from "@/lib/middleware/auth"

export const GET = requireAuth(async (request, { params }: { params: { id: string } }) => {
  try {
    const moduleId = Number.parseInt(params.id)

    if (isNaN(moduleId)) {
      return NextResponse.json({ error: "Invalid module ID" }, { status: 400 })
    }

    const module = await ModuleModel.findById(moduleId)

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    return NextResponse.json({ module })
  } catch (error) {
    console.error("Get module error:", error)
    return NextResponse.json({ error: "Failed to fetch module" }, { status: 500 })
  }
})
