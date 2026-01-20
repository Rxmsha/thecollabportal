'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, FileText, ExternalLink, Film, FileIcon, Mail, Image } from 'lucide-react'
import xano from '@/services/xano'
import { Template, TemplateCategory, TemplateFormat, TemplateAudience } from '@/types'

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: 'social-media' as TemplateCategory,
    format: 'canva' as TemplateFormat,
    audience: ['mortgage_agents', 'realtors'] as TemplateAudience[],
    shortDescription: '',
    downloadLink: '',
    previewImageUrl: '',
    releaseNotes: '',
  })

  useEffect(() => {
    loadTemplates()
  }, [categoryFilter, statusFilter])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getTemplates({
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      if (data) {
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const { data, error } = await xano.createTemplate(newTemplate)
      if (data) {
        loadTemplates()
        setIsCreateOpen(false)
        setNewTemplate({
          title: '',
          category: 'social-media',
          format: 'canva',
          audience: ['mortgage_agents', 'realtors'],
          shortDescription: '',
          downloadLink: '',
          previewImageUrl: '',
          releaseNotes: '',
        })
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social-media':
        return <Image className="h-3.5 w-3.5" />
      case 'email':
        return <Mail className="h-3.5 w-3.5" />
      case 'video':
        return <Film className="h-3.5 w-3.5" />
      default:
        return <FileIcon className="h-3.5 w-3.5" />
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'social-media':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'email':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'flyer':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'presentation':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'checklist':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'guide':
        return 'bg-teal-100 text-teal-700 border-teal-200'
      case 'video':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'document':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatCategoryLabel = (category: string) => {
    switch (category) {
      case 'social-media':
        return 'social'
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Templates</h1>
          <p className="text-gray-500 mt-1">
            Create and publish content for your users
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Add a new template to the library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newTemplate.title}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter template title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        category: value as TemplateCategory,
                      }))
                    }
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
                    value={newTemplate.format}
                    onValueChange={(value) =>
                      setNewTemplate((prev) => ({
                        ...prev,
                        format: value as TemplateFormat,
                      }))
                    }
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
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTemplate.shortDescription}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the template"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Preview Image URL (optional)</Label>
                <Input
                  value={newTemplate.previewImageUrl}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      previewImageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Download/Edit Link</Label>
                <Input
                  value={newTemplate.downloadLink}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      downloadLink: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Release Notes (optional)</Label>
                <Textarea
                  value={newTemplate.releaseNotes}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      releaseNotes: e.target.value,
                    }))
                  }
                  placeholder="What's new or updated"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] bg-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="social-media">Social Media</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="flyer">Flyer</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="checklist">Checklist</SelectItem>
            <SelectItem value="guide">Guide</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border rounded-xl">
              <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-5 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-9 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden border rounded-xl hover:shadow-lg transition-shadow">
              {/* Image Preview */}
              <div className="aspect-[4/3] bg-gray-100 relative">
                {template.previewImageUrl ? (
                  <img
                    src={template.previewImageUrl}
                    alt={template.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <FileText className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                {/* Category Badge - Top Right */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getCategoryStyle(template.category)}`}>
                    {getCategoryIcon(template.category)}
                    {formatCategoryLabel(template.category)}
                  </span>
                </div>
                {/* Draft Badge - Top Left */}
                {template.status === 'draft' && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Draft
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {template.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {template.shortDescription}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {template.format.toUpperCase().replace('_', ' ')}
                  </span>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => template.downloadLink && window.open(template.downloadLink, '_blank')}
                  >
                    Open
                    <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border rounded-xl">
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first template</p>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
