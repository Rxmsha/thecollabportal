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
import { Search, Building2, Mail, Phone, Calendar, Users, Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import xano from '@/services/xano'
import { formatDate } from '@/lib/utils'
import { Agent } from '@/types'

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
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
    seatLimit: 10,
  })

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
      case 'suspended':
        return <Badge variant="warning">Suspended</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleStatusChange = async (agentId: number, newStatus: string) => {
    try {
      await xano.updateAgent(agentId, { status: newStatus })
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, status: newStatus as any } : a))
      )
      setSelectedAgent(null)
    } catch (error) {
      console.error('Failed to update agent status:', error)
    }
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
        // Reload agents list
        loadAgents()
        // Reset form
        setNewAgent({
          email: '',
          firstName: '',
          lastName: '',
          companyName: '',
          phone: '',
          seatLimit: 10,
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
      seatLimit: 10,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 mt-1">Manage all mortgage agents on the platform</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
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
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">
                      Agent
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">
                      Company
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">
                      Realtors
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">
                      Joined
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: agent.brandColor || '#2563eb' }}
                          >
                            {agent.firstName[0]}
                            {agent.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {agent.firstName} {agent.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-900">{agent.companyName}</p>
                      </td>
                      <td className="p-4">{getStatusBadge(agent.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {agent.seatsUsed}/{agent.seatLimit}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">
                        {formatDate(agent.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          View
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

      {/* Agent Detail Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
            <DialogDescription>
              View and manage agent information
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-medium"
                  style={{ backgroundColor: selectedAgent.brandColor || '#2563eb' }}
                >
                  {selectedAgent.firstName[0]}
                  {selectedAgent.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedAgent.firstName} {selectedAgent.lastName}
                  </h3>
                  <p className="text-gray-500">{selectedAgent.companyName}</p>
                  {getStatusBadge(selectedAgent.status)}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{selectedAgent.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{selectedAgent.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Joined {formatDate(selectedAgent.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {selectedAgent.seatsUsed} of {selectedAgent.seatLimit} seats used
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Change Status
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedAgent.status === 'active' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedAgent.id, 'active')}
                  >
                    Active
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAgent.status === 'suspended' ? 'warning' : 'outline'}
                    onClick={() => handleStatusChange(selectedAgent.id, 'suspended')}
                  >
                    Suspend
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      selectedAgent.status === 'cancelled' ? 'destructive' : 'outline'
                    }
                    onClick={() => handleStatusChange(selectedAgent.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Agent Modal */}
      <Dialog open={showCreateModal} onOpenChange={closeCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
            <DialogDescription>
              Add a new mortgage agent to the platform. A temporary password will be generated.
            </DialogDescription>
          </DialogHeader>

          {createSuccess ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">Agent created successfully!</p>
                <p className="text-green-700 text-sm mt-1">
                  Send these credentials to the agent:
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <Label className="text-gray-500 text-xs">Email</Label>
                  <p className="font-mono text-sm">{createSuccess.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Temporary Password</Label>
                  <p className="font-mono text-sm bg-yellow-100 px-2 py-1 rounded inline-block">
                    {createSuccess.tempPassword}
                  </p>
                </div>
              </div>
              <Button onClick={closeCreateModal} className="w-full">
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateAgent} className="space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newAgent.firstName}
                    onChange={(e) => setNewAgent({ ...newAgent, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newAgent.lastName}
                    onChange={(e) => setNewAgent({ ...newAgent, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={newAgent.companyName}
                  onChange={(e) => setNewAgent({ ...newAgent, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seatLimit">Seat Limit</Label>
                  <Input
                    id="seatLimit"
                    type="number"
                    min="1"
                    value={newAgent.seatLimit}
                    onChange={(e) => setNewAgent({ ...newAgent, seatLimit: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeCreateModal} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="flex-1">
                  {isCreating ? 'Creating...' : 'Create Agent'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
