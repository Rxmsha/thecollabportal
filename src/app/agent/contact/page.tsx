'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react'
import { useBranding } from '@/context/BrandingContext'

export default function AgentContactSupportPage() {
  const { user } = useAuth()
  const { brandColor } = useBranding()
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  })
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [sendError, setSendError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.message.trim()) return

    setIsSending(true)
    setSendError('')

    try {
      const response = await fetch('/api/contact/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName: user?.name,
          agentEmail: user?.email,
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
          <h1 className="dot-matrix text-2xl text-gray-900">Contact Support</h1>
          <p className="text-base text-gray-700 mt-1">
            Get help from The Collab Portal team
          </p>
        </div>

        {/* Centered Content */}
        <div className="max-w-xl mx-auto">
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <CheckCircle className="h-5 w-5 text-white" />
              <span className="text-white font-semibold text-base">
                Message Sent
              </span>
            </div>
            <CardContent className="p-6 bg-white text-center rounded-b-lg">
              <div
                className="h-16 w-16 flex items-center justify-center mx-auto mb-4 rounded-lg"
                style={{ backgroundColor: brandColor }}
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Message Sent Successfully
              </h2>
              <p className="text-base text-gray-700 mb-6">
                Your message has been sent to the support team.
                We&apos;ll get back to you as soon as possible.
              </p>
              <Button
                onClick={() => setIsSent(false)}
                className="rounded-lg text-sm"
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
        <h1 className="dot-matrix text-2xl text-gray-900">Contact Support</h1>
        <p className="text-base text-gray-700 mt-1">
          Get help from The Collab Portal team
        </p>
      </div>

      {/* Centered Content */}
      <div className="max-w-xl mx-auto">
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-6 py-4 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <MessageSquare className="h-5 w-5 text-white" />
            <span className="text-white font-semibold text-base">
              Send a Message
            </span>
          </div>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <p className="text-base text-gray-700 mb-6">
              Have a question, feedback, or need assistance? Send a message to our support team.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {sendError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-base">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {sendError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-900 text-base">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="What's this about?"
                  required
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-900 text-base">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Describe your question or issue in detail..."
                  rows={6}
                  required
                  className="rounded-lg"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-lg text-sm h-11"
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
    </div>
  )
}
