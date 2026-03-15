'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, FileText, ExternalLink, Filter } from 'lucide-react'
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
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="dot-matrix text-xl sm:text-2xl text-gray-900">Templates</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Browse marketing templates provided by your mortgage partner
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-lg text-sm sm:text-base"
        />
      </div>

      {/* Category Filter */}
      {/* Mobile: Dropdown Select */}
      <div className="sm:hidden">
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="w-full rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <SelectValue placeholder="Select category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="hidden sm:block">
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
      </Tabs>

      {/* Templates Grid */}
      <div className="mt-4 sm:mt-6">
          {isLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 overflow-hidden rounded-lg">
                  <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-200 animate-pulse" />
                  <CardContent className="p-0 bg-white">
                    <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      <div className="h-3 bg-gray-100 w-2/3 animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                      <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                    )}
                    {/* Category Badge - Top Right */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-white/90 text-gray-700 border border-gray-200">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  {/* Content - Dark footer */}
                  <div className="p-3 sm:p-4 flex flex-col h-[100px] sm:h-[120px] rounded-b-lg" style={{ backgroundColor: brandColor }}>
                    <h3 className="font-semibold text-white text-sm sm:text-base mb-0.5 sm:mb-1 truncate">
                      {template.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 line-clamp-1 flex-grow">
                      {template.shortDescription || '\u00A0'}
                    </p>
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] sm:text-xs font-medium text-gray-300">
                        {template.format.replace('_', ' ')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseTemplate(template)}
                        className="rounded-lg bg-transparent border-gray-400 text-white hover:bg-white/10 hover:text-white text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
                      >
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
                className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 rounded-t-lg"
                style={{ backgroundColor: brandColor }}
              >
                <FileText className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-white font-semibold text-sm sm:text-base">
                  Templates
                </span>
              </div>
              <CardContent className="py-8 sm:py-12 text-center bg-white rounded-b-lg">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-700">No templates found</p>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                  Try adjusting your search or category filter
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  )
}
