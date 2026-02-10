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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import xano from '@/services/xano'
import { useAuth } from '@/context/AuthContext'

interface FirstLoginModalProps {
  isOpen: boolean
  onComplete: () => void
}

export default function FirstLoginModal({ isOpen, onComplete }: FirstLoginModalProps) {
  const { updateUser, user } = useAuth()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)

  const handleChangePassword = async () => {
    setError('')
    setSuccess(false)

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    setIsChanging(true)

    try {
      const { error: changeError } = await xano.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      if (changeError) {
        setError(changeError)
        setIsChanging(false)
        return
      }

      // Mark first login as completed
      const { data: completeData } = await xano.completeFirstLogin()

      // If user is a realtor, activate their realtor status
      if (completeData?.role === 'realtor' && completeData?.realtorId) {
        await xano.activateMyRealtorStatus()
      }

      setSuccess(true)

      // Update local user state
      if (user) {
        updateUser({ ...user, firstLoginCompleted: true })
      }

      setTimeout(() => {
        onComplete()
      }, 1500)
    } catch (err) {
      setError('Failed to change password')
      setIsChanging(false)
    }
  }

  const handleDoItLater = async () => {
    setIsDismissing(true)
    try {
      // Mark first login as completed even if they skip
      const { data: completeData } = await xano.completeFirstLogin()

      // If user is a realtor, activate their realtor status
      if (completeData?.role === 'realtor' && completeData?.realtorId) {
        await xano.activateMyRealtorStatus()
      }

      // Update local user state
      if (user) {
        updateUser({ ...user, firstLoginCompleted: true })
      }

      onComplete()
    } catch (err) {
      console.error('Failed to dismiss:', err)
      // Still close the modal even if the API fails
      onComplete()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDoItLater() }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[90vh] flex flex-col" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="bg-[#1a2332] px-6 py-4 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-white font-mono uppercase tracking-wider">Set Your Password</DialogTitle>
            <DialogDescription className="text-gray-400 font-mono text-sm">
              For your security, change your temporary password to something memorable.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-mono">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-mono">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Password changed successfully!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tempPassword" className="font-mono text-xs uppercase tracking-wider text-gray-600">Temporary Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="tempPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="pl-10 font-mono"
                disabled={isChanging || success}
              />
            </div>
            <p className="text-xs text-gray-500 font-mono">This is the password from your welcome email</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPass" className="font-mono text-xs uppercase tracking-wider text-gray-600">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="newPass"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className="pl-10 font-mono"
                disabled={isChanging || success}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPass" className="font-mono text-xs uppercase tracking-wider text-gray-600">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPass"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="pl-10 font-mono"
                disabled={isChanging || success}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleChangePassword}
              disabled={isChanging || success}
              className="w-full bg-[#1a2332] hover:bg-[#2a3342] font-mono uppercase tracking-wider"
            >
              {isChanging ? 'Changing Password...' : 'Change Password'}
            </Button>

            <button
              onClick={handleDoItLater}
              disabled={isDismissing || isChanging || success}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 font-mono"
            >
              {isDismissing ? 'Please wait...' : "I'll do it later"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}