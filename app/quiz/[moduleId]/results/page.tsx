"use client"

// Quiz results page with detailed feedback and certificate eligibility
import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Award, RotateCcw, Home, Download, Loader2 } from "lucide-react"

export default function QuizResultsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const moduleId = params.moduleId as string

  const [user, setUser] = useState<any | null>(null)
  const [downloadingCertificate, setDownloadingCertificate] = useState(false)
  const score = Number.parseFloat(searchParams.get("score") || "0")
  const passed = searchParams.get("passed") === "true"

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleDownloadCertificate = async () => {
    setDownloadingCertificate(true)

    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          module_id: Number.parseInt(moduleId),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate certificate")
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `SMSI-Certificate-${moduleId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Certificate download error:", error)
      alert("Failed to download certificate. Please try again.")
    } finally {
      setDownloadingCertificate(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (score: number, passed: boolean) => {
    if (passed) {
      if (score >= 95) return "Outstanding! Excellent understanding of cybersecurity concepts."
      if (score >= 90) return "Great job! You have a strong grasp of the material."
      return "Well done! You've successfully completed this training module."
    } else {
      return "Don't worry! Review the material and try again to improve your score."
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Quiz Results</h1>
          <Link href="/dashboard">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Results Card */}
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {passed ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-600" />
                )}
              </div>
              <CardTitle className="text-2xl mb-2">{passed ? "Congratulations!" : "Quiz Complete"}</CardTitle>
              <CardDescription className="text-lg">{getScoreMessage(score, passed)}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Score Display */}
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>{score.toFixed(1)}%</div>
                <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-1">
                  {passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Your Score</span>
                  <span className="text-sm text-gray-500">Pass Threshold: 80%</span>
                </div>
                <Progress value={score} className="w-full h-3" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="text-yellow-600">80%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Certificate Section */}
              {passed && (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Award className="h-8 w-8 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Certificate Earned!</h3>
                      <p className="text-sm text-yellow-700">
                        You've earned a certificate for completing this cybersecurity training module.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCertificate}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    {downloadingCertificate ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Certificate...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Performance Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Performance Summary</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{score.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Final Score</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{passed ? "✓" : "✗"}</div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {passed ? (
                      <>
                        <li>• Continue to the next training module</li>
                        <li>• Download and save your certificate</li>
                        <li>• Apply what you've learned in your daily work</li>
                        <li>• Share your achievement with your team</li>
                      </>
                    ) : (
                      <>
                        <li>• Review the training material again</li>
                        <li>• Focus on areas where you had difficulty</li>
                        <li>• Retake the quiz when you feel ready</li>
                        <li>• Ask your supervisor for additional resources</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>

            {!passed && (
              <Link href={`/quiz/${moduleId}`} className="flex-1">
                <Button className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              </Link>
            )}

            {passed && (
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">Continue Learning</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
