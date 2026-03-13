'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  FileText,
  FilePlus,
  FileEdit,
  Trash2,
  Bell,
  Send,
  Users,
  Home,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import xano from '@/services/xano'
import { formatDateTime } from '@/lib/utils'
import { UsageLog } from '@/types'
import Link from 'next/link'
import { useBranding } from '@/context/BrandingContext'

// Event type configuration
const EVENT_CONFIG: Record<string, {
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  category: 'agent' | 'realtor' | 'template'
}> = {
  // Agent events
  agent_created: {
    label: 'Agent Created',
    icon: UserPlus,
    color: 'text-[#0077B6]',
    bgColor: 'bg-[#0077B6]',
    category: 'agent'
  },
  agent_activated: {
    label: 'Agent Activated',
    icon: UserCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600',
    category: 'agent'
  },
  agent_deactivated: {
    label: 'Agent Deactivated',
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    category: 'agent'
  },
  agent_reactivated: {
    label: 'Agent Reactivated',
    icon: UserCog,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600',
    category: 'agent'
  },
  // Realtor events
  realtor_invited: {
    label: 'Realtor Invited',
    icon: UserPlus,
    color: 'text-orange-600',
    bgColor: 'bg-orange-600',
    category: 'realtor'
  },
  realtor_activated: {
    label: 'Realtor Activated',
    icon: UserCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600',
    category: 'realtor'
  },
  realtor_deactivated_by_agent: {
    label: 'Realtor Deactivated (Agent)',
    icon: UserX,
    color: 'text-amber-600',
    bgColor: 'bg-amber-600',
    category: 'realtor'
  },
  realtor_deactivated_by_admin: {
    label: 'Realtor Deactivated (Admin)',
    icon: UserX,
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    category: 'realtor'
  },
  realtor_reactivated_by_agent: {
    label: 'Realtor Reactivated (Agent)',
    icon: UserCog,
    color: 'text-teal-600',
    bgColor: 'bg-teal-600',
    category: 'realtor'
  },
  realtor_reactivated_by_admin: {
    label: 'Realtor Reactivated (Admin)',
    icon: UserCog,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600',
    category: 'realtor'
  },
  // Template events
  template_created: {
    label: 'Template Created',
    icon: FilePlus,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-600',
    category: 'template'
  },
  template_published: {
    label: 'Template Published',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-600',
    category: 'template'
  },
  template_updated: {
    label: 'Template Updated',
    icon: FileEdit,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-600',
    category: 'template'
  },
  template_deleted: {
    label: 'Template Deleted',
    icon: Trash2,
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    category: 'template'
  },
  template_notification_sent_to_agents: {
    label: 'Notification to Agents',
    icon: Bell,
    color: 'text-violet-600',
    bgColor: 'bg-violet-600',
    category: 'template'
  },
  template_notification_sent_to_realtors: {
    label: 'Notification to Realtors',
    icon: Send,
    color: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-600',
    category: 'template'
  },
}

const ITEMS_PER_PAGE = 50

export default function AdminLogsPage() {
  const { brandColor } = useBranding()
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventFilter, setEventFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadLogs()
    setCurrentPage(1) // Reset to first page when filter changes
  }, [eventFilter])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getUsageLogs({
        eventType: eventFilter === 'all' ? undefined : eventFilter,
        limit: 500, // Fetch more logs for client-side pagination
      })
      if (data) {
        // Handle both paginated response (data.items) and plain array
        const rawData = data as any
        const logsArray = Array.isArray(rawData) ? rawData : (rawData.items || [])
        // Transform snake_case from API to camelCase for frontend
        const transformedLogs = logsArray.map((log: any) => ({
          id: log.id,
          eventType: log.event_type,
          agentId: log.agent_id,
          realtorId: log.realtor_id,
          templateId: log.template_id,
          details: log.details,
          createdAt: log.created_at,
          // Include joined data from API
          agent: log._agent ? {
            id: log._agent.id,
            firstName: log._agent.first_name,
            lastName: log._agent.last_name,
            email: log._agent.email,
          } : null,
          realtor: log._realtor ? {
            id: log._realtor.id,
            firstName: log._realtor.first_name,
            lastName: log._realtor.last_name,
            email: log._realtor.email,
          } : null,
          template: log._template ? {
            id: log._template.id,
            title: log._template.title,
          } : null,
        }))
        setLogs(transformedLogs)
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEventConfig = (eventType: string) => {
    return EVENT_CONFIG[eventType] || {
      label: eventType.replace(/_/g, ' '),
      icon: Activity,
      color: 'text-gray-600',
      bgColor: 'bg-gray-600',
      category: 'agent'
    }
  }

  const filteredLogs = logs.filter(log => {
    if (categoryFilter === 'all') return true
    const config = getEventConfig(log.eventType)
    return config.category === categoryFilter
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

  // Reset to page 1 when category filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter])

  const getFullName = (firstName?: string, lastName?: string, fallback?: string): string => {
    if (firstName && lastName) return `${firstName} ${lastName}`
    if (firstName) return firstName
    if (lastName) return lastName
    return fallback || 'Unknown'
  }

  const getEventDescription = (log: UsageLog): string => {
    const details = log.details || {}
    const eventType = log.eventType

    // Build names - prefer joined data from API, fall back to details
    const agentName = log.agent
      ? getFullName(log.agent.firstName, log.agent.lastName, log.agent.email)
      : getFullName(details.agent_first_name, details.agent_last_name, details.agent_email)

    const realtorName = log.realtor
      ? getFullName(log.realtor.firstName, log.realtor.lastName, log.realtor.email)
      : getFullName(details.realtor_first_name, details.realtor_last_name, details.realtor_email)

    const templateTitle = log.template?.title || details.template_title || 'Untitled'

    switch (eventType) {
      // Agent events
      case 'agent_created':
        return `New agent account created for ${agentName}`
      case 'agent_activated':
        return `Agent completed first login and is now active`
      case 'agent_deactivated':
        return `Agent ${agentName} has been deactivated by admin`
      case 'agent_reactivated':
        return `Agent ${agentName} has been reactivated by admin`

      // Realtor events
      case 'realtor_invited':
        return `Invitation sent to ${realtorName}`
      case 'realtor_activated':
        return `Realtor completed first login and is now active`
      case 'realtor_deactivated_by_agent':
        return `${realtorName} was deactivated by their linked agent`
      case 'realtor_deactivated_by_admin':
        return `${realtorName} was deactivated by admin`
      case 'realtor_reactivated_by_agent':
        return `${realtorName} was reactivated by their linked agent`
      case 'realtor_reactivated_by_admin':
        return `${realtorName} was reactivated by admin`

      // Template events
      case 'template_created':
        return `New template "${templateTitle}" was created`
      case 'template_published':
        const agentCount = details.agent_count || 0
        const publishRealtorCount = details.realtor_count || 0
        if (agentCount > 0 || publishRealtorCount > 0) {
          return `Template "${templateTitle}" published - notified ${agentCount} agents and ${publishRealtorCount} realtors`
        }
        return `Template "${templateTitle}" was published`
      case 'template_updated':
        return `Template "${templateTitle}" was updated`
      case 'template_deleted':
        return `Template "${templateTitle}" was permanently deleted`
      case 'template_notification_sent_to_agents':
        return `Notification for "${templateTitle}" sent to ${details.agent_count || 0} agents`
      case 'template_notification_sent_to_realtors':
        return `Notification for "${templateTitle}" sent to ${details.realtor_count || 0} realtors`

      default:
        return (eventType as string).replace(/_/g, ' ')
    }
  }

  const agentCount = logs.filter(l => getEventConfig(l.eventType).category === 'agent').length
  const realtorCount = logs.filter(l => getEventConfig(l.eventType).category === 'realtor').length
  const templateCount = logs.filter(l => getEventConfig(l.eventType).category === 'template').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="dot-matrix text-2xl text-gray-900">Usage Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all activity across the platform
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40 text-sm rounded-lg border-gray-300 bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all" className="text-sm">All Categories</SelectItem>
              <SelectItem value="agent" className="text-sm">Agent Events</SelectItem>
              <SelectItem value="realtor" className="text-sm">Realtor Events</SelectItem>
              <SelectItem value="template" className="text-sm">Template Events</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full sm:w-64 text-sm rounded-lg border-gray-300 bg-white">
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all" className="text-sm">All Events</SelectItem>
              <SelectItem value="---agent" disabled className="text-sm font-semibold text-gray-500">— Agent Events —</SelectItem>
              <SelectItem value="agent_created" className="text-sm">Agent Created</SelectItem>
              <SelectItem value="agent_activated" className="text-sm">Agent Activated</SelectItem>
              <SelectItem value="agent_deactivated" className="text-sm">Agent Deactivated</SelectItem>
              <SelectItem value="agent_reactivated" className="text-sm">Agent Reactivated</SelectItem>
              <SelectItem value="---realtor" disabled className="text-sm font-semibold text-gray-500">— Realtor Events —</SelectItem>
              <SelectItem value="realtor_invited" className="text-sm">Realtor Invited</SelectItem>
              <SelectItem value="realtor_activated" className="text-sm">Realtor Activated</SelectItem>
              <SelectItem value="realtor_deactivated_by_agent" className="text-sm">Realtor Deactivated (Agent)</SelectItem>
              <SelectItem value="realtor_deactivated_by_admin" className="text-sm">Realtor Deactivated (Admin)</SelectItem>
              <SelectItem value="realtor_reactivated_by_agent" className="text-sm">Realtor Reactivated (Agent)</SelectItem>
              <SelectItem value="realtor_reactivated_by_admin" className="text-sm">Realtor Reactivated (Admin)</SelectItem>
              <SelectItem value="---template" disabled className="text-sm font-semibold text-gray-500">— Template Events —</SelectItem>
              <SelectItem value="template_created" className="text-sm">Template Created</SelectItem>
              <SelectItem value="template_published" className="text-sm">Template Published</SelectItem>
              <SelectItem value="template_updated" className="text-sm">Template Updated</SelectItem>
              <SelectItem value="template_deleted" className="text-sm">Template Deleted</SelectItem>
              <SelectItem value="template_notification_sent_to_agents" className="text-sm">Notification to Agents</SelectItem>
              <SelectItem value="template_notification_sent_to_realtors" className="text-sm">Notification to Realtors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-3 sm:px-4 py-2 flex items-center gap-2 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <Activity className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-medium truncate">Total Events</span>
          </div>
          <CardContent className="p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="text-2xl sm:text-3xl font-bold" style={{ color: brandColor }}>{logs.length}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="bg-[#0077B6] px-3 sm:px-4 py-2 flex items-center gap-2 rounded-t-lg">
            <Users className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-medium truncate">Agent Events</span>
          </div>
          <CardContent className="p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="text-2xl sm:text-3xl font-bold text-[#0077B6]">{agentCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="bg-orange-600 px-3 sm:px-4 py-2 flex items-center gap-2 rounded-t-lg">
            <Home className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-medium truncate">Realtor Events</span>
          </div>
          <CardContent className="p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{realtorCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="bg-purple-600 px-3 sm:px-4 py-2 flex items-center gap-2 rounded-t-lg">
            <LayoutTemplate className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-medium truncate">Template Events</span>
          </div>
          <CardContent className="p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">{templateCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 overflow-hidden rounded-lg">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
          <Activity className="h-5 w-5 text-white flex-shrink-0" />
          <span className="text-white font-semibold text-sm sm:text-base">Activity Log</span>
          <span className="text-white/60 text-xs sm:text-sm ml-auto">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
            <span className="hidden sm:inline">{totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}</span>
          </span>
        </div>
        <CardContent className="p-0 bg-white rounded-b-lg">
          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedLogs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {paginatedLogs.map((log) => {
                const config = getEventConfig(log.eventType)
                const IconComponent = config.icon
                const description = getEventDescription(log)

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${config.color} border-current bg-white`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2">{description}</p>
                      <div className="flex gap-2 sm:gap-3 text-xs flex-wrap items-center">
                        {/* Show agent info only for agent events */}
                        {config.category === 'agent' && log.agentId && (
                          <>
                            <Link
                              href={`/admin/agents?id=${log.agentId}`}
                              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#0077B6]/10 text-[#0077B6] text-[10px] sm:text-xs font-medium hover:bg-[#0077B6]/20 transition-colors"
                            >
                              <span>Agent</span>
                              <span>#{log.agentId}</span>
                            </Link>
                            {(log.agent?.email || log.details?.agent_email) && (
                              <span className="text-gray-500 text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-none">{log.agent?.email || log.details?.agent_email}</span>
                            )}
                          </>
                        )}
                        {/* Show realtor info only for realtor events */}
                        {config.category === 'realtor' && log.realtorId && (
                          <>
                            <Link
                              href={`/admin/realtors?id=${log.realtorId}`}
                              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-orange-600/10 text-orange-600 text-[10px] sm:text-xs font-medium hover:bg-orange-600/20 transition-colors"
                            >
                              <span>Realtor</span>
                              <span>#{log.realtorId}</span>
                            </Link>
                            {(log.realtor?.email || log.details?.realtor_email) && (
                              <span className="text-gray-500 text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-none">{log.realtor?.email || log.details?.realtor_email}</span>
                            )}
                          </>
                        )}
                        {/* Show template info for template events */}
                        {config.category === 'template' && log.templateId && (
                          <Link
                            href={`/admin/templates/${log.templateId}`}
                            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-purple-600/10 text-purple-600 text-[10px] sm:text-xs font-medium hover:bg-purple-600/20 transition-colors"
                          >
                            <span>Template</span>
                            <span>#{log.templateId}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <Activity className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-sm sm:text-base">No activity logs found</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {eventFilter !== 'all' && 'Try changing the filter to see more logs'}
              </p>
            </div>
          )}
        </CardContent>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 rounded-b-lg">
            <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length}
            </div>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-lg hidden sm:flex"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers - simplified on mobile */}
              <div className="flex items-center gap-1 mx-1 sm:mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and adjacent pages
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 1) return true
                    return false
                  })
                  .map((page, idx, arr) => {
                    // Add ellipsis between non-consecutive pages
                    const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className="px-1 sm:px-2 text-gray-400 text-sm">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="rounded-lg min-w-[32px] sm:min-w-[36px] text-xs sm:text-sm"
                          style={currentPage === page ? { backgroundColor: brandColor } : undefined}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    )
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg hidden sm:flex"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
