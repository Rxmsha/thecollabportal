'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { StatsCard } from '@/components/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserPlus,
  FileText,
  Palette,
  Wrench,
  Calculator,
  ArrowRight,
} from 'lucide-react'
import xano from '@/services/xano'

export default function AgentDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalRealtors: 0,
    activeRealtors: 0,
    seatsUsed: 0,
    seatLimit: 10,
    templatesAccessed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const { data, error } = await xano.getAgentStats()
      if (data) {
        setStats(data)
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
          title="Templates Accessed"
          value={stats.templatesAccessed}
          subtitle="this month"
          icon={FileText}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
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

      {/* Recent Activity & Tips */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Customize your branding
                  </h4>
                  <p className="text-sm text-gray-500">
                    Add your logo and brand colors to personalize your portal
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Invite your realtors
                  </h4>
                  <p className="text-sm text-gray-500">
                    Send invitations to realtors you want to collaborate with
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Explore templates & tools
                  </h4>
                  <p className="text-sm text-gray-500">
                    Browse our library of marketing templates and AI tools
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Realtors</CardTitle>
            <Link href="/agent/realtors">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.totalRealtors > 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  You have {stats.totalRealtors} realtors in your network
                </p>
                <Link href="/agent/realtors">
                  <Button variant="outline" className="mt-4">
                    Manage Realtors
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No realtors yet</p>
                <Link href="/agent/invite">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Your First Realtor
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
