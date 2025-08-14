import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { UserModel } from "@/lib/models/User"
import { ResultModel } from "@/lib/models/Result"
import { AuditLogModel } from "@/lib/models/AuditLog"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all user data
    const userData = await UserModel.findById(user.id)
    const results = await ResultModel.findByUserId(user.id)
    const auditLogs = await AuditLogModel.findByUserId(user.id)

    const exportData = {
      personal_information: {
        id: userData?.id,
        email: userData?.email,
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        role: userData?.role,
        created_at: userData?.created_at,
        updated_at: userData?.updated_at,
      },
      training_results: results.map((result) => ({
        module_id: result.module_id,
        score: result.score,
        passed: result.passed,
        completed_at: result.completed_at,
      })),
      activity_logs: auditLogs.map((log) => ({
        action: log.action,
        resource: log.resource,
        timestamp: log.created_at,
        ip_address: log.ip_address,
      })),
      export_metadata: {
        exported_at: new Date().toISOString(),
        export_type: "RGPD_DATA_EXPORT",
        user_id: user.id,
      },
    }

    // Log the export action
    await logAudit({
      userId: user.id,
      action: AUDIT_ACTIONS.DATA_EXPORT,
      resource: "user_data",
      resourceId: user.id.toString(),
      request,
    })

    return NextResponse.json(exportData)
  } catch (error) {
    console.error("Data export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
