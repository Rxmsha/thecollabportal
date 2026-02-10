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
          <Button style={{ backgroundColor: brandColor }} onClick={() => setShowCreateModal(true)}>
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
                <thead className="border-b border-gray-700" style={{ backgroundColor: brandColor }}>
                  <tr>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Agent</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Company</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Status</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Realtors</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Joined</th>
                    <th className="text-right p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="h-11 w-11 flex items-center justify-center text-white text-sm font-mono font-bold tracking-wider"
                              style={{ backgroundColor: agent.brandColor || '#1a2332' }}
                            >
                              {agent.firstName[0]}{agent.lastName[0]}
                            </div>
                            <div>
                              <p className="font-mono text-base font-medium text-gray-900 tracking-wide">{agent.firstName} {agent.lastName}</p>
                              <p className="text-sm text-gray-500 font-mono">{agent.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4"><p className="text-base text-gray-700 font-medium">{agent.companyName}</p></td>
                        <td className="p-4">{getStatusBadge(agent.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-base font-mono text-gray-700">{agent.seatsUsed}/{agent.seatLimit}</span>
                          </div>
                        </td>
                        <td className="p-4 text-base text-gray-500 font-mono">{formatDate(agent.createdAt)}</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" className="text-sm font-medium border-gray-300 hover:bg-gray-100 hover:border-gray-400 h-9 px-4" onClick={() => handleOpenDetails(agent.id)}>
                            MORE
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0" closeClassName="text-white">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : detailsError ? (
            <div className="bg-red-50 text-red-600 p-4">{detailsError}</div>
          ) : agentDetails ? (
            <>
              {/* Header */}
              <div className="p-6 flex items-center gap-4" style={{ backgroundColor: brandColor }}>
                <div
                  className="h-16 w-16 flex items-center justify-center text-white text-lg font-mono font-bold tracking-wider border-2 border-white/20"
                  style={{ backgroundColor: agentDetails.brandColor || '#1a2332' }}
                >
                  {agentDetails.firstName[0]}{agentDetails.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-mono text-xl font-medium tracking-wide truncate">{agentDetails.firstName} {agentDetails.lastName}</h3>
                  <p className="text-gray-400 text-base truncate">{agentDetails.companyName}</p>
                </div>
                {getStatusBadge(agentDetails.status)}
              </div>

              <div className="p-6 space-y-6">
                {/* Contact & Stats Grid */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="text-gray-700 font-mono text-base truncate">{agentDetails.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Phone</p>
                    <p className="text-gray-700 font-mono text-base">{agentDetails.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Joined</p>
                    <p className="text-gray-700 font-mono text-base">{formatDate(agentDetails.createdAt)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Seats</p>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700 font-mono text-base">{agentDetails.seatsUsed}/{agentDetails.seatLimit}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateSeatLimit(agentDetails.seatLimit - 1)}
                          disabled={isUpdatingSeatLimit || agentDetails.seatLimit <= 1 || agentDetails.seatLimit <= agentDetails.seatsUsed}
                          className="h-7 w-7 flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateSeatLimit(agentDetails.seatLimit + 1)}
                          disabled={isUpdatingSeatLimit}
                          className="h-7 w-7 flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linked Realtors - Compact */}
                <div className="border border-gray-200">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                    <p className="text-sm font-mono text-gray-500 uppercase tracking-wider">Linked Realtors ({agentDetails.realtors?.length || 0})</p>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {agentDetails.realtors && agentDetails.realtors.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {agentDetails.realtors.map((realtor: any) => (
                          <div key={realtor.id} className="flex items-center justify-between px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <span className="h-7 w-7 text-white flex items-center justify-center text-xs font-mono" style={{ backgroundColor: brandColor }}>
                                {realtor.firstName?.[0]}{realtor.lastName?.[0]}
                              </span>
                              <span className="text-gray-700 font-mono text-base">{realtor.firstName} {realtor.lastName}</span>
                            </div>
                            <span className={`text-sm font-mono uppercase ${realtor.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {realtor.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-400 text-center py-4 font-mono">No realtors</p>
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
                  <div className="bg-red-50 border border-red-200 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-base text-red-700 font-mono">
                        Permanently delete <strong>{agentDetails.firstName}</strong>?
                        {agentDetails.realtors && agentDetails.realtors.length > 0 && (
                          <> {agentDetails.realtors.length} realtor(s) will be unlinked.</>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 h-10 font-mono">
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAgent} disabled={isDeleting} className="flex-1 h-10 font-mono">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-base text-red-500 hover:text-red-600 font-mono py-4 border-t border-gray-100"
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
              <Button onClick={closeCredentialsModal} className="w-full" style={{ backgroundColor: brandColor }}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Agent Modal */}
      <Dialog open={showCreateModal} onOpenChange={closeCreateModal}>
        <DialogContent className="max-w-md p-0" closeClassName="text-white">
          <div className="p-5" style={{ backgroundColor: brandColor }}>
            <h2 className="text-white font-mono text-lg font-medium tracking-wide">CREATE NEW AGENT</h2>
            <p className="text-gray-400 text-sm font-mono mt-1">Add a new mortgage agent to the platform</p>
          </div>

          <div className="p-6">
            {createSuccess ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-emerald-800 font-mono font-medium">Agent created successfully!</p>
                  <p className="text-emerald-700 text-sm font-mono mt-1">Send these credentials to the agent:</p>
                </div>
                <div className="bg-gray-50 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="font-mono text-base text-gray-700">{createSuccess.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Temporary Password</p>
                    <p className="font-mono text-base bg-amber-100 px-2 py-1 inline-block text-gray-900">{createSuccess.tempPassword}</p>
                  </div>
                </div>
                <Button onClick={closeCreateModal} className="w-full font-mono h-11" style={{ backgroundColor: brandColor }}>Done</Button>
              </div>
            ) : (
              <form onSubmit={handleCreateAgent} className="space-y-5">
                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-mono">{createError}</div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-mono text-gray-500 uppercase tracking-wider">First Name <span className="text-red-500">*</span></Label>
                    <Input id="firstName" className="font-mono" value={newAgent.firstName} onChange={(e) => setNewAgent({ ...newAgent, firstName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-mono text-gray-500 uppercase tracking-wider">Last Name <span className="text-red-500">*</span></Label>
                    <Input id="lastName" className="font-mono" value={newAgent.lastName} onChange={(e) => setNewAgent({ ...newAgent, lastName: e.target.value })} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-mono text-gray-500 uppercase tracking-wider">Email <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" className="font-mono" value={newAgent.email} onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-mono text-gray-500 uppercase tracking-wider">Company Name <span className="text-red-500">*</span></Label>
                  <Input id="companyName" className="font-mono" value={newAgent.companyName} onChange={(e) => setNewAgent({ ...newAgent, companyName: e.target.value })} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-mono text-gray-500 uppercase tracking-wider">Phone</Label>
                    <Input id="phone" type="tel" className="font-mono" value={newAgent.phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seatLimit" className="text-sm font-mono text-gray-500 uppercase tracking-wider">Seat Limit <span className="text-red-500">*</span></Label>
                    <Input id="seatLimit" type="number" className="font-mono" min="1" value={newAgent.seatLimit} onChange={(e) => setNewAgent({ ...newAgent, seatLimit: parseInt(e.target.value) || 50 })} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeCreateModal} className="flex-1 font-mono h-11">Cancel</Button>
                  <Button type="submit" disabled={isCreating} className="flex-1 font-mono h-11" style={{ backgroundColor: brandColor }}>{isCreating ? 'Creating...' : 'Create Agent'}</Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
