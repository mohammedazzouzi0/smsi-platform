import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { UserModel } from "@/lib/models/User"
import { ResultModel } from "@/lib/models/Result"
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit"

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { password } = await request.json()

    // Verify password before deletion
    const userData = await UserModel.findById(user.id)
    if (!userData || !(await UserModel.verifyPassword(password, userData.password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 })
    }

    // Log the deletion request
    await logAudit({
      userId: user.id,
      action: AUDIT_ACTIONS.DATA_DELETE,
      resource: "user_account",
      resourceId: user.id.toString(),
      details: { reason: "RGPD_deletion_request" },
      request,
    })

    // Delete user data (cascade will handle related records)
    await ResultModel.deleteByUserId(user.id)
    await UserModel.delete(user.id)

    return NextResponse.json({
      message: "Account and all associated data have been permanently deleted",
      deleted_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 })
  }
}
