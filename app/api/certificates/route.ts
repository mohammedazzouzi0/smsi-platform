// API route for listing user certificates
import { NextResponse } from "next/server"
import { ResultModel } from "@/lib/models/Result"
import { requireAuth } from "@/lib/middleware/auth"

export const GET = requireAuth(async (request) => {
  try {
    const { user } = request

    // Get all passed results for the user
    const results = await ResultModel.findByUserId(user!.userId)
    const certificates = results.filter((result) => result.passed)

    return NextResponse.json({
      certificates: certificates.map((cert) => ({
        id: cert.id,
        module_id: cert.module_id,
        module_title: cert.module_title,
        score: cert.score,
        completed_at: cert.completed_at,
        certificate_generated: cert.certificate_generated,
      })),
    })
  } catch (error) {
    console.error("Get certificates error:", error)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
})
