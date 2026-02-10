'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
import { Search, Users, Building, Plus, Loader2 } from 'lucide-react'
import xano from '@/services/xano'
import { formatDate } from '@/lib/utils'
import { Realtor, RealtorStatus, Agent } from '@/types'
import RealtorCredentialsModal from '@/components/RealtorCredentialsModal'
import RealtorDetailModal from '@/components/RealtorDetailModal'

interface RealtorCredentials {
  email: string
  firstName: string
  lastName: string
  tempPassword: string
}

export default function AdminRealtorsPage() {
  const [realtors, setRealtors] = useState<Realtor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [credentials, setCredentials] = useState<RealtorCredentials | null>(null)
  const [credentialsAgentName, setCredentialsAgentName] = useState<string>('')
  const [isCredentialsFromReset, setIsCredentialsFromReset] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRealtorId, setSelectedRealtorId] = useState<number | null>(null)

  // Create realtor modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState<{
    email: string
    tempPassword: string
    agentName: string | null
    status: string
  } | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [newRealtor, setNewRealtor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    brokerage: '',
    phone: '',
    agentId: 'none' as string | number,
  })

  useEffect(() => {
    loadRealtors()
  }, [statusFilter])

  const loadRealtors = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.adminGetRealtors({
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      if (data) {
        setRealtors(data)
      }
    } catch (error) {
      console.error('Failed to load realtors:', error)
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
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setIsLoadingAgents(false)
    }
  }

  const filteredRealtors = realtors.filter((realtor) => {
    const fullName = `${realtor.firstName} ${realtor.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      realtor.email.toLowerCase().includes(query) ||
      (realtor.brokerage && realtor.brokerage.toLowerCase().includes(query))
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

  const handleOpenDetails = (realtorId: number) => {
    setSelectedRealtorId(realtorId)
    setShowDetailModal(true)
  }

  const handleStatusChange = (realtorId: number, newStatus: RealtorStatus) => {
    setRealtors((prev) =>
      prev.map((r) => (r.id === realtorId ? { ...r, status: newStatus } : r))
    )
  }

  const handlePasswordReset = (creds: {
    email: string
    firstName: string
    lastName: string
    tempPassword: string
    agentName: string
  }) => {
    setCredentials({
      email: creds.email,
      firstName: creds.firstName,
      lastName: creds.lastName,
      tempPassword: creds.tempPassword,
    })
    setCredentialsAgentName(creds.agentName)
    setIsCredentialsFromReset(true)
    setShowCredentialsModal(true)
  }

  const handleDelete = (realtorId: number) => {
    setRealtors((prev) => prev.filter((r) => r.id !== realtorId))
  }

  const openCreateModal = () => {
    setShowCreateModal(true)
    loadAgents()
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setCreateError('')
    setCreateSuccess(null)
    setNewRealtor({
      firstName: '',
      lastName: '',
      email: '',
      brokerage: '',
      phone: '',
      agentId: 'none',
    })
  }

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const limited = digits.slice(0, 10)
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
    setNewRealtor((prev) => ({ ...prev, phone: formatted }))
  }

  const handleCreateRealtor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setCreateError('')
    setCreateSuccess(null)

    try {
      const agentId = newRealtor.agentId === 'none' ? null : Number(newRealtor.agentId)
      const { data, error } = await xano.adminCreateRealtor({
        firstName: newRealtor.firstName,
        lastName: newRealtor.lastName,
        email: newRealtor.email,
        brokerage: newRealtor.brokerage,
        phone: newRealtor.phone,
        agentId,
      })

      if (error) {
        setCreateError(error)
        return
      }

      if (data) {
        setCreateSuccess({
          email: data.email,
          tempPassword: data.tempPassword,
          agentName: data.agentName,
          status: data.status,
        })
        loadRealtors()
        setNewRealtor({
          firstName: '',
          lastName: '',
          email: '',
          brokerage: '',
          phone: '',
          agentId: 'none',
        })
      }
    } catch (error) {
      setCreateError('Failed to create realtor')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <React.Fragment>
      <RealtorCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => {
          setShowCredentialsModal(false)
          setCredentialsAgentName('')
          setIsCredentialsFromReset(false)
        }}
        credentials={credentials}
        isReactivation={isCredentialsFromReset}
        agentName={credentialsAgentName}
      />
      <RealtorDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedRealtorId(null)
        }}
        realtorId={selectedRealtorId}
        onStatusChange={handleStatusChange}
        onPasswordReset={handlePasswordReset}
        onDelete={handleDelete}
      />
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="dot-matrix text-xl text-gray-900">REALTORS</h1>
          <p className="text-sm text-gray-500 mt-1">
            View all realtors across all agents on the platform
          </p>
        </div>
        <Button className="bg-[#1a2332] hover:bg-[#2a3342]" onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Create Realtor
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search realtors..."
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

      {/* Realtors Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredRealtors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a2332] border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Realtor</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Brokerage</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Status</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Agent</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Invited</th>
                    <th className="text-left p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Last Active</th>
                    <th className="text-right p-4 text-sm font-mono font-medium text-gray-300 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRealtors.map((realtor) => (
                      <tr key={realtor.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 bg-[#1a2332] flex items-center justify-center text-white text-sm font-mono font-bold tracking-wider">
                              {realtor.firstName[0]}{realtor.lastName[0]}
                            </div>
                            <div>
                              <p className="font-mono text-base font-medium text-gray-900 tracking-wide">{realtor.firstName} {realtor.lastName}</p>
                              <p className="text-sm text-gray-500 font-mono">{realtor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-base text-gray-700 font-medium">{realtor.brokerage || '-'}</span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(realtor.status)}</td>
                        <td className="p-4 text-base text-gray-500 font-mono">{realtor.agentId ? `#${realtor.agentId}` : 'Unlinked'}</td>
                        <td className="p-4 text-base text-gray-500 font-mono">{formatDate(realtor.inviteSentAt)}</td>
                        <td className="p-4 text-base text-gray-500 font-mono">{realtor.activatedAt ? formatDate(realtor.activatedAt) : 'Never'}</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" className="text-sm font-mono font-medium h-9 px-4 border-gray-300 hover:bg-gray-100 hover:border-gray-400" onClick={() => handleOpenDetails(realtor.id)}>
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
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No realtors found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Realtor Modal */}
      <Dialog open={showCreateModal} onOpenChange={closeCreateModal}>
        <DialogContent className="max-w-md p-0" closeClassName="text-white hover:text-gray-300">
          <DialogHeader className="bg-[#1a2332] text-white p-6">
            <DialogTitle className="font-mono text-lg font-bold uppercase tracking-wider">Create New Realtor</DialogTitle>
            <DialogDescription className="text-gray-300 font-mono text-sm">
              Add a new realtor to the platform. You can optionally link them to an agent.
            </DialogDescription>
          </DialogHeader>

          {createSuccess ? (
            <div className="space-y-4 p-6">
              <div className={`${createSuccess.status === 'invited' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} border p-4`}>
                <p className={`${createSuccess.status === 'invited' ? 'text-green-800' : 'text-amber-800'} font-mono font-medium`}>
                  Realtor created successfully!
                </p>
                {createSuccess.status === 'invited' ? (
                  <p className="text-green-700 text-sm font-mono mt-1">
                    An onboarding email has been sent from {createSuccess.agentName}.
                  </p>
                ) : (
                  <p className="text-amber-700 text-sm font-mono mt-1">
                    No email was sent. The realtor is inactive until linked to an agent.
                  </p>
                )}
              </div>
              <div className="bg-gray-50 p-4 space-y-3">
                <div>
                  <Label className="text-gray-500 text-xs font-mono uppercase tracking-wider">Email</Label>
                  <p className="font-mono text-base">{createSuccess.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs font-mono uppercase tracking-wider">Temporary Password</Label>
                  <p className="font-mono text-base bg-yellow-100 px-2 py-1 inline-block">{createSuccess.tempPassword}</p>
                </div>
                {createSuccess.agentName && (
                  <div>
                    <Label className="text-gray-500 text-xs font-mono uppercase tracking-wider">Linked Agent</Label>
                    <p className="font-mono text-base">{createSuccess.agentName}</p>
                  </div>
                )}
                <div>
                  <Label className="text-gray-500 text-xs font-mono uppercase tracking-wider">Status</Label>
                  <p className="font-mono text-base uppercase">{createSuccess.status}</p>
                </div>
              </div>
              <Button onClick={closeCreateModal} className="w-full bg-[#1a2332] hover:bg-[#2a3342] font-mono uppercase tracking-wider">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleCreateRealtor} className="space-y-4 p-6">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-mono">{createError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-mono text-sm uppercase tracking-wider">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    className="font-mono"
                    value={newRealtor.firstName}
                    onChange={(e) => setNewRealtor({ ...newRealtor, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-mono text-sm uppercase tracking-wider">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    className="font-mono"
                    value={newRealtor.lastName}
                    onChange={(e) => setNewRealtor({ ...newRealtor, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-sm uppercase tracking-wider">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  className="font-mono"
                  value={newRealtor.email}
                  onChange={(e) => setNewRealtor({ ...newRealtor, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brokerage" className="font-mono text-sm uppercase tracking-wider">Brokerage</Label>
                <Input
                  id="brokerage"
                  className="font-mono"
                  value={newRealtor.brokerage}
                  onChange={(e) => setNewRealtor({ ...newRealtor, brokerage: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-mono text-sm uppercase tracking-wider">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="font-mono"
                  value={newRealtor.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentId" className="font-mono text-sm uppercase tracking-wider">Link to Agent</Label>
                {isLoadingAgents ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading agents...
                  </div>
                ) : (
                  <Select
                    value={String(newRealtor.agentId)}
                    onValueChange={(value) => setNewRealtor({ ...newRealtor, agentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Linked Agent (Inactive)</SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={String(agent.id)}>
                          {agent.firstName} {agent.lastName} - {agent.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500">
                  {newRealtor.agentId === 'none'
                    ? 'Realtor will be created as inactive and no email will be sent.'
                    : 'Realtor will receive an onboarding email that appears to come from the selected agent.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeCreateModal} className="flex-1 font-mono uppercase tracking-wider">
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="flex-1 bg-[#1a2332] hover:bg-[#2a3342] font-mono uppercase tracking-wider">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Realtor'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </React.Fragment>
  )
}
