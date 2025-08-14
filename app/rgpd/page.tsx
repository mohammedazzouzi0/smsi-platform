"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Trash2, Shield, FileText, AlertTriangle } from "lucide-react"

export default function RGPDPage() {
  const [loading, setLoading] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleDataExport = async () => {
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/rgpd/export")
      if (!response.ok) throw new Error("Export failed")

      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `my-data-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage("Your data has been exported successfully.")
    } catch (err) {
      setError("Failed to export data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAccountDeletion = async () => {
    if (!deletePassword) {
      setError("Please enter your password to confirm deletion.")
      return
    }

    setLoading(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch("/api/rgpd/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Deletion failed")
      }

      setMessage("Your account and all data have been permanently deleted.")
      setTimeout(() => {
        window.location.href = "/"
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RGPD & Data Privacy</h1>
        <p className="text-muted-foreground">
          Manage your personal data and privacy settings in compliance with RGPD regulations.
        </p>
      </div>

      {message && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-green-800">{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Data
            </CardTitle>
            <CardDescription>Download a complete copy of all your personal data stored in our system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Your export will include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Personal information (name, email)</li>
                  <li>Training progress and quiz results</li>
                  <li>Certificate records</li>
                  <li>Activity logs and timestamps</li>
                </ul>
              </div>
              <Button onClick={handleDataExport} disabled={loading} className="w-full sm:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                {loading ? "Exporting..." : "Export My Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  <strong>Warning:</strong> This will permanently delete all your data including: training progress,
                  certificates, and account information.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="delete-password">Confirm with your password:</Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="max-w-sm"
                />
              </div>

              <Button
                onClick={handleAccountDeletion}
                disabled={loading || !deletePassword}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {loading ? "Deleting..." : "Delete My Account"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Information */}
        <Card>
          <CardHeader>
            <CardTitle>Your Privacy Rights</CardTitle>
            <CardDescription>Under RGPD, you have the following rights regarding your personal data:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Right to Access</h4>
                <p className="text-muted-foreground">You can request access to your personal data at any time.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Right to Rectification</h4>
                <p className="text-muted-foreground">You can request correction of inaccurate personal data.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Right to Erasure</h4>
                <p className="text-muted-foreground">You can request deletion of your personal data.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Right to Data Portability</h4>
                <p className="text-muted-foreground">You can export your data in a structured format.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
