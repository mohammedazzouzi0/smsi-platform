// Result model for tracking quiz performance and progress
import { executeQuery, executeQuerySingle } from "../database"

export interface Result {
  id: number
  user_id: number
  module_id: number
  score: number
  total_questions: number
  correct_answers: number
  passed: boolean
  time_spent_minutes: number
  certificate_generated: boolean
  completed_at: Date
}

export interface CreateResultData {
  user_id: number
  module_id: number
  score: number
  total_questions: number
  correct_answers: number
  passed: boolean
  time_spent_minutes: number
}

export interface UserProgress {
  user_id: number
  total_modules: number
  completed_modules: number
  passed_modules: number
  average_score: number
  certificates_earned: number
  total_time_spent: number
}

export class ResultModel {
  // Create or update quiz result
  static async createOrUpdate(resultData: CreateResultData): Promise<Result> {
    const { user_id, module_id, score, total_questions, correct_answers, passed, time_spent_minutes } = resultData

    // Check if result already exists
    const existingResult = await this.findByUserAndModule(user_id, module_id)

    if (existingResult) {
      // Update existing result if new score is better
      if (score > existingResult.score) {
        const query = `
          UPDATE results 
          SET score = ?, total_questions = ?, correct_answers = ?, passed = ?, 
              time_spent_minutes = ?, completed_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND module_id = ?
        `

        await executeQuery(query, [
          score,
          total_questions,
          correct_answers,
          passed,
          time_spent_minutes,
          user_id,
          module_id,
        ])
      }

      return this.findByUserAndModule(user_id, module_id) as Promise<Result>
    } else {
      // Create new result
      const query = `
        INSERT INTO results (user_id, module_id, score, total_questions, correct_answers, passed, time_spent_minutes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `

      await executeQuery(query, [
        user_id,
        module_id,
        score,
        total_questions,
        correct_answers,
        passed,
        time_spent_minutes,
      ])

      return this.findByUserAndModule(user_id, module_id) as Promise<Result>
    }
  }

  // Find result by user and module
  static async findByUserAndModule(userId: number, moduleId: number): Promise<Result | null> {
    const query = "SELECT * FROM results WHERE user_id = ? AND module_id = ?"
    return executeQuerySingle<Result>(query, [userId, moduleId])
  }

  // Get all results for a user
  static async findByUserId(userId: number): Promise<Result[]> {
    const query = `
      SELECT r.*, m.title as module_title
      FROM results r
      JOIN modules m ON r.module_id = m.id
      WHERE r.user_id = ?
      ORDER BY r.completed_at DESC
    `
    return executeQuery<any>(query, [userId])
  }

  // Get user progress summary
  static async getUserProgress(userId: number): Promise<UserProgress> {
    const query = `
      SELECT 
        COUNT(DISTINCT m.id) as total_modules,
        COUNT(DISTINCT r.module_id) as completed_modules,
        COUNT(DISTINCT CASE WHEN r.passed = TRUE THEN r.module_id END) as passed_modules,
        COALESCE(AVG(r.score), 0) as average_score,
        COUNT(DISTINCT CASE WHEN r.passed = TRUE THEN r.module_id END) as certificates_earned,
        COALESCE(SUM(r.time_spent_minutes), 0) as total_time_spent
      FROM modules m
      LEFT JOIN results r ON m.id = r.module_id AND r.user_id = ?
      WHERE m.is_active = TRUE
    `

    const result = await executeQuerySingle<any>(query, [userId])

    return {
      user_id: userId,
      total_modules: result?.total_modules || 0,
      completed_modules: result?.completed_modules || 0,
      passed_modules: result?.passed_modules || 0,
      average_score: result?.average_score || 0,
      certificates_earned: result?.certificates_earned || 0,
      total_time_spent: result?.total_time_spent || 0,
    }
  }

  // Mark certificate as generated
  static async markCertificateGenerated(userId: number, moduleId: number): Promise<void> {
    const query = "UPDATE results SET certificate_generated = TRUE WHERE user_id = ? AND module_id = ?"
    await executeQuery(query, [userId, moduleId])
  }

  // Get leaderboard (top performers)
  static async getLeaderboard(limit = 10): Promise<any[]> {
    const query = `
      SELECT 
        u.name,
        u.email,
        COUNT(r.id) as completed_modules,
        COUNT(CASE WHEN r.passed = TRUE THEN 1 END) as passed_modules,
        AVG(r.score) as average_score,
        SUM(r.time_spent_minutes) as total_time_spent
      FROM users u
      JOIN results r ON u.id = r.user_id
      WHERE u.role = 'user'
      GROUP BY u.id, u.name, u.email
      HAVING completed_modules > 0
      ORDER BY passed_modules DESC, average_score DESC
      LIMIT ?
    `

    return executeQuery<any>(query, [limit])
  }

  // Get module completion statistics
  static async getModuleStats(): Promise<any[]> {
    const query = `
      SELECT 
        m.id,
        m.title,
        m.difficulty_level,
        COUNT(r.id) as total_attempts,
        COUNT(CASE WHEN r.passed = TRUE THEN 1 END) as passed_attempts,
        AVG(r.score) as average_score,
        AVG(r.time_spent_minutes) as average_time
      FROM modules m
      LEFT JOIN results r ON m.id = r.module_id
      WHERE m.is_active = TRUE
      GROUP BY m.id, m.title, m.difficulty_level
      ORDER BY m.created_at ASC
    `

    return executeQuery<any>(query)
  }

  // Delete user results (RGPD compliance)
  static async deleteByUserId(userId: number): Promise<void> {
    const query = "DELETE FROM results WHERE user_id = ?"
    await executeQuery(query, [userId])
  }
}
