'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Upload, Link as LinkIcon, Save, Image as ImageIcon, Phone, AlertCircle } from 'lucide-react'
import xano from '@/services/xano'
import { markBrandingVisited } from '@/lib/onboarding'

export default function AgentBrandingPage() {
  // Mark branding as visited for onboarding progress
  useEffect(() => {
    markBrandingVisited()
  }, [])
  const { user } = useAuth()
  const [agentId, setAgentId] = useState<number | null>(null)
  const [agentName, setAgentName] = useState({ firstName: '', lastName: '' })
  const [branding, setBranding] = useState({
    phone: '',
    brandColor: '#2563eb',
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
          brandColor: data.brandColor || '#2563eb',
          logoUrl: data.logoUrl || '',
          calendlyLink: data.calendlyLink || '',
          cmaLink: data.cmaLink || '',
          bio: data.bio || '',
        })
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
        // Debug: log the response to see its structure
        console.log('Upload response:', JSON.stringify(data, null, 2))

        // Handle different Xano response formats for file URL
        const logoUrl = data.file?.url || data.file?.path || data.url || data.path || (typeof data === 'string' ? data : null)
        if (logoUrl) {
          setBranding((prev) => ({ ...prev, logoUrl }))
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
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
        <p className="text-gray-500 mt-1">
          Customize how your portal appears to your realtors
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Your contact details visible to realtors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={branding.phone}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="(555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Upload your company logo to be displayed on your portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {isUploading ? (
                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                  <p className="text-xs text-gray-500">
                    Recommended: 200x200px, PNG or JPG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Color */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Color</CardTitle>
              <CardDescription>
                Choose a primary color for your portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="color"
                    value={branding.brandColor}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, brandColor: e.target.value }))
                    }
                    className="h-12 w-12 rounded-lg cursor-pointer border-0"
                  />
                </div>
                <Input
                  value={branding.brandColor}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, brandColor: e.target.value }))
                  }
                  className="w-32 font-mono"
                  placeholder="#2563eb"
                />
                <div className="flex gap-2">
                  {['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#f97316'].map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setBranding((prev) => ({ ...prev, brandColor: color }))
                        }
                        className="h-8 w-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>External Links</CardTitle>
              <CardDescription>
                Add links to your scheduling and CMA tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calendly">Calendly Link</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="calendly"
                    value={branding.calendlyLink}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, calendlyLink: e.target.value }))
                    }
                    placeholder="https://calendly.com/your-link"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cma">CMA Tool Link</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="cma"
                    value={branding.cmaLink}
                    onChange={(e) =>
                      setBranding((prev) => ({ ...prev, cmaLink: e.target.value }))
                    }
                    placeholder="https://cma-tool.com/your-link"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
              <CardDescription>
                Write a short bio that will be displayed to your realtors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={branding.bio}
                onChange={(e) =>
                  setBranding((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Tell your realtors about yourself and your services..."
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-2">
                {branding.bio.length}/500 characters
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            {saveSuccess && (
              <span className="text-sm text-green-600">Changes saved successfully!</span>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How your portal will appear to realtors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: branding.brandColor }}
                  >
                    {branding.logoUrl ? (
                      <img
                        src={branding.logoUrl}
                        alt="Logo"
                        className="h-full w-full object-contain rounded-lg"
                      />
                    ) : (
                      agentName.firstName?.[0] || 'A'
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {agentName.firstName} {agentName.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">Mortgage Agent</p>
                    {branding.phone && (
                      <p className="text-xs text-gray-400">{branding.phone}</p>
                    )}
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    style={{ backgroundColor: branding.brandColor }}
                    disabled
                  >
                    Book a Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    View Templates
                  </Button>
                </div>
                {branding.bio && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm text-gray-600 line-clamp-4">
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
