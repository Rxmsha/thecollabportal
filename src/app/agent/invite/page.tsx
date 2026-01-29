'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail, AlertCircle } from 'lucide-react'
import xano from '@/services/xano'
import RealtorCredentialsModal from '@/components/RealtorCredentialsModal'

interface RealtorCredentials {
  email: string
  firstName: string
  lastName: string
  tempPassword: string
}

export default function AgentInvitePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    brokerage: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [credentials, setCredentials] = useState<RealtorCredentials | null>(null)

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
      } else if (data) {
        // Show credentials modal
        setCredentials({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          tempPassword: data.tempPassword,
        })
        setShowCredentialsModal(true)
        // Reset form
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

  return (
    <React.Fragment>
      <RealtorCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        credentials={credentials}
        isReactivation={false}
      />
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invite Realtor</h1>
        <p className="text-gray-500 mt-1">
          Send an invitation to a realtor to join your portal
        </p>
      </div>

      <div className="max-w-2xl">
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
    </div>
    </React.Fragment>
  )
}
