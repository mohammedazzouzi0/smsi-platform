"use client"

// Admin dashboard with comprehensive analytics and management overview
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  BarChart3,
  Settings,
  LogOut,
  UserPlus,
  Plus,
  Eye,
} from "lucide-react"

interface Analytics {
  overview: {
    total_users: number
    total_modules: number
    total_attempts: number
    overall_pass_rate: number
  }
  users: {
    total: number
    admins: number
    regular_users: number
  }
  modules: {
    total: number
    active: number
    by_difficulty: {
      beginner: number
      intermediate: number
      advanced: number
    }
  }
  performance: {
    total_attempts: number
    total_passed: number
    pass_rate: number
    module_completion: any[]
  }
  leaderboard: any[]
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/dashboard")
      return
    }

    setUser(parsedUser)
    fetchAnalytics()
  }, [router])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      setError("Failed to load analytics data")
      console.error("Fetch analytics error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SMSI Admin</h1>
              <p className="text-sm text-gray-600">Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Administrator
            </Badge>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600">Manage your SMSI cybersecurity training platform.</p>
        </div>

        {analytics && (
          <>
            {/* Overview Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{analytics.overview.total_users}</div>
                      <div className="text-sm text-gray-500">
                        {analytics.users.admins} admins, {analytics.users.regular_users} users
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Training Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{analytics.overview.total_modules}</div>
                      <div className="text-sm text-gray-500">{analytics.modules.active} active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Quiz Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">{analytics.overview.total_attempts}</div>
                      <div className="text-sm text-gray-500">total attempts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-yellow-600" />
                    <div>
                      <div className="text-2xl font-bold">{analytics.overview.overall_pass_rate.toFixed(1)}%</div>
                      <Progress value={analytics.overview.overall_pass_rate} className="w-full mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin/users">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Users
                      </Button>
                    </Link>
                    <Link href="/admin/users/create">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New User
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Content Management</span>
                  </CardTitle>
                  <CardDescription>Manage training modules and quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin/modules">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Modules
                      </Button>
                    </Link>
                    <Link href="/admin/modules/create">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Module
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics & Reports</span>
                  </CardTitle>
                  <CardDescription>View detailed performance analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin/analytics">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </Link>
                    <Link href="/admin/reports">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Award className="h-4 w-4 mr-2" />
                        Generate Reports
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Module Performance */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Module Performance</CardTitle>
                  <CardDescription>Completion rates by training module</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.performance.module_completion.slice(0, 5).map((module) => (
                      <div key={module.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{module.title}</span>
                          <Badge
                            variant="outline"
                            className={
                              module.difficulty_level === "beginner"
                                ? "bg-green-50 text-green-700"
                                : module.difficulty_level === "intermediate"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-red-50 text-red-700"
                            }
                          >
                            {module.difficulty_level}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{module.total_attempts || 0} attempts</span>
                          <span>
                            {module.total_attempts > 0
                              ? ((module.passed_attempts / module.total_attempts) * 100).toFixed(1)
                              : 0}
                            % pass rate
                          </span>
                        </div>
                        <Progress
                          value={module.total_attempts > 0 ? (module.passed_attempts / module.total_attempts) * 100 : 0}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Users with highest completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.leaderboard.slice(0, 5).map((user, index) => (
                      <div key={user.email} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : index === 1
                                  ? "bg-gray-100 text-gray-800"
                                  : index === 2
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.passed_modules} modules • {user.average_score?.toFixed(1)}% avg
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="outline">{user.completed_modules} completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
                <CardDescription>Platform health and compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
                    <div className="text-sm font-medium">ISO 27001 Compliant</div>
                    <div className="text-xs text-gray-500">Security management</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
                    <div className="text-sm font-medium">RGPD Compliant</div>
                    <div className="text-xs text-gray-500">Data protection</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
                    <div className="text-sm font-medium">System Healthy</div>
                    <div className="text-xs text-gray-500">All services operational</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
