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
} from 'lucide-react'
import xano from '@/services/xano'
import { toast } from '@/hooks/use-toast'

interface Resource {
  id: number
  title: string
  description: string
  buttonText: string
  resourceUrl: string
  resourceType: 'link' | 'file'
  audience: 'agents' | 'realtors' | 'both'
  displayOrder: number
  isActive: boolean
  createdAt: string
}

export default function AdminResourcesPage() {
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
  const [displayOrder, setDisplayOrder] = useState(0)

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    setIsLoading(true)
    try {
      const { data } = await xano.adminGetResources()
      if (data) {
        setResources(data)
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
        return <Badge variant="default" className="bg-blue-100 text-blue-700">Agents Only</Badge>
      case 'realtors':
        return <Badge variant="default" className="bg-green-100 text-green-700">Realtors Only</Badge>
      case 'both':
        return <Badge variant="default" className="bg-purple-100 text-purple-700">Both</Badge>
      default:
        return <Badge variant="secondary">{aud}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-500 mt-1">
            Manage helpful resources for agents and realtors
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Resources List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-4">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              className={`${!resource.isActive ? 'opacity-50' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <GripVertical className="h-5 w-5" />
                      <span className="text-sm font-mono">{resource.displayOrder}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                        {getAudienceBadge(resource.audience)}
                        {!resource.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {resource.resourceType === 'file' && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            File
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          Button: "{resource.buttonText}"
                        </span>
                        <a
                          href={resource.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Resource
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={resource.isActive ? "ghost" : "default"}
                      size="sm"
                      className={resource.isActive ? "" : "bg-green-500 hover:bg-green-600 text-black font-medium"}
                      onClick={() => handleToggleActive(resource)}
                    >
                      {resource.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(resource)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedResource(resource)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No resources yet</p>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Resource
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>
              Create a new helpful resource for agents and/or realtors
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Pre-Approval Process"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description *</Label>
              <Textarea
                id="create-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Help your clients understand the mortgage pre-approval process..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-buttonText">Button Text *</Label>
              <Input
                id="create-buttonText"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g., Learn More, Download Guide"
              />
            </div>

            <div className="space-y-2">
              <Label>Resource Type</Label>
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
              <Label htmlFor="create-resourceUrl">
                {resourceType === 'link' ? 'URL *' : 'File *'}
              </Label>
              {resourceType === 'link' ? (
                <Input
                  id="create-resourceUrl"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="https://example.com/resource"
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
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  {resourceUrl && (
                    <p className="text-sm text-gray-500 truncate">
                      Uploaded: {resourceUrl}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Audience *</Label>
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
              <Label htmlFor="create-displayOrder">Display Order</Label>
              <Input
                id="create-displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">Lower numbers appear first</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isSaving}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Update this resource's details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Pre-Approval Process"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Help your clients understand the mortgage pre-approval process..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-buttonText">Button Text *</Label>
              <Input
                id="edit-buttonText"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g., Learn More, Download Guide"
              />
            </div>

            <div className="space-y-2">
              <Label>Resource Type</Label>
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
              <Label htmlFor="edit-resourceUrl">
                {resourceType === 'link' ? 'URL *' : 'File *'}
              </Label>
              {resourceType === 'link' ? (
                <Input
                  id="edit-resourceUrl"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  placeholder="https://example.com/resource"
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
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  {resourceUrl && (
                    <p className="text-sm text-gray-500 truncate">
                      Current: {resourceUrl}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Audience *</Label>
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
              <Label htmlFor="edit-displayOrder">Display Order</Label>
              <Input
                id="edit-displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">Lower numbers appear first</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedResource(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={isSaving}>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedResource?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
