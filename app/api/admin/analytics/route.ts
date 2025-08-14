// Admin API for analytics and reporting
import { NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import { ModuleModel } from "@/lib/models/Module"
import { ResultModel } from "@/lib/models/Result"
import { requireRole } from "@/lib/middleware/auth"

export const GET = requireRole("admin")(async (request) => {
  try {
    // Get comprehensive analytics data
    const [userStats, moduleStats, moduleCompletionStats, leaderboard] = await Promise.all([
      UserModel.getStats(),
      ModuleModel.getStats(),
      ResultModel.getModuleStats(),
      ResultModel.getLeaderboard(10),
    ])

    // Calculate additional metrics
    const totalAttempts = moduleCompletionStats.reduce((sum, module) => sum + (module.total_attempts || 0), 0)
    const totalPassed = moduleCompletionStats.reduce((sum, module) => sum + (module.passed_attempts || 0), 0)
    const overallPassRate = totalAttempts > 0 ? (totalPassed / totalAttempts) * 100 : 0

    const analytics = {
      overview: {
        total_users: userStats.total,
        total_modules: moduleStats.total,
        total_attempts: totalAttempts,
        overall_pass_rate: overallPassRate,
      },
      users: {
        total: userStats.total,
        admins: userStats.admins,
        regular_users: userStats.users,
        growth_rate: 0, // Could be calculated with historical data
      },
      modules: {
        total: moduleStats.total,
        active: moduleStats.active,
        by_difficulty: {
          beginner: moduleStats.beginner,
          intermediate: moduleStats.intermediate,
          advanced: moduleStats.advanced,
        },
      },
      performance: {
        total_attempts: totalAttempts,
        total_passed: totalPassed,
        pass_rate: overallPassRate,
        module_completion: moduleCompletionStats,
      },
      leaderboard,
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
})
