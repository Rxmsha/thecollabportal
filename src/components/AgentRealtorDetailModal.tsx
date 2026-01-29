'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Mail,
  Phone,
  Building,
  Calendar,
  KeyRound,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import xano from '@/services/xano'
import { RealtorStatus } from '@/types'

interface RealtorDetails {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  brokerage: string
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
}

export default function AgentRealtorDetailModal({
  isOpen,
  onClose,
  realtorId,
  onStatusChange,
  onPasswordReset,
}: AgentRealtorDetailModalProps) {
  const [details, setDetails] = useState<RealtorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && realtorId) {
      loadRealtorDetails()
    } else {
      setDetails(null)
      setError(null)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'invited':
        return <Badge variant="default">Invited</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Realtor Details</DialogTitle>
          <DialogDescription>
            View realtor information and manage their account
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Realtor Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium text-lg">
                    {details.firstName[0]}
                    {details.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {details.firstName} {details.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(details.status)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{details.email}</span>
                </div>
                {details.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{details.phone}</span>
                  </div>
                )}
                {details.brokerage && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{details.brokerage}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Invited: {formatDate(details.inviteSentAt)}
                  </span>
                </div>
                {details.activatedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Last Active: {formatDate(details.activatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">
                Actions
              </Label>

              <div className="flex flex-wrap gap-2">
                {details.status === 'active' && (
                  <Button
                    variant="outline"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4 mr-2" />
                    )}
                    Reset Password
                  </Button>
                )}

                {details.status === 'active' ? (
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
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

              <p className="text-xs text-gray-500">
                {details.status === 'active'
                  ? 'Resetting password will generate a new temporary password and send an email to the realtor.'
                  : details.status === 'inactive'
                  ? 'Activating will generate a new password and send a welcome email.'
                  : 'This realtor has not yet accepted their invitation.'}
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
