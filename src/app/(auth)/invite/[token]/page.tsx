'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'
import xano from '@/services/xano'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [inviteData, setInviteData] = useState<{
    email: string
    firstName: string
    lastName: string
    agentName: string
    agentCompany: string
  } | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const { data, error } = await xano.request<any>(`/invites/validate/${token}`)

      if (error || !data) {
        setError('This invitation link is invalid or has expired.')
        setIsLoading(false)
        return
      }

      setInviteData({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        agentName: data.agentName,
        agentCompany: data.agentCompany,
      })
    } catch (err) {
      setError('Failed to validate invitation.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await xano.request<any>(`/invites/accept/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      })

      if (error) {
        setError(error)
        setIsSubmitting(false)
        return
      }

      setIsComplete(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError('Failed to create account. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">CP</span>
          </div>
          <p className="text-gray-500">Validating invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button onClick={() => router.push('/login')}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Created!</h2>
              <p className="text-gray-500 mb-6">
                Your account has been created successfully. Redirecting to login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">CP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TheCollabPortal</h1>
          <p className="text-gray-500 mt-1">Accept your invitation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>You&apos;re invited!</CardTitle>
            <CardDescription>
              {inviteData?.agentName} from {inviteData?.agentCompany} has invited you to join TheCollabPortal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={`${inviteData?.firstName} ${inviteData?.lastName}`}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={inviteData?.email} disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Accept Invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} TheCollabPortal. All rights reserved.
        </p>
      </div>
    </div>
  )
}
