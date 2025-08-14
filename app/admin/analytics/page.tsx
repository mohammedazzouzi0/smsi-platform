"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [analytics, setAnalytics] = useState<any | null>(null)

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

    fetchAnalytics()
  }, [router])

  async function fetchAnalytics() {
    try {
      const response = await fetch("/api/admin/analytics")
      if (!response.ok) throw new Error("Failed to fetch analytics")
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (e) {
      setError("Failed to load analytics")
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
      <div className="container mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analytics ? (
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{analytics.overview.total_users}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Modules</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{analytics.overview.total_modules}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Attempts</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{analytics.overview.total_attempts}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pass Rate</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{analytics.overview.overall_pass_rate.toFixed(1)}%</CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">No analytics available.</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


