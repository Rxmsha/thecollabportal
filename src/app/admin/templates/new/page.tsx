'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

export default function NewTemplatePage() {
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/templates')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Template</h1>
          <p className="text-gray-500 mt-1">Add a new template to the library</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>Fill in the information for your new template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={template.title}
              onChange={(e) => setTemplate((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter template title"
            />
          </div>

          {/* Category and Format */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={template.category}
                onValueChange={(value) => setTemplate((prev) => ({ ...prev, category: value as TemplateCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="flyer">Flyer</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={template.format}
                onValueChange={(value) => setTemplate((prev) => ({ ...prev, format: value as TemplateFormat }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            <Label>Description</Label>
            <Textarea
              value={template.shortDescription}
              onChange={(e) => setTemplate((prev) => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="Brief description of the template"
              rows={3}
            />
          </div>

          {/* Preview Image */}
          <div className="space-y-2">
            <Label>Preview Image (optional)</Label>
            {template.previewImageUrl ? (
              <div className="relative w-full max-w-md">
                <img
                  src={template.previewImageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
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
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  {isUploadingImage ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload className="h-10 w-10" />
                      <span>Click to upload image</span>
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
            <Label>Download/Edit Link *</Label>
            <Input
              value={template.downloadLink}
              onChange={(e) => setTemplate((prev) => ({ ...prev, downloadLink: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={template.status}
              onValueChange={(value) => setTemplate((prev) => ({ ...prev, status: value as 'draft' | 'published' }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            <Label>Release Notes (optional)</Label>
            <Textarea
              value={template.releaseNotes}
              onChange={(e) => setTemplate((prev) => ({ ...prev, releaseNotes: e.target.value }))}
              placeholder="What's new or updated"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => router.push('/admin/templates')}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !template.title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
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
