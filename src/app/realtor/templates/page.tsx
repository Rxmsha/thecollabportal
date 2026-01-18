'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, FileText, ExternalLink, Video, Image } from 'lucide-react'
import xano from '@/services/xano'
import { Template } from '@/types'

export default function RealtorTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const { data, error } = await xano.getTemplates({
        status: 'published',
        audience: 'realtors',
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

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === 'all' || template.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'canva':
        return <Image className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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

  const handleUseTemplate = (template: Template) => {
    if (template.downloadLink) {
      window.open(template.downloadLink, '_blank')
    }
  }

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'listing', label: 'Listing' },
    { value: 'social', label: 'Social' },
    { value: 'email', label: 'Email' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Docs' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-500 mt-1">
          Browse marketing templates provided by your mortgage partner
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
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
                <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                    {template.previewImageUrl ? (
                      <img
                        src={template.previewImageUrl}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-gray-300" />
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant={getCategoryBadgeColor(template.category) as any}>
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {template.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant={getFormatBadgeColor(template.format) as any}>
                        {getFormatIcon(template.format)}
                        <span className="ml-1 capitalize">
                          {template.format.replace('_', ' ')}
                        </span>
                      </Badge>
                      <Button size="sm" onClick={() => handleUseTemplate(template)}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Use
                      </Button>
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
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or category filter
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
