'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, FileText, Film, FileIcon, Mail, Image, Search, Trash2, X, Check, Loader2 } from 'lucide-react'
import xano from '@/services/xano'
import { Template } from '@/types'
import { useBranding } from '@/context/BrandingContext'

export default function AdminTemplatesPage() {
  const { brandColor } = useBranding()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [categoryFilter, statusFilter, formatFilter])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getTemplates({
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        format: formatFilter === 'all' ? undefined : formatFilter,
        search: searchQuery || undefined,
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

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTemplates()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds([])
  }, [categoryFilter, statusFilter, formatFilter, searchQuery])

  const toggleSelection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === templates.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(templates.map(t => t.id))
    }
  }

  const clearSelection = () => {
    setSelectedIds([])
    setShowDeleteConfirm(false)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    try {
      // Delete templates one by one
      const deletePromises = selectedIds.map(id => xano.deleteTemplate(id))
      await Promise.all(deletePromises)

      // Remove deleted templates from state
      setTemplates(prev => prev.filter(t => !selectedIds.includes(t.id)))
      setSelectedIds([])
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete templates:', error)
    } finally {
      setIsDeleting(false)
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
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="dot-matrix text-xl text-gray-900">TEMPLATES</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and publish content for your users
          </p>
        </div>
        <Button
          style={{ backgroundColor: brandColor }}
          onClick={() => router.push('/admin/templates/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      {/* Selection Bar - Shows when templates are selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-[#0077B6]/10 border border-[#0077B6]/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-medium text-[#0077B6]">
              {selectedIds.length} template{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <Button variant="ghost" size="sm" onClick={selectAll} className="text-[#0077B6] hover:text-[#006399] font-mono uppercase tracking-wider text-xs">
              {selectedIds.length === templates.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {showDeleteConfirm ? (
              <>
                <span className="text-sm font-mono text-red-600 mr-2">Delete {selectedIds.length} template{selectedIds.length !== 1 ? 's' : ''}?</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="font-mono uppercase tracking-wider text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="font-mono uppercase tracking-wider text-xs"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Confirm Delete
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={clearSelection} className="font-mono uppercase tracking-wider text-xs">
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="font-mono uppercase tracking-wider text-xs"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-[200px] bg-white"
          />
        </div>
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
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-[140px] bg-white">
            <SelectValue placeholder="All Formats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            <SelectItem value="canva">Canva</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="doc">Document</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 rounded-none">
              <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-3" style={{ backgroundColor: brandColor }}>
                <div className="h-5 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 w-16 bg-gray-700 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const isSelected = selectedIds.includes(template.id)
            return (
              <Card
                key={template.id}
                className={`overflow-hidden border-0 rounded-none hover:shadow-lg transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-[#0077B6]' : ''
                }`}
                onClick={() => router.push(`/admin/templates/${template.id}`)}
              >
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

                  {/* Selection Checkbox - Top Left */}
                  <div
                    className="absolute top-3 left-3 z-10"
                    onClick={(e) => toggleSelection(template.id, e)}
                  >
                    <div
                      className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#0077B6] border-[#0077B6] text-white'
                          : 'bg-white/90 border-gray-300 hover:border-[#0077B6]'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Category Badge - Top Right */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium uppercase tracking-wider border ${getCategoryStyle(template.category)}`}>
                      {getCategoryIcon(template.category)}
                      {formatCategoryLabel(template.category)}
                    </span>
                  </div>

                  {/* Draft Badge - Below checkbox */}
                  {template.status === 'draft' && (
                    <div className="absolute top-12 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-medium uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        Draft
                      </span>
                    </div>
                  )}
                </div>

                {/* Content - Dark footer */}
                <div className="p-4 flex flex-col h-[110px]" style={{ backgroundColor: brandColor }}>
                  <h3 className="font-mono font-semibold text-white text-base mb-1 truncate">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-mono line-clamp-1 flex-grow">
                    {template.shortDescription || '\u00A0'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
                      {template.format.toUpperCase().replace('_', ' ')}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent border-gray-500 text-white hover:bg-white/10 hover:text-white font-mono text-xs uppercase tracking-wider"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/templates/${template.id}`)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-0">
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 font-mono mb-4">Get started by creating your first template</p>
            <Button
              onClick={() => router.push('/admin/templates/new')}
              className="font-mono uppercase tracking-wider"
              style={{ backgroundColor: brandColor }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
