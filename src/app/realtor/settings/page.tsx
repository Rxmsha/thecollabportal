'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/context/BrandingContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Save, User, Shield, AlertCircle, CheckCircle2, Lock, Loader2 } from 'lucide-react'
import xano from '@/services/xano'

export default function RealtorSettingsPage() {
  const { user } = useAuth()
  const { brandColor } = useBranding()
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    brokerage: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Change password state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    loadRealtorProfile()
  }, [])

  const loadRealtorProfile = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getMyRealtorProfile()
      if (data) {
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          brokerage: data.brokerage || '',
        })
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError('')

    try {
      const { error } = await xano.updateRealtorProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        brokerage: profile.brokerage,
      })

      if (error) {
        setSaveError(error)
      } else {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
      setSaveError('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all fields')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    setIsChangingPassword(true)

    try {
      const { data, error } = await xano.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      if (error) {
        setPasswordError(error)
      } else {
        setPasswordSuccess(true)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          setPasswordDialogOpen(false)
          setPasswordSuccess(false)
        }, 2000)
      }
    } catch (err) {
      setPasswordError('Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const resetPasswordDialog = () => {
    setPasswordDialogOpen(false)
    setPasswordError('')
    setPasswordSuccess(false)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">SETTINGS</h1>
        <p className="text-base text-gray-900 mt-1 font-mono">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Settings */}
        <Card className="border-0 overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
            <User className="h-5 w-5 text-white" />
            <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">Profile</span>
          </div>
          <CardContent className="p-6 bg-white space-y-6">
            <p className="text-base text-gray-900 font-mono">Update your personal information</p>

            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-mono">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-mono">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                Profile saved successfully!
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-mono text-sm uppercase tracking-wider text-gray-900">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="rounded-none font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-mono text-sm uppercase tracking-wider text-gray-900">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="rounded-none font-mono"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-sm uppercase tracking-wider text-gray-900">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="rounded-none font-mono bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 font-mono">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-mono text-sm uppercase tracking-wider text-gray-900">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="rounded-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brokerage" className="font-mono text-sm uppercase tracking-wider text-gray-900">
                Brokerage
              </Label>
              <Input
                id="brokerage"
                value={profile.brokerage}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, brokerage: e.target.value }))
                }
                className="rounded-none font-mono"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="rounded-none font-mono uppercase tracking-wider text-sm h-10"
                style={{ backgroundColor: brandColor }}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-0 overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
            <Shield className="h-5 w-5 text-white" />
            <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">Security</span>
          </div>
          <CardContent className="p-6 bg-white space-y-6">
            <p className="text-base text-gray-900 font-mono">Manage your account security settings</p>

            <div className="flex items-center justify-between py-4 border-t border-gray-100">
              <div>
                <p className="font-mono font-medium text-gray-900 uppercase tracking-wider text-base">Password</p>
                <p className="text-base text-gray-900 font-mono mt-1">
                  Update your account password
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setPasswordDialogOpen(true)}
                className="rounded-none font-mono uppercase tracking-wider text-sm h-10"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={resetPasswordDialog}>
        <DialogContent className="sm:max-w-md p-0 gap-0 rounded-none border-0 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: brandColor }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-white font-mono uppercase tracking-wider">
                <Lock className="h-5 w-5" />
                Change Password
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-900 font-mono">
              Enter your current password and choose a new one.
            </p>

            {passwordError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-mono">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-mono">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                Password changed successfully!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="font-mono text-xs uppercase tracking-wider text-gray-900">
                Current Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="pl-10 rounded-none font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-mono text-xs uppercase tracking-wider text-gray-900">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="pl-10 rounded-none font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-mono text-xs uppercase tracking-wider text-gray-900">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="pl-10 rounded-none font-mono"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={resetPasswordDialog}
                className="flex-1 rounded-none font-mono uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-none font-mono uppercase tracking-wider"
                style={{ backgroundColor: brandColor }}
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
