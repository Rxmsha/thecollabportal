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
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-3 sm:pb-4">
          <h1 className="dot-matrix text-xl sm:text-2xl text-gray-900">Invite Realtor</h1>
          <p className="text-sm sm:text-base text-gray-700 mt-1">
            Send an invitation to a realtor to join your portal
          </p>
        </div>

        {/* Centered Content */}
        <div className="max-w-xl mx-auto">
          {/* Seat Usage Banner */}
          {seatStats && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 border rounded-lg flex items-start sm:items-center gap-2 sm:gap-3 ${
              seatStats.canInvite
                ? 'bg-blue-50 border-blue-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <Users className={`h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0 ${seatStats.canInvite ? 'text-blue-600' : 'text-amber-600'}`} />
              <div>
                <p className={`font-semibold text-sm sm:text-base ${seatStats.canInvite ? 'text-blue-800' : 'text-amber-800'}`}>
                  {seatStats.occupiedSeats} / {seatStats.seatLimit} seats used
                </p>
                <p className={`text-xs sm:text-base ${seatStats.canInvite ? 'text-blue-600' : 'text-amber-600'}`}>
                  {seatStats.canInvite
                    ? `${seatStats.seatLimit - seatStats.occupiedSeats} seats remaining`
                    : 'Seat limit reached. Contact support to upgrade your plan.'}
                </p>
              </div>
            </div>
          )}

          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <UserPlus className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                Realtor Details
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                Enter the realtor's information to send them an invitation
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {!seatStats?.canInvite && !isLoadingStats && (
                  <div className="flex items-start gap-2 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs sm:text-base">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>You have reached your seat limit. Please upgrade your plan to invite more realtors.</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-base">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="firstName" className="text-gray-900 text-sm sm:text-base">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                      className="rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="lastName" className="text-gray-900 text-sm sm:text-base">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                      className="rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-gray-900 text-sm sm:text-base">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="pl-10 rounded-lg text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="brokerage" className="text-gray-900 text-sm sm:text-base">
                    Brokerage
                  </Label>
                  <Input
                    id="brokerage"
                    value={formData.brokerage}
                    onChange={(e) => handleChange('brokerage', e.target.value)}
                    className="rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="phone" className="text-gray-900 text-sm sm:text-base">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="rounded-lg text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-lg text-sm h-10 sm:h-11"
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
