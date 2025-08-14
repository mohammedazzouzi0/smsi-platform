// SMSI Cybersecurity Platform - Landing Page
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Award, BookOpen, Lock, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">SMSI Platform</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Cybersecurity Awareness Training Platform</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Comprehensive Information Security Management System (SMSI) compliant with ISO 27001, ISO 27002, ISO
              27005, and RGPD regulations. Build your cybersecurity knowledge through interactive training modules and
              earn certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning Today
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                  Access Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Comprehensive Cybersecurity Training</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Interactive Modules</CardTitle>
                <CardDescription>
                  Learn through engaging content covering phishing, passwords, physical security, and access management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Knowledge Assessment</CardTitle>
                <CardDescription>
                  Test your understanding with interactive quizzes and receive immediate feedback on your progress.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Digital Certificates</CardTitle>
                <CardDescription>
                  Earn personalized PDF certificates upon successful completion of training modules (80% pass rate).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Compliance Ready</CardTitle>
                <CardDescription>
                  Built to meet ISO 27001, ISO 27002, ISO 27005 standards and RGPD data protection requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Comprehensive admin dashboard for managing users, tracking progress, and generating reports.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Security First</CardTitle>
                <CardDescription>
                  Built with security best practices including encrypted data, audit logging, and role-based access
                  control.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Regulatory Compliance</h3>
            <p className="text-lg text-gray-600 mb-8">
              Our platform is designed to help organizations meet their cybersecurity training requirements while
              maintaining full compliance with international standards and local regulations.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">ISO 27001</h4>
                <p className="text-sm text-gray-600">Information Security Management Systems</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">ISO 27002</h4>
                <p className="text-sm text-gray-600">Security Controls Implementation</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">ISO 27005</h4>
                <p className="text-sm text-gray-600">Information Security Risk Management</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">RGPD/GDPR</h4>
                <p className="text-sm text-gray-600">Data Protection Regulation</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Loi 05.20</h4>
                <p className="text-sm text-gray-600">Cybersecurity of Sensitive Systems</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Loi 09.08</h4>
                <p className="text-sm text-gray-600">Personal Data Protection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-semibold">SMSI Platform</span>
          </div>
          <p className="text-gray-400 mb-4">
            Secure, compliant cybersecurity awareness training for modern organizations.
          </p>
          <p className="text-sm text-gray-500">© 2024 SMSI Platform. Built with security and compliance in mind.</p>
        </div>
      </footer>
    </div>
  )
}
