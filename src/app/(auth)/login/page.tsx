'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Mail, Lock } from 'lucide-react'

// Demo test credentials
const demoCredentials = {
  admin: { email: 'admin@thecollabportal.com', password: 'demo123' },
  agent: { email: 'sarah@mortgagepro.com', password: 'demo123' },
  realtor: { email: 'jessica.realtor@torontorealty.com', password: 'demo123' },
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || 'Login failed')
    }
    setIsLoading(false)
  }

  const fillDemoCredentials = (role: 'admin' | 'agent' | 'realtor') => {
    setEmail(demoCredentials[role].email)
    setPassword(demoCredentials[role].password)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8eef7] px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardContent className="pt-8 pb-6 px-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">The Collab Portal</h1>
              <p className="text-gray-500 mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-500">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </div>

            {/* Demo Login Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500 mb-4">
                Demo Login (for testing)
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => fillDemoCredentials('admin')}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => fillDemoCredentials('agent')}
                >
                  Agent
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => fillDemoCredentials('realtor')}
                >
                  Realtor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
