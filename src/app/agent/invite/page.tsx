'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { UserPlus, Mail, CheckCircle, Copy, AlertCircle } from 'lucide-react'
import xano from '@/services/xano'

export default function AgentInvitePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    brokerage: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { data, error: apiError } = await xano.inviteRealtor({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        brokerage: formData.brokerage,
        phone: formData.phone,
      })

      if (apiError) {
        setError(apiError)
      } else {
        setSuccess(true)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          brokerage: '',
          phone: '',
        })
      }
    } catch (err) {
      setError('Failed to send invitation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/DEMO_TOKEN`

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invitation Sent!
              </h2>
              <p className="text-gray-500 mb-6">
                An invitation email has been sent to{' '}
                <span className="font-medium">{formData.email || 'the realtor'}</span>.
                They&apos;ll receive instructions to join your portal.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setSuccess(false)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Another
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invite Realtor</h1>
        <p className="text-gray-500 mt-1">
          Send an invitation to a realtor to join your portal
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Realtor Details</CardTitle>
              <CardDescription>
                Enter the realtor&apos;s information to send them an invitation
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="john.doe@realty.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brokerage">Brokerage</Label>
                  <Input
                    id="brokerage"
                    value={formData.brokerage}
                    onChange={(e) => handleChange('brokerage', e.target.value)}
                    placeholder="RE/MAX, Keller Williams, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Share Link */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Share Invite Link</CardTitle>
              <CardDescription>
                Or share this link directly with realtors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="text-xs bg-gray-50"
                />
                <Button variant="outline" size="icon" onClick={copyInviteLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Invited realtors receive an email with a link to create their account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>They&apos;ll have access to your branded portal with templates and tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>You can track who has accepted their invitation in &quot;My Realtors&quot;</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
