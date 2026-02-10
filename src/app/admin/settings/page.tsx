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
        <h1 className="dot-matrix text-2xl text-gray-900">SETTINGS</h1>
        <p className="text-base text-gray-500 mt-1 font-mono">
          Manage your admin account settings
        </p>
      </div>

      {/* Profile and Branding side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card className="border-0 overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
            <User className="h-5 w-5 text-white" />
            <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">Profile</span>
          </div>
          <CardContent className="p-6 bg-white space-y-6">
            <p className="text-base text-gray-700 font-mono">Your admin account information</p>
            <div className="space-y-5">
              <div className="space-y-1">
                <Label className="font-mono text-sm uppercase tracking-wider text-gray-500">Name</Label>
                <p className="text-gray-900 font-mono font-medium text-lg">{user?.name || 'Admin'}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-sm uppercase tracking-wider text-gray-500">Email</Label>
                <p className="text-gray-900 font-mono font-medium text-lg">{user?.email || ''}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-mono text-sm uppercase tracking-wider text-gray-500">Role</Label>
                <div>
                  <span className="inline-flex items-center px-4 py-2 text-sm font-mono uppercase tracking-wider border text-[#0077B6] border-[#0077B6] bg-white">
                    {user?.role || 'admin'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-0 overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
            <Palette className="h-5 w-5 text-white" />
            <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">Branding</span>
          </div>
          <CardContent className="p-6 bg-white space-y-6">
            <p className="text-base text-gray-700 font-mono">Customize the portal appearance</p>

            {/* Portal Color */}
            <div className="space-y-5">
              <div className="space-y-1">
                <Label className="font-mono text-sm uppercase tracking-wider text-gray-500">Portal Color</Label>
                <p className="text-base text-gray-700 font-mono">
                  Set the primary color for sidebar and headers
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 border-2 border-gray-300"
                  style={{ backgroundColor: brandColor }}
                />
                <div className="flex-1">
                  <p className="font-mono font-medium text-gray-900 text-lg">
                    {BRAND_COLORS.find(c => c.value === brandColor)?.name || 'Custom'}
                  </p>
                  <p className="text-sm font-mono text-gray-500">{brandColor}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedColor(brandColor)
                    setBrandingDialogOpen(true)
                  }}
                  className="rounded-none font-mono uppercase tracking-wider text-sm h-10"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>

            {/* Portal Logo */}
            <div className="space-y-5 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <Label className="font-mono text-sm uppercase tracking-wider text-gray-500">Portal Logo</Label>
                <p className="text-base text-gray-700 font-mono">
                  Upload a custom logo for the sidebar (all users)
                </p>
              </div>
              <div className="flex items-center gap-4">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-12 h-12 object-contain border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#0077B6] flex items-center justify-center text-white text-sm font-bold border-2 border-gray-300">
                    CP
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-mono font-medium text-gray-900 text-lg">
                    {logo ? 'Custom Logo' : 'Default Logo'}
                  </p>
                  <p className="text-sm font-mono text-gray-700">
                    {logo ? 'Custom image uploaded' : 'Using default CP logo'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setLogoDialogOpen(true)}
                  className="rounded-none font-mono uppercase tracking-wider text-sm h-10"
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
      <div className="w-full lg:w-1/2">
        <Card className="border-0 overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
            <Shield className="h-5 w-5 text-white" />
            <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">Security</span>
          </div>
          <CardContent className="p-6 bg-white space-y-6">
            <p className="text-base text-gray-700 font-mono">Manage your account security settings</p>
            <div className="flex items-center justify-between py-4 border-t border-gray-100">
              <div>
                <p className="font-mono font-medium text-gray-900 uppercase tracking-wider text-base">Password</p>
                <p className="text-base text-gray-700 font-mono mt-1">
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

      {/* Branding Color Dialog */}
      <Dialog open={brandingDialogOpen} onOpenChange={setBrandingDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 rounded-none border-0 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: selectedColor }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-white font-mono uppercase tracking-wider">
                <Palette className="h-5 w-5" />
                Portal Branding
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-500 font-mono">
              Select a primary color for your portal. This will change the sidebar, headers, and accent colors.
            </p>

            <div className="grid grid-cols-4 gap-3">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`relative aspect-square border-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-gray-900 scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className={`h-6 w-6 ${color.textColor === 'white' ? 'text-white' : 'text-gray-900'}`} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-wider text-gray-500">
                Selected Color
              </Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 border border-gray-200"
                  style={{ backgroundColor: selectedColor }}
                />
                <div>
                  <p className="font-mono font-medium text-gray-900">
                    {BRAND_COLORS.find(c => c.value === selectedColor)?.name || 'Custom'}
                  </p>
                  <p className="text-xs font-mono text-gray-500">{selectedColor}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setBrandingDialogOpen(false)}
                className="flex-1 rounded-none font-mono uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-none font-mono uppercase tracking-wider"
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
            <p className="text-sm text-gray-500 font-mono">
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
              <Label htmlFor="currentPassword" className="font-mono text-xs uppercase tracking-wider text-gray-500">
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
              <Label htmlFor="newPassword" className="font-mono text-xs uppercase tracking-wider text-gray-500">
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
              <Label htmlFor="confirmPassword" className="font-mono text-xs uppercase tracking-wider text-gray-500">
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

      {/* Logo Upload Dialog */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0 rounded-none border-0 overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: brandColor }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-white font-mono uppercase tracking-wider">
                <ImageIcon className="h-5 w-5" />
                Portal Logo
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-500 font-mono">
              Upload a custom logo for the sidebar. This will be visible to all users (admins, agents, and realtors).
            </p>

            {/* Current Logo Preview */}
            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-200 bg-gray-50">
              <Label className="font-mono text-xs uppercase tracking-wider text-gray-500">
                Current Logo
              </Label>
              {logo ? (
                <img
                  src={logo}
                  alt="Current Logo"
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <div className="w-20 h-20 bg-[#0077B6] flex items-center justify-center text-white text-2xl font-bold">
                  CP
                </div>
              )}
              <p className="text-xs font-mono text-gray-500">
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
            <div className="text-xs text-gray-500 font-mono space-y-1">
              <p>• Recommended size: 40x40 pixels</p>
              <p>• Max file size: 500KB</p>
              <p>• Supported formats: PNG, JPG, SVG</p>
            </div>

            <div className="flex gap-3 pt-4">
              {logo && (
                <Button
                  variant="outline"
                  onClick={handleRemoveLogo}
                  className="rounded-none font-mono uppercase tracking-wider text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setLogoDialogOpen(false)}
                className="flex-1 rounded-none font-mono uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-none font-mono uppercase tracking-wider"
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
