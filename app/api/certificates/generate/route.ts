// API route for generating PDF certificates
import { NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import { ModuleModel } from "@/lib/models/Module"
import { ResultModel } from "@/lib/models/Result"
import { CertificateGenerator } from "@/lib/pdf-generator"
import { requireAuth } from "@/lib/middleware/auth"
import { z } from "zod"

const generateCertificateSchema = z.object({
  module_id: z.number(),
})

export const POST = requireAuth(async (request) => {
  try {
    const { user } = request
    const body = await request.json()

    // Validate input
    const validation = generateCertificateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const { module_id } = validation.data

    // Get user data
    const userData = await UserModel.findById(user!.userId)
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get module data
    const moduleData = await ModuleModel.findById(module_id)
    if (!moduleData) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    // Get result data
    const result = await ResultModel.findByUserAndModule(user!.userId, module_id)
    if (!result) {
      return NextResponse.json({ error: "No quiz result found for this module" }, { status: 404 })
    }

    // Check if user passed the quiz
    if (!result.passed) {
      return NextResponse.json({ error: "Certificate not available - quiz not passed" }, { status: 400 })
    }

    // Generate certificate ID
    const certificateId = CertificateGenerator.generateCertificateId(
      user!.userId,
      module_id,
      new Date(result.completed_at),
    )

    // Prepare certificate data
    const certificateData = {
      userName: userData.name,
      userEmail: userData.email,
      moduleName: moduleData.title,
      score: result.score,
      completionDate: new Date(result.completed_at),
      certificateId,
    }

    // Generate PDF
    const pdf = CertificateGenerator.generateCertificate(certificateData)

    // Mark certificate as generated in database
    await ResultModel.markCertificateGenerated(user!.userId, module_id)

    // Return PDF as buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="SMSI-Certificate-${moduleData.title.replace(/\s+/g, "-")}-${certificateId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Generate certificate error:", error)
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 })
  }
})
