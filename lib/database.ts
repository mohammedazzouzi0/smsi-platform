// Database connection and utilities for SMSI platform
import mysql from "mysql2/promise"

// Database configuration with security best practices
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smsi_platform",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
}

// Create connection pool for better performance
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Execute query with error handling and logging
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const connection = getPool()

  try {
    const [rows] = await connection.execute(query, params)
    return rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    console.error("Query:", query)
    console.error("Params:", params)
    throw new Error("Database operation failed")
  }
}

// Get single record
export async function executeQuerySingle<T = any>(query: string, params: any[] = []): Promise<T | null> {
  const results = await executeQuery<T>(query, params)
  return results.length > 0 ? results[0] : null
}

// Transaction support for complex operations
export async function executeTransaction(queries: Array<{ query: string; params: any[] }>): Promise<void> {
  const connection = await getPool().getConnection()

  try {
    await connection.beginTransaction()

    for (const { query, params } of queries) {
      await connection.execute(query, params)
    }

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    console.error("Transaction error:", error)
    throw new Error("Transaction failed")
  } finally {
    connection.release()
  }
}

// Health check for database connection
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await executeQuery("SELECT 1")
    return true
  } catch (error) {
    console.error("Database health check failed:", error)
    return false
  }
}

export const db = getPool()
