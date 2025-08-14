import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { AuditLogModel } from "@/lib/models/AuditLog"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const logs = await AuditLogModel.findAll(limit, offset)

    return NextResponse.json({
      logs,
      pagination: {
        limit,
        offset,
        hasMore: logs.length === limit,
      },
    })
  } catch (error) {
    console.error("Audit logs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
