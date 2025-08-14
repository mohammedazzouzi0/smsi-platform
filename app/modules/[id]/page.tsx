"use client"

// Individual training module page with content display
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Clock, BookOpen, Play, Shield } from "lucide-react"

interface Module {
  id: number
  title: string
  description: string
  content: string
  duration_minutes: number
  difficulty_level: "beginner" | "intermediate" | "advanced"
}

export default function ModulePage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string

  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    fetchModule()
  }, [moduleId, router])

  const fetchModule = async () => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch module")
      }

      const data = await response.json()
      setModule(data.module)
    } catch (error) {
      setError("Failed to load training module")
      console.error("Fetch module error:", error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || "Module not found"}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
            <h1 className="text-2xl font-bold text-gray-900">SMSI Platform</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{module.title}</h2>
              <p className="text-lg text-gray-600">{module.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{module.duration_minutes} minutes</span>
            </div>
            <Badge className={getDifficultyColor(module.difficulty_level)}>{module.difficulty_level}</Badge>
          </div>
        </div>

        {/* Module Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Training Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: module.content }} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Module Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Module Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Duration</div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{module.duration_minutes} minutes</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Difficulty</div>
                    <Badge className={getDifficultyColor(module.difficulty_level)}>{module.difficulty_level}</Badge>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">Learning Objectives</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Understand key cybersecurity concepts</li>
                      <li>• Identify potential security threats</li>
                      <li>• Apply best practices in daily work</li>
                      <li>• Recognize compliance requirements</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Action */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assessment</CardTitle>
                  <CardDescription>Test your knowledge with an interactive quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/quiz/${module.id}`}>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Take Quiz
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 mt-2">Score 80% or higher to earn your certificate</p>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Compliance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    This training module is designed to meet ISO 27001, ISO 27002, and RGPD compliance requirements for
                    cybersecurity awareness.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
