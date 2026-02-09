'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Building2, Mail, Phone, Calendar, Users, Plus, KeyRound, Copy, CheckCircle2, Eye, EyeOff, Loader2, Minus, RefreshCw, Trash2, AlertTriangle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import xano from '@/services/xano'
import { formatDate } from '@/lib/utils'
import { Agent } from '@/types'

interface AgentDetails {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  brandColor: string
  status: string
  seatLimit: number
  seatsUsed: number
  createdAt: string
  realtors: any[]
}

interface ResetCredentials {
  email: string
  firstName: string
  lastName: string
  tempPassword: string
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState<{ email: string; tempPassword: string } | null>(null)
  const [newAgent, setNewAgent] = useState({
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    seatLimit: 50,
  })

  // Agent detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  // Reset password state
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [resetCredentials, setResetCredentials] = useState<ResetCredentials | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  // Seat limit state
  const [editingSeatLimit, setEditingSeatLimit] = useState<number | null>(null)
  const [isUpdatingSeatLimit, setIsUpdatingSeatLimit] = useState(false)

  // Recalculate seats state
  const [isRecalculating, setIsRecalculating] = useState(false)

  // Delete agent state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadAgents()
  }, [statusFilter])

  const loadAgents = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getAgents({
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      if (data) {
        setAgents(data)
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecalculateSeats = async () => {
    setIsRecalculating(true)
    try {
      const { data, error } = await xano.recalculateAllSeats()
      if (data && !error) {
        // Reload agents to show updated seats
        loadAgents()
      }
    } catch (error) {
      console.error('Failed to recalculate seats:', error)
    } finally {
      setIsRecalculating(false)
    }
  }

  const filteredAgents = agents.filter((agent) => {
    const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      agent.email.toLowerCase().includes(query) ||
      agent.companyName.toLowerCase().includes(query)
    )
  })

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

  const handleDeactivate = async () => {
    if (!selectedAgentId) return
    try {
      const { error } = await xano.adminDeactivateAgent(selectedAgentId)
      if (!error) {
        setAgents((prev) =>
          prev.map((a) => (a.id === selectedAgentId ? { ...a, status: 'inactive' as any } : a))
        )
        if (agentDetails) {
          setAgentDetails({ ...agentDetails, status: 'inactive' })
        }
      }
    } catch (error) {
      console.error('Failed to deactivate agent:', error)
    }
  }

  const handleReactivate = async () => {
    if (!selectedAgentId) return
    setIsResettingPassword(true)
    try {
      const { data, error } = await xano.adminReactivateAgent(selectedAgentId)
      if (error) {
        console.error('Failed to reactivate agent:', error)
        return
      }
      if (data) {
        setAgents((prev) =>
          prev.map((a) => (a.id === selectedAgentId ? { ...a, status: 'active' as any } : a))
        )
        setResetCredentials({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          tempPassword: data.tempPassword,
        })
        setShowDetailModal(false)
        setShowCredentialsModal(true)
      }
    } catch (error) {
      console.error('Failed to reactivate agent:', error)
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleOpenDetails = async (agentId: number) => {
    setSelectedAgentId(agentId)
    setShowDetailModal(true)
    setIsLoadingDetails(true)
    setDetailsError(null)
    setAgentDetails(null)

    try {
      const { data, error } = await xano.adminGetAgentDetails(agentId)
      if (error) {
        setDetailsError(error)
      } else if (data) {
        setAgentDetails(data)
      }
    } catch (err) {
      setDetailsError('Failed to load agent details')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedAgentId) return
    setIsResettingPassword(true)

    try {
      const { data, error } = await xano.resetAgentPassword(selectedAgentId)
      if (error) {
        console.error('Failed to reset password:', error)
        return
      }
      if (data) {
        setResetCredentials({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          tempPassword: data.tempPassword,
        })
        setShowDetailModal(false)
        setShowCredentialsModal(true)
      }
    } catch (error) {
      console.error('Failed to reset password:', error)
    } finally {
      setIsResettingPassword(false)
    }
  }

  const copyPassword = async () => {
    if (resetCredentials) {
      await navigator.clipboard.writeText(resetCredentials.tempPassword)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedAgentId(null)
    setAgentDetails(null)
    setDetailsError(null)
    setEditingSeatLimit(null)
    setShowDeleteConfirm(false)
  }

  const handleDeleteAgent = async () => {
    if (!selectedAgentId) return
    setIsDeleting(true)
    try {
      const { data, error } = await xano.adminDeleteAgent(selectedAgentId)
      if (error) {
        setDetailsError(error)
        setShowDeleteConfirm(false)
      } else if (data) {
        // Remove agent from list
        setAgents((prev) => prev.filter((a) => a.id !== selectedAgentId))
        closeDetailModal()
      }
    } catch (err) {
      setDetailsError('Failed to delete agent')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateSeatLimit = async (newLimit: number) => {
    if (!agentDetails || newLimit < 1) return

    setIsUpdatingSeatLimit(true)
    try {
      const { data, error } = await xano.updateAgentSeatLimit(agentDetails.id, newLimit)
      if (data && !error) {
        // Update local state
        setAgentDetails({ ...agentDetails, seatLimit: newLimit })
        setEditingSeatLimit(newLimit)
        // Also update the agents list
        setAgents(agents.map(a => a.id === agentDetails.id ? { ...a, seatLimit: newLimit } : a))
      }
    } catch (error) {
      console.error('Failed to update seat limit:', error)
    } finally {
      setIsUpdatingSeatLimit(false)
    }
  }

  const closeCredentialsModal = () => {
    setShowCredentialsModal(false)
    setResetCredentials(null)
    setShowPassword(false)
    setCopiedPassword(false)
  }

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setCreateError('')
    setCreateSuccess(null)

    try {
      const { data, error } = await xano.createAgent(newAgent)

      if (error) {
        setCreateError(error)
        return
      }

      if (data) {
        setCreateSuccess({
          email: data.email,
          tempPassword: data.tempPassword,
        })
        loadAgents()
        setNewAgent({
          email: '',
          firstName: '',
          lastName: '',
          companyName: '',
          phone: '',
          seatLimit: 50,
        })
      }
    } catch (error) {
      setCreateError('Failed to create agent')
    } finally {
      setIsCreating(false)
    }
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setCreateError('')
    setCreateSuccess(null)
    setNewAgent({
      email: '',
      firstName: '',
      lastName: '',
      companyName: '',
      phone: '',
      seatLimit: 50,
    })
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
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
    setNewAgent((prev) => ({ ...prev, phone: formatted }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="dot-matrix text-xl text-gray-900">AGENTS</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all mortgage agents on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRecalculateSeats} disabled={isRecalculating}>
            {isRecalculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Recalculate Seats
          </Button>
          <Button className="bg-[#1a2332] hover:bg-[#2a3342]" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agents Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Realtors</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                              style={{ backgroundColor: agent.brandColor || '#0077B6' }}
                            >
                              {agent.firstName[0]}{agent.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{agent.firstName} {agent.lastName}</p>
                              <p className="text-sm text-gray-500">{agent.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4"><p className="text-gray-900">{agent.companyName}</p></td>
                        <td className="p-4">{getStatusBadge(agent.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{agent.seatsUsed}/{agent.seatLimit}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-500">{formatDate(agent.createdAt)}</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDetails(agent.id)}>
                            More
                          </Button>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No agents found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={closeDetailModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
            <DialogDescription>View and manage agent information</DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : detailsError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{detailsError}</div>
          ) : agentDetails ? (
            <div className="space-y-6">
              {/* Agent Info */}
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-medium"
                  style={{ backgroundColor: agentDetails.brandColor || '#2563eb' }}
                >
                  {agentDetails.firstName[0]}{agentDetails.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{agentDetails.firstName} {agentDetails.lastName}</h3>
                  <p className="text-gray-500">{agentDetails.companyName}</p>
                  {getStatusBadge(agentDetails.status)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{agentDetails.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{agentDetails.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Joined {formatDate(agentDetails.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{agentDetails.seatsUsed} of {agentDetails.seatLimit} seats used</span>
                </div>
              </div>

              {/* Seat Limit Control */}
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Seat Limit</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateSeatLimit(agentDetails.seatLimit - 1)}
                    disabled={isUpdatingSeatLimit || agentDetails.seatLimit <= 1 || agentDetails.seatLimit <= agentDetails.seatsUsed}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">{agentDetails.seatLimit}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleUpdateSeatLimit(agentDetails.seatLimit + 1)}
                    disabled={isUpdatingSeatLimit}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {isUpdatingSeatLimit && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {agentDetails.seatsUsed > 0 && agentDetails.seatLimit <= agentDetails.seatsUsed
                    ? "Cannot reduce below current usage"
                    : "Adjust the maximum number of realtors this agent can invite"}
                </p>
              </div>

              {/* Linked Realtors */}
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">
                  Linked Realtors ({agentDetails.realtors?.length || 0})
                </Label>
                <div className="mt-2 bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {agentDetails.realtors && agentDetails.realtors.length > 0 ? (
                    <div className="space-y-2">
                      {agentDetails.realtors.map((realtor: any) => (
                        <div key={realtor.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-medium">
                              {realtor.firstName?.[0]}{realtor.lastName?.[0]}
                            </div>
                            <span className="text-gray-700">{realtor.firstName} {realtor.lastName}</span>
                          </div>
                          <Badge variant={realtor.status === 'active' ? 'success' : realtor.status === 'invited' ? 'default' : 'secondary'} className="text-xs">
                            {realtor.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No realtors yet</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Password Reset */}
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Password</Label>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword || agentDetails.status === 'inactive'}
                    className={agentDetails.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {isResettingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
                    Reset Password
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    {agentDetails.status === 'inactive'
                      ? 'Activate the agent first to reset their password.'
                      : 'This will generate a new password and send an email to the agent.'}
                  </p>
                </div>
              </div>

              {/* Status Change */}
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Change Status</Label>
                <div className="flex gap-2 mt-2">
                  {agentDetails.status === 'active' ? (
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeactivate}>
                      Deactivate
                    </Button>
                  ) : agentDetails.status === 'inactive' ? (
                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleReactivate} disabled={isResettingPassword}>
                      {isResettingPassword ? 'Activating...' : 'Activate'}
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500">Agent will be activated on first login</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Delete Agent */}
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Danger Zone</Label>
                {showDeleteConfirm ? (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Are you sure you want to delete this agent?</p>
                        <p className="text-sm text-red-600 mt-1">
                          This will permanently delete {agentDetails.firstName} {agentDetails.lastName}&apos;s account.
                          {agentDetails.realtors && agentDetails.realtors.length > 0 && (
                            <> Their {agentDetails.realtors.length} linked realtor(s) will be unlinked and deactivated (not deleted).</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteAgent}
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
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Agent
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      Deleting will unlink and deactivate any linked realtors (they won&apos;t be deleted).
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Password Reset Credentials Modal */}
      <Dialog open={showCredentialsModal} onOpenChange={closeCredentialsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>A new password has been generated and an email has been sent to the agent.</DialogDescription>
          </DialogHeader>

          {resetCredentials && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">Password reset successfully!</p>
                <p className="text-green-700 text-sm mt-1">Share these credentials with {resetCredentials.firstName}:</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <Label className="text-gray-500 text-xs">Agent Name</Label>
                  <p className="font-medium">{resetCredentials.firstName} {resetCredentials.lastName}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Email</Label>
                  <p className="font-mono text-sm">{resetCredentials.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Temporary Password</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-yellow-100 px-3 py-2 rounded font-mono text-sm">
                      {showPassword ? resetCredentials.tempPassword : '••••••••••••'}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={copyPassword}>
                      {copiedPassword ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-amber-600">The agent will be prompted to change their password on first login.</p>
              <Button onClick={closeCredentialsModal} className="w-full bg-[#1a2332] hover:bg-[#2a3342]">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Agent Modal */}
      <Dialog open={showCreateModal} onOpenChange={closeCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>Add a new mortgage agent to the platform. A temporary password will be generated.</DialogDescription>
          </DialogHeader>

          {createSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">Agent created successfully!</p>
                <p className="text-green-700 text-sm mt-1">Send these credentials to the agent:</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <Label className="text-gray-500 text-xs">Email</Label>
                  <p className="font-mono text-sm">{createSuccess.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Temporary Password</Label>
                  <p className="font-mono text-sm bg-yellow-100 px-2 py-1 rounded inline-block">{createSuccess.tempPassword}</p>
                </div>
              </div>
              <Button onClick={closeCreateModal} className="w-full bg-[#1a2332] hover:bg-[#2a3342]">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleCreateAgent} className="space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{createError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={newAgent.firstName} onChange={(e) => setNewAgent({ ...newAgent, firstName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={newAgent.lastName} onChange={(e) => setNewAgent({ ...newAgent, lastName: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={newAgent.email} onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={newAgent.companyName} onChange={(e) => setNewAgent({ ...newAgent, companyName: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" placeholder="(555) 555-5555" value={newAgent.phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seatLimit">Seat Limit</Label>
                  <Input id="seatLimit" type="number" min="1" value={newAgent.seatLimit} onChange={(e) => setNewAgent({ ...newAgent, seatLimit: parseInt(e.target.value) || 50 })} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeCreateModal} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={isCreating} className="flex-1 bg-[#1a2332] hover:bg-[#2a3342]">{isCreating ? 'Creating...' : 'Create Agent'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
