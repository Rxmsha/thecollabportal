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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">BRANDING</h1>
        <p className="text-base text-gray-700 mt-1 font-mono">
          Customize how your portal appears to your realtors
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-mono">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <Phone className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                Contact Information
              </span>
            </div>
            <CardContent className="p-6 bg-white">
              <p className="text-base text-gray-700 font-mono mb-4">
                Your contact details visible to realtors
              </p>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-mono text-sm uppercase tracking-wider text-gray-500">
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
                    className="pl-10 rounded-none font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <ImageIcon className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                Logo
              </span>
            </div>
            <CardContent className="p-6 bg-white">
              <p className="text-base text-gray-700 font-mono mb-4">
                Upload your company logo to be displayed on your portal
              </p>
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {isUploading ? (
                    <div className="h-6 w-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  ) : branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-upload" className={isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 transition-colors font-mono text-sm uppercase tracking-wider">
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
                  <p className="text-sm text-gray-700 font-mono">
                    Recommended: 200x200px, PNG or JPG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Color */}
          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <Palette className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                Brand Color
              </span>
            </div>
            <CardContent className="p-6 bg-white">
              <p className="text-base text-gray-700 font-mono mb-4">
                Choose a primary color for your portal
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input
                      type="color"
                      value={branding.brandColor}
                      onChange={(e) =>
                        setBranding((prev) => ({ ...prev, brandColor: e.target.value }))
                      }
                      className="h-12 w-12 cursor-pointer border-2 border-gray-200"
                    />
                  </div>
                  <Input
                    value={branding.brandColor}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, brandColor: e.target.value }))
                    }
                    className="w-32 font-mono rounded-none uppercase"
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
                      className={`group relative h-10 w-10 border-2 transition-all ${
                        branding.brandColor === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {branding.brandColor === color.value && (
                        <Check className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Links */}
          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <ExternalLink className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                External Links
              </span>
            </div>
            <CardContent className="p-6 bg-white space-y-5">
              <p className="text-base text-gray-700 font-mono">
                Add links to your scheduling and CMA tools
              </p>
              <div className="space-y-2">
                <Label htmlFor="calendly" className="font-mono text-sm uppercase tracking-wider text-gray-500">
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
                    className="pl-10 rounded-none font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cma" className="font-mono text-sm uppercase tracking-wider text-gray-500">
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
                    className="pl-10 rounded-none font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
              <User className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                About You
              </span>
            </div>
            <CardContent className="p-6 bg-white">
              <p className="text-base text-gray-700 font-mono mb-4">
                Write a short bio that will be displayed to your realtors
              </p>
              <Textarea
                value={branding.bio}
                onChange={(e) =>
                  setBranding((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Tell your realtors about yourself and your services..."
                rows={5}
                className="rounded-none font-mono"
              />
              <p className="text-sm text-gray-700 font-mono mt-2">
                {branding.bio.length}/500 characters
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            {saveSuccess && (
              <span className="text-base text-emerald-600 font-mono flex items-center gap-2">
                <Check className="h-4 w-4" />
                Changes saved successfully!
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-none font-mono uppercase tracking-wider text-sm h-10"
              style={{ backgroundColor: brandColor }}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="border-0 overflow-hidden sticky top-6">
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: branding.brandColor }}>
              <Eye className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                Preview
              </span>
            </div>
            <CardContent className="p-6 bg-white">
              <p className="text-base text-gray-700 font-mono mb-4">
                How your portal will appear to realtors
              </p>
              <div className="border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-12 w-12 flex items-center justify-center text-white font-mono font-bold"
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
                  <div>
                    <h3 className="font-mono font-semibold text-gray-900 uppercase tracking-wider text-base">
                      {agentName.firstName} {agentName.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 font-mono">Mortgage Agent</p>
                    {branding.phone && (
                      <p className="text-sm text-gray-500 font-mono">{branding.phone}</p>
                    )}
                    {user?.email && (
                      <p className="text-sm text-gray-500 font-mono">{user.email}</p>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-200 my-4" />
                <div className="space-y-2">
                  {branding.calendlyLink && (
                    <Button
                      className="w-full justify-start rounded-none font-mono text-sm uppercase tracking-wider"
                      style={{ backgroundColor: branding.brandColor }}
                      disabled
                    >
                      Book a Call
                    </Button>
                  )}
                  {branding.cmaLink && (
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-none font-mono text-sm uppercase tracking-wider"
                      disabled
                    >
                      CMA Tool
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-none font-mono text-sm uppercase tracking-wider"
                    disabled
                  >
                    View Templates
                  </Button>
                </div>
                {branding.bio && (
                  <>
                    <div className="border-t border-gray-200 my-4" />
                    <p className="text-base text-gray-700 font-mono line-clamp-4">
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
