import type { NextRequest } from "next/server"
import { AuditLogModel } from "./models/AuditLog"

export interface AuditContext {
  userId?: number
  action: string
  resource: string
  resourceId?: string
  details?: any
  request: NextRequest
}

export async function logAudit(context: AuditContext): Promise<void> {
  try {
    const ip = context.request.headers.get("x-forwarded-for") || context.request.headers.get("x-real-ip") || "unknown"
    const userAgent = context.request.headers.get("user-agent") || "unknown"

    await AuditLogModel.create({
      user_id: context.userId || null,
      action: context.action,
      resource: context.resource,
      resource_id: context.resourceId || null,
      ip_address: ip,
      user_agent: userAgent,
      details: context.details || {},
    })
  } catch (error) {
    console.error("Failed to log audit:", error)
    // Don't throw - audit logging should not break the main flow
  }
}

export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: "login",
  LOGOUT: "logout",
  REGISTER: "register",
  PASSWORD_CHANGE: "password_change",

  // Training
  MODULE_VIEW: "module_view",
  MODULE_COMPLETE: "module_complete",
  QUIZ_START: "quiz_start",
  QUIZ_SUBMIT: "quiz_submit",

  // Certificates
  CERTIFICATE_GENERATE: "certificate_generate",
  CERTIFICATE_DOWNLOAD: "certificate_download",

  // Admin
  USER_CREATE: "user_create",
  USER_UPDATE: "user_update",
  USER_DELETE: "user_delete",
  MODULE_CREATE: "module_create",
  MODULE_UPDATE: "module_update",
  MODULE_DELETE: "module_delete",

  // RGPD
  DATA_EXPORT: "data_export",
  DATA_DELETE: "data_delete",
  CONSENT_UPDATE: "consent_update",
} as const
