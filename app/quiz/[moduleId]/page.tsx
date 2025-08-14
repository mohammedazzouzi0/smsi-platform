"use client"

// Interactive quiz page with timer and progress tracking
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, AlertCircle, Timer } from "lucide-react"
import Link from "next/link"

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  points: number
}

interface QuizData {
  module: {
    id: number
    title: string
    description: string
  }
  questions: QuizQuestion[]
  total_questions: number
  total_points: number
}

interface Answer {
  quiz_id: number
  selected_option: number
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string

  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [startTime] = useState(Date.now())
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    fetchQuiz()
  }, [moduleId, router])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch quiz")
      }

      const data = await response.json()
      setQuizData(data)
    } catch (error) {
      setError("Failed to load quiz")
      console.error("Fetch quiz error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
  }

  const handleNextQuestion = () => {
    if (selectedOption === null || !quizData) return

    // Save current answer
    const newAnswer: Answer = {
      quiz_id: quizData.questions[currentQuestion].id,
      selected_option: selectedOption,
    }

    const updatedAnswers = [...answers]
    const existingIndex = updatedAnswers.findIndex((a) => a.quiz_id === newAnswer.quiz_id)

    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = newAnswer
    } else {
      updatedAnswers.push(newAnswer)
    }

    setAnswers(updatedAnswers)
    setSelectedOption(null)

    // Move to next question or finish
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitQuiz(updatedAnswers)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)

      // Load previous answer if exists
      const previousAnswer = answers.find((a) => a.quiz_id === quizData!.questions[currentQuestion - 1].id)
      setSelectedOption(previousAnswer?.selected_option ?? null)
    }
  }

  const submitQuiz = async (finalAnswers: Answer[]) => {
    if (!quizData) return

    setSubmitting(true)

    try {
      const timeSpentMinutes = Math.ceil((Date.now() - startTime) / (1000 * 60))

      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          module_id: Number.parseInt(moduleId),
          answers: finalAnswers,
          time_spent_minutes: timeSpentMinutes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz")
      }

      const result = await response.json()

      // Redirect to results page with data
      router.push(`/quiz/${moduleId}/results?score=${result.result.score}&passed=${result.result.passed}`)
    } catch (error) {
      setError("Failed to submit quiz")
      console.error("Submit quiz error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || "Quiz not found"}</AlertDescription>
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

  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100
  const currentQ = quizData.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{quizData.module.title} - Quiz</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-mono">{formatTime(timeElapsed)}</span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Quiz
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Question Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">Question {currentQuestion + 1}</CardTitle>
                <CardDescription className="text-lg text-gray-900 font-medium">{currentQ.question}</CardDescription>
              </div>
              <Badge variant="outline">
                {currentQ.points} {currentQ.points === 1 ? "point" : "points"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
              className="space-y-4"
            >
              {currentQ.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-gray-500">
                {currentQuestion + 1} of {quizData.questions.length}
              </div>

              <Button onClick={handleNextQuestion} disabled={selectedOption === null || submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : currentQuestion === quizData.questions.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Quiz
                  </>
                ) : (
                  "Next Question"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Info */}
        <div className="max-w-4xl mx-auto mt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to score 80% or higher to pass this quiz and earn your certificate. Take your time and read each
              question carefully.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
