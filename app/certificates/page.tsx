"use client"

// Certificate management page for users
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Award, Download, Calendar, Shield, Loader2 } from "lucide-react"

interface Certificate {
  id: number
  module_id: number
  module_title: string
  score: number
  completed_at: string
  certificate_generated: boolean
}

export default function CertificatesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
    fetchCertificates()
  }, [router])

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/certificates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch certificates")
      }

      const data = await response.json()
      setCertificates(data.certificates)
    } catch (error) {
      setError("Failed to load certificates")
      console.error("Fetch certificates error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async (moduleId: number, moduleTitle: string) => {
    setDownloadingId(moduleId)

    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          module_id: moduleId,
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
      a.download = `SMSI-Certificate-${moduleTitle.replace(/\s+/g, "-")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Certificate download error:", error)
      alert("Failed to download certificate. Please try again.")
    } finally {
      setDownloadingId(null)
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
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
              <p className="text-sm text-gray-600">Download and manage your training certificates</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overview */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-yellow-600" />
                <span>Certificate Overview</span>
              </CardTitle>
              <CardDescription>Your cybersecurity training achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{certificates.length}</div>
                  <div className="text-sm text-gray-600">Certificates Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {certificates.length > 0
                      ? (certificates.reduce((sum, cert) => sum + cert.score, 0) / certificates.length).toFixed(1)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {certificates.filter((cert) => cert.certificate_generated).length}
                  </div>
                  <div className="text-sm text-gray-600">Downloaded</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates List */}
        {certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{certificate.module_title}</CardTitle>
                      <CardDescription>Cybersecurity Training Certificate</CardDescription>
                    </div>
                    <Award className="h-6 w-6 text-yellow-600 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Score */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Score:</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {certificate.score.toFixed(1)}%
                      </Badge>
                    </div>

                    {/* Completion Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed:</span>
                      <div className="flex items-center space-x-1 text-sm text-gray-900">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(certificate.completed_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <Button
                      onClick={() => handleDownloadCertificate(certificate.module_id, certificate.module_title)}
                      disabled={downloadingId === certificate.module_id}
                      className="w-full"
                    >
                      {downloadingId === certificate.module_id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>

                    {/* Compliance Badge */}
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        ISO 27001 Compliant
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                <p className="text-gray-600 mb-6">
                  Complete training modules with a score of 80% or higher to earn certificates.
                </p>
                <Link href="/dashboard">
                  <Button>Start Training</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Certificate Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                • Certificates are automatically generated when you pass a training module with 80% or higher score.
              </p>
              <p>• Each certificate includes a unique ID for verification purposes.</p>
              <p>• All certificates are compliant with ISO 27001, ISO 27002, ISO 27005, and RGPD regulations.</p>
              <p>• Certificates can be downloaded multiple times and are valid indefinitely.</p>
              <p>• Share your certificates with employers or include them in your professional portfolio.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
