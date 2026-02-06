'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Shield, DollarSign, Calendar, MessageSquare, CheckSquare, Baby, Zap, Bell } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <img
                src="/logo.svg"
                alt="CoupleOps Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Couple<span className="text-pink-600">Ops</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Fix systems, not people. Transform your relationship with structured decision-making, 
            role clarity, and transparent communication.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild className="bg-pink-600 hover:bg-pink-700">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Partner Management</CardTitle>
              <CardDescription>
                Secure pairing with role-based access and partner-only features
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Role Lock System</CardTitle>
              <CardDescription>
                Define business roles and ownership to prevent conflicts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CheckSquare className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Decision Authority</CardTitle>
              <CardDescription>
                Clear decision-making with timers and final authority
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <DollarSign className="w-8 h-8 text-yellow-600 mb-2" />
              <CardTitle>Money Transparency</CardTitle>
              <CardDescription>
                Track income, expenses, and maintain financial clarity
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-indigo-600 mb-2" />
              <CardTitle>AI Referee</CardTitle>
              <CardDescription>
                Neutral AI-powered conflict resolution and suggestions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Baby className="w-8 h-8 text-pink-600 mb-2" />
              <CardTitle>Child Management</CardTitle>
              <CardDescription>
                Coordinate parenting decisions, expenses, and schedules
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Product Truth */}
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">✅ PRODUCT TRUTH</h2>
          <p className="text-xl text-gray-700 font-medium">
            CoupleOps <span className="text-pink-600 font-bold">does not try to fix people</span>.
          </p>
          <p className="text-xl text-gray-700 font-medium mt-2">
            It <span className="text-green-600 font-bold">fixes systems</span>, and systems fix fights.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 CoupleOps. Building stronger relationships through better systems.
          </p>
        </div>
      </footer>
    </div>
  )
}