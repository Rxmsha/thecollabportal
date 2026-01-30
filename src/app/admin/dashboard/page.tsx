'use client'

import React, { useState, useEffect } from 'react'
import { StatsCard } from '@/components/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
} from 'lucide-react'
import xano from '@/services/xano'
import { formatDateTime } from '@/lib/utils'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalRealtors: 0,
    activeRealtors: 0,
    totalTemplates: 0,
    publishedTemplates: 0,
  })
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [recentErrors, setRecentErrors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, logsRes, errorsRes] = await Promise.all([
        xano.getAdminStats(),
        xano.getUsageLogs({ limit: 5 }),
        xano.getErrorLogs({ resolved: false }),
      ])

      if (statsRes.data) {
        setStats(statsRes.data)
      }
      if (logsRes.data) {
        // Transform from snake_case to camelCase
        const logsArray = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data.items || [])
        const transformedLogs = logsArray.map((log: any) => ({
          id: log.id,
          eventType: log.event_type,
          details: log.details,
          createdAt: log.created_at,
        }))
        setRecentLogs(transformedLogs)
      }
      if (errorsRes.data) {
        setRecentErrors(errorsRes.data.slice(0, 3))
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'template_published':
        return 'success'
      case 'realtor_invited':
        return 'default'
      case 'realtor_activated':
        return 'success'
      case 'agent_created':
        return 'purple'
      case 'branding_updated':
        return 'orange'
      default:
        return 'secondary'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of the platform&apos;s performance and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Agents"
          value={stats.totalAgents}
          subtitle={`${stats.activeAgents} active`}
          icon={Building2}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Total Realtors"
          value={stats.totalRealtors}
          subtitle={`${stats.activeRealtors} active`}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Templates"
          value={stats.totalTemplates}
          subtitle={`${stats.publishedTemplates} published`}
          icon={FileText}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title="Active Agents"
          value={stats.activeAgents}
          subtitle={`of ${stats.totalAgents} total`}
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Recent Activity & Errors */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={getEventBadgeColor(log.eventType || '') as any}>
                        {(log.eventType || 'unknown').replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {log.details?.template_title || log.details?.agent_email || log.details?.realtor_email || ''}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Unresolved Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentErrors.length > 0 ? (
              <div className="space-y-3">
                {recentErrors.map((error) => (
                  <div
                    key={error.id}
                    className="p-3 bg-gray-50 rounded-lg border-l-4 border-red-500"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={getSeverityColor(error.severity) as any}>
                        {error.severity}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(error.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {error.scenarioName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{error.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-gray-500">No unresolved errors</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
