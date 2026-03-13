'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, CheckCircle2, Eye, EyeOff } from 'lucide-react'

interface RealtorCredentials {
  email: string
  firstName: string
  lastName: string
  tempPassword: string
}

interface RealtorCredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  credentials: RealtorCredentials | null
  isReactivation?: boolean
  agentName?: string // For admin context - shows which agent the email was sent from
}

export default function RealtorCredentialsModal({
  isOpen,
  onClose,
  credentials,
  isReactivation = false,
  agentName,
}: RealtorCredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    await navigator.clipboard.writeText(text)
    if (type === 'email') {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } else {
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  const handleClose = () => {
    setShowPassword(false)
    setCopiedEmail(false)
    setCopiedPassword(false)
    onClose()
  }

  if (!credentials) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0" closeClassName="text-white hover:text-gray-300">
        <DialogHeader className="bg-[#1a2332] text-white p-6">
          <DialogTitle className="font-mono text-lg font-bold uppercase tracking-wider">
            {isReactivation ? 'Realtor Reactivated' : 'Realtor Invited'}
          </DialogTitle>
          <DialogDescription className="text-gray-300 font-mono text-sm">
            {isReactivation
              ? 'A new password has been generated and a welcome email has been sent.'
              : 'The realtor has been invited and a welcome email has been sent.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="bg-green-50 border border-green-200 p-4">
            <p className="text-green-800 font-mono font-medium">
              {isReactivation ? 'Account reactivated!' : 'Invitation sent successfully!'}
            </p>
            <p className="text-green-700 text-sm font-mono mt-1">
              Share these credentials with {credentials.firstName}:
            </p>
            {agentName && (
              <p className="text-green-600 text-sm font-mono mt-2">
                Email sent from: <span className="font-medium">{agentName}</span>
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 space-y-4">
            <div>
              <Label className="text-gray-500 text-xs font-mono uppercase tracking-wider">Realtor Name</Label>
              <p className="font-mono font-medium text-base">
                {credentials.firstName} {credentials.lastName}
              </p>
            </div>

            <div>
              <Label className="text-gray-500 text-xs font-mono uppercase tracking-wider">Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-base flex-1">{credentials.email}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(credentials.email, 'email')}
                >
                  {copiedEmail ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-gray-500 text-xs font-mono uppercase tracking-wider">Temporary Password</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-yellow-100 px-3 py-2 font-mono text-base">
                  {showPassword ? credentials.tempPassword : '••••••••••••'}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(credentials.tempPassword, 'password')}
                >
                  {copiedPassword ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-sm text-amber-600 font-mono">
            The realtor will be prompted to change their password on first login.
          </p>

          <Button onClick={handleClose} className="w-full bg-[#1a2332] hover:bg-[#2a3342] font-mono uppercase tracking-wider">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
