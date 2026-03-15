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
import { Save, User, Shield, CreditCard, AlertCircle, CheckCircle2, Lock, Bell, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import xano from '@/services/xano'

export default function AgentSettingsPage() {
  const { user } = useAuth()
  const { brandColor } = useBranding()
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [agentData, setAgentData] = useState<any>(null)
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

  // Notification preferences
  const [templateNotificationsEnabled, setTemplateNotificationsEnabled] = useState(true)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)

  useEffect(() => {
    loadAgentProfile()
  }, [])

  const loadAgentProfile = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getMyAgentProfile()
      if (data) {
        setAgentData(data)
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
        })
        // Set notification preference (default to true if not set)
        setTemplateNotificationsEnabled(data.templateNotificationsEnabled !== false)
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
      const { error } = await xano.updateAgentProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
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

  const handleToggleTemplateNotifications = async (enabled: boolean) => {
    setIsSavingNotifications(true)
    try {
      const { error } = await xano.updateAgentProfile({
        templateNotificationsEnabled: enabled,
      })

      if (!error) {
        setTemplateNotificationsEnabled(enabled)
      }
    } catch (err) {
      console.error('Failed to update notification preference:', err)
    } finally {
      setIsSavingNotifications(false)
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
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="dot-matrix text-xl sm:text-2xl text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Profile Settings */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <User className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">Profile</span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base text-gray-700">Update your personal information</p>

              {saveError && (
                <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{saveError}</span>
                </div>
              )}
              {saveSuccess && (
                <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs sm:text-sm">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Profile saved successfully!</span>
                </div>
              )}

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm font-medium text-gray-500">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    className="rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium text-gray-500">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    className="rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                  />
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-gray-500">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="rounded-lg text-sm h-10 w-full sm:w-auto"
                  style={{ backgroundColor: brandColor }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <Shield className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">Security</span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base text-gray-700">Manage your account security settings</p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4 border-t border-gray-100">
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Password</p>
                  <p className="text-sm sm:text-base text-gray-700 mt-1">
                    Update your account password
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPasswordDialogOpen(true)}
                  className="rounded-lg text-sm h-10 w-full sm:w-auto"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <Bell className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">Notifications</span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base text-gray-700">Manage your email notification preferences</p>

              <div className="flex items-start sm:items-center justify-between gap-3 py-3 sm:py-4 border-t border-gray-100">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">New Template Notifications</p>
                  <p className="text-xs sm:text-base text-gray-700">
                    Receive emails when new templates are published
                  </p>
                </div>
                <Switch
                  checked={templateNotificationsEnabled}
                  onCheckedChange={handleToggleTemplateNotifications}
                  disabled={isSavingNotifications}
                  className="flex-shrink-0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Plan Info */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <CreditCard className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">Your Plan</span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 text-xs sm:text-sm">Status</span>
                <span className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full capitalize ${
                  agentData?.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {agentData?.status || 'Loading...'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-gray-600 text-xs sm:text-sm">Billing Period</span>
                <span className="font-medium text-gray-900 text-sm sm:text-base">Monthly</span>
              </div>
              <div className="border-t border-gray-100 pt-3 sm:pt-4">
                <Button
                  variant="outline"
                  className="w-full rounded-lg text-sm h-10"
                  onClick={() => {
                    window.open('/api/billing/portal', '_blank')
                  }}
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={resetPasswordDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-lg border-0 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 sm:gap-3 text-white font-semibold text-sm sm:text-base">
                <Lock className="h-5 w-5 flex-shrink-0" />
                Change Password
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <p className="text-xs sm:text-sm text-gray-500">
              Enter your current password and choose a new one.
            </p>

            {passwordError && (
              <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs sm:text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="currentPassword" className="text-xs sm:text-sm font-medium text-gray-500">
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
                  className="pl-10 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="newPassword" className="text-xs sm:text-sm font-medium text-gray-500">
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
                  className="pl-10 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-gray-500">
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
                  className="pl-10 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={resetPasswordDialog}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-lg"
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