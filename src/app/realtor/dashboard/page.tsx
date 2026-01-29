'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Wrench,
  Calculator,
  Calendar,
  Mail,
  Phone,
  Building,
  ExternalLink,
} from 'lucide-react'
import xano from '@/services/xano'
import FirstLoginModal from '@/components/FirstLoginModal'

interface AgentInfo {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  brandColor: string
  logoUrl: string
  calendlyLink: string
  cmaLink: string
  bio: string
}

export default function RealtorDashboardPage() {
  const { user } = useAuth()
  const [agent, setAgent] = useState<AgentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false)

  useEffect(() => {
    if (user?.agentId) {
      loadAgentInfo()
    }
  }, [user])

  // Show first login modal for realtors who haven't completed first login
  useEffect(() => {
    if (user && user.role === 'realtor' && user.firstLoginCompleted === false) {
      setShowFirstLoginModal(true)
    }
  }, [user])

  const loadAgentInfo = async () => {
    try {
      const { data, error } = await xano.getAgent(user!.agentId!)
      if (data) {
        setAgent(data)
      }
    } catch (error) {
      console.error('Failed to load agent info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickLinks = [
    {
      title: 'Browse Templates',
      description: 'Access marketing templates',
      icon: FileText,
      href: '/realtor/templates',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'AI Tools',
      description: 'Generate content with AI',
      icon: Wrench,
      href: '/realtor/tools',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Calculators',
      description: 'Mortgage calculators',
      icon: Calculator,
      href: '/realtor/calculators',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Contact Agent',
      description: 'Get in touch',
      icon: Mail,
      href: '/realtor/contact',
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* First Login Modal for password change */}
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onComplete={() => setShowFirstLoginModal(false)}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Access resources and tools provided by your mortgage partner
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link key={link.title} href={link.href}>
                      <div className="group p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer">
                        <div
                          className={`h-10 w-10 rounded-lg ${link.color} flex items-center justify-center mb-3`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Resources for Your Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Pre-Approval Process
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Help your clients understand the mortgage pre-approval process
                    and what documents they need.
                  </p>
                  <Button size="sm" variant="outline">
                    Learn More
                  </Button>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    First-Time Homebuyer Guide
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Share this comprehensive guide with first-time buyers to help
                    them navigate the process.
                  </p>
                  <Button size="sm" variant="outline">
                    Download Guide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Mortgage Partner</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              ) : agent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      {agent.logoUrl ? (
                        <img
                          src={agent.logoUrl}
                          alt={agent.companyName}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback
                          style={{ backgroundColor: agent.brandColor }}
                          className="text-white text-lg"
                        >
                          {agent.firstName[0]}
                          {agent.lastName[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {agent.firstName} {agent.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{agent.companyName}</p>
                    </div>
                  </div>

                  {agent.bio && (
                    <>
                      <Separator />
                      <p className="text-sm text-gray-600">{agent.bio}</p>
                    </>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {agent.email}
                    </div>
                    {agent.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {agent.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4 text-gray-400" />
                      {agent.companyName}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {agent.calendlyLink && (
                      <Button
                        className="w-full"
                        style={{ backgroundColor: agent.brandColor }}
                        asChild
                      >
                        <a
                          href={agent.calendlyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book a Call
                        </a>
                      </Button>
                    )}
                    {agent.cmaLink && (
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href={agent.cmaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          CMA Tool
                        </a>
                      </Button>
                    )}
                    <Link href="/realtor/contact">
                      <Button variant="outline" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Unable to load agent information
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
