'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
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
import { User, Shield, AlertCircle, CheckCircle2, Lock, Loader2, Palette, Check, ImageIcon, Upload, Trash2 } from 'lucide-react'
import xano from '@/services/xano'
import { useBranding, BRAND_COLORS } from '@/context/BrandingContext'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const { brandColor, setBrandColor, logo, setLogo } = useBranding()

  // Branding state
  const [brandingDialogOpen, setBrandingDialogOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(brandColor)

  // Logo state
  const [logoDialogOpen, setLogoDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (max 500KB for localStorage)
      if (file.size > 500 * 1024) {
        alert('Image size should be less than 500KB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogo(base64String)
        setLogoDialogOpen(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogo(null)
    setLogoDialogOpen(false)
  }

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

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">Settings</h1>
        <p className="text-base text-gray-500 mt-1">
          Manage your admin account settings
        </p>
      </div>

      {/* Profile and Branding side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile Info */}
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <User className="h-5 w-5 text-white flex-shrink-0" />
            <span className="text-white font-semibold text-sm sm:text-base">Profile</span>
          </div>
          <CardContent className="p-4 sm:p-6 bg-white space-y-4 sm:space-y-6 rounded-b-lg">
            <p className="text-sm sm:text-base text-gray-700">Your admin account information</p>
            <div className="space-y-4 sm:space-y-5">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Name</Label>
                <p className="text-gray-900 font-medium text-base sm:text-lg break-words">{user?.name || 'Admin'}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Email</Label>
                <p className="text-gray-900 font-medium text-base sm:text-lg break-all">{user?.email || ''}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Role</Label>
                <div>
                  <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full text-[#0077B6] border border-[#0077B6] bg-white capitalize">
                    {user?.role || 'admin'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <Palette className="h-5 w-5 text-white flex-shrink-0" />
            <span className="text-white font-semibold text-sm sm:text-base">Branding</span>
          </div>
          <CardContent className="p-4 sm:p-6 bg-white space-y-4 sm:space-y-6 rounded-b-lg">
            <p className="text-sm sm:text-base text-gray-700">Customize the portal appearance</p>

            {/* Portal Color */}
            <div className="space-y-4 sm:space-y-5">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Portal Color</Label>
                <p className="text-sm sm:text-base text-gray-700">
                  Set the primary color for sidebar and headers
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: brandColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-base sm:text-lg truncate">
                      {BRAND_COLORS.find(c => c.value === brandColor)?.name || 'Custom'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{brandColor}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedColor(brandColor)
                    setBrandingDialogOpen(true)
                  }}
                  className="rounded-lg text-sm h-10 w-full sm:w-auto"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>

            {/* Portal Logo */}
            <div className="space-y-4 sm:space-y-5 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <Label className="text-xs sm:text-sm font-medium text-gray-500">Portal Logo</Label>
                <p className="text-sm sm:text-base text-gray-700">
                  Upload a custom logo for the sidebar (all users)
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain border-2 border-gray-300 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#0077B6] flex items-center justify-center text-white text-xs sm:text-sm font-bold border-2 border-gray-300 flex-shrink-0">
                      CP
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-base sm:text-lg">
                      {logo ? 'Custom Logo' : 'Default Logo'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {logo ? 'Custom image uploaded' : 'Using default CP logo'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setLogoDialogOpen(true)}
                  className="rounded-lg text-sm h-10 w-full sm:w-auto"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security - full width below */}
      <div className="w-full md:w-1/2">
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <Shield className="h-5 w-5 text-white flex-shrink-0" />
            <span className="text-white font-semibold text-sm sm:text-base">Security</span>
          </div>
          <CardContent className="p-4 sm:p-6 bg-white space-y-4 sm:space-y-6 rounded-b-lg">
            <p className="text-sm sm:text-base text-gray-700">Manage your account security settings</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-t border-gray-100">
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
      </div>

      {/* Branding Color Dialog */}
      <Dialog open={brandingDialogOpen} onOpenChange={setBrandingDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-lg border-0 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg" style={{ backgroundColor: selectedColor }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 sm:gap-3 text-white font-semibold text-sm sm:text-base">
                <Palette className="h-5 w-5 flex-shrink-0" />
                Portal Branding
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <p className="text-xs sm:text-sm text-gray-500">
              Select a primary color for your portal. This will change the sidebar, headers, and accent colors.
            </p>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative aspect-square rounded-lg border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-gray-900 scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className={`h-5 w-5 sm:h-6 sm:w-6 ${color.textColor === 'white' ? 'text-white' : 'text-gray-900'}`} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-gray-500">
                Selected Color
              </Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: selectedColor }}
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {BRAND_COLORS.find(c => c.value === selectedColor)?.name || 'Custom'}
                  </p>
                  <p className="text-xs text-gray-500">{selectedColor}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setBrandingDialogOpen(false)}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-lg"
                style={{ backgroundColor: selectedColor }}
                onClick={() => {
                  setBrandColor(selectedColor)
                  setBrandingDialogOpen(false)
                }}
              >
                Apply Color
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs sm:text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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

      {/* Logo Upload Dialog */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-lg border-0 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 sm:gap-3 text-white font-semibold text-sm sm:text-base">
                <ImageIcon className="h-5 w-5 flex-shrink-0" />
                Portal Logo
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <p className="text-xs sm:text-sm text-gray-500">
              Upload a custom logo for the sidebar. This will be visible to all users (admins, agents, and realtors).
            </p>

            {/* Current Logo Preview */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 border-2 border-dashed border-gray-200 bg-gray-50 rounded-lg">
              <Label className="text-xs sm:text-sm font-medium text-gray-500">
                Current Logo
              </Label>
              {logo ? (
                <img
                  src={logo}
                  alt="Current Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0077B6] rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  CP
                </div>
              )}
              <p className="text-xs text-gray-500">
                {logo ? 'Custom logo uploaded' : 'Default logo'}
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {/* Upload guidelines */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>Recommended size: 40x40 pixels</p>
              <p>Max file size: 500KB</p>
              <p>Supported formats: PNG, JPG, SVG</p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              {logo && (
                <Button
                  variant="outline"
                  onClick={handleRemoveLogo}
                  className="rounded-lg text-red-600 border-red-600 hover:bg-red-50 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setLogoDialogOpen(false)}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-lg"
                style={{ backgroundColor: brandColor }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
