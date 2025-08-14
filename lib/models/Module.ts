// Training module model for cybersecurity content
import { executeQuery, executeQuerySingle } from "../database"

export interface Module {
  id: number
  title: string
  description: string
  content: string
  duration_minutes: number
  difficulty_level: "beginner" | "intermediate" | "advanced"
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateModuleData {
  title: string
  description: string
  content: string
  duration_minutes?: number
  difficulty_level?: "beginner" | "intermediate" | "advanced"
  is_active?: boolean
}

export interface ModuleProgress {
  module_id: number
  user_id: number
  completed: boolean
  score?: number
  passed?: boolean
  completed_at?: Date
}

export class ModuleModel {
  // Get all active modules
  static async findAll(): Promise<Module[]> {
    const query = `
      SELECT * FROM modules 
      WHERE is_active = TRUE 
      ORDER BY difficulty_level, created_at ASC
    `
    return executeQuery<Module>(query)
  }

  // Get module by ID
  static async findById(id: number): Promise<Module | null> {
    const query = "SELECT * FROM modules WHERE id = ? AND is_active = TRUE"
    return executeQuerySingle<Module>(query, [id])
  }

  // Get modules with user progress
  static async findAllWithProgress(userId: number): Promise<(Module & { progress?: ModuleProgress })[]> {
    const query = `
      SELECT 
        m.*,
        r.score,
        r.passed,
        r.completed_at,
        CASE WHEN r.id IS NOT NULL THEN TRUE ELSE FALSE END as completed
      FROM modules m
      LEFT JOIN results r ON m.id = r.module_id AND r.user_id = ?
      WHERE m.is_active = TRUE
      ORDER BY m.difficulty_level, m.created_at ASC
    `

    const results = await executeQuery<any>(query, [userId])

    return results.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      content: row.content,
      duration_minutes: row.duration_minutes,
      difficulty_level: row.difficulty_level,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      progress: row.completed
        ? {
            module_id: row.id,
            user_id: userId,
            completed: true,
            score: row.score,
            passed: row.passed,
            completed_at: row.completed_at,
          }
        : undefined,
    }))
  }

  // Create new module (admin only)
  static async create(moduleData: CreateModuleData): Promise<Module> {
    const {
      title,
      description,
      content,
      duration_minutes = 30,
      difficulty_level = "beginner",
      is_active = true,
    } = moduleData

    const query = `
      INSERT INTO modules (title, description, content, duration_minutes, difficulty_level, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [
      title,
      description,
      content,
      duration_minutes,
      difficulty_level,
      is_active,
    ])

    // Get the created module
    const insertId = (result as any).insertId
    const module = await this.findById(insertId)
    if (!module) throw new Error("Failed to create module")

    return module
  }

  // Update module (admin only)
  static async update(id: number, updates: Partial<CreateModuleData>): Promise<void> {
    const fields: string[] = []
    const values: any[] = []

    if (updates.title) {
      fields.push("title = ?")
      values.push(updates.title)
    }

    if (updates.description) {
      fields.push("description = ?")
      values.push(updates.description)
    }

    if (updates.content) {
      fields.push("content = ?")
      values.push(updates.content)
    }

    if (updates.duration_minutes !== undefined) {
      fields.push("duration_minutes = ?")
      values.push(updates.duration_minutes)
    }

    if (updates.difficulty_level) {
      fields.push("difficulty_level = ?")
      values.push(updates.difficulty_level)
    }

    if (updates.is_active !== undefined) {
      fields.push("is_active = ?")
      values.push(updates.is_active)
    }

    if (fields.length === 0) return

    values.push(id)
    const query = `UPDATE modules SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

    await executeQuery(query, values)
  }

  // Delete module (admin only)
  static async delete(id: number): Promise<void> {
    const query = "UPDATE modules SET is_active = FALSE WHERE id = ?"
    await executeQuery(query, [id])
  }

  // Get module statistics
  static async getStats(): Promise<{
    total: number
    beginner: number
    intermediate: number
    advanced: number
    active: number
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN difficulty_level = 'beginner' THEN 1 ELSE 0 END) as beginner,
        SUM(CASE WHEN difficulty_level = 'intermediate' THEN 1 ELSE 0 END) as intermediate,
        SUM(CASE WHEN difficulty_level = 'advanced' THEN 1 ELSE 0 END) as advanced,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active
      FROM modules
    `
    const result = await executeQuerySingle<any>(query)
    return result || { total: 0, beginner: 0, intermediate: 0, advanced: 0, active: 0 }
  }
}
