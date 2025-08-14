import type { RowDataPacket, ResultSetHeader } from "mysql2"
import { db } from "../database"

export interface AuditLog {
  id: number
  user_id: number | null
  action: string
  resource: string
  resource_id: string | null
  ip_address: string
  user_agent: string
  details: any
  created_at: Date
}

export class AuditLogModel {
  static async create(log: Omit<AuditLog, "id" | "created_at">): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        log.user_id,
        log.action,
        log.resource,
        log.resource_id,
        log.ip_address,
        log.user_agent,
        JSON.stringify(log.details),
      ],
    )
    return result.insertId
  }

  static async findByUserId(userId: number, limit = 50): Promise<AuditLog[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit],
    )
    return rows.map((row) => ({
      ...row,
      details: JSON.parse(row.details || "{}"),
    })) as AuditLog[]
  }

  static async findAll(limit = 100, offset = 0): Promise<AuditLog[]> {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT al.*, u.email as user_email 
       FROM audit_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ORDER BY al.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset],
    )
    return rows.map((row) => ({
      ...row,
      details: JSON.parse(row.details || "{}"),
    })) as AuditLog[]
  }

  static async deleteOlderThan(days: number): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      `DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days],
    )
    return result.affectedRows
  }
}
