"use client"

// User dashboard with progress tracking and module overview
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, BookOpen, Award, Clock, CheckCircle, Play, LogOut, TrendingUp } from "lucide-react"

interface ModuleProgress {
  module_id: number
  user_id: number
  completed: boolean
  score?: number
  passed?: boolean
  completed_at?: Date
}

interface Module {
  id: number
  title: string
  description: string
  duration_minutes: number
  difficulty_level: "beginner" | "intermediate" | "advanced"
  progress?: ModuleProgress
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Fetch modules and progress
    fetchModules()
  }, [router])

  const fetchModules = async () => {
    try {
      const response = await fetch("/api/modules", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch modules")
      }

      const data = await response.json()
      setModules(data.modules)
    } catch (error) {
      setError("Failed to load training modules")
      console.error("Fetch modules error:", error)
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

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProgressStats = () => {
    const completed = modules.filter((m) => m.progress?.completed).length
    const passed = modules.filter((m) => m.progress?.passed).length
    const total = modules.length
    const progressPercentage = total > 0 ? (completed / total) * 100 : 0

    return { completed, passed, total, progressPercentage }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = getProgressStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">SMSI Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
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
          <p className="text-gray-600">Continue your cybersecurity awareness training journey.</p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{Math.round(stats.progressPercentage)}%</div>
                  <Progress value={stats.progressPercentage} className="w-full mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Modules Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-gray-500">of {stats.total}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Modules Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.passed}</div>
                  <div className="text-sm text-gray-500">≥80% score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-gray-500">training modules</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Modules */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Training Modules</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Card key={module.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
                      <CardDescription className="text-sm">{module.description}</CardDescription>
                    </div>
                    {module.progress?.completed && (
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{module.duration_minutes} min</span>
                      </div>
                      <Badge className={getDifficultyColor(module.difficulty_level)}>{module.difficulty_level}</Badge>
                    </div>

                    {module.progress?.completed && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span>Score: {module.progress.score?.toFixed(1)}%</span>
                          <Badge variant={module.progress.passed ? "default" : "destructive"}>
                            {module.progress.passed ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                        {module.progress.completed_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Completed: {new Date(module.progress.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}

                    <Link href={`/modules/${module.id}`}>
                      <Button className="w-full" variant={module.progress?.completed ? "outline" : "default"}>
                        <Play className="h-4 w-4 mr-2" />
                        {module.progress?.completed ? "Review Module" : "Start Module"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/certificates">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent w-full"
                >
                  <Award className="h-6 w-6" />
                  <span>View Certificates</span>
                </Button>
              </Link>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                <BookOpen className="h-6 w-6" />
                <span>Learning Resources</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2 bg-transparent">
                <Shield className="h-6 w-6" />
                <span>Security Guidelines</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
