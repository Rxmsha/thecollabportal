'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/context/BrandingContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  FileText,
  Wrench,
  Calculator,
  Mail,
  Phone,
  Building,
  ExternalLink,
  Calendar,
  User,
  Briefcase,
  Loader2,
  StickyNote,
  List,
  Save,
  Lock,
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

interface Resource {
  id: number
  title: string
  description: string
  buttonText: string
  resourceUrl: string
  resourceType: 'link' | 'file'
}

export default function RealtorDashboardPage() {
  const { user } = useAuth()
  const { brandColor } = useBranding()
  const [agent, setAgent] = useState<AgentInfo | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const notesRef = React.useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  // Show first login modal for realtors who haven't completed first login
  useEffect(() => {
    if (user && user.role === 'realtor' && user.firstLoginCompleted === false) {
      setShowFirstLoginModal(true)
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load resources, agent info, and realtor profile in parallel
      const [resourcesResponse, agentResponse, profileResponse] = await Promise.all([
        xano.getResources(),
        xano.getMyAgent(),
        xano.getMyRealtorProfile(),
      ])

      if (resourcesResponse.data) {
        setResources(resourcesResponse.data)
      }
      if (resourcesResponse.error) {
        console.error('Failed to load resources:', resourcesResponse.error)
      }

      if (agentResponse.data) {
        setAgent(agentResponse.data)
      } else if (agentResponse.error) {
        console.error('Failed to load agent:', agentResponse.error)
      }

      if (profileResponse.data) {
        setNotes(profileResponse.data.notes || '')
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveNotes = async () => {
    setIsSavingNotes(true)
    try {
      await xano.updateRealtorProfile({ notes })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save notes:', error)
    } finally {
      setIsSavingNotes(false)
    }
  }

  // Track resource click
  const handleResourceClick = async (resourceId: number) => {
    try {
      await xano.trackResourceClick(resourceId)
    } catch (error) {
      // Silent fail - don't block navigation
      console.error('Failed to track resource click:', error)
    }
  }

  const insertBullet = () => {
    const textarea = notesRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = notes.lastIndexOf('\n', start - 1) + 1
    const beforeLine = notes.substring(0, lineStart)
    const afterStart = notes.substring(lineStart)
    const newText = beforeLine + '• ' + afterStart
    const cursorOffset = start + 2

    setNotes(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(cursorOffset, cursorOffset)
    }, 0)
  }

  const quickLinks = [
    {
      title: 'Browse Templates',
      description: 'Access marketing templates',
      icon: FileText,
      href: '/realtor/templates',
      iconColor: 'text-blue-600',
    },
    {
      title: 'AI Tools',
      description: 'Generate content with AI',
      icon: Wrench,
      href: '/realtor/tools',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Calculators',
      description: 'Mortgage calculators',
      icon: Calculator,
      href: '/realtor/calculators',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Contact Agent',
      description: 'Get in touch',
      icon: Mail,
      href: '/realtor/contact',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* First Login Modal for password change */}
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onComplete={() => setShowFirstLoginModal(false)}
      />

      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">
          Welcome, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-base text-gray-500 mt-1">
          Access resources and tools provided by your mortgage partner
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Links */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <Briefcase className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-base">Quick Access</span>
            </div>
            <CardContent className="p-6 bg-white rounded-b-lg">
              <div className="grid gap-4 sm:grid-cols-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link key={link.title} href={link.href}>
                      <div className="group p-4 border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer bg-white rounded-lg">
                        <div className={`${link.iconColor} mb-3`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700">
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

          {/* Resources for Your Clients */}
          {resources.length > 0 && (
            <Card className="border-0 overflow-hidden rounded-lg">
              <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
                <FileText className="h-5 w-5 text-white" />
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
        </div>

        {/* Agent Info Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <User className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-base">Your Mortgage Partner</span>
            </div>
            <CardContent className="p-6 bg-white rounded-b-lg">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : agent ? (
                <div className="space-y-4">
                  {/* Agent Info */}
                  <div className="flex items-center gap-3">
                    {agent.logoUrl ? (
                      <img
                        src={agent.logoUrl}
                        alt={agent.companyName}
                        className="h-12 w-12 object-cover rounded-lg"
                        style={{ backgroundColor: agent.brandColor }}
                      />
                    ) : (
                      <div
                        className="h-12 w-12 flex items-center justify-center text-white font-bold rounded-lg"
                        style={{ backgroundColor: agent.brandColor }}
                      >
                        {agent.firstName[0]}{agent.lastName[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {agent.firstName} {agent.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{agent.companyName}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
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

                  {/* Bio */}
                  {agent.bio && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{agent.bio}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {agent.calendlyLink && (
                      <Button
                        className="w-full rounded-lg text-sm"
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
                      <Button
                        variant="outline"
                        className="w-full rounded-lg text-sm"
                        asChild
                      >
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
                    <Link href="/realtor/contact" className="block">
                      <Button
                        variant="outline"
                        className="w-full rounded-lg text-sm"
                      >
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

          {/* My Notes Card */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <StickyNote className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-base">My Notes</span>
            </div>
            <CardContent className="p-4 bg-white space-y-3 rounded-b-lg">
              {/* Privacy Notice */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500">
                  Private notes - not visible to your mortgage agent
                </p>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 border-b border-gray-200 pb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={insertBullet}
                  title="Add bullet point"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Notes Textarea */}
              <Textarea
                ref={notesRef}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your personal notes here..."
                className="min-h-[150px] text-sm rounded-lg resize-none"
              />

              {/* Save Button */}
              <Button
                onClick={saveNotes}
                disabled={isSavingNotes}
                className="w-full rounded-lg text-sm"
                style={{ backgroundColor: brandColor }}
              >
                {isSavingNotes ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : notesSaved ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
