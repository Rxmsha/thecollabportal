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
import { Activity } from 'lucide-react'
import xano from '@/services/xano'
import { formatDateTime } from '@/lib/utils'
import { UsageLog } from '@/types'

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventFilter, setEventFilter] = useState('all')

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
        setLogs(data)
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'template_published':
        return 'purple'
      case 'email_sent':
        return 'default'
      case 'realtor_invited':
        return 'orange'
      case 'realtor_activated':
        return 'success'
      case 'agent_created':
        return 'default'
      case 'branding_updated':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getEventIcon = (eventType: string) => {
    const colors: { [key: string]: string } = {
      template_published: 'bg-purple-100 text-purple-600',
      email_sent: 'bg-blue-100 text-blue-600',
      realtor_invited: 'bg-orange-100 text-orange-600',
      realtor_activated: 'bg-green-100 text-green-600',
      agent_created: 'bg-blue-100 text-blue-600',
      branding_updated: 'bg-gray-100 text-gray-600',
    }
    return colors[eventType] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage Logs</h1>
          <p className="text-gray-500 mt-1">
            Track all activity across the platform
          </p>
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="template_published">Template Published</SelectItem>
            <SelectItem value="email_sent">Email Sent</SelectItem>
            <SelectItem value="realtor_invited">Realtor Invited</SelectItem>
            <SelectItem value="realtor_activated">Realtor Activated</SelectItem>
            <SelectItem value="agent_created">Agent Created</SelectItem>
            <SelectItem value="branding_updated">Branding Updated</SelectItem>
          </SelectContent>
        </Select>
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
          ) : logs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${getEventIcon(
                      log.eventType
                    )}`}
                  >
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getEventBadgeColor(log.eventType) as any}>
                        {log.eventType.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.details}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      {log.agentId && <span>Agent #{log.agentId}</span>}
                      {log.realtorId && <span>Realtor #{log.realtorId}</span>}
                      {log.templateId && <span>Template #{log.templateId}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activity logs found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
