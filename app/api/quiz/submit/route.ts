// API route for submitting quiz answers and calculating results
import { NextResponse } from "next/server"
import { QuizModel } from "@/lib/models/Quiz"
import { ResultModel } from "@/lib/models/Result"
import { ModuleModel } from "@/lib/models/Module"
import { requireAuth } from "@/lib/middleware/auth"
import { z } from "zod"

// Quiz submission schema
const submitQuizSchema = z.object({
  module_id: z.number(),
  answers: z.array(
    z.object({
      quiz_id: z.number(),
      selected_option: z.number(),
    }),
  ),
  time_spent_minutes: z.number().min(0),
})

export const POST = requireAuth(async (request) => {
  try {
    const { user } = request
    const body = await request.json()

    // Validate input
    const validation = submitQuizSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid submission data", details: validation.error.errors }, { status: 400 })
    }

    const { module_id, answers, time_spent_minutes } = validation.data

    // Verify module exists
    const module = await ModuleModel.findById(module_id)
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    // Get all quiz questions for this module
    const quizzes = await QuizModel.findByModuleId(module_id)
    if (quizzes.length === 0) {
      return NextResponse.json({ error: "No quiz questions found" }, { status: 404 })
    }

    // Calculate results
    let totalPoints = 0
    let earnedPoints = 0
    const detailedResults = []

    for (const answer of answers) {
      const quiz = quizzes.find((q) => q.id === answer.quiz_id)
      if (!quiz) continue

      const isCorrect = answer.selected_option === quiz.correct_option
      const pointsEarned = isCorrect ? quiz.points : 0

      totalPoints += quiz.points
      earnedPoints += pointsEarned

      detailedResults.push({
        quiz_id: quiz.id,
        question: quiz.question,
        selected_option: answer.selected_option,
        correct_option: quiz.correct_option,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        explanation: quiz.explanation,
      })
    }

    // Calculate percentage and pass/fail
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = percentage >= 80 // 80% pass threshold

    // Save result to database
    const result = await ResultModel.createOrUpdate({
      user_id: user!.userId,
      module_id,
      score: percentage,
      total_questions: quizzes.length,
      correct_answers: detailedResults.filter((r) => r.is_correct).length,
      passed,
      time_spent_minutes,
    })

    return NextResponse.json({
      result: {
        score: percentage,
        passed,
        total_questions: quizzes.length,
        correct_answers: detailedResults.filter((r) => r.is_correct).length,
        total_points: totalPoints,
        earned_points: earnedPoints,
        time_spent_minutes,
        certificate_eligible: passed,
      },
      detailed_results: detailedResults,
      module: {
        id: module.id,
        title: module.title,
      },
    })
  } catch (error) {
    console.error("Submit quiz error:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
})
