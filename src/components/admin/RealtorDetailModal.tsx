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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  Phone,
  Building,
  Calendar,
  User,
  KeyRound,
  UserCheck,
  UserX,
  Loader2,
  Trash2,
  AlertTriangle,
  Send,
  Link2,
  Unlink,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import xano from '@/services/xano'
import { RealtorStatus, Agent } from '@/types'
import { toast } from '@/hooks/use-toast'

interface AgentInfo {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  status: string
}

interface RealtorDetails {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  brokerage: string
  status: string
  agentId: number | null
  userId: number
  inviteSentAt: string
  activatedAt: string
  createdAt: string
  agent: AgentInfo | null
}

interface RealtorDetailModalProps {
  isOpen: boolean
  onClose: () => void
  realtorId: number | null
  onStatusChange?: (realtorId: number, newStatus: RealtorStatus) => void
  onPasswordReset?: (credentials: {
    email: string
    firstName: string
    lastName: string
    tempPassword: string
    agentName: string
  }) => void
  onDelete?: (realtorId: number) => void
  onAgentChange?: (realtorId: number, agentId: number | null) => void
}

export default function RealtorDetailModal({
  isOpen,
  onClose,
  realtorId,
  onStatusChange,
  onPasswordReset,
  onDelete,
  onAgentChange,
}: RealtorDetailModalProps) {
  const [details, setDetails] = useState<RealtorDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [isResendingInvite, setIsResendingInvite] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Unlink/Link state
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [showLinkSelect, setShowLinkSelect] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)

  useEffect(() => {
    if (isOpen && realtorId) {
      loadRealtorDetails()
    } else {
      setDetails(null)
      setError(null)
      setShowDeleteConfirm(false)
      setShowLinkSelect(false)
      setSelectedAgentId('')
    }
  }, [isOpen, realtorId])

  const loadRealtorDetails = async () => {
    if (!realtorId) return
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await xano.adminGetRealtorDetails(realtorId)
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

  const loadAgents = async () => {
    setIsLoadingAgents(true)
    try {
      const { data, error } = await xano.getAgents({ status: 'active' })
      if (data) {
        setAgents(data)
      }
    } catch (err) {
      console.error('Failed to load agents:', err)
    } finally {
      setIsLoadingAgents(false)
    }
  }

  const handleResetPassword = async () => {
    if (!realtorId) return
    setIsResettingPassword(true)
    try {
      const { data, error } = await xano.adminResetRealtorPassword(realtorId)
      if (error) {
        setError(error)
      } else if (data && onPasswordReset) {
        onPasswordReset({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          tempPassword: data.tempPassword,
          agentName: data.agentName,
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
      const { error } = await xano.adminDeactivateRealtor(realtorId)
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
      const { data, error } = await xano.adminReactivateRealtor(realtorId)
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
            agentName: data.agentName,
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
      const { data, error } = await xano.adminResendRealtorInvite(realtorId)
      if (error) {
        setError(error)
      } else if (data) {
        setDetails((prev) => (prev ? { ...prev, inviteSentAt: new Date().toISOString() } : null))
        toast({
          title: 'Invite sent',
          description: `Onboarding email has been resent to ${data.email} (from ${data.agentName})`,
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
      const { data, error } = await xano.adminUnlinkRealtor(realtorId)
      if (error) {
        setError(error)
      } else if (data) {
        setDetails((prev) => (prev ? { ...prev, agentId: null, agent: null, status: 'inactive' } : null))
        onStatusChange?.(realtorId, 'inactive')
        onAgentChange?.(realtorId, null)
        toast({
          title: 'Realtor unlinked',
          description: 'The realtor has been unlinked from their agent and deactivated.',
        })
      }
    } catch (err: any) {
      console.error('Unlink error:', err)
      setError(err?.message || 'Failed to unlink realtor')
    } finally {
      setIsUnlinking(false)
    }
  }

  const handleShowLinkSelect = () => {
    setShowLinkSelect(true)
    loadAgents()
  }

  const handleLink = async () => {
    if (!realtorId || !selectedAgentId) return
    setIsLinking(true)
    setError(null)
    try {
      const { data, error } = await xano.adminLinkRealtorToAgent(realtorId, parseInt(selectedAgentId))
      if (error) {
        setError(error)
      } else if (data) {
        setDetails((prev) => (prev ? { ...prev, agentId: data.agentId, agent: data.agent } : null))
        onAgentChange?.(realtorId, data.agentId)
        setShowLinkSelect(false)
        setSelectedAgentId('')
        toast({
          title: 'Realtor linked',
          description: `The realtor has been linked to ${data.agent.firstName} ${data.agent.lastName}. They remain inactive until activated.`,
        })
      }
    } catch (err) {
      setError('Failed to link realtor')
    } finally {
      setIsLinking(false)
    }
  }

  const handleDelete = async () => {
    if (!realtorId) return
    setIsDeleting(true)
    try {
      const { data, error } = await xano.adminDeleteRealtor(realtorId)
      if (error) {
        setError(error)
        setShowDeleteConfirm(false)
      } else if (data) {
        onDelete?.(realtorId)
        onClose()
      }
    } catch (err) {
      setError('Failed to delete realtor')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
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

  const hasAgent = details?.agent != null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                      {!hasAgent && <Badge variant="outline">Unlinked</Badge>}
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

            {/* Linked Agent Info */}
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wide">
                Linked Agent
              </Label>
              {hasAgent && details.agent ? (
                <div className="bg-blue-50 rounded-lg p-4 mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        {details.agent.firstName} {details.agent.lastName}
                      </span>
                    </div>
                    {details.agent.status === 'inactive' ? (
                      <Badge variant="secondary">Inactive</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>
                  {details.agent.companyName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-700">{details.agent.companyName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-700">{details.agent.email}</span>
                  </div>
                  {details.agent.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-700">{details.agent.phone}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={handleUnlink}
                    disabled={isUnlinking}
                  >
                    {isUnlinking ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Unlink className="h-4 w-4 mr-2" />
                    )}
                    Unlink from Agent
                  </Button>
                  <p className="text-xs text-gray-500">
                    Unlinking will deactivate the realtor and remove them from this agent.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 mt-2 space-y-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Unlink className="h-4 w-4" />
                    <span className="text-sm">No agent linked</span>
                  </div>
                  {showLinkSelect ? (
                    <div className="space-y-3">
                      <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingAgents ? 'Loading agents...' : 'Select an agent'} />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.firstName} {agent.lastName} - {agent.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleLink}
                          disabled={!selectedAgentId || isLinking}
                        >
                          {isLinking ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Link2 className="h-4 w-4 mr-2" />
                          )}
                          Link to Agent
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowLinkSelect(false)
                            setSelectedAgentId('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={handleShowLinkSelect}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Link to an Agent
                    </Button>
                  )}
                  <p className="text-xs text-gray-500">
                    The realtor will remain inactive until activated after linking.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">
                Actions
              </Label>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword || details.status === 'inactive' || !hasAgent}
                  className={details.status === 'inactive' || !hasAgent ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {isResettingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4 mr-2" />
                  )}
                  Reset Password
                </Button>

                {details.status === 'invited' && hasAgent && (
                  <Button
                    variant="outline"
                    onClick={handleResendInvite}
                    disabled={isResendingInvite}
                  >
                    {isResendingInvite ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Resend Invite
                  </Button>
                )}

                {(details.status === 'active' || details.status === 'invited') && hasAgent ? (
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
                ) : details.status === 'inactive' && hasAgent ? (
                  <Button
                    variant="outline"
                    className={details.agent?.status === 'inactive'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                    onClick={handleActivate}
                    disabled={isChangingStatus || details.agent?.status === 'inactive'}
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
                {!hasAgent
                  ? 'Link the realtor to an agent first to enable actions.'
                  : details.status === 'inactive' && details.agent?.status === 'inactive'
                  ? 'Cannot activate realtor while their linked agent is inactive. Activate the agent first.'
                  : details.status === 'inactive'
                  ? 'Activate the realtor first to reset their password.'
                  : 'Password reset email will be sent from the linked agent.'}
              </p>
            </div>

            {/* Delete Section */}
            <Separator />
            <div className="space-y-3">
              <Label className="text-xs text-gray-500 uppercase tracking-wide">
                Danger Zone
              </Label>

              {showDeleteConfirm ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Are you sure you want to delete this realtor?</p>
                      <p className="text-sm text-red-600 mt-1">
                        This will permanently delete {details.firstName} {details.lastName}&apos;s account and all their data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Realtor
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
