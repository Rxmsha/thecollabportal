'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Send
} from 'lucide-react'
import xano from '@/services/xano'
import { formatDateTime } from '@/lib/utils'
import { UsageLog } from '@/types'
import Link from 'next/link'

// Event type configuration
const EVENT_CONFIG: Record<string, {
  label: string
  icon: React.ElementType
  color: string
  badgeVariant: string
  category: 'agent' | 'realtor' | 'template'
}> = {
  // Agent events
  agent_created: {
    label: 'Agent Created',
    icon: UserPlus,
    color: 'bg-blue-100 text-blue-600',
    badgeVariant: 'default',
    category: 'agent'
  },
  agent_activated: {
    label: 'Agent Activated',
    icon: UserCheck,
    color: 'bg-green-100 text-green-600',
    badgeVariant: 'success',
    category: 'agent'
  },
  agent_deactivated: {
    label: 'Agent Deactivated',
    icon: UserX,
    color: 'bg-red-100 text-red-600',
    badgeVariant: 'destructive',
    category: 'agent'
  },
  agent_reactivated: {
    label: 'Agent Reactivated',
    icon: UserCog,
    color: 'bg-emerald-100 text-emerald-600',
    badgeVariant: 'success',
    category: 'agent'
  },
  // Realtor events
  realtor_invited: {
    label: 'Realtor Invited',
    icon: UserPlus,
    color: 'bg-orange-100 text-orange-600',
    badgeVariant: 'orange',
    category: 'realtor'
  },
  realtor_activated: {
    label: 'Realtor Activated',
    icon: UserCheck,
    color: 'bg-green-100 text-green-600',
    badgeVariant: 'success',
    category: 'realtor'
  },
  realtor_deactivated_by_agent: {
    label: 'Realtor Deactivated (Agent)',
    icon: UserX,
    color: 'bg-amber-100 text-amber-600',
    badgeVariant: 'warning',
    category: 'realtor'
  },
  realtor_deactivated_by_admin: {
    label: 'Realtor Deactivated (Admin)',
    icon: UserX,
    color: 'bg-red-100 text-red-600',
    badgeVariant: 'destructive',
    category: 'realtor'
  },
  realtor_reactivated_by_agent: {
    label: 'Realtor Reactivated (Agent)',
    icon: UserCog,
    color: 'bg-teal-100 text-teal-600',
    badgeVariant: 'success',
    category: 'realtor'
  },
  realtor_reactivated_by_admin: {
    label: 'Realtor Reactivated (Admin)',
    icon: UserCog,
    color: 'bg-emerald-100 text-emerald-600',
    badgeVariant: 'success',
    category: 'realtor'
  },
  // Template events
  template_created: {
    label: 'Template Created',
    icon: FilePlus,
    color: 'bg-indigo-100 text-indigo-600',
    badgeVariant: 'default',
    category: 'template'
  },
  template_published: {
    label: 'Template Published',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600',
    badgeVariant: 'purple',
    category: 'template'
  },
  template_updated: {
    label: 'Template Updated',
    icon: FileEdit,
    color: 'bg-cyan-100 text-cyan-600',
    badgeVariant: 'secondary',
    category: 'template'
  },
  template_deleted: {
    label: 'Template Deleted',
    icon: Trash2,
    color: 'bg-red-100 text-red-600',
    badgeVariant: 'destructive',
    category: 'template'
  },
  template_notification_sent_to_agents: {
    label: 'Notification Sent to Agents',
    icon: Bell,
    color: 'bg-violet-100 text-violet-600',
    badgeVariant: 'purple',
    category: 'template'
  },
  template_notification_sent_to_realtors: {
    label: 'Notification Sent to Realtors',
    icon: Send,
    color: 'bg-fuchsia-100 text-fuchsia-600',
    badgeVariant: 'purple',
    category: 'template'
  },
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventFilter, setEventFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    loadLogs()
  }, [eventFilter])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getUsageLogs({
        eventType: eventFilter === 'all' ? undefined : eventFilter,
        limit: 100,
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
      color: 'bg-gray-100 text-gray-600',
      badgeVariant: 'secondary',
      category: 'agent'
    }
  }

  const filteredLogs = logs.filter(log => {
    if (categoryFilter === 'all') return true
    const config = getEventConfig(log.eventType)
    return config.category === categoryFilter
  })

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
        return eventType.replace(/_/g, ' ')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage Logs</h1>
          <p className="text-gray-500 mt-1">
            Track all activity across the platform
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="agent">Agent Events</SelectItem>
              <SelectItem value="realtor">Realtor Events</SelectItem>
              <SelectItem value="template">Template Events</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="---agent" disabled className="font-semibold text-gray-500">— Agent Events —</SelectItem>
              <SelectItem value="agent_created">Agent Created</SelectItem>
              <SelectItem value="agent_activated">Agent Activated</SelectItem>
              <SelectItem value="agent_deactivated">Agent Deactivated</SelectItem>
              <SelectItem value="agent_reactivated">Agent Reactivated</SelectItem>
              <SelectItem value="---realtor" disabled className="font-semibold text-gray-500">— Realtor Events —</SelectItem>
              <SelectItem value="realtor_invited">Realtor Invited</SelectItem>
              <SelectItem value="realtor_activated">Realtor Activated</SelectItem>
              <SelectItem value="realtor_deactivated_by_agent">Realtor Deactivated (Agent)</SelectItem>
              <SelectItem value="realtor_deactivated_by_admin">Realtor Deactivated (Admin)</SelectItem>
              <SelectItem value="realtor_reactivated_by_agent">Realtor Reactivated (Agent)</SelectItem>
              <SelectItem value="realtor_reactivated_by_admin">Realtor Reactivated (Admin)</SelectItem>
              <SelectItem value="---template" disabled className="font-semibold text-gray-500">— Template Events —</SelectItem>
              <SelectItem value="template_created">Template Created</SelectItem>
              <SelectItem value="template_published">Template Published</SelectItem>
              <SelectItem value="template_updated">Template Updated</SelectItem>
              <SelectItem value="template_deleted">Template Deleted</SelectItem>
              <SelectItem value="template_notification_sent_to_agents">Notification to Agents</SelectItem>
              <SelectItem value="template_notification_sent_to_realtors">Notification to Realtors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
            <div className="text-sm text-gray-500">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter(l => getEventConfig(l.eventType).category === 'agent').length}
            </div>
            <div className="text-sm text-gray-500">Agent Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {logs.filter(l => getEventConfig(l.eventType).category === 'realtor').length}
            </div>
            <div className="text-sm text-gray-500">Realtor Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {logs.filter(l => getEventConfig(l.eventType).category === 'template').length}
            </div>
            <div className="text-sm text-gray-500">Template Events</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredLogs.map((log) => {
                const config = getEventConfig(log.eventType)
                const IconComponent = config.icon
                const description = getEventDescription(log)

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50"
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={config.badgeVariant as any}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{description}</p>
                      <div className="flex gap-3 text-xs flex-wrap items-center">
                        {/* Show agent info only for agent events */}
                        {config.category === 'agent' && log.agentId && (
                          <>
                            <Link
                              href={`/admin/agents?id=${log.agentId}`}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                            >
                              <span className="font-medium">Agent</span>
                              <span>#{log.agentId}</span>
                            </Link>
                            {(log.agent?.email || log.details?.agent_email) && (
                              <span className="text-gray-500">{log.agent?.email || log.details?.agent_email}</span>
                            )}
                          </>
                        )}
                        {/* Show realtor info only for realtor events */}
                        {config.category === 'realtor' && log.realtorId && (
                          <>
                            <Link
                              href={`/admin/realtors?id=${log.realtorId}`}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
                            >
                              <span className="font-medium">Realtor</span>
                              <span>#{log.realtorId}</span>
                            </Link>
                            {(log.realtor?.email || log.details?.realtor_email) && (
                              <span className="text-gray-500">{log.realtor?.email || log.details?.realtor_email}</span>
                            )}
                          </>
                        )}
                        {/* Show template info for template events */}
                        {config.category === 'template' && log.templateId && (
                          <Link
                            href={`/admin/templates/${log.templateId}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                          >
                            <span className="font-medium">Template</span>
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
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activity logs found</p>
              <p className="text-gray-400 text-sm mt-1">
                {eventFilter !== 'all' && 'Try changing the filter to see more logs'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
