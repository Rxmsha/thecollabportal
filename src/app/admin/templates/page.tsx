'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, FileText, Edit, Eye, Upload } from 'lucide-react'
import xano from '@/services/xano'
import { formatDate } from '@/lib/utils'
import { Template, TemplateCategory, TemplateFormat, TemplateAudience } from '@/types'

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: 'listing' as TemplateCategory,
    format: 'canva' as TemplateFormat,
    audience: ['mortgage_agents', 'realtors'] as TemplateAudience[],
    shortDescription: '',
    downloadLink: '',
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
        setTemplates((prev) => [data, ...prev])
        setIsCreateOpen(false)
        setNewTemplate({
          title: '',
          category: 'listing',
          format: 'canva',
          audience: ['mortgage_agents', 'realtors'],
          shortDescription: '',
          downloadLink: '',
          releaseNotes: '',
        })
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handlePublish = async (templateId: number) => {
    try {
      await xano.publishTemplate(templateId)
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId ? { ...t, status: 'published' as const } : t
        )
      )
    } catch (error) {
      console.error('Failed to publish template:', error)
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const query = searchQuery.toLowerCase()
    return (
      template.title.toLowerCase().includes(query) ||
      template.shortDescription.toLowerCase().includes(query)
    )
  })

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case 'canva':
        return 'purple'
      case 'pdf':
        return 'destructive'
      case 'google_doc':
        return 'default'
      case 'video':
        return 'orange'
      default:
        return 'secondary'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'listing':
        return 'success'
      case 'social':
        return 'purple'
      case 'email':
        return 'default'
      case 'video':
        return 'orange'
      case 'document':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">
            Manage and publish templates for agents and realtors
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
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
                      <SelectItem value="listing">Listing</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
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
                      <SelectItem value="google_doc">Google Doc</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
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
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="listing">Listing</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="document">Document</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-300" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant={getCategoryBadgeColor(template.category) as any}>
                    {template.category}
                  </Badge>
                  {template.status === 'draft' && (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{template.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {template.shortDescription}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant={getFormatBadgeColor(template.format) as any}>
                    {template.format.replace('_', ' ')}
                  </Badge>
                  <div className="flex gap-2">
                    {template.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handlePublish(template.id)}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
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
            <p className="text-gray-500">No templates found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
