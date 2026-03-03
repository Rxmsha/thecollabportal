'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/context/BrandingContext'
import { Card, CardContent } from '@/components/ui/card'
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
  LayoutDashboard,
  Zap,
  BookOpen,
  ArrowRight,
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
  const { brandColor } = useBranding()
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

  // Track resource click
  const handleResourceClick = async (resourceId: number) => {
    try {
      await xano.trackResourceClick(resourceId)
    } catch (error) {
      // Silent fail - don't block navigation
      console.error('Failed to track resource click:', error)
    }
  }

  const quickActions = [
    {
      title: 'Invite Realtor',
      description: 'Add a new realtor to your network',
      icon: UserPlus,
      href: '/agent/invite',
      color: '#0077B6',
    },
    {
      title: 'Update Branding',
      description: 'Customize your portal appearance',
      icon: Palette,
      href: '/agent/branding',
      color: '#7C3AED',
    },
    {
      title: 'Browse Templates',
      description: 'Access marketing templates',
      icon: FileText,
      href: '/agent/templates',
      color: '#059669',
    },
    {
      title: 'AI Tools',
      description: 'Generate content with AI',
      icon: Wrench,
      href: '/agent/tools',
      color: '#EA580C',
    },
  ]

  return (
    <div className="space-y-6">
      {/* First Login Password Change Modal */}
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onComplete={() => setShowFirstLoginModal(false)}
      />

      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-base text-gray-700 mt-1">
          Here's an overview of your portal activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-4 py-3 flex items-center gap-2 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <Users className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Total Realtors</span>
          </div>
          <CardContent className="p-4 bg-white rounded-b-lg">
            <p className="text-3xl font-bold text-gray-900">{stats.totalRealtors}</p>
            <p className="text-base text-gray-700 mt-1">{stats.activeRealtors} active</p>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-4 py-3 flex items-center gap-2 bg-emerald-600 rounded-t-lg">
            <Users className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Active Realtors</span>
          </div>
          <CardContent className="p-4 bg-white rounded-b-lg">
            <p className="text-3xl font-bold text-emerald-600">{stats.activeRealtors}</p>
            <p className="text-base text-gray-700 mt-1">currently active</p>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-4 py-3 flex items-center gap-2 bg-amber-600 rounded-t-lg">
            <UserPlus className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Pending Invites</span>
          </div>
          <CardContent className="p-4 bg-white rounded-b-lg">
            <p className="text-3xl font-bold text-amber-600">{stats.pendingRealtors}</p>
            <p className="text-base text-gray-700 mt-1">awaiting activation</p>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-4 py-3 flex items-center gap-2 bg-purple-600 rounded-t-lg">
            <LayoutDashboard className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Seat Usage</span>
          </div>
          <CardContent className="p-4 bg-white rounded-b-lg">
            <p className="text-3xl font-bold text-purple-600">
              {stats.seatsUsed}/{stats.seatLimit}
            </p>
            <Progress value={seatUsagePercent} className="h-2 mt-2" />
            <p className="text-base text-gray-700 mt-1">
              {stats.seatLimit - stats.seatsUsed} seats remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 overflow-hidden rounded-lg">
        <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
          <Zap className="h-5 w-5 text-white" />
          <span className="text-white font-semibold text-base">Quick Actions</span>
        </div>
        <CardContent className="p-6 bg-white rounded-b-lg">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <div className="group p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-all cursor-pointer h-full">
                    <div className="mb-3">
                      <Icon className="h-6 w-6" style={{ color: action.color }} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      {action.title}
                    </h3>
                    <p className="text-base text-gray-700 mt-1">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-sm font-medium" style={{ color: action.color }}>
                      Go <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resources for Your Clients */}
      {resources.length > 0 && (
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <BookOpen className="h-5 w-5 text-white" />
            <span className="text-white font-semibold text-base">Resources for Your Clients</span>
          </div>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <div className="space-y-4">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex border border-gray-200 bg-white overflow-hidden rounded-lg"
                >
                  <div className="flex-1 p-4">
                    <h4 className="font-semibold text-gray-900 text-base">
                      {resource.title}
                    </h4>
                    <p className="text-base text-gray-700 mt-1 mb-3">
                      {resource.description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-sm"
                      asChild
                    >
                      <a
                        href={resource.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleResourceClick(resource.id)}
                      >
                        {resource.buttonText}
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  </div>
                  <div className="w-3 rounded-r-lg" style={{ backgroundColor: brandColor }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started - Only show if not completed */}
      {!onboarding.completed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-6 py-4 flex items-center gap-3 bg-emerald-600 rounded-t-lg">
              <Check className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-base">Getting Started</span>
            </div>
            <CardContent className="p-6 bg-white rounded-b-lg">
              <div className="space-y-4">
                <Link href="/agent/branding">
                  <div className={`flex items-start gap-4 p-4 border rounded-lg transition-all cursor-pointer ${
                    onboarding.visitedBranding
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0 ${
                      onboarding.visitedBranding
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {onboarding.visitedBranding ? <Check className="h-4 w-4" /> : '1'}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-base ${
                        onboarding.visitedBranding ? 'text-emerald-700' : 'text-gray-900'
                      }`}>
                        Customize Your Branding
                      </h4>
                      <p className={`text-base mt-1 ${
                        onboarding.visitedBranding ? 'text-emerald-600' : 'text-gray-700'
                      }`}>
                        Add your logo and brand colors to personalize your portal
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/agent/invite">
                  <div className={`flex items-start gap-4 p-4 border rounded-lg transition-all cursor-pointer ${
                    onboarding.visitedInvite
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0 ${
                      onboarding.visitedInvite
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {onboarding.visitedInvite ? <Check className="h-4 w-4" /> : '2'}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-base ${
                        onboarding.visitedInvite ? 'text-emerald-700' : 'text-gray-900'
                      }`}>
                        Invite Your Realtors
                      </h4>
                      <p className={`text-base mt-1 ${
                        onboarding.visitedInvite ? 'text-emerald-600' : 'text-gray-700'
                      }`}>
                        Send invitations to realtors you want to collaborate with
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/agent/templates">
                  <div className={`flex items-start gap-4 p-4 border rounded-lg transition-all cursor-pointer ${
                    onboarding.visitedTemplates
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0 ${
                      onboarding.visitedTemplates
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {onboarding.visitedTemplates ? <Check className="h-4 w-4" /> : '3'}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-base ${
                        onboarding.visitedTemplates ? 'text-emerald-700' : 'text-gray-900'
                      }`}>
                        Explore Templates & Tools
                      </h4>
                      <p className={`text-base mt-1 ${
                        onboarding.visitedTemplates ? 'text-emerald-600' : 'text-gray-700'
                      }`}>
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
