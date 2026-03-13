'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Loader2,
  Users,
  Building2,
  GripVertical,
  Info,
  Tag,
} from 'lucide-react'
import xano from '@/services/xano'
import { toast } from '@/hooks/use-toast'
import { useBranding } from '@/context/BrandingContext'

interface Resource {
  id: number
  title: string
  description: string
  buttonText: string
  resourceUrl: string
  resourceType: 'link' | 'file'
  audience: 'agents' | 'realtors' | 'both'
  category: string
  displayOrder: number
  isActive: boolean
  createdAt: string
}

const RESOURCE_CATEGORIES = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'training', label: 'Training' },
  { value: 'tools', label: 'Tools' },
  { value: 'guides', label: 'Guides' },
  { value: 'other', label: 'Other' },
]

export default function AdminResourcesPage() {
  const { brandColor } = useBranding()
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [buttonText, setButtonText] = useState('Learn More')
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourceType, setResourceType] = useState<'link' | 'file'>('link')
  const [audience, setAudience] = useState<'agents' | 'realtors' | 'both'>('both')
  const [category, setCategory] = useState('other')
  const [displayOrder, setDisplayOrder] = useState(0)

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    setIsLoading(true)
    try {
      const { data } = await xano.adminGetResources()
      if (data) {
        // Sort by display_order, then by id for consistent ordering
        const sorted = [...data].sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder
          }
          return a.id - b.id
        })
        setResources(sorted)
      }
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setButtonText('Learn More')
    setResourceUrl('')
    setResourceType('link')
    setAudience('both')
    setCategory('other')
    setDisplayOrder(0)
  }

  const handleCreate = async () => {
    if (!title || !description || !resourceUrl) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await xano.adminCreateResource({
        title,
        description,
        buttonText,
        resourceUrl,
        resourceType,
        audience,
        category,
        displayOrder,
      })

      if (error) {
        toast({
          title: 'Failed to create resource',
          description: error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Resource created',
          description: 'The resource has been created successfully',
        })
        setShowCreateModal(false)
        resetForm()
        loadResources()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedResource) return

    setIsSaving(true)
    try {
      const { error } = await xano.adminUpdateResource(selectedResource.id, {
        title,
        description,
        buttonText,
        resourceUrl,
        resourceType,
        audience,
        category,
        displayOrder,
      })

      if (error) {
        toast({
          title: 'Failed to update resource',
          description: error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Resource updated',
          description: 'The resource has been updated successfully',
        })
        setShowEditModal(false)
        setSelectedResource(null)
        resetForm()
        loadResources()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedResource) return

    setIsDeleting(true)
    try {
      const { error } = await xano.adminDeleteResource(selectedResource.id)

      if (error) {
        toast({
          title: 'Failed to delete resource',
          description: error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Resource deleted',
          description: 'The resource has been deleted successfully',
        })
        setShowDeleteDialog(false)
        setSelectedResource(null)
        loadResources()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleActive = async (resource: Resource) => {
    try {
      const { error } = await xano.adminUpdateResource(resource.id, {
        isActive: !resource.isActive,
      })

      if (error) {
        toast({
          title: 'Failed to update resource',
          description: error,
          variant: 'destructive',
        })
      } else {
        loadResources()
      }
    } catch (error) {
      console.error('Failed to toggle resource:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { data, error } = await xano.uploadFile(file)
      if (error) {
        toast({
          title: 'Upload failed',
          description: error,
          variant: 'destructive',
        })
      } else if (data?.file?.url) {
        setResourceUrl(data.file.url)
        setResourceType('file')
        toast({
          title: 'File uploaded',
          description: 'File uploaded successfully',
        })
      }
    } catch (error) {
      toast({
        title: 'Upload error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const openEditModal = (resource: Resource) => {
    setSelectedResource(resource)
    setTitle(resource.title)
    setDescription(resource.description)
    setButtonText(resource.buttonText)
    setResourceUrl(resource.resourceUrl)
    setResourceType(resource.resourceType)
    setAudience(resource.audience)
    setCategory(resource.category || 'other')
    setDisplayOrder(resource.displayOrder)
    setShowEditModal(true)
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const getAudienceBadge = (aud: string) => {
    switch (aud) {
      case 'agents':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700"><Building2 className="h-3 w-3" />Agents</span>
      case 'realtors':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"><Users className="h-3 w-3" />Realtors</span>
      case 'both':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Both</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{aud}</span>
    }
  }

  const getCategoryBadge = (cat: string) => {
    const category = RESOURCE_CATEGORIES.find(c => c.value === cat)
    const label = category?.label || cat
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
        <Tag className="h-3 w-3" />
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="dot-matrix text-2xl text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add links or files that appear on agent and realtor dashboards
          </p>
        </div>
        <Button className="rounded-lg" style={{ backgroundColor: brandColor }} onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* How it works info box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How Resources Work</p>
          <p className="text-blue-700">
            Resources you add here will appear in the "Resources" section on agent and realtor dashboards.
            Use the <strong>Audience</strong> setting to control who sees each resource. You can add external links (like Canva templates)
            or upload files directly.
          </p>
        </div>
      </div>

      {/* Resources List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 bg-white">
                  <div className="h-6 bg-gray-100 w-1/3 animate-pulse mb-2" />
                  <div className="h-4 bg-gray-100 w-2/3 animate-pulse" />
                </div>
                <div className="p-4" style={{ backgroundColor: brandColor }}>
                  <div className="h-4 bg-gray-700 w-1/4 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-4">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              className="border-0 overflow-hidden rounded-lg"
            >
              <CardContent className="p-0">
                {/* Main Content */}
                <div className="p-6 bg-white rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center text-gray-400">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                          {getAudienceBadge(resource.audience)}
                          {resource.category && getCategoryBadge(resource.category)}
                          {!resource.isActive && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Inactive</span>
                          )}
                          {resource.resourceType === 'file' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              <FileText className="h-3 w-3" />
                              File
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                            Button: "{resource.buttonText}"
                          </span>
                          <a
                            href={resource.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[#0077B6] hover:underline text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Resource
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Dark Footer with Actions */}
                <div className="px-6 py-3 flex items-center justify-end gap-2 rounded-b-lg" style={{ backgroundColor: brandColor }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-lg text-xs ${
                      resource.isActive
                        ? 'bg-transparent border-gray-500 text-gray-300 hover:bg-white/10 hover:text-white'
                        : 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                    }`}
                    onClick={() => handleToggleActive(resource)}
                  >
                    {resource.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-gray-500 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg text-xs"
                    onClick={() => openEditModal(resource)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg text-xs"
                    onClick={() => {
                      setSelectedResource(resource)
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 rounded-lg">
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first resource</p>
            <Button className="rounded-lg" style={{ backgroundColor: brandColor }} onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-lg" closeClassName="text-white">
          <div className="px-6 py-4 flex-shrink-0 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <DialogHeader>
              <DialogTitle className="text-white font-semibold">Add Resource</DialogTitle>
              <DialogDescription className="text-gray-300 text-sm">
                Create a new helpful resource for agents and/or realtors
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="create-title" className="text-sm font-medium text-gray-600">Title *</Label>
              <Input
                id="create-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description" className="text-sm font-medium text-gray-600">Description *</Label>
              <Textarea
                id="create-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-buttonText" className="text-sm font-medium text-gray-600">Button Text *</Label>
              <Input
                id="create-buttonText"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g., Learn More, Download Guide"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Resource Type</Label>
              <Select value={resourceType} onValueChange={(v: 'link' | 'file') => setResourceType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      External Link
                    </div>
                  </SelectItem>
                  <SelectItem value="file">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Upload File
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-resourceUrl" className="text-sm font-medium text-gray-600">
                {resourceType === 'link' ? 'URL *' : 'File *'}
              </Label>
              {resourceType === 'link' ? (
                <Input
                  id="create-resourceUrl"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="flex-1"
                    />
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin text-[#0077B6]" />}
                  </div>
                  {resourceUrl && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> File uploaded successfully
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Audience *</Label>
              <Select value={audience} onValueChange={(v: 'agents' | 'realtors' | 'both') => setAudience(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Both Agents & Realtors
                    </div>
                  </SelectItem>
                  <SelectItem value="agents">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Agents Only
                    </div>
                  </SelectItem>
                  <SelectItem value="realtors">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Realtors Only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button className="rounded-lg" style={{ backgroundColor: brandColor }} onClick={handleCreate} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Create Resource'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-lg" closeClassName="text-white">
          <div className="px-6 py-4 flex-shrink-0 rounded-t-lg" style={{ backgroundColor: brandColor }}>
            <DialogHeader>
              <DialogTitle className="text-white font-semibold">Edit Resource</DialogTitle>
              <DialogDescription className="text-gray-300 text-sm">
                Update this resource's details
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-medium text-gray-600">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium text-gray-600">Description *</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-buttonText" className="text-sm font-medium text-gray-600">Button Text *</Label>
              <Input
                id="edit-buttonText"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g., Learn More, Download Guide"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Resource Type</Label>
              <Select value={resourceType} onValueChange={(v: 'link' | 'file') => setResourceType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      External Link
                    </div>
                  </SelectItem>
                  <SelectItem value="file">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Upload File
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-resourceUrl" className="text-sm font-medium text-gray-600">
                {resourceType === 'link' ? 'URL *' : 'File *'}
              </Label>
              {resourceType === 'link' ? (
                <Input
                  id="edit-resourceUrl"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="flex-1"
                    />
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin text-[#0077B6]" />}
                  </div>
                  {resourceUrl && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> File uploaded
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Audience *</Label>
              <Select value={audience} onValueChange={(v: 'agents' | 'realtors' | 'both') => setAudience(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Both Agents & Realtors
                    </div>
                  </SelectItem>
                  <SelectItem value="agents">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Agents Only
                    </div>
                  </SelectItem>
                  <SelectItem value="realtors">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Realtors Only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedResource(null)
                  resetForm()
                }}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button className="rounded-lg" style={{ backgroundColor: brandColor }} onClick={handleEdit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="p-0 overflow-hidden rounded-lg">
          <div className="bg-red-600 px-6 py-4 rounded-t-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white font-semibold">Delete Resource?</AlertDialogTitle>
              <AlertDialogDescription className="text-red-100 text-sm">
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <div className="px-6 pt-4 pb-6">
            <p className="text-gray-700">
              Are you sure you want to delete "<span className="font-semibold">{selectedResource?.title}</span>"?
            </p>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 rounded-lg"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
