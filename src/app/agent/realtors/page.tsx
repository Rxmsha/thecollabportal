'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/context/BrandingContext'
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
import { Search, Users, UserPlus, Mail, Building, Phone, MoreHorizontal } from 'lucide-react'
import xano from '@/services/xano'
import { formatDate } from '@/lib/utils'
import { Realtor, RealtorStatus } from '@/types'
import RealtorCredentialsModal from '@/components/RealtorCredentialsModal'
import AgentRealtorDetailModal from '@/components/AgentRealtorDetailModal'
import { toast } from '@/hooks/use-toast'

interface RealtorCredentials {
  email: string
  firstName: string
  lastName: string
  tempPassword: string
}

export default function AgentRealtorsPage() {
  const { user } = useAuth()
  const { brandColor } = useBranding()
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
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            Active
          </span>
        )
      case 'invited':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            Invited
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            Inactive
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200 capitalize">
            {status}
          </span>
        )
    }
  }

  const handleResendInvite = async (realtorId: number) => {
    try {
      const { data, error } = await xano.resendRealtorInvite(realtorId)
      if (error) {
        console.error('Failed to resend invite:', error)
        toast({
          title: 'Failed to resend invite',
          description: error,
          variant: 'destructive',
        })
      } else if (data) {
        setRealtors((prev) =>
          prev.map((r) =>
            r.id === realtorId ? { ...r, inviteSentAt: new Date().toISOString() } : r
          )
        )
        toast({
          title: 'Invite sent',
          description: `Onboarding email has been resent to ${data.email}`,
          variant: 'success',
        })
      }
    } catch (error) {
      console.error('Failed to resend invite:', error)
      toast({
        title: 'Failed to resend invite',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
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
  }) => {
    setCredentials(creds)
    setShowCredentialsModal(true)
  }

  const handleUnlink = (realtorId: number) => {
    setRealtors((prev) => prev.filter((r) => r.id !== realtorId))
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
        onUnlink={handleUnlink}
      />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="dot-matrix text-2xl text-gray-900">My Realtors</h1>
            <p className="text-base text-gray-700 mt-1">
              Manage the realtors in your network
            </p>
          </div>
          <Link href="/agent/invite">
            <Button
              className="rounded-lg text-sm h-10"
              style={{ backgroundColor: brandColor }}
            >
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
              className="pl-10 rounded-lg"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
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
              <Card key={i} className="border-0 overflow-hidden rounded-lg">
                <div className="px-4 py-3 bg-gray-200 animate-pulse rounded-t-lg" />
                <CardContent className="p-6 bg-white rounded-b-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-100 w-2/3 rounded animate-pulse" />
                      <div className="h-3 bg-gray-100 w-1/2 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRealtors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRealtors.map((realtor) => (
              <Card key={realtor.id} className="border-0 overflow-hidden rounded-lg hover:shadow-md transition-shadow h-[280px]">
                <CardContent className="p-0 bg-white h-full flex flex-col rounded-lg">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: brandColor }}
                        >
                          {realtor.firstName[0]}
                          {realtor.lastName[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">
                            {realtor.firstName} {realtor.lastName}
                          </h3>
                          {getStatusBadge(realtor.status)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetails(realtor.id)}
                        className="rounded-lg text-sm"
                      >
                        More
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-gray-700 text-base">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {realtor.email}
                    </div>
                    {realtor.brokerage && (
                      <div className="flex items-center gap-2 text-gray-700 text-base">
                        <Building className="h-4 w-4 text-gray-400" />
                        {realtor.brokerage}
                      </div>
                    )}
                    {realtor.phone && (
                      <div className="flex items-center gap-2 text-gray-700 text-base">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {realtor.phone}
                      </div>
                    )}
                  </div>

                  <div
                    className="px-4 h-12 flex items-center justify-between rounded-b-lg"
                    style={{ backgroundColor: brandColor }}
                  >
                    <span className="text-base text-white/80">
                      Invited {formatDate(realtor.inviteSentAt)}
                    </span>
                    {realtor.status === 'invited' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResendInvite(realtor.id)}
                        className="rounded-lg text-sm h-8 text-white hover:bg-white/10"
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
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <Users className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-base">
                Realtors
              </span>
            </div>
            <CardContent className="py-12 text-center bg-white rounded-b-lg">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-base text-gray-700 mb-4">No realtors found</p>
              <Link href="/agent/invite">
                <Button
                  className="rounded-lg text-sm"
                  style={{ backgroundColor: brandColor }}
                >
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
