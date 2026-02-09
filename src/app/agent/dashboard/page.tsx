'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { StatsCard } from '@/components/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import FirstLoginModal from '@/components/FirstLoginModal'
import {
  Users,
  UserPlus,
  FileText,
  Palette,
  Wrench,
  Calculator,
  Check,
  ExternalLink,
} from 'lucide-react'
import xano from '@/services/xano'
import { getOnboardingProgress, type OnboardingProgress } from '@/lib/onboarding'

interface Resource {
  id: number
  title: string
  description: string
  buttonText: string
  resourceUrl: string
  resourceType: 'link' | 'file'
}

export default function AgentDashboardPage() {
  const { user } = useAuth()
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false)
  const [resources, setResources] = useState<Resource[]>([])
  const [onboarding, setOnboarding] = useState<OnboardingProgress>({
    visitedBranding: false,
    visitedInvite: false,
    visitedTemplates: false,
    completed: false,
  })

  // Load onboarding progress on mount
  useEffect(() => {
    setOnboarding(getOnboardingProgress())
  }, [])

  // Show first login modal if user hasn't completed first login
  useEffect(() => {
    if (user && user.role === 'agent' && user.firstLoginCompleted === false) {
      setShowFirstLoginModal(true)
    }
  }, [user])
  const [stats, setStats] = useState({
    totalRealtors: 0,
    activeRealtors: 0,
    pendingRealtors: 0,
    seatsUsed: 0,
    seatLimit: 10,
    seatsRemaining: 10,
    occupiedSeats: 0,
    canInvite: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const [statsResponse, resourcesResponse] = await Promise.all([
        xano.getAgentStats(),
        xano.getResources(),
      ])
      if (statsResponse.data) {
        setStats(statsResponse.data)
      }
      if (statsResponse.error) {
        console.error('Failed to load stats:', statsResponse.error)
      }
      if (resourcesResponse.data) {
        setResources(resourcesResponse.data)
      }
      if (resourcesResponse.error) {
        console.error('Failed to load resources:', resourcesResponse.error)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const seatUsagePercent = (stats.seatsUsed / stats.seatLimit) * 100

  const quickActions = [
    {
      title: 'Invite Realtor',
      description: 'Add a new realtor to your network',
      icon: UserPlus,
      href: '/agent/invite',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Update Branding',
      description: 'Customize your portal appearance',
      icon: Palette,
      href: '/agent/branding',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Browse Templates',
      description: 'Access marketing templates',
      icon: FileText,
      href: '/agent/templates',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'AI Tools',
      description: 'Generate content with AI',
      icon: Wrench,
      href: '/agent/tools',
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* First Login Password Change Modal */}
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onComplete={() => setShowFirstLoginModal(false)}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s an overview of your portal activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Realtors"
          value={stats.totalRealtors}
          subtitle={`${stats.activeRealtors} active`}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Active Realtors"
          value={stats.activeRealtors}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Pending Invites"
          value={stats.pendingRealtors}
          subtitle="awaiting activation"
          icon={UserPlus}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-gray-500">Seat Usage</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.seatsUsed}/{stats.seatLimit}
                </p>
                <Progress value={seatUsagePercent} className="h-2" />
                <p className="text-xs text-gray-500">
                  {stats.seatLimit - stats.seatsUsed} seats remaining
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <div className="group p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer">
                    <div
                      className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resources for Your Clients */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resources for Your Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <div
                  key={resource.id}
                  className={`p-4 rounded-lg ${
                    index % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'
                  }`}
                >
                  <h4 className="font-medium text-gray-900 mb-2">
                    {resource.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {resource.description}
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={resource.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {resource.buttonText}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started - Only show if not completed */}
      {!onboarding.completed && (
        <div className="max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/agent/branding">
                  <div className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    onboarding.visitedBranding ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      onboarding.visitedBranding
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-white'
                    }`}>
                      {onboarding.visitedBranding ? <Check className="h-4 w-4" /> : '1'}
                    </div>
                    <div>
                      <h4 className={`font-medium ${onboarding.visitedBranding ? 'text-green-700' : 'text-gray-900'}`}>
                        Customize your branding
                      </h4>
                      <p className={`text-sm ${onboarding.visitedBranding ? 'text-green-600' : 'text-gray-500'}`}>
                        Add your logo and brand colors to personalize your portal
                      </p>
                    </div>
                  </div>
                </Link>
                <Link href="/agent/invite">
                  <div className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    onboarding.visitedInvite ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      onboarding.visitedInvite
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-white'
                    }`}>
                      {onboarding.visitedInvite ? <Check className="h-4 w-4" /> : '2'}
                    </div>
                    <div>
                      <h4 className={`font-medium ${onboarding.visitedInvite ? 'text-green-700' : 'text-gray-900'}`}>
                        Invite your realtors
                      </h4>
                      <p className={`text-sm ${onboarding.visitedInvite ? 'text-green-600' : 'text-gray-500'}`}>
                        Send invitations to realtors you want to collaborate with
                      </p>
                    </div>
                  </div>
                </Link>
                <Link href="/agent/templates">
                  <div className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    onboarding.visitedTemplates ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium ${
                      onboarding.visitedTemplates
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-white'
                    }`}>
                      {onboarding.visitedTemplates ? <Check className="h-4 w-4" /> : '3'}
                    </div>
                    <div>
                      <h4 className={`font-medium ${onboarding.visitedTemplates ? 'text-green-700' : 'text-gray-900'}`}>
                        Explore templates & tools
                      </h4>
                      <p className={`text-sm ${onboarding.visitedTemplates ? 'text-green-600' : 'text-gray-500'}`}>
                        Browse our library of marketing templates and AI tools
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
