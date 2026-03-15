'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/context/BrandingContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Mail,
  Phone,
  Calendar,
  Building,
  Send,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  MessageSquare,
  User,
  Loader2,
} from 'lucide-react'
import xano from '@/services/xano'

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

export default function RealtorContactPage() {
  const { user } = useAuth()
  const { brandColor } = useBranding()
  const [agent, setAgent] = useState<AgentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  })
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    if (user) {
      loadAgentInfo()
    }
  }, [user])

  const loadAgentInfo = async () => {
    try {
      const { data, error } = await xano.getMyAgent()
      if (data) {
        setAgent(data)
      } else if (error) {
        console.error('Failed to load agent info:', error)
      }
    } catch (error) {
      console.error('Failed to load agent info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.message.trim()) return

    setIsSending(true)
    setSendError('')

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentEmail: agent?.email,
          agentName: agent ? `${agent.firstName} ${agent.lastName}` : '',
          realtorName: user?.name,
          realtorEmail: user?.email,
          subject: formData.subject,
          message: formData.message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setIsSent(true)
      setFormData({ subject: '', message: '' })
    } catch (error: any) {
      console.error('Failed to send message:', error)
      setSendError(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  if (isSent) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-3 sm:pb-4">
          <h1 className="dot-matrix text-xl sm:text-2xl text-gray-900">Contact Agent</h1>
          <p className="text-sm sm:text-base text-gray-700 mt-1">
            Get in touch with your mortgage partner
          </p>
        </div>

        {/* Success Message */}
        <div className="max-w-xl mx-auto">
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                Message Sent
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white text-center rounded-b-lg">
              <div
                className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center mx-auto mb-3 sm:mb-4 rounded-lg"
                style={{ backgroundColor: brandColor }}
              >
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Message Sent Successfully
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                Your message has been sent to {agent?.firstName} {agent?.lastName}.
                They&apos;ll get back to you soon.
              </p>
              <Button
                onClick={() => setIsSent(false)}
                className="rounded-lg text-sm w-full sm:w-auto"
                style={{ backgroundColor: brandColor }}
              >
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="dot-matrix text-xl sm:text-2xl text-gray-900">Contact Agent</h1>
        <p className="text-sm sm:text-base text-gray-700 mt-1">
          Get in touch with your mortgage partner
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <MessageSquare className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                Send a Message
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                Have a question or need assistance? Send a message directly to your mortgage partner.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {sendError && (
                  <div className="flex items-start gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-base">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{sendError}</span>
                  </div>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="subject" className="text-gray-900 text-sm sm:text-base">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    required
                    className="rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="message" className="text-gray-900 text-sm sm:text-base">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    rows={5}
                    required
                    className="rounded-lg text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-lg text-sm h-10 sm:h-11"
                  style={{ backgroundColor: brandColor }}
                  disabled={isSending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Agent Info Sidebar - Same style as dashboard */}
        <div>
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <User className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                Your Mortgage Partner
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
              {isLoading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-gray-400" />
                </div>
              ) : agent ? (
                <div className="space-y-3 sm:space-y-4">
                  {/* Agent Info */}
                  <div className="flex items-center gap-3">
                    {agent.logoUrl ? (
                      <img
                        src={agent.logoUrl}
                        alt={agent.companyName}
                        className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-lg flex-shrink-0"
                        style={{ backgroundColor: agent.brandColor }}
                      />
                    ) : (
                      <div
                        className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-white font-bold rounded-lg text-sm sm:text-base flex-shrink-0"
                        style={{ backgroundColor: agent.brandColor }}
                      >
                        {agent.firstName[0]}{agent.lastName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {agent.firstName} {agent.lastName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{agent.companyName}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{agent.email}</span>
                    </div>
                    {agent.phone && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>{agent.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{agent.companyName}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {agent.bio && (
                    <div className="pt-3 sm:pt-4 border-t border-gray-100">
                      <p className="text-xs sm:text-sm text-gray-600">{agent.bio}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-3 sm:pt-4 border-t border-gray-100">
                    {agent.calendlyLink && (
                      <Button
                        className="w-full rounded-lg text-xs sm:text-sm h-9 sm:h-10"
                        style={{ backgroundColor: agent.brandColor }}
                        asChild
                      >
                        <a
                          href={agent.calendlyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          Book a Call
                        </a>
                      </Button>
                    )}
                    {agent.cmaLink && (
                      <Button
                        variant="outline"
                        className="w-full rounded-lg text-xs sm:text-sm h-9 sm:h-10"
                        asChild
                      >
                        <a
                          href={agent.cmaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                          CMA Tool
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-3 sm:py-4 text-sm">
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
