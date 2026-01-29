'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Search, Users, Building } from 'lucide-react'
import xano from '@/services/xano'
import { formatDate } from '@/lib/utils'
import { Realtor, RealtorStatus } from '@/types'
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
      />
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Realtors</h1>
        <p className="text-gray-500 mt-1">
          View all realtors across all agents on the platform
        </p>
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
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Realtor</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Brokerage</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Agent</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Invited</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Last Active</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRealtors.map((realtor) => (
                      <tr key={realtor.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                              {realtor.firstName[0]}{realtor.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{realtor.firstName} {realtor.lastName}</p>
                              <p className="text-sm text-gray-500">{realtor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{realtor.brokerage || '-'}</span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(realtor.status)}</td>
                        <td className="p-4 text-gray-500">Agent #{realtor.agentId}</td>
                        <td className="p-4 text-gray-500">{formatDate(realtor.inviteSentAt)}</td>
                        <td className="p-4 text-gray-500">{realtor.activatedAt ? formatDate(realtor.activatedAt) : 'Never'}</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDetails(realtor.id)}>
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
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No realtors found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </React.Fragment>
  )
}
