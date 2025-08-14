// Quiz model for interactive assessments
import { executeQuery, executeQuerySingle } from "../database"

export interface Quiz {
  id: number
  module_id: number
  question: string
  options: string[]
  correct_option: number
  explanation: string
  points: number
  created_at: Date
  updated_at: Date
}

export interface CreateQuizData {
  module_id: number
  question: string
  options: string[]
  correct_option: number
  explanation?: string
  points?: number
}

export interface QuizAnswer {
  quiz_id: number
  selected_option: number
  is_correct: boolean
  points_earned: number
}

export interface QuizSubmission {
  user_id: number
  module_id: number
  answers: QuizAnswer[]
  total_score: number
  percentage: number
  passed: boolean
  time_spent_minutes: number
}

export class QuizModel {
  // Get all quizzes for a module
  static async findByModuleId(moduleId: number): Promise<Quiz[]> {
    const query = `
      SELECT id, module_id, question, options, correct_option, explanation, points, created_at, updated_at
      FROM quizzes 
      WHERE module_id = ? 
      ORDER BY created_at ASC
    `

    const results = await executeQuery<any>(query, [moduleId])

    return results.map((row) => ({
      ...row,
      options: JSON.parse(row.options),
    }))
  }

  // Get quiz questions without correct answers (for taking quiz)
  static async findQuestionsForModule(moduleId: number): Promise<Omit<Quiz, "correct_option" | "explanation">[]> {
    const query = `
      SELECT id, module_id, question, options, points, created_at, updated_at
      FROM quizzes 
      WHERE module_id = ? 
      ORDER BY created_at ASC
    `

    const results = await executeQuery<any>(query, [moduleId])

    return results.map((row) => ({
      id: row.id,
      module_id: row.module_id,
      question: row.question,
      options: JSON.parse(row.options),
      points: row.points,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  }

  // Get quiz by ID (for checking answers)
  static async findById(id: number): Promise<Quiz | null> {
    const query = "SELECT * FROM quizzes WHERE id = ?"
    const result = await executeQuerySingle<any>(query, [id])

    if (!result) return null

    return {
      ...result,
      options: JSON.parse(result.options),
    }
  }

  // Create new quiz question (admin only)
  static async create(quizData: CreateQuizData): Promise<Quiz> {
    const { module_id, question, options, correct_option, explanation = "", points = 1 } = quizData

    const query = `
      INSERT INTO quizzes (module_id, question, options, correct_option, explanation, points)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await executeQuery(query, [
      module_id,
      question,
      JSON.stringify(options),
      correct_option,
      explanation,
      points,
    ])

    // Get the created quiz
    const insertId = (result as any).insertId
    const quiz = await this.findById(insertId)
    if (!quiz) throw new Error("Failed to create quiz")

    return quiz
  }

  // Update quiz question (admin only)
  static async update(id: number, updates: Partial<CreateQuizData>): Promise<void> {
    const fields: string[] = []
    const values: any[] = []

    if (updates.question) {
      fields.push("question = ?")
      values.push(updates.question)
    }

    if (updates.options) {
      fields.push("options = ?")
      values.push(JSON.stringify(updates.options))
    }

    if (updates.correct_option !== undefined) {
      fields.push("correct_option = ?")
      values.push(updates.correct_option)
    }

    if (updates.explanation !== undefined) {
      fields.push("explanation = ?")
      values.push(updates.explanation)
    }

    if (updates.points !== undefined) {
      fields.push("points = ?")
      values.push(updates.points)
    }

    if (fields.length === 0) return

    values.push(id)
    const query = `UPDATE quizzes SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

    await executeQuery(query, values)
  }

  // Delete quiz question (admin only)
  static async delete(id: number): Promise<void> {
    const query = "DELETE FROM quizzes WHERE id = ?"
    await executeQuery(query, [id])
  }

  // Get quiz statistics for a module
  static async getModuleStats(moduleId: number): Promise<{
    total_questions: number
    total_points: number
    average_difficulty: number
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_questions,
        SUM(points) as total_points,
        AVG(points) as average_difficulty
      FROM quizzes 
      WHERE module_id = ?
    `
    const result = await executeQuerySingle<any>(query, [moduleId])
    return result || { total_questions: 0, total_points: 0, average_difficulty: 0 }
  }
}
