// User model with security and compliance features
import bcrypt from "bcryptjs"
import { executeQuery, executeQuerySingle } from "../database"

export interface User {
  id: number
  name: string
  email: string
  password: string
  role: "user" | "admin"
  consent_rgpd: boolean
  last_login: Date | null
  created_at: Date
  updated_at: Date
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role?: "user" | "admin"
  consent_rgpd: boolean
}

export class UserModel {
  // Create new user with encrypted password
  static async create(userData: CreateUserData): Promise<User> {
    const { name, email, password, role = "user", consent_rgpd } = userData

    // Hash password with bcrypt (RGPD compliant)
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const query = `
      INSERT INTO users (name, email, password, role, consent_rgpd)
      VALUES (?, ?, ?, ?, ?)
    `

    await executeQuery(query, [name, email, hashedPassword, role, consent_rgpd])

    // Return created user (without password)
    const user = await this.findByEmail(email)
    if (!user) throw new Error("Failed to create user")

    return user
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE email = ?"
    return executeQuerySingle<User>(query, [email])
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    const query = "SELECT * FROM users WHERE id = ?"
    return executeQuerySingle<User>(query, [id])
  }

  // Verify password for authentication
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user) return null

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    // Update last login timestamp
    await this.updateLastLogin(user.id)

    return user
  }

  // Update last login (for audit purposes)
  static async updateLastLogin(userId: number): Promise<void> {
    const query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?"
    await executeQuery(query, [userId])
  }

  // Get all users (admin function)
  static async findAll(limit = 50, offset = 0): Promise<User[]> {
    const query = `
      SELECT id, name, email, role, consent_rgpd, last_login, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    return executeQuery<User>(query, [limit, offset])
  }

  // Update user profile
  static async update(id: number, updates: Partial<CreateUserData>): Promise<void> {
    const fields: string[] = []
    const values: any[] = []

    if (updates.name) {
      fields.push("name = ?")
      values.push(updates.name)
    }

    if (updates.email) {
      fields.push("email = ?")
      values.push(updates.email)
    }

    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 12)
      fields.push("password = ?")
      values.push(hashedPassword)
    }

    if (updates.role) {
      fields.push("role = ?")
      values.push(updates.role)
    }

    if (fields.length === 0) return

    values.push(id)
    const query = `UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

    await executeQuery(query, values)
  }

  // Delete user (RGPD right to be forgotten)
  static async delete(id: number): Promise<void> {
    const query = "DELETE FROM users WHERE id = ?"
    await executeQuery(query, [id])
  }

  // Get user statistics
  static async getStats(): Promise<{ total: number; admins: number; users: number }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users
      FROM users
    `
    const result = await executeQuerySingle<any>(query)
    return result || { total: 0, admins: 0, users: 0 }
  }
}
