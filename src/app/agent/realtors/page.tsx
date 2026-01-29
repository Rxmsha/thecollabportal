'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
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
import { Search, Users, UserPlus, Mail, Building, Phone } from 'lucide-react'
import xano from '@/services/xano'
import { formatDate } from '@/lib/utils'
import { Realtor, RealtorStatus } from '@/types'
import RealtorCredentialsModal from '@/components/RealtorCredentialsModal'
import AgentRealtorDetailModal from '@/components/AgentRealtorDetailModal'

interface RealtorCredentials {
  email: string
  firstName: string
  lastName: string
  tempPassword: string
}

export default function AgentRealtorsPage() {
  const { user } = useAuth()
  const [realtors, setRealtors] = useState<Realtor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [credentials, setCredentials] = useState<RealtorCredentials | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRealtorId, setSelectedRealtorId] = useState<number | null>(null)

  useEffect(() => {
    if (user?.agentId) {
      loadRealtors()
    }
  }, [user, statusFilter])

  const loadRealtors = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getMyRealtors({
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

  const handleResendInvite = async (realtorId: number) => {
    // This would trigger a Zapier workflow or SendGrid API
    console.log('Resending invite to realtor:', realtorId)
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
  }) => {
    setCredentials(creds)
    setShowCredentialsModal(true)
  }

  return (
    <React.Fragment>
      <RealtorCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        credentials={credentials}
        isReactivation={true}
      />
      <AgentRealtorDetailModal
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Realtors</h1>
            <p className="text-gray-500 mt-1">
              Manage the realtors in your network
            </p>
          </div>
          <Link href="/agent/invite">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Realtor
            </Button>
          </Link>
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

        {/* Realtors Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRealtors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRealtors.map((realtor) => (
              <Card key={realtor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                        {realtor.firstName[0]}
                        {realtor.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {realtor.firstName} {realtor.lastName}
                        </h3>
                        {getStatusBadge(realtor.status)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetails(realtor.id)}
                    >
                      More
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {realtor.email}
                    </div>
                    {realtor.brokerage && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="h-4 w-4 text-gray-400" />
                        {realtor.brokerage}
                      </div>
                    )}
                    {realtor.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {realtor.phone}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-400">
                    <span>Invited {formatDate(realtor.inviteSentAt)}</span>
                    {realtor.status === 'invited' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResendInvite(realtor.id)}
                      >
                        Resend Invite
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No realtors found</p>
              <Link href="/agent/invite">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Your First Realtor
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </React.Fragment>
  )
}
