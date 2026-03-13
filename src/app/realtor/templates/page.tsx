'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, FileText, ExternalLink } from 'lucide-react'
import xano from '@/services/xano'
import { Template } from '@/types'
import { useBranding } from '@/context/BrandingContext'

export default function RealtorTemplatesPage() {
  const { brandColor } = useBranding()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const { data, error } = await xano.getPublishedTemplates()
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

  const handleUseTemplate = async (template: Template) => {
    if (template.downloadLink) {
      // Track the click for analytics
      try {
        await xano.trackTemplateClick(template.id)
      } catch (error) {
        console.error('Failed to track template click:', error)
      }
      window.open(template.downloadLink, '_blank')
    }
  }

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'email', label: 'Email' },
    { value: 'flyer', label: 'Flyer' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'checklist', label: 'Checklist' },
    { value: 'guide', label: 'Guide' },
    { value: 'business-card', label: 'Business Cards' },
    { value: 'print', label: 'Print Materials' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">Templates</h1>
        <p className="text-base text-gray-500 mt-1">
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
          className="pl-10 rounded-lg"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-gray-100 rounded-lg p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="rounded-lg text-sm data-[state=active]:bg-white"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-200 animate-pulse" />
                  <CardContent className="p-0 bg-white">
                    <div className="aspect-video bg-gray-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 animate-pulse" />
                      <div className="h-3 bg-gray-100 w-2/3 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="border-0 overflow-hidden hover:shadow-md transition-shadow rounded-lg">
                  {/* Image Preview */}
                  <div className="aspect-[4/3] bg-gray-100 relative flex items-center justify-center rounded-t-lg">
                    {template.previewImageUrl ? (
                      <img
                        src={template.previewImageUrl}
                        alt={template.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <FileText className="h-16 w-16 text-gray-300" />
                    )}
                    {/* Category Badge - Top Right */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-700 border border-gray-200">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  {/* Content - Dark footer */}
                  <div className="p-4 flex flex-col h-[120px] rounded-b-lg" style={{ backgroundColor: brandColor }}>
                    <h3 className="font-semibold text-white text-base mb-1 truncate">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-1 flex-grow">
                      {template.shortDescription || '\u00A0'}
                    </p>
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-medium text-gray-300">
                        {template.format.replace('_', ' ')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseTemplate(template)}
                        className="rounded-lg bg-transparent border-gray-400 text-white hover:bg-white/10 hover:text-white text-xs"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 overflow-hidden rounded-lg">
              <div
                className="px-6 py-4 flex items-center gap-3 rounded-t-lg"
                style={{ backgroundColor: brandColor }}
              >
                <FileText className="h-5 w-5 text-white" />
                <span className="text-white font-semibold text-base">
                  Templates
                </span>
              </div>
              <CardContent className="py-12 text-center bg-white rounded-b-lg">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-base text-gray-700">No templates found</p>
                <p className="text-base text-gray-500 mt-1">
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
