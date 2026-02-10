'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Mail, AlertCircle, Users } from 'lucide-react'
import xano from '@/services/xano'
import RealtorCredentialsModal from '@/components/RealtorCredentialsModal'
import { markInviteVisited } from '@/lib/onboarding'
import { useBranding } from '@/context/BrandingContext'

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
  const { brandColor } = useBranding()
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
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="dot-matrix text-2xl text-gray-900">INVITE REALTOR</h1>
          <p className="text-base text-gray-700 mt-1 font-mono">
            Send an invitation to a realtor to join your portal
          </p>
        </div>

        {/* Centered Content */}
        <div className="max-w-xl mx-auto">
          {/* Seat Usage Banner */}
          {seatStats && (
            <div className={`mb-6 p-4 border flex items-center gap-3 ${
              seatStats.canInvite
                ? 'bg-blue-50 border-blue-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <Users className={`h-5 w-5 ${seatStats.canInvite ? 'text-blue-600' : 'text-amber-600'}`} />
              <div>
                <p className={`font-mono font-semibold text-base ${seatStats.canInvite ? 'text-blue-800' : 'text-amber-800'}`}>
                  {seatStats.occupiedSeats} / {seatStats.seatLimit} seats used
                </p>
                <p className={`text-base font-mono ${seatStats.canInvite ? 'text-blue-600' : 'text-amber-600'}`}>
                  {seatStats.canInvite
                    ? `${seatStats.seatLimit - seatStats.occupiedSeats} seats remaining`
                    : 'Seat limit reached. Contact support to upgrade your plan.'}
                </p>
              </div>
            </div>
          )}

          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <UserPlus className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                Realtor Details
              </span>
            </div>
            <CardContent className="p-6 bg-white">
              <p className="text-base text-gray-700 font-mono mb-6">
                Enter the realtor&apos;s information to send them an invitation
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!seatStats?.canInvite && !isLoadingStats && (
                  <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 text-amber-700 text-base font-mono">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    You have reached your seat limit. Please upgrade your plan to invite more realtors.
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-base font-mono">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-mono text-gray-900 text-base">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                      className="rounded-none font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-mono text-gray-900 text-base">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                      className="rounded-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono text-gray-900 text-base">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="pl-10 rounded-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brokerage" className="font-mono text-gray-900 text-base">
                    Brokerage
                  </Label>
                  <Input
                    id="brokerage"
                    value={formData.brokerage}
                    onChange={(e) => handleChange('brokerage', e.target.value)}
                    className="rounded-none font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-mono text-gray-900 text-base">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="rounded-none font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-none font-mono uppercase tracking-wider text-sm h-11"
                  style={{ backgroundColor: brandColor }}
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
