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
      // Prioritize success - if data is returned, the deletion worked
      if (data) {
        onDelete?.(realtorId)
        onClose()
      } else if (error) {
        setError(error)
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      setError('Failed to delete realtor')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-mono font-medium uppercase tracking-wider"
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-700 border border-emerald-200`}>Active</span>
      case 'invited':
        return <span className={`${baseClasses} bg-amber-100 text-amber-700 border border-amber-200`}>Invited</span>
      case 'inactive':
        return <span className={`${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`}>Inactive</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`}>{status}</span>
    }
  }

  const hasAgent = details?.agent != null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0" closeClassName="text-white hover:text-gray-300">
        <DialogHeader className="bg-[#1a2332] text-white p-6">
          <DialogTitle className="font-mono text-lg font-bold uppercase tracking-wider">Realtor Details</DialogTitle>
          <DialogDescription className="text-gray-300 font-mono text-sm">
            View realtor information and manage their account
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 font-mono">
            {error}
          </div>
        ) : details ? (
          <div className="p-6 space-y-5">
            {/* Header - Avatar, Name, Brokerage, Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-[#1a2332] flex items-center justify-center text-white font-mono font-bold text-lg tracking-wider">
                  {details.firstName[0]}{details.lastName[0]}
                </div>
                <div>
                  <p className="font-mono font-semibold text-gray-900 text-base">
                    {details.firstName} {details.lastName}
                  </p>
                  {details.brokerage && (
                    <p className="font-mono text-sm text-gray-500">{details.brokerage}</p>
                  )}
                </div>
              </div>
              {getStatusBadge(details.status)}
            </div>

            {/* Info Grid - 2 columns */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-widest font-mono">Email</Label>
                <p className="font-mono text-sm text-gray-900 mt-1">{details.email}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-widest font-mono">Phone</Label>
                <p className="font-mono text-sm text-gray-900 mt-1">{details.phone || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-widest font-mono">Invited</Label>
                <p className="font-mono text-sm text-gray-900 mt-1">{formatDate(details.inviteSentAt)}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-400 uppercase tracking-widest font-mono">Last Active</Label>
                <p className="font-mono text-sm text-gray-900 mt-1">{details.activatedAt ? formatDate(details.activatedAt) : 'Never'}</p>
              </div>
            </div>

            {/* Linked Agent Section */}
            <div className="border border-gray-200 p-4">
              <Label className="text-xs text-gray-400 uppercase tracking-widest font-mono">
                Linked Agent {hasAgent && details.agent ? '(1)' : '(0)'}
              </Label>
              {hasAgent && details.agent ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-[#1a2332] flex items-center justify-center text-white font-mono font-bold text-xs">
                        {details.agent.firstName[0]}{details.agent.lastName[0]}
                      </div>
                      <span className="font-mono text-sm text-gray-900">
                        {details.agent.firstName} {details.agent.lastName}
                      </span>
                    </div>
                    {details.agent.status === 'inactive' ? (
                      <span className="px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">Inactive</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-mono font-medium uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Active</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 font-mono">{details.agent.companyName || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-600 font-mono">{details.agent.email}</span>
                  </div>
                  {details.agent.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600 font-mono">{details.agent.phone}</span>
                    </div>
                  )}
                  <button
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-mono text-sm uppercase tracking-wider mt-2 disabled:opacity-50"
                    onClick={handleUnlink}
                    disabled={isUnlinking}
                  >
                    {isUnlinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
                    Unlink from Agent
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="font-mono text-sm text-gray-500">No agent linked</p>
                  {showLinkSelect ? (
                    <div className="space-y-2">
                      <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                        <SelectTrigger className="font-mono text-sm">
                          <SelectValue placeholder={isLoadingAgents ? 'Loading...' : 'Select an agent'} />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id.toString()} className="font-mono text-sm">
                              {agent.firstName} {agent.lastName} - {agent.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleLink} disabled={!selectedAgentId || isLinking} className="bg-[#1a2332] hover:bg-[#2a3342] font-mono text-xs uppercase tracking-wider">
                          {isLinking ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Link2 className="h-3 w-3 mr-1" />}
                          Link
                        </Button>
                        <Button size="sm" variant="outline" className="font-mono text-xs uppercase tracking-wider" onClick={() => { setShowLinkSelect(false); setSelectedAgentId(''); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-mono text-sm uppercase tracking-wider"
                      onClick={handleShowLinkSelect}
                    >
                      <Link2 className="h-4 w-4" />
                      Link to an Agent
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Actions Row - Reset Password & Resend Invite side by side */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={`${details.status === 'invited' && hasAgent ? 'flex-1' : 'w-full'} font-mono uppercase tracking-wider justify-center`}
                onClick={handleResetPassword}
                disabled={isResettingPassword || details.status === 'inactive' || !hasAgent}
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
                  className="flex-1 font-mono uppercase tracking-wider justify-center"
                  onClick={handleResendInvite}
                  disabled={isResendingInvite}
                >
                  {isResendingInvite ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Resend Invite
                </Button>
              )}
            </div>

            {(details.status === 'active' || details.status === 'invited') && hasAgent && (
              <Button
                variant="outline"
                className="w-full font-mono uppercase tracking-wider justify-center text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                onClick={handleDeactivate}
                disabled={isChangingStatus}
              >
                {isChangingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserX className="h-4 w-4 mr-2" />}
                Deactivate
              </Button>
            )}

            {details.status === 'inactive' && hasAgent && (
              <Button
                variant="outline"
                className={`w-full font-mono uppercase tracking-wider justify-center ${details.agent?.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                onClick={handleActivate}
                disabled={isChangingStatus || details.agent?.status === 'inactive'}
              >
                {isChangingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
                Activate
              </Button>
            )}

            {/* Delete Link */}
            {showDeleteConfirm ? (
              <div className="bg-red-50 border border-red-200 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-mono font-medium text-red-800 text-sm">Delete this realtor?</p>
                    <p className="text-xs text-red-600 mt-1 font-mono">
                      This will permanently delete {details.firstName} {details.lastName}&apos;s account. This cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="font-mono text-xs uppercase tracking-wider">
                    Cancel
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="font-mono text-xs uppercase tracking-wider">
                    {isDeleting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Trash2 className="h-3 w-3 mr-1" />}
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <button
                className="w-full text-center text-red-600 hover:text-red-700 font-mono text-sm uppercase tracking-wider py-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Realtor
              </button>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
