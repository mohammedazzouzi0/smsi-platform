"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ModuleItem {
  id: number
  title: string
  description: string | null
  difficulty_level: "beginner" | "intermediate" | "advanced"
  duration_minutes: number
}

export default function AdminModulesPage() {
  const router = useRouter()
  const [modules, setModules] = useState<ModuleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsed = JSON.parse(userData)
    if (parsed.role !== "admin") {
      router.push("/dashboard")
      return
    }
    fetchModules()
  }, [router])

  async function fetchModules() {
    try {
      const res = await fetch("/api/modules")
      if (!res.ok) throw new Error("Failed to fetch modules")
      const data = await res.json()
      setModules(data.modules || [])
    } catch (e) {
      setError("Failed to load modules")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Modules</h1>
          <Link href="/admin/modules/create">
            <Button>Create Module</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="text-lg">{m.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{m.description || "No description"}</p>
                <div className="text-sm text-gray-500 mb-4">
                  {m.difficulty_level} • {m.duration_minutes} min
                </div>
                <Link href={`/modules/${m.id}`}>
                  <Button variant="outline">View</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {modules.length === 0 && <div className="text-gray-500">No modules found.</div>}
      </div>
    </div>
  )
}


