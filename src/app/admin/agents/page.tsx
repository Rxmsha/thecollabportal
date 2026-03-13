'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Search, Building2, Users, Plus, KeyRound, Copy, CheckCircle2, Eye, EyeOff, Loader2, Minus, RefreshCw, AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import xano from '@/services/xano'
import { formatDate } from '@/lib/utils'
import { Agent } from '@/types'
import { useBranding } from '@/context/BrandingContext'

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
  const { brandColor } = useBranding()
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
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full"
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>Active</span>
      case 'invited':
        return <span className={`${baseClasses} bg-amber-100 text-amber-700`}>Invited</span>
      case 'inactive':
        return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>Inactive</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>{status}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="dot-matrix text-2xl text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all mortgage agents on the platform</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleRecalculateSeats} disabled={isRecalculating} className="w-full sm:w-auto">
            {isRecalculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Recalculate Seats
          </Button>
          <Button style={{ backgroundColor: brandColor }} onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
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
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                          style={{ backgroundColor: agent.brandColor || '#1a2332' }}
                        >
                          {agent.firstName[0]}{agent.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{agent.firstName} {agent.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(agent.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{agent.companyName}</span>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users className="h-3.5 w-3.5" />
                        <span>{agent.seatsUsed}/{agent.seatLimit}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{formatDate(agent.createdAt)}</span>
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetails(agent.id)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Agent</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Company</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Realtors</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Joined</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAgents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div
                                className="h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                style={{ backgroundColor: agent.brandColor || '#1a2332' }}
                              >
                                {agent.firstName[0]}{agent.lastName[0]}
                              </div>
                              <div>
                                <p className="text-base font-medium text-gray-900">{agent.firstName} {agent.lastName}</p>
                                <p className="text-sm text-gray-500">{agent.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4"><p className="text-base text-gray-700 font-medium">{agent.companyName}</p></td>
                          <td className="p-4">{getStatusBadge(agent.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-base text-gray-700">{agent.seatsUsed}/{agent.seatLimit}</span>
                            </div>
                          </td>
                          <td className="p-4 text-base text-gray-500">{formatDate(agent.createdAt)}</td>
                          <td className="p-4 text-right">
                            <Button variant="outline" className="text-sm font-medium rounded-lg border-gray-300 hover:bg-gray-100 hover:border-gray-400 h-9 px-4" onClick={() => handleOpenDetails(agent.id)}>
                              View
                            </Button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0" closeClassName="text-white">
          <DialogTitle className="sr-only">Agent Details</DialogTitle>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : detailsError ? (
            <div className="bg-red-50 text-red-600 p-4">{detailsError}</div>
          ) : agentDetails ? (
            <>
              {/* Header */}
              <div className="p-6 flex items-center gap-4 rounded-t-lg" style={{ backgroundColor: brandColor }}>
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center text-white text-lg font-semibold border-2 border-white/20"
                  style={{ backgroundColor: agentDetails.brandColor || '#1a2332' }}
                >
                  {agentDetails.firstName[0]}{agentDetails.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-xl font-semibold truncate">{agentDetails.firstName} {agentDetails.lastName}</h3>
                  <p className="text-gray-300 text-base truncate">{agentDetails.companyName}</p>
                </div>
                {getStatusBadge(agentDetails.status)}
              </div>

              <div className="p-6 space-y-6">
                {/* Email - Full Width */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <a href={`mailto:${agentDetails.email}`} className="text-gray-700 text-base hover:text-blue-600 hover:underline break-all">{agentDetails.email}</a>
                </div>

                {/* Phone - Full Width */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-700 text-base">{agentDetails.phone || 'N/A'}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Joined</p>
                    <p className="text-gray-700 text-base">{formatDate(agentDetails.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Seats</p>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700 text-base">{agentDetails.seatsUsed}/{agentDetails.seatLimit}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateSeatLimit(agentDetails.seatLimit - 1)}
                          disabled={isUpdatingSeatLimit || agentDetails.seatLimit <= 1 || agentDetails.seatLimit <= agentDetails.seatsUsed}
                          className="h-7 w-7 rounded flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateSeatLimit(agentDetails.seatLimit + 1)}
                          disabled={isUpdatingSeatLimit}
                          className="h-7 w-7 rounded flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linked Realtors - Compact */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Linked Realtors ({agentDetails.realtors?.length || 0})</p>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {agentDetails.realtors && agentDetails.realtors.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {agentDetails.realtors.map((realtor: any) => (
                          <div key={realtor.id} className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <span className="h-7 w-7 rounded-full text-white flex items-center justify-center text-xs font-medium" style={{ backgroundColor: brandColor }}>
                                {realtor.firstName?.[0]}{realtor.lastName?.[0]}
                              </span>
                              <span className="text-gray-700 text-base">{realtor.firstName} {realtor.lastName}</span>
                            </div>
                            <span className={`text-sm font-medium ${realtor.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {realtor.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-400 text-center py-4">No realtors</p>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword || agentDetails.status === 'inactive'}
                    className="flex-1 h-11"
                  >
                    {isResettingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
                    Reset Password
                  </Button>
                  {agentDetails.status === 'active' ? (
                    <Button variant="outline" className="flex-1 h-11 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={handleDeactivate}>
                      Deactivate
                    </Button>
                  ) : agentDetails.status === 'inactive' ? (
                    <Button variant="outline" className="flex-1 h-11 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={handleReactivate} disabled={isResettingPassword}>
                      {isResettingPassword ? 'Activating...' : 'Activate'}
                    </Button>
                  ) : null}
                </div>

                {/* Delete Section */}
                {showDeleteConfirm ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-base text-red-700">
                        Permanently delete <strong>{agentDetails.firstName}</strong>?
                        {agentDetails.realtors && agentDetails.realtors.length > 0 && (
                          <> {agentDetails.realtors.length} realtor(s) will be unlinked.</>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 h-10 rounded-lg">
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAgent} disabled={isDeleting} className="flex-1 h-10 rounded-lg">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-base text-red-500 hover:text-red-600 py-4 border-t border-gray-100"
                  >
                    Delete Agent
                  </button>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Password Reset Credentials Modal */}
      <Dialog open={showCredentialsModal} onOpenChange={closeCredentialsModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                  <Label className="text-gray-500 text-xs font-medium">Agent Name</Label>
                  <p className="font-medium">{resetCredentials.firstName} {resetCredentials.lastName}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs font-medium">Email</Label>
                  <p className="text-sm">{resetCredentials.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs font-medium">Temporary Password</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-yellow-100 px-3 py-2 rounded-lg font-mono text-sm">
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
              <Button onClick={closeCredentialsModal} className="w-full rounded-lg" style={{ backgroundColor: brandColor }}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Agent Modal */}
      <Dialog open={showCreateModal} onOpenChange={closeCreateModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 rounded-lg" closeClassName="text-white">
          <div className="p-5" style={{ backgroundColor: brandColor }}>
            <h2 className="text-white text-lg font-semibold">Create New Agent</h2>
            <p className="text-gray-300 text-sm mt-1">Add a new mortgage agent to the platform</p>
          </div>

          <div className="p-6">
            {createSuccess ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-emerald-800 font-medium">Agent created successfully!</p>
                  <p className="text-emerald-700 text-sm mt-1">Send these credentials to the agent:</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base text-gray-700">{createSuccess.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Temporary Password</p>
                    <p className="font-mono text-base bg-amber-100 rounded px-2 py-1 inline-block text-gray-900">{createSuccess.tempPassword}</p>
                  </div>
                </div>
                <Button onClick={closeCreateModal} className="w-full h-11 rounded-lg" style={{ backgroundColor: brandColor }}>Done</Button>
              </div>
            ) : (
              <form onSubmit={handleCreateAgent} className="space-y-5">
                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded-lg">{createError}</div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-500">First Name <span className="text-red-500">*</span></Label>
                    <Input id="firstName" value={newAgent.firstName} onChange={(e) => setNewAgent({ ...newAgent, firstName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-500">Last Name <span className="text-red-500">*</span></Label>
                    <Input id="lastName" value={newAgent.lastName} onChange={(e) => setNewAgent({ ...newAgent, lastName: e.target.value })} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-500">Email <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={newAgent.email} onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-500">Company Name <span className="text-red-500">*</span></Label>
                  <Input id="companyName" value={newAgent.companyName} onChange={(e) => setNewAgent({ ...newAgent, companyName: e.target.value })} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-500">Phone</Label>
                    <Input id="phone" type="tel" value={newAgent.phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seatLimit" className="text-sm font-medium text-gray-500">Seat Limit <span className="text-red-500">*</span></Label>
                    <Input id="seatLimit" type="number" min="1" value={newAgent.seatLimit} onChange={(e) => setNewAgent({ ...newAgent, seatLimit: parseInt(e.target.value) || 50 })} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeCreateModal} className="flex-1 h-11 rounded-lg">Cancel</Button>
                  <Button type="submit" disabled={isCreating} className="flex-1 h-11 rounded-lg" style={{ backgroundColor: brandColor }}>{isCreating ? 'Creating...' : 'Create Agent'}</Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
