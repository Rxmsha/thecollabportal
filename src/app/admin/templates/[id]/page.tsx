'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft, Loader2, Upload, X, Pencil, Trash2, Eye, EyeOff,
  ExternalLink, Send, Users, User, Check, AlertTriangle, FileText, Image, Mail, Film, FileIcon
} from 'lucide-react'
import xano from '@/services/xano'
import { Template, TemplateCategory, TemplateFormat } from '@/types'
import { useBranding } from '@/context/BrandingContext'

export default function TemplateDetailPage() {
  const { brandColor } = useBranding()
  const router = useRouter()
  const params = useParams()
  const templateId = Number(params.id)

  const [template, setTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPublishedWarning, setShowPublishedWarning] = useState(false)

  // Edit state
  const [editData, setEditData] = useState<{
    title: string
    category: TemplateCategory
    format: TemplateFormat
    shortDescription: string
    downloadLink: string
    previewImageUrl: string
    releaseNotes: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Status update
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Delete
  const [isDeleting, setIsDeleting] = useState(false)

  // Notification
  const [notificationMode, setNotificationMode] = useState<'all' | 'specific'>('all')
  const [agents, setAgents] = useState<{ id: number; firstName: string; lastName: string; email: string }[]>([])
  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [notificationResult, setNotificationResult] = useState<{ success: boolean; agentCount: number } | null>(null)

  // Realtor Notification
  const [realtorNotificationMode, setRealtorNotificationMode] = useState<'all' | 'specific'>('all')
  const [realtors, setRealtors] = useState<{ id: number; firstName: string; lastName: string; email: string; agentName: string }[]>([])
  const [selectedRealtorIds, setSelectedRealtorIds] = useState<number[]>([])
  const [isLoadingRealtors, setIsLoadingRealtors] = useState(false)
  const [isSendingRealtorNotification, setIsSendingRealtorNotification] = useState(false)
  const [realtorNotificationResult, setRealtorNotificationResult] = useState<{ success: boolean; count: number } | null>(null)

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getTemplate(templateId)
      if (data && !error) {
        // Transform snake_case to camelCase
        setTemplate({
          id: data.id,
          title: data.title,
          category: data.category,
          format: data.format,
          audience: data.audience,
          shortDescription: data.short_description,
          downloadLink: data.download_link,
          previewImageUrl: data.preview_image_url,
          status: data.status,
          releaseNotes: data.release_notes,
          publishedAt: data.published_at,
          createdAt: data.created_at,
          createdBy: data.created_by,
        })
      }
    } catch (error) {
      console.error('Failed to load template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartEdit = () => {
    if (!template) return
    if (template.status === 'published') {
      setShowPublishedWarning(true)
      return
    }
    startEditMode()
  }

  const startEditMode = () => {
    if (!template) return
    setEditData({
      title: template.title,
      category: template.category,
      format: template.format,
      shortDescription: template.shortDescription || '',
      downloadLink: template.downloadLink || '',
      previewImageUrl: template.previewImageUrl || '',
      releaseNotes: template.releaseNotes || '',
    })
    setShowPublishedWarning(false)
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditData(null)
    setUploadError('')
  }

  const handleSaveEdit = async () => {
    if (!template || !editData) return

    setIsSaving(true)
    try {
      // Check if user cleared the preview image
      const clearedImage = !editData.previewImageUrl && template.previewImageUrl

      const { error } = await xano.updateTemplate(template.id, {
        title: editData.title,
        category: editData.category,
        format: editData.format,
        short_description: editData.shortDescription,
        download_link: editData.downloadLink,
        preview_image_url: editData.previewImageUrl || undefined,
        clear_preview_image: clearedImage ? true : undefined,
        release_notes: editData.releaseNotes,
        status: 'draft',
      })

      if (!error) {
        setTemplate({
          ...template,
          ...editData,
          status: 'draft',
        })
        setIsEditMode(false)
        setEditData(null)
      }
    } catch (error) {
      console.error('Failed to update template:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editData) return

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
        setEditData({ ...editData, previewImageUrl: data.file.url })
      }
    } catch (err) {
      setUploadError('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleUpdateStatus = async (newStatus: 'draft' | 'published') => {
    if (!template) return

    setIsUpdatingStatus(true)
    try {
      const { error } = await xano.updateTemplateStatus(template.id, newStatus)
      if (!error) {
        setTemplate({ ...template, status: newStatus })

        // If publishing, send notifications to realtors
        // Note: Agent notifications are handled by the backend's updateTemplateStatus
        if (newStatus === 'published') {
          // Send to realtors (fire and forget - don't block UI)
          xano.sendTemplateNotificationToRealtors(template.id).then(({ data, error }) => {
            if (error) {
              xano.logError('template_publish', 'realtor_notification_failed', `Failed to notify realtors for template ${template.id}: ${error}`)
            } else {
              console.log('Realtor notifications sent:', data?.realtorEmailsSent || 0)
            }
          }).catch(err => {
            xano.logError('template_publish', 'realtor_notification_failed', `Exception notifying realtors for template ${template.id}: ${err.message}`)
          })
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!template) return

    setIsDeleting(true)
    try {
      const { error } = await xano.deleteTemplate(template.id)
      if (!error) {
        router.push('/admin/templates')
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const loadAgents = async () => {
    setIsLoadingAgents(true)
    try {
      const { data } = await xano.getAgents()
      if (data) {
        setAgents(data.filter((a: any) => a.status === 'active').map((a: any) => ({
          id: a.id,
          firstName: a.firstName || '',
          lastName: a.lastName || '',
          email: a.email || ''
        })))
      }
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setIsLoadingAgents(false)
    }
  }

  const handleNotificationModeChange = (mode: 'all' | 'specific') => {
    setNotificationMode(mode)
    if (mode === 'specific' && agents.length === 0) {
      loadAgents()
    }
    setSelectedAgentIds([])
    setNotificationResult(null)
  }

  const toggleAgentSelection = (agentId: number) => {
    setSelectedAgentIds(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    )
  }

  const handleSendNotification = async () => {
    if (!template) return
    if (notificationMode === 'specific' && selectedAgentIds.length === 0) return

    setIsSendingNotification(true)
    setNotificationResult(null)
    try {
      const agentIds = notificationMode === 'specific' ? selectedAgentIds : undefined
      const { data, error } = await xano.sendTemplateNotification(template.id, agentIds)
      if (data && !error) {
        setNotificationResult({
          success: true,
          agentCount: data.agentEmailsSent || 0
        })
      } else {
        setNotificationResult({ success: false, agentCount: 0 })
        xano.logError('manual_notification', 'agent_notification_failed', `Failed to manually notify agents for template ${template.id}: ${error}`)
      }
    } catch (error: any) {
      setNotificationResult({ success: false, agentCount: 0 })
      xano.logError('manual_notification', 'agent_notification_failed', `Exception manually notifying agents for template ${template.id}: ${error?.message}`)
    } finally {
      setIsSendingNotification(false)
    }
  }

  // Realtor notification functions
  const loadRealtors = async () => {
    setIsLoadingRealtors(true)
    try {
      const { data } = await xano.getAllRealtors()
      if (data) {
        setRealtors(data.filter((r: any) => r.status === 'active').map((r: any) => ({
          id: r.id,
          firstName: r.firstName || '',
          lastName: r.lastName || '',
          email: r.email || '',
          agentName: r.agentName || ''
        })))
      }
    } catch (error) {
      console.error('Failed to load realtors:', error)
    } finally {
      setIsLoadingRealtors(false)
    }
  }

  const handleRealtorNotificationModeChange = (mode: 'all' | 'specific') => {
    setRealtorNotificationMode(mode)
    if (mode === 'specific' && realtors.length === 0) {
      loadRealtors()
    }
    setSelectedRealtorIds([])
    setRealtorNotificationResult(null)
  }

  const toggleRealtorSelection = (realtorId: number) => {
    setSelectedRealtorIds(prev =>
      prev.includes(realtorId) ? prev.filter(id => id !== realtorId) : [...prev, realtorId]
    )
  }

  const handleSendRealtorNotification = async () => {
    if (!template) return
    if (realtorNotificationMode === 'specific' && selectedRealtorIds.length === 0) return

    setIsSendingRealtorNotification(true)
    setRealtorNotificationResult(null)
    try {
      const realtorIds = realtorNotificationMode === 'specific' ? selectedRealtorIds : undefined
      const { data, error } = await xano.sendTemplateNotificationToRealtors(template.id, realtorIds)
      if (data && !error) {
        setRealtorNotificationResult({
          success: true,
          count: data.realtorEmailsSent || 0
        })
      } else {
        setRealtorNotificationResult({ success: false, count: 0 })
        xano.logError('manual_notification', 'realtor_notification_failed', `Failed to manually notify realtors for template ${template.id}: ${error}`)
      }
    } catch (error: any) {
      setRealtorNotificationResult({ success: false, count: 0 })
      xano.logError('manual_notification', 'realtor_notification_failed', `Exception manually notifying realtors for template ${template.id}: ${error?.message}`)
    } finally {
      setIsSendingRealtorNotification(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social-media': return <Image className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'video': return <Film className="h-4 w-4" />
      default: return <FileIcon className="h-4 w-4" />
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'social-media': return 'bg-purple-100 text-purple-700 border border-purple-200'
      case 'email': return 'bg-blue-100 text-blue-700 border border-blue-200'
      case 'flyer': return 'bg-green-100 text-green-700 border border-green-200'
      case 'presentation': return 'bg-orange-100 text-orange-700 border border-orange-200'
      case 'checklist': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
      case 'guide': return 'bg-teal-100 text-teal-700 border border-teal-200'
      case 'video': return 'bg-red-100 text-red-700 border border-red-200'
      case 'business-card': return 'bg-pink-100 text-pink-700 border border-pink-200'
      case 'print': return 'bg-indigo-100 text-indigo-700 border border-indigo-200'
      case 'other': return 'bg-slate-100 text-slate-700 border border-slate-200'
      default: return 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/admin/templates')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Template not found</h3>
            <p className="text-gray-500">This template may have been deleted.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Delete Confirmation View
  if (showDeleteConfirm) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="rounded-lg">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="max-w-lg mx-auto border-0 overflow-hidden rounded-lg">
          <div className="bg-red-600 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Trash2 className="h-6 w-6 text-white flex-shrink-0" />
              <div>
                <h4 className="text-white font-semibold">Delete Template?</h4>
                <p className="text-sm text-red-100 mt-1">This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6 space-y-4 rounded-b-lg">
            <p className="text-gray-700">
              Are you sure you want to delete "<span className="font-semibold">{template.title}</span>"? The template will be permanently removed.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1 rounded-lg">
                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Published Warning View
  if (showPublishedWarning) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setShowPublishedWarning(false)} className="rounded-lg">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="max-w-lg mx-auto border-0 overflow-hidden rounded-lg">
          <div className="bg-amber-500 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-white flex-shrink-0" />
              <div>
                <h4 className="text-white font-semibold">Template is Published</h4>
                <p className="text-sm text-amber-100 mt-1">Editing will change the template status.</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6 space-y-4 rounded-b-lg">
            <p className="text-gray-700">
              Editing will unpublish this template. It will be hidden from agents and realtors until you publish it again.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowPublishedWarning(false)} className="flex-1 rounded-lg">
                Cancel
              </Button>
              <Button onClick={startEditMode} className="flex-1 rounded-lg" style={{ backgroundColor: brandColor }}>
                Continue to Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Edit Mode View
  if (isEditMode && editData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
            <p className="text-gray-500 mt-1">Update template information</p>
          </div>
        </div>

        <Card className="rounded-lg">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={editData.category} onValueChange={(v) => setEditData({ ...editData, category: v as TemplateCategory })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="flyer">Flyer</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="business-card">Business Cards</SelectItem>
                    <SelectItem value="print">Print Materials</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Format</Label>
                <Select value={editData.format} onValueChange={(v) => setEditData({ ...editData, format: v as TemplateFormat })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={editData.shortDescription}
                onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
                rows={3}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview Image</Label>
              {editData.previewImageUrl ? (
                <div className="relative w-full max-w-md">
                  <img src={editData.previewImageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-lg"
                    onClick={() => setEditData({ ...editData, previewImageUrl: '' })}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative w-full max-w-md">
                  <input type="file" accept="image/*" onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isUploadingImage} />
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                    {isUploadingImage ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" /><span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-500">
                        <Upload className="h-6 w-6" /><span className="text-sm">Click to upload</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Download/Edit Link</Label>
              <Input value={editData.downloadLink} onChange={(e) => setEditData({ ...editData, downloadLink: e.target.value })} placeholder="https://..." className="rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Release Notes</Label>
              <Textarea value={editData.releaseNotes} onChange={(e) => setEditData({ ...editData, releaseNotes: e.target.value })} rows={2} className="rounded-lg" />
            </div>

            {template.status === 'published' && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">Saving will unpublish this template.</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancelEdit} className="rounded-lg">Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // View Mode (Default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/templates')} className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{template.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                template.status === 'published'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {template.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getCategoryStyle(template.category)}`}>
                {getCategoryIcon(template.category)}
                {template.category === 'social-media' ? 'Social' : template.category}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">{template.format.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleStartEdit} className="rounded-lg">
            <Pencil className="h-4 w-4 mr-2" />Edit
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Image */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {template.previewImageUrl ? (
                <img src={template.previewImageUrl} alt={template.title} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-0 shadow-sm rounded-lg">
            <CardHeader className="text-white rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <CardTitle className="text-base font-semibold">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 rounded-b-lg">
              <div>
                <Label className="text-xs text-gray-400 font-medium">Description</Label>
                <p className="text-gray-700 mt-1">{template.shortDescription || 'No description provided'}</p>
              </div>
              {template.releaseNotes && (
                <div>
                  <Label className="text-xs text-gray-400 font-medium">Release Notes</Label>
                  <p className="text-gray-700 mt-1">{template.releaseNotes}</p>
                </div>
              )}
              <Separator />
              <div>
                <Label className="text-xs text-gray-400 font-medium">Download/Edit Link</Label>
                <div className="mt-2">
                  <Button onClick={() => template.downloadLink && window.open(template.downloadLink, '_blank')} className="bg-[#0077B6] hover:bg-[#006399] rounded-lg">
                    <ExternalLink className="h-4 w-4 mr-2" />Open Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Control */}
          <Card className="border-0 shadow-sm rounded-lg">
            <CardHeader className="text-white py-4 rounded-t-lg" style={{ backgroundColor: brandColor }}>
              <CardTitle className="text-base font-semibold">Status</CardTitle>
              <CardDescription className="text-gray-300 text-sm">Control template visibility</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 rounded-b-lg">
              {template.status === 'draft' ? (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg" onClick={() => handleUpdateStatus('published')} disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
                  Publish & Notify All
                </Button>
              ) : (
                <Button variant="outline" className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg" onClick={() => handleUpdateStatus('draft')} disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <EyeOff className="h-4 w-4 mr-2" />}
                  Unpublish (Draft)
                </Button>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {template.status === 'draft' ? 'Publishing will make this visible and automatically notify all agents and realtors.' : 'Unpublishing will hide this template from users.'}
              </p>
            </CardContent>
          </Card>

          {/* Notifications - Only for published */}
          {template.status === 'published' && (
            <Card className="border-0 shadow-sm rounded-lg">
              <CardHeader className="text-white py-4 rounded-t-lg" style={{ backgroundColor: brandColor }}>
                <CardTitle className="text-base font-semibold">Notify Agents</CardTitle>
                <CardDescription className="text-gray-300 text-sm">Send email notifications manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 rounded-b-lg">
                <div className="flex gap-2">
                  <Button variant={notificationMode === 'all' ? 'default' : 'outline'} size="sm" onClick={() => handleNotificationModeChange('all')}
                    className={`rounded-lg ${notificationMode === 'all' ? 'bg-[#0077B6] hover:bg-[#006399]' : ''}`}>
                    <Users className="h-4 w-4 mr-2" />All
                  </Button>
                  <Button variant={notificationMode === 'specific' ? 'default' : 'outline'} size="sm" onClick={() => handleNotificationModeChange('specific')}
                    className={`rounded-lg ${notificationMode === 'specific' ? 'bg-[#0077B6] hover:bg-[#006399]' : ''}`}>
                    <User className="h-4 w-4 mr-2" />Specific
                  </Button>
                </div>

                {notificationMode === 'specific' && (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {isLoadingAgents ? (
                      <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
                    ) : agents.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">No active agents</p>
                    ) : (
                      agents.map((agent) => (
                        <div key={agent.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => toggleAgentSelection(agent.id)}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedAgentIds.includes(agent.id) ? 'bg-[#0077B6] border-[#0077B6] text-white' : 'border-gray-300'}`}>
                            {selectedAgentIds.includes(agent.id) && <Check className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{agent.firstName} {agent.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{agent.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {notificationMode === 'specific' && selectedAgentIds.length > 0 && (
                  <p className="text-xs text-[#0077B6]">{selectedAgentIds.length} agent{selectedAgentIds.length !== 1 ? 's' : ''} selected</p>
                )}

                <Button variant="outline" className="w-full text-[#0077B6] hover:text-[#006399] hover:bg-[#0077B6]/10 rounded-lg" onClick={handleSendNotification}
                  disabled={isSendingNotification || (notificationMode === 'specific' && selectedAgentIds.length === 0)}>
                  {isSendingNotification ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Notification
                </Button>

                {notificationResult && (
                  <p className={`text-xs ${notificationResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                    {notificationResult.success
                      ? `Sent to ${notificationResult.agentCount} agent${notificationResult.agentCount !== 1 ? 's' : ''}`
                      : 'Failed to send'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notify Realtors - Only for published */}
          {template.status === 'published' && (
            <Card className="border-0 shadow-sm rounded-lg">
              <CardHeader className="text-white py-4 rounded-t-lg" style={{ backgroundColor: brandColor }}>
                <CardTitle className="text-base font-semibold">Notify Realtors</CardTitle>
                <CardDescription className="text-gray-300 text-sm">Send to realtors (appears from their agent)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 rounded-b-lg">
                <div className="flex gap-2">
                  <Button variant={realtorNotificationMode === 'all' ? 'default' : 'outline'} size="sm" onClick={() => handleRealtorNotificationModeChange('all')}
                    className={`rounded-lg ${realtorNotificationMode === 'all' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}>
                    <Users className="h-4 w-4 mr-2" />All
                  </Button>
                  <Button variant={realtorNotificationMode === 'specific' ? 'default' : 'outline'} size="sm" onClick={() => handleRealtorNotificationModeChange('specific')}
                    className={`rounded-lg ${realtorNotificationMode === 'specific' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}>
                    <User className="h-4 w-4 mr-2" />Specific
                  </Button>
                </div>

                {realtorNotificationMode === 'specific' && (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {isLoadingRealtors ? (
                      <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
                    ) : realtors.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">No active realtors</p>
                    ) : (
                      realtors.map((realtor) => (
                        <div key={realtor.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => toggleRealtorSelection(realtor.id)}>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedRealtorIds.includes(realtor.id) ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300'}`}>
                            {selectedRealtorIds.includes(realtor.id) && <Check className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{realtor.firstName} {realtor.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{realtor.email}</p>
                            {realtor.agentName && <p className="text-xs text-gray-400 truncate">Agent: {realtor.agentName}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {realtorNotificationMode === 'specific' && selectedRealtorIds.length > 0 && (
                  <p className="text-xs text-orange-600">{selectedRealtorIds.length} realtor{selectedRealtorIds.length !== 1 ? 's' : ''} selected</p>
                )}

                <Button variant="outline" className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg" onClick={handleSendRealtorNotification}
                  disabled={isSendingRealtorNotification || (realtorNotificationMode === 'specific' && selectedRealtorIds.length === 0)}>
                  {isSendingRealtorNotification ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Notification
                </Button>

                {realtorNotificationResult && (
                  <p className={`text-xs ${realtorNotificationResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                    {realtorNotificationResult.success
                      ? `Sent to ${realtorNotificationResult.count} realtor${realtorNotificationResult.count !== 1 ? 's' : ''}`
                      : 'Failed to send'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
