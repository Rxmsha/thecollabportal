'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Mail,
  Phone,
  Calendar,
  Building,
  Send,
  CheckCircle,
  ExternalLink,
  AlertCircle,
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
  bio: string
}

export default function RealtorContactPage() {
  const { user } = useAuth()
  const [agent, setAgent] = useState<AgentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  })
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

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

  const [sendError, setSendError] = useState('')

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
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Message Sent!
              </h2>
              <p className="text-gray-500 mb-6">
                Your message has been sent to {agent?.firstName} {agent?.lastName}.
                They&apos;ll get back to you soon.
              </p>
              <Button onClick={() => setIsSent(false)}>Send Another Message</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Your Agent</h1>
        <p className="text-gray-500 mt-1">
          Get in touch with your mortgage partner
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
              <CardDescription>
                Have a question or need assistance? Send a message directly to your
                mortgage partner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {sendError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {sendError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="What's this about?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Type your message here..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSending}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Agent Info */}
        <div>
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

                  <Separator />

                  <div className="space-y-3">
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Mail className="h-4 w-4 text-gray-400" />
                      {agent.email}
                    </a>
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <Phone className="h-4 w-4 text-gray-400" />
                        {agent.phone}
                      </a>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="h-4 w-4 text-gray-400" />
                      {agent.companyName}
                    </div>
                  </div>

                  <Separator />

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
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Unable to load agent information
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {agent?.calendlyLink && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a
                    href={agent.calendlyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule a Meeting
                  </a>
                </Button>
              )}
              {agent?.email && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${agent.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email Directly
                  </a>
                </Button>
              )}
              {agent?.phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${agent.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
