// API route for fetching quiz questions
import { NextResponse } from "next/server"
import { QuizModel } from "@/lib/models/Quiz"
import { ModuleModel } from "@/lib/models/Module"
import { requireAuth } from "@/lib/middleware/auth"

export const GET = requireAuth(async (request, { params }: { params: { moduleId: string } }) => {
  try {
    const moduleId = Number.parseInt(params.moduleId)

    if (isNaN(moduleId)) {
      return NextResponse.json({ error: "Invalid module ID" }, { status: 400 })
    }

    // Verify module exists and is active
    const module = await ModuleModel.findById(moduleId)
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    // Get quiz questions (without correct answers)
    const questions = await QuizModel.findQuestionsForModule(moduleId)

    if (questions.length === 0) {
      return NextResponse.json({ error: "No quiz questions available for this module" }, { status: 404 })
    }

    return NextResponse.json({
      module: {
        id: module.id,
        title: module.title,
        description: module.description,
      },
      questions,
      total_questions: questions.length,
      total_points: questions.reduce((sum, q) => sum + q.points, 0),
    })
  } catch (error) {
    console.error("Get quiz error:", error)
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
})
