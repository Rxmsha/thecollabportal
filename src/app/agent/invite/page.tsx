'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail, AlertCircle, Users } from 'lucide-react'
import xano from '@/services/xano'
import RealtorCredentialsModal from '@/components/RealtorCredentialsModal'
import { markInviteVisited } from '@/lib/onboarding'

interface RealtorCredentials {
  email: string
  firstName: string
  lastName: string
  tempPassword: string
}

interface SeatStats {
  seatLimit: number
  occupiedSeats: number
  canInvite: boolean
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
  const [seatStats, setSeatStats] = useState<SeatStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Mark invite as visited for onboarding progress
  useEffect(() => {
    markInviteVisited()
  }, [])

  useEffect(() => {
    loadSeatStats()
  }, [])

  const loadSeatStats = async () => {
    try {
      const { data } = await xano.getAgentStats()
      if (data) {
        setSeatStats({
          seatLimit: data.seatLimit,
          occupiedSeats: data.occupiedSeats,
          canInvite: data.canInvite,
        })
      }
    } catch (err) {
      console.error('Failed to load seat stats:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }

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
        // Reload seat stats
        loadSeatStats()
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

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Limit to 10 digits
    const limited = digits.slice(0, 10)
    // Format as (XXX) XXX-XXXX
    if (limited.length >= 7) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    } else if (limited.length >= 4) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    } else if (limited.length > 0) {
      return `(${limited}`
    }
    return ''
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
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
        {/* Seat Usage Banner */}
        {seatStats && (
          <div className={`mb-4 p-4 rounded-lg border flex items-center gap-3 ${
            seatStats.canInvite
              ? 'bg-blue-50 border-blue-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <Users className={`h-5 w-5 ${seatStats.canInvite ? 'text-blue-600' : 'text-amber-600'}`} />
            <div>
              <p className={`font-medium ${seatStats.canInvite ? 'text-blue-800' : 'text-amber-800'}`}>
                {seatStats.occupiedSeats} / {seatStats.seatLimit} seats used
              </p>
              <p className={`text-sm ${seatStats.canInvite ? 'text-blue-600' : 'text-amber-600'}`}>
                {seatStats.canInvite
                  ? `${seatStats.seatLimit - seatStats.occupiedSeats} seats remaining`
                  : 'Seat limit reached. Contact support to upgrade your plan.'}
              </p>
            </div>
          </div>
        )}

        <Card>
            <CardHeader>
              <CardTitle>Realtor Details</CardTitle>
              <CardDescription>
                Enter the realtor&apos;s information to send them an invitation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!seatStats?.canInvite && !isLoadingStats && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    You have reached your seat limit. Please upgrade your plan to invite more realtors.
                  </div>
                )}

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
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isLoadingStats || !seatStats?.canInvite}
                >
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
