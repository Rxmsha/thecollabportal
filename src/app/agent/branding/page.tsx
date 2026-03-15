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
  Upload,
  Link as LinkIcon,
  Save,
  Image as ImageIcon,
  Phone,
  AlertCircle,
  Palette,
  User,
  ExternalLink,
  Eye,
  Check,
} from 'lucide-react'
import xano from '@/services/xano'
import { markBrandingVisited } from '@/lib/onboarding'

const BRAND_COLORS = [
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'Slate', value: '#475569' },
  { name: 'Charcoal', value: '#374151' },
  { name: 'Steel', value: '#334155' },
  { name: 'Graphite', value: '#1f2937' },
  { name: 'Forest', value: '#14532d' },
  { name: 'Burgundy', value: '#7f1d1d' },
  { name: 'Deep Blue', value: '#1e40af' },
]

export default function AgentBrandingPage() {
  const { brandColor, setBrandColor: setContextBrandColor, setProfilePhoto } = useBranding()
  // Mark branding as visited for onboarding progress
  useEffect(() => {
    markBrandingVisited()
  }, [])
  const { user } = useAuth()
  const [agentId, setAgentId] = useState<number | null>(null)
  const [agentName, setAgentName] = useState({ firstName: '', lastName: '' })
  const [branding, setBranding] = useState({
    phone: '',
    brandColor: '#1e3a5f',
    logoUrl: '',
    calendlyLink: '',
    cmaLink: '',
    bio: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadBranding()
    }
  }, [user])

  const loadBranding = async () => {
    setIsLoading(true)
    try {
      const { data, error: fetchError } = await xano.getMyAgentProfile()
      if (fetchError) {
        setError(fetchError)
      } else if (data) {
        setAgentId(data.id)
        setAgentName({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        })
        setBranding({
          phone: data.phone || '',
          brandColor: data.brandColor || '#1e3a5f',
          logoUrl: data.logoUrl || '',
          calendlyLink: data.calendlyLink || '',
          cmaLink: data.cmaLink || '',
          bio: data.bio || '',
        })
        // Update context for sidebar display
        if (data.logoUrl) {
          setProfilePhoto(data.logoUrl)
        }
        // Update brand color in context for entire portal
        if (data.brandColor) {
          setContextBrandColor(data.brandColor)
        }
      }
    } catch (err) {
      console.error('Failed to load branding:', err)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    setError('')

    if (!agentId) {
      setError('Agent ID not found')
      setIsSaving(false)
      return
    }

    try {
      const { error: saveError } = await xano.updateAgentBranding(agentId, branding)
      if (saveError) {
        setError(saveError)
      } else {
        // Update brand color in context immediately after saving
        setContextBrandColor(branding.brandColor)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save branding:', err)
      setError('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const { data, error: uploadError } = await xano.uploadFile(file)
      if (uploadError) {
        setError(uploadError)
      } else if (data) {
        console.log('Upload response:', JSON.stringify(data, null, 2))
        const logoUrl = data.file?.url || data.file?.path || data.url || data.path || (typeof data === 'string' ? data : null)
        if (logoUrl) {
          setBranding((prev) => ({ ...prev, logoUrl }))
          // Update profile photo in context for immediate sidebar display
          setProfilePhoto(logoUrl)
        } else {
          setError('Upload succeeded but no URL returned. Check console for response structure.')
        }
      }
    } catch (err) {
      console.error('Failed to upload logo:', err)
      setError('Failed to upload logo')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-700 font-mono">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="dot-matrix text-xl sm:text-2xl text-gray-900">Branding</h1>
        <p className="text-sm sm:text-base text-gray-700 mt-1">
          Customize how your portal appears to your realtors
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Contact Info */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <Phone className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                Contact Information
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                Your contact details visible to realtors
              </p>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-gray-500">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={branding.phone}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="(555) 123-4567"
                    className="pl-10 rounded-lg text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <ImageIcon className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                Logo
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                Upload your company logo to be displayed on your portal
              </p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                  {isUploading ? (
                    <div className="h-6 w-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <Label htmlFor="logo-upload" className={isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <Upload className="h-4 w-4" />
                      {isUploading ? 'Uploading...' : 'Upload Logo'}
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                    />
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-700">
                    Recommended: 200x200px, PNG or JPG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Color */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <Palette className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                Brand Color
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                Choose a primary color for your portal
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <input
                      type="color"
                      value={branding.brandColor}
                      onChange={(e) =>
                        setBranding((prev) => ({ ...prev, brandColor: e.target.value }))
                      }
                      className="h-10 w-10 sm:h-12 sm:w-12 cursor-pointer border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                  <Input
                    value={branding.brandColor}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, brandColor: e.target.value }))
                    }
                    className="w-28 sm:w-32 rounded-lg uppercase text-sm"
                    placeholder="#1a2332"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {BRAND_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setBranding((prev) => ({ ...prev, brandColor: color.value }))
                      }
                      className={`group relative h-8 w-8 sm:h-10 sm:w-10 rounded-lg border-2 transition-all ${
                        branding.brandColor === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {branding.brandColor === color.value && (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Links */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <ExternalLink className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                External Links
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg space-y-4 sm:space-y-5">
              <p className="text-sm sm:text-base text-gray-700">
                Add links to your scheduling and CMA tools
              </p>
              <div className="space-y-2">
                <Label htmlFor="calendly" className="text-xs sm:text-sm font-medium text-gray-500">
                  Calendly Link
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="calendly"
                    value={branding.calendlyLink}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, calendlyLink: e.target.value }))
                    }
                    placeholder="https://calendly.com/your-link"
                    className="pl-10 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cma" className="text-xs sm:text-sm font-medium text-gray-500">
                  CMA Tool Link
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="cma"
                    value={branding.cmaLink}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, cmaLink: e.target.value }))
                    }
                    placeholder="https://cma-tool.com/your-link"
                    className="pl-10 rounded-lg text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 overflow-hidden rounded-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <User className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                About You
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                Write a short bio that will be displayed to your realtors
              </p>
              <Textarea
                value={branding.bio}
                onChange={(e) =>
                  setBranding((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Tell your realtors about yourself and your services..."
                rows={4}
                className="rounded-lg text-sm"
              />
              <p className="text-xs sm:text-sm text-gray-700 mt-2">
                {branding.bio.length}/500 characters
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
            {saveSuccess && (
              <span className="text-sm sm:text-base text-emerald-600 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Changes saved successfully!
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg text-sm h-10 w-full sm:w-auto"
              style={{ backgroundColor: brandColor }}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="border-0 overflow-hidden rounded-lg lg:sticky lg:top-6">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: branding.brandColor }}>
              <Eye className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base">
                Preview
              </span>
            </div>
            <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                How your portal will appear to realtors
              </p>
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ backgroundColor: branding.brandColor }}
                  >
                    {branding.logoUrl ? (
                      <img
                        src={branding.logoUrl}
                        alt="Logo"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      agentName.firstName?.[0] || 'A'
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {agentName.firstName} {agentName.lastName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">Mortgage Agent</p>
                    {branding.phone && (
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{branding.phone}</p>
                    )}
                    {user?.email && (
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-200 my-3 sm:my-4" />
                <div className="space-y-2">
                  {branding.calendlyLink && (
                    <Button
                      className="w-full justify-start rounded-lg text-xs sm:text-sm h-9 sm:h-10"
                      style={{ backgroundColor: branding.brandColor }}
                      disabled
                    >
                      Book a Call
                    </Button>
                  )}
                  {branding.cmaLink && (
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-lg text-xs sm:text-sm h-9 sm:h-10"
                      disabled
                    >
                      CMA Tool
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-lg text-xs sm:text-sm h-9 sm:h-10"
                    disabled
                  >
                    View Templates
                  </Button>
                </div>
                {branding.bio && (
                  <>
                    <div className="border-t border-gray-200 my-3 sm:my-4" />
                    <p className="text-sm sm:text-base text-gray-700 line-clamp-4">
                      {branding.bio}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
