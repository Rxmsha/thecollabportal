'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Phone,
  Building,
  Calendar,
  KeyRound,
  UserCheck,
  UserX,
  Loader2,
  Send,
  Unlink,
  AlertTriangle,
  User,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import xano from '@/services/xano'
import { RealtorStatus } from '@/types'
import { toast } from '@/hooks/use-toast'
import { useBranding } from '@/context/BrandingContext'

interface RealtorDetails {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  brokerage: string
  areaServiced: string
  status: string
  agentId: number
  userId: number
  inviteSentAt: string
  activatedAt: string
  createdAt: string
}

interface AgentRealtorDetailModalProps {
  isOpen: boolean
  onClose: () => void
  realtorId: number | null
  onStatusChange?: (realtorId: number, newStatus: RealtorStatus) => void
  onPasswordReset?: (credentials: {
    email: string
    firstName: string
    lastName: string
    tempPassword: string
  }) => void
  onUnlink?: (realtorId: number) => void
}

export default function AgentRealtorDetailModal({
  isOpen,
  onClose,
  realtorId,
  onStatusChange,
  onPasswordReset,
  onUnlink,
}: AgentRealtorDetailModalProps) {
  const { brandColor } = useBranding()
  const [details, setDetails] = useState<RealtorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [isResendingInvite, setIsResendingInvite] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && realtorId) {
      loadRealtorDetails()
    } else {
      setDetails(null)
      setError(null)
      setShowUnlinkConfirm(false)
    }
  }, [isOpen, realtorId])

  const loadRealtorDetails = async () => {
    if (!realtorId) return
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await xano.getMyRealtorDetails(realtorId)
      if (error) {
        setError(error)
      } else if (data) {
        setDetails(data)
      }
    } catch (err) {
      setError('Failed to load realtor details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!realtorId) return
    setIsResettingPassword(true)
    try {
      const { data, error } = await xano.resetMyRealtorPassword(realtorId)
      if (error) {
        setError(error)
      } else if (data && onPasswordReset) {
        onPasswordReset({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          tempPassword: data.tempPassword,
        })
        onClose()
      }
    } catch (err) {
      setError('Failed to reset password')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleDeactivate = async () => {
    if (!realtorId) return
    setIsChangingStatus(true)
    try {
      const { error } = await xano.deactivateRealtor(realtorId)
      if (error) {
        setError(error)
      } else {
        setDetails((prev) => (prev ? { ...prev, status: 'inactive' } : null))
        onStatusChange?.(realtorId, 'inactive')
      }
    } catch (err) {
      setError('Failed to deactivate realtor')
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleActivate = async () => {
    if (!realtorId) return
    setIsChangingStatus(true)
    try {
      const { data, error } = await xano.reactivateRealtor(realtorId)
      if (error) {
        setError(error)
      } else if (data) {
        setDetails((prev) => (prev ? { ...prev, status: 'active' } : null))
        onStatusChange?.(realtorId, 'active')
        if (onPasswordReset) {
          onPasswordReset({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            tempPassword: data.tempPassword,
          })
          onClose()
        }
      }
    } catch (err) {
      setError('Failed to activate realtor')
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleResendInvite = async () => {
    if (!realtorId) return
    setIsResendingInvite(true)
    setError(null)
    try {
      const { data, error } = await xano.resendRealtorInvite(realtorId)
      if (error) {
        setError(error)
      } else if (data) {
        // Update the invite_sent_at timestamp in local state
        setDetails((prev) => (prev ? { ...prev, inviteSentAt: new Date().toISOString() } : null))
        toast({
          title: 'Invite sent',
          description: `Onboarding email has been resent to ${data.email}`,
          variant: 'success',
        })
      }
    } catch (err) {
      setError('Failed to resend invite')
    } finally {
      setIsResendingInvite(false)
    }
  }

  const handleUnlink = async () => {
    if (!realtorId) return
    setIsUnlinking(true)
    setError(null)
    try {
      const { data, error } = await xano.agentUnlinkRealtor(realtorId)
      if (error) {
        setError(error)
        setShowUnlinkConfirm(false)
      } else if (data) {
        onUnlink?.(realtorId)
        toast({
          title: 'Realtor unlinked',
          description: 'The realtor has been removed from your network.',
        })
        onClose()
      }
    } catch (err: any) {
      console.error('Unlink error:', err)
      setError(err?.message || 'Failed to unlink realtor')
      setShowUnlinkConfirm(false)
    } finally {
      setIsUnlinking(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
            Active
          </span>
        )
      case 'invited':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
            Invited
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
            Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
            {status}
          </span>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-none border-0" closeClassName="text-white">
        <div className="px-6 py-4" style={{ backgroundColor: brandColor }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white font-mono uppercase tracking-wider">
              <User className="h-5 w-5" />
              Realtor Details
            </DialogTitle>
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 font-mono text-base">
            {error}
          </div>
        ) : details ? (
          <div className="p-6 space-y-6">
            {/* Realtor Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 flex items-center justify-center text-white font-mono font-bold text-sm"
                  style={{ backgroundColor: brandColor }}
                >
                  {details.firstName[0]}
                  {details.lastName[0]}
                </div>
                <div>
                  <p className="font-mono font-semibold text-gray-900 text-base">
                    {details.firstName} {details.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(details.status)}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-base font-mono">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{details.email}</span>
                </div>
                {details.phone && (
                  <div className="flex items-center gap-2 text-base font-mono">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{details.phone}</span>
                  </div>
                )}
                {details.brokerage && (
                  <div className="flex items-center gap-2 text-base font-mono">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{details.brokerage}</span>
                  </div>
                )}
                {details.areaServiced && (
                  <div className="flex items-start gap-2 text-base font-mono">
                    <User className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-900">Area Serviced: {details.areaServiced}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-base font-mono">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    Invited: {formatDate(details.inviteSentAt)}
                  </span>
                </div>
                {details.activatedAt && (
                  <div className="flex items-center gap-2 text-base font-mono">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">
                      Last Active: {formatDate(details.activatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <Label className="text-sm text-gray-900 uppercase tracking-wider font-mono">
                Actions
              </Label>

              <div className="flex flex-wrap gap-2">
                {details.status === 'active' && (
                  <Button
                    variant="outline"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                    className="rounded-none font-mono uppercase tracking-wider text-sm"
                  >
                    {isResettingPassword ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4 mr-2" />
                    )}
                    Reset Password
                  </Button>
                )}

                {details.status === 'invited' && (
                  <Button
                    variant="outline"
                    onClick={handleResendInvite}
                    disabled={isResendingInvite}
                    className="rounded-none font-mono uppercase tracking-wider text-sm"
                  >
                    {isResendingInvite ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Resend Invite
                  </Button>
                )}

                {(details.status === 'active' || details.status === 'invited') ? (
                  <Button
                    variant="outline"
                    className="rounded-none font-mono uppercase tracking-wider text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={handleDeactivate}
                    disabled={isChangingStatus}
                  >
                    {isChangingStatus ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4 mr-2" />
                    )}
                    Deactivate
                  </Button>
                ) : details.status === 'inactive' ? (
                  <Button
                    variant="outline"
                    className="rounded-none font-mono uppercase tracking-wider text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    onClick={handleActivate}
                    disabled={isChangingStatus}
                  >
                    {isChangingStatus ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    Activate
                  </Button>
                ) : null}
              </div>

              <p className="text-sm text-gray-900 font-mono">
                {details.status === 'active'
                  ? 'Resetting password will generate a new temporary password and send an email to the realtor.'
                  : details.status === 'inactive'
                  ? 'Activating will generate a new password and send a welcome email.'
                  : 'Resend invite will generate a new password and resend the onboarding email.'}
              </p>
            </div>

            {/* Unlink Section */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              {showUnlinkConfirm ? (
                <div className="bg-red-50 border border-red-200 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-mono font-semibold text-red-800 text-base">Are you sure you want to unlink this realtor?</p>
                      <p className="text-sm text-red-600 mt-1 font-mono">
                        {details.firstName} {details.lastName} will be removed from your network.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUnlinkConfirm(false)}
                      disabled={isUnlinking}
                      className="rounded-none font-mono uppercase tracking-wider text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleUnlink}
                      disabled={isUnlinking}
                      className="rounded-none font-mono uppercase tracking-wider text-sm"
                    >
                      {isUnlinking ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Unlink className="h-4 w-4 mr-2" />
                      )}
                      Unlink Realtor
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="rounded-none font-mono uppercase tracking-wider text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                    onClick={() => setShowUnlinkConfirm(true)}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Unlink from My Network
                  </Button>
                  <p className="text-sm text-gray-900 font-mono">
                    Unlinking removes this realtor from your network.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
