'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'
import xano from '@/services/xano'
import { TemplateCategory, TemplateFormat, TemplateAudience } from '@/types'
import { useBranding } from '@/context/BrandingContext'

export default function NewTemplatePage() {
  const { brandColor } = useBranding()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [template, setTemplate] = useState({
    title: '',
    category: 'social-media' as TemplateCategory,
    format: 'canva' as TemplateFormat,
    audience: ['mortgage_agents', 'realtors'] as TemplateAudience[],
    shortDescription: '',
    downloadLink: '',
    previewImageUrl: '',
    status: 'draft' as 'draft' | 'published',
    releaseNotes: '',
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB')
      return
    }

    setIsUploadingImage(true)
    setUploadError('')

    try {
      const { data, error } = await xano.uploadFile(file)
      if (error) {
        setUploadError(error)
      } else if (data?.file?.url) {
        setTemplate((prev) => ({ ...prev, previewImageUrl: data.file.url }))
      }
    } catch (err) {
      setUploadError('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleCreate = async () => {
    if (!template.title.trim()) return

    setIsCreating(true)
    try {
      const { data, error } = await xano.createTemplate(template)
      if (data && !error) {
        router.push('/admin/templates')
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/templates')}
          className="hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="dot-matrix text-2xl text-gray-900">Create New Template</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new template to the library</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-0 overflow-hidden rounded-lg">
        <div className="px-6 py-4 rounded-t-lg" style={{ backgroundColor: brandColor }}>
          <h2 className="text-white font-semibold">Template Details</h2>
          <p className="text-gray-300 text-sm">Fill in the information for your new template</p>
        </div>
        <CardContent className="p-6 space-y-6 rounded-b-lg">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Title *</Label>
            <Input
              value={template.title}
              onChange={(e) => setTemplate((prev) => ({ ...prev, title: e.target.value }))}
              className="rounded-lg"
            />
          </div>

          {/* Category and Format */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Category</Label>
              <Select
                value={template.category}
                onValueChange={(value) => setTemplate((prev) => ({ ...prev, category: value as TemplateCategory }))}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="flyer">Flyer</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="business-card">Business Cards</SelectItem>
                  <SelectItem value="print">Print Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Format</Label>
              <Select
                value={template.format}
                onValueChange={(value) => setTemplate((prev) => ({ ...prev, format: value as TemplateFormat }))}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="canva">Canva</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Description</Label>
            <Textarea
              value={template.shortDescription}
              onChange={(e) => setTemplate((prev) => ({ ...prev, shortDescription: e.target.value }))}
              rows={3}
              className="rounded-lg"
            />
          </div>

          {/* Preview Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Preview Image (optional)</Label>
            {template.previewImageUrl ? (
              <div className="relative w-full max-w-md">
                <img
                  src={template.previewImageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-lg"
                  onClick={() => setTemplate((prev) => ({ ...prev, previewImageUrl: '' }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="relative w-full max-w-md">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploadingImage}
                />
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0077B6] transition-colors bg-gray-50">
                  {isUploadingImage ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0077B6]" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload className="h-10 w-10" />
                      <span className="text-sm">Click to upload image</span>
                      <span className="text-xs text-gray-400">Max 5MB</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          </div>

          {/* Download Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Download/Edit Link *</Label>
            <Input
              value={template.downloadLink}
              onChange={(e) => setTemplate((prev) => ({ ...prev, downloadLink: e.target.value }))}
              className="rounded-lg"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Status</Label>
            <Select
              value={template.status}
              onValueChange={(value) => setTemplate((prev) => ({ ...prev, status: value as 'draft' | 'published' }))}
            >
              <SelectTrigger className="w-48 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Published templates are visible to agents and realtors. Publishing will also send notification emails.
            </p>
          </div>

          {/* Release Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Release Notes (optional)</Label>
            <Textarea
              value={template.releaseNotes}
              onChange={(e) => setTemplate((prev) => ({ ...prev, releaseNotes: e.target.value }))}
              rows={2}
              className="rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/templates')}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !template.title.trim()}
              className="rounded-lg"
              style={{ backgroundColor: brandColor }}
            >
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
