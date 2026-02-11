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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="dot-matrix text-2xl text-gray-900">CONTACT AGENT</h1>
          <p className="text-base text-gray-700 mt-1 font-mono">
            Get in touch with your mortgage partner
          </p>
        </div>

        {/* Success Message */}
        <div className="max-w-xl mx-auto">
          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <CheckCircle className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                Message Sent
              </span>
            </div>
            <CardContent className="p-6 bg-white text-center">
              <div
                className="h-16 w-16 flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: brandColor }}
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-mono font-semibold text-gray-900 mb-2">
                Message Sent Successfully
              </h2>
              <p className="text-base text-gray-700 font-mono mb-6">
                Your message has been sent to {agent?.firstName} {agent?.lastName}.
                They&apos;ll get back to you soon.
              </p>
              <Button
                onClick={() => setIsSent(false)}
                className="rounded-none font-mono uppercase tracking-wider text-sm"
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">CONTACT AGENT</h1>
        <p className="text-base text-gray-700 mt-1 font-mono">
          Get in touch with your mortgage partner
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <MessageSquare className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                Send a Message
              </span>
            </div>
            <CardContent className="p-6 bg-white">
              <p className="text-base text-gray-700 font-mono mb-6">
                Have a question or need assistance? Send a message directly to your mortgage partner.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {sendError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 text-base font-mono">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {sendError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-mono text-gray-900 text-base">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    required
                    className="rounded-none font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-mono text-gray-900 text-base">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    rows={6}
                    required
                    className="rounded-none font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-none font-mono uppercase tracking-wider text-sm h-11"
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
          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <User className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                Your Mortgage Partner
              </span>
            </div>
            <CardContent className="p-6 bg-white">
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
                        className="h-12 w-12 object-cover"
                        style={{ backgroundColor: agent.brandColor }}
                      />
                    ) : (
                      <div
                        className="h-12 w-12 flex items-center justify-center text-white font-mono font-bold"
                        style={{ backgroundColor: agent.brandColor }}
                      >
                        {agent.firstName[0]}{agent.lastName[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-mono font-semibold text-gray-900 uppercase tracking-wider text-sm">
                        {agent.firstName} {agent.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">{agent.companyName}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {agent.email}
                    </div>
                    {agent.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {agent.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                      <Building className="h-4 w-4 text-gray-400" />
                      {agent.companyName}
                    </div>
                  </div>

                  {/* Bio */}
                  {agent.bio && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-mono">{agent.bio}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {agent.calendlyLink && (
                      <Button
                        className="w-full rounded-none font-mono uppercase tracking-wider text-sm"
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
                        className="w-full rounded-none font-mono uppercase tracking-wider text-sm"
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
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 font-mono">
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
