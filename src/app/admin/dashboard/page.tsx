'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  Mail,
  MousePointerClick,
  Calendar,
  UserPlus,
  LayoutTemplate,
  FolderOpen,
} from 'lucide-react'
import xano from '@/services/xano'
import { formatDateTime } from '@/lib/utils'
import { useBranding } from '@/context/BrandingContext'

interface AgentData {
  id: number
  firstName: string
  lastName: string
  email: string
  companyName: string
  status: string
  createdAt: string
}

interface TemplateData {
  id: number
  title: string
  status: string
  publishedAt: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const { brandColor } = useBranding()
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    pendingAgents: 0,
    totalRealtors: 0,
    activeRealtors: 0,
    totalTemplates: 0,
    publishedTemplates: 0,
    totalResources: 0,
    totalResourceClicks: 0,
    totalEmailsDelivered: 0,
  })
  const [recentAgents, setRecentAgents] = useState<AgentData[]>([])
  const [templatesThisMonth, setTemplatesThisMonth] = useState(0)
  const [agentsThisMonth, setAgentsThisMonth] = useState(0)
  const [realtorsThisMonth, setRealtorsThisMonth] = useState(0)
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [recentErrors, setRecentErrors] = useState<any[]>([])
  const [popularContent, setPopularContent] = useState<{
    popularResources: Array<{ id: number; title: string; category: string; clickCount: number }>
    popularTemplates: Array<{ id: number; title: string; category: string; clickCount: number }>
  }>({ popularResources: [], popularTemplates: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, logsRes, errorsRes, popularRes] = await Promise.all([
        xano.getAdminStats(),
        xano.getUsageLogs({ limit: 5 }),
        xano.getErrorLogs({ resolved: false }),
        xano.getPopularContent(5),
      ])

      if (statsRes.data) {
        setStats({
          totalAgents: statsRes.data.totalAgents,
          activeAgents: statsRes.data.activeAgents,
          pendingAgents: statsRes.data.pendingAgents || 0,
          totalRealtors: statsRes.data.totalRealtors,
          activeRealtors: statsRes.data.activeRealtors,
          totalTemplates: statsRes.data.totalTemplates,
          publishedTemplates: statsRes.data.publishedTemplates,
          totalResources: statsRes.data.totalResources || 0,
          totalResourceClicks: statsRes.data.totalResourceClicks || 0,
          totalEmailsDelivered: statsRes.data.totalEmailsDelivered || 0,
        })

        // Calculate this month's stats from the data
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        if (statsRes.data.allAgents) {
          const agents = statsRes.data.allAgents as AgentData[]
          // Sort by createdAt descending and take recent 5
          const sorted = [...agents].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setRecentAgents(sorted.slice(0, 5))

          // Count this month's agents
          const thisMonthAgents = agents.filter(a =>
            new Date(a.createdAt) >= startOfMonth
          ).length
          setAgentsThisMonth(thisMonthAgents)
        }

        if (statsRes.data.publishedTemplatesList) {
          const templates = statsRes.data.publishedTemplatesList as TemplateData[]
          // Count templates published this month
          const thisMonthTemplates = templates.filter(t => {
            const publishedDate = t.publishedAt ? new Date(t.publishedAt) : new Date(t.createdAt)
            return publishedDate >= startOfMonth
          }).length
          setTemplatesThisMonth(thisMonthTemplates)
        }
      }

      if (logsRes.data) {
        const rawData = logsRes.data as any
        const logsArray = Array.isArray(rawData) ? rawData : (rawData.items || [])
        const transformedLogs = logsArray.map((log: any) => ({
          id: log.id,
          eventType: log.event_type || log.eventType,
          details: log.details,
          createdAt: log.created_at || log.createdAt,
        }))
        setRecentLogs(transformedLogs)
      }

      if (errorsRes.data) {
        setRecentErrors(errorsRes.data.slice(0, 3))
      }

      if (popularRes.data) {
        // Sort by clickCount descending and take top 5
        const sortedResources = (popularRes.data.popularResources || [])
          .sort((a: any, b: any) => b.clickCount - a.clickCount)
          .slice(0, 5)
        const sortedTemplates = (popularRes.data.popularTemplates || [])
          .sort((a: any, b: any) => b.clickCount - a.clickCount)
          .slice(0, 5)
        setPopularContent({
          popularResources: sortedResources,
          popularTemplates: sortedTemplates,
        })
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
      case 'template_created':
      case 'realtor_activated':
      case 'agent_activated':
        return 'success'
      case 'realtor_invited':
      case 'template_notification_sent_to_realtors':
        return 'default'
      case 'agent_created':
      case 'template_notification_sent_to_agents':
        return 'purple'
      case 'branding_updated':
      case 'resource_created':
      case 'resource_updated':
        return 'orange'
      case 'template_deleted':
      case 'resource_deleted':
      case 'agent_deactivated':
      case 'realtor_deactivated_by_agent':
      case 'realtor_deactivated_by_admin':
        return 'destructive'
      case 'agent_reactivated':
      case 'realtor_reactivated_by_agent':
      case 'realtor_reactivated_by_admin':
        return 'success'
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
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform overview and key metrics
        </p>
      </div>

      {/* Primary Stats Grid - 4 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Agents</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAgents}</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                  <Building2 className="h-6 w-6" style={{ color: brandColor }} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="success" className="text-xs">{stats.activeAgents} active</Badge>
                {stats.pendingAgents > 0 && (
                  <Badge variant="warning" className="text-xs">{stats.pendingAgents} pending</Badge>
                )}
              </div>
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-1 text-xs">
                <UserPlus className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">+{agentsThisMonth}</span>
                <span className="text-gray-500">this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Realtors</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRealtors}</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                  <Users className="h-6 w-6" style={{ color: brandColor }} />
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="success" className="text-xs">{stats.activeRealtors} active</Badge>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp className="h-3 w-3" />
                <span>{stats.totalRealtors > 0 ? Math.round((stats.activeRealtors / stats.totalRealtors) * 100) : 0}% activation rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Templates</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTemplates}</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                  <LayoutTemplate className="h-6 w-6" style={{ color: brandColor }} />
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="success" className="text-xs">{stats.publishedTemplates} published</Badge>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="text-blue-600 font-medium">{templatesThisMonth}</span>
                <span className="text-gray-500">published this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Resources</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalResources}</p>
                </div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandColor}15` }}>
                  <FolderOpen className="h-6 w-6" style={{ color: brandColor }} />
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="secondary" className="text-xs">{stats.totalResourceClicks} total clicks</Badge>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-1 text-xs">
                <MousePointerClick className="h-3 w-3 text-purple-600" />
                <span className="text-gray-500">Click tracking active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Stats */}
      <Card className="border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Emails Delivered</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalEmailsDelivered}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Content */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {/* Most Clicked Resources */}
        <Card className="border-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-4 w-4" style={{ color: brandColor }} />
              Most Clicked Resources
            </h2>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : popularContent.popularResources.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {popularContent.popularResources.map((resource, index) => (
                  <div key={resource.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-sm font-bold text-gray-400 w-5">#{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{resource.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{resource.category.replace(/-/g, ' ')}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                        <MousePointerClick className="h-3 w-3 mr-1" />
                        {resource.clickCount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">No resource clicks yet</p>
            )}
          </CardContent>
        </Card>

        {/* Most Clicked Templates */}
        <Card className="border-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-4 w-4" style={{ color: brandColor }} />
              Most Clicked Templates
            </h2>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : popularContent.popularTemplates.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {popularContent.popularTemplates.map((template, index) => (
                  <div key={template.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-sm font-bold text-gray-400 w-5">#{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{template.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{template.category.replace(/-/g, ' ')}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                        <MousePointerClick className="h-3 w-3 mr-1" />
                        {template.clickCount}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">No template clicks yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recently Added Agents */}
        <Card className="border-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-900">
              <UserPlus className="h-4 w-4" style={{ color: brandColor }} />
              Recently Added Agents
            </h2>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentAgents.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentAgents.map((agent) => (
                  <div key={agent.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {agent.firstName} {agent.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{agent.companyName}</p>
                      </div>
                      <Badge
                        variant={agent.status === 'active' ? 'success' : 'secondary'}
                        className="text-xs ml-2"
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">No agents yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-900">
              <Activity className="h-4 w-4" style={{ color: brandColor }} />
              Recent Activity
            </h2>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={getEventBadgeColor(log.eventType || '') as any} className="text-xs flex-shrink-0">
                        {(log.eventType || 'unknown').replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {log.details?.template_title ||
                       log.details?.agent_email ||
                       log.details?.realtor_email ||
                       log.details?.email ||
                       log.details?.name ||
                       ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Unresolved Errors */}
        <Card className="border-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-gray-900">
              <AlertCircle className="h-4 w-4" style={{ color: brandColor }} />
              Unresolved Errors
            </h2>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentErrors.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentErrors.map((error) => (
                  <div key={error.id} className="p-3 border-l-4 border-l-red-500 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={getSeverityColor(error.severity) as any} className="text-xs">
                        {error.severity}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(error.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {error.scenarioName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{error.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-gray-500 text-sm">No unresolved errors</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
