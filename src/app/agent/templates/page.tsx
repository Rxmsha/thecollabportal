'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, FileText, ExternalLink, Video, Image, Mail, Loader2, Users, Check, X } from 'lucide-react'
import xano from '@/services/xano'
import { Template, Realtor } from '@/types'
import { markTemplatesVisited } from '@/lib/onboarding'
import { useBranding } from '@/context/BrandingContext'

export default function AgentTemplatesPage() {
  const { brandColor } = useBranding()
  // Mark templates as visited for onboarding progress
  useEffect(() => {
    markTemplatesVisited()
  }, [])
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Notify realtors modal state
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [realtors, setRealtors] = useState<Realtor[]>([])
  const [loadingRealtors, setLoadingRealtors] = useState(false)
  const [selectedRealtorIds, setSelectedRealtorIds] = useState<number[]>([])
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [notificationResult, setNotificationResult] = useState<{ success: boolean; emailsSent: number } | null>(null)

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

  const loadRealtors = async () => {
    setLoadingRealtors(true)
    try {
      const { data, error } = await xano.getMyRealtors({ status: 'active' })
      if (data) {
        setRealtors(data)
        // Select all by default
        setSelectedRealtorIds(data.map((r: Realtor) => r.id))
      }
    } catch (error) {
      console.error('Failed to load realtors:', error)
    } finally {
      setLoadingRealtors(false)
    }
  }

  const handleOpenNotifyModal = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTemplate(template)
    setNotificationResult(null)
    setShowNotifyModal(true)
    loadRealtors()
  }

  const handleCloseNotifyModal = () => {
    setShowNotifyModal(false)
    setSelectedTemplate(null)
    setRealtors([])
    setSelectedRealtorIds([])
    setNotificationResult(null)
  }

  const toggleRealtorSelection = (realtorId: number) => {
    setSelectedRealtorIds(prev =>
      prev.includes(realtorId)
        ? prev.filter(id => id !== realtorId)
        : [...prev, realtorId]
    )
  }

  const selectAllRealtors = () => {
    if (selectedRealtorIds.length === realtors.length) {
      setSelectedRealtorIds([])
    } else {
      setSelectedRealtorIds(realtors.map(r => r.id))
    }
  }

  const handleSendNotification = async (sendToAll: boolean) => {
    if (!selectedTemplate) return

    setIsSendingNotification(true)
    try {
      // If sendToAll is true, don't pass realtor_ids (API will send to all)
      // If sendToAll is false, pass the selected realtor IDs
      const realtorIds = sendToAll ? undefined : selectedRealtorIds
      const { data, error } = await xano.agentSendTemplateNotificationToRealtors(
        selectedTemplate.id,
        realtorIds
      )

      if (data) {
        setNotificationResult({ success: true, emailsSent: data.emailsSent })
      } else {
        setNotificationResult({ success: false, emailsSent: 0 })
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      setNotificationResult({ success: false, emailsSent: 0 })
    } finally {
      setIsSendingNotification(false)
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
      case 'social-media':
        return 'purple'
      case 'email':
        return 'default'
      case 'flyer':
        return 'success'
      case 'presentation':
        return 'orange'
      case 'checklist':
        return 'secondary'
      case 'guide':
        return 'default'
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
    { value: 'social-media', label: 'Social Media' },
    { value: 'email', label: 'Email' },
    { value: 'flyer', label: 'Flyer' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'checklist', label: 'Checklist' },
    { value: 'guide', label: 'Guide' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">TEMPLATES</h1>
        <p className="text-base text-gray-700 mt-1 font-mono">
          Browse and use marketing templates for your business
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-none font-mono"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-gray-100 rounded-none p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="rounded-none font-mono text-sm uppercase tracking-wider data-[state=active]:bg-white"
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
                <Card key={template.id} className="border-0 overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ backgroundColor: brandColor }}
                  >
                    <span className="text-white font-mono font-semibold uppercase tracking-wider text-sm truncate">
                      {template.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-0 font-mono uppercase text-xs"
                    >
                      {template.category}
                    </Badge>
                  </div>
                  <CardContent className="p-0 bg-white">
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
                    </div>
                    <div className="p-4">
                      <p className="text-base text-gray-700 font-mono line-clamp-2 mb-3">
                        {template.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant={getFormatBadgeColor(template.format) as any} className="font-mono uppercase text-xs">
                          {getFormatIcon(template.format)}
                          <span className="ml-1">
                            {template.format.replace('_', ' ')}
                          </span>
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleOpenNotifyModal(template, e)}
                            title="Notify Realtors"
                            className="rounded-none"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(template)}
                            className="rounded-none font-mono uppercase tracking-wider text-xs"
                            style={{ backgroundColor: brandColor }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 overflow-hidden">
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{ backgroundColor: brandColor }}
              >
                <FileText className="h-5 w-5 text-white" />
                <span className="text-white font-mono font-semibold uppercase tracking-wider text-base">
                  Templates
                </span>
              </div>
              <CardContent className="py-12 text-center bg-white">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-base text-gray-700 font-mono">No templates found</p>
                <p className="text-base text-gray-500 mt-1 font-mono">
                  Try adjusting your search or category filter
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Notify Realtors Modal */}
      <Dialog open={showNotifyModal} onOpenChange={handleCloseNotifyModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-none border-0" closeClassName="text-white">
          <div className="px-6 py-4" style={{ backgroundColor: brandColor }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-white font-mono uppercase tracking-wider">
                <Mail className="h-5 w-5" />
                Notify Realtors
              </DialogTitle>
            </DialogHeader>
          </div>

          {selectedTemplate && (
            <div className="p-6 space-y-4">
              <p className="text-base text-gray-700 font-mono">
                Send an email about this template to your realtors.
              </p>

              {/* Template Preview */}
              <div className="bg-gray-50 border border-gray-200 p-3 flex items-center gap-3">
                {selectedTemplate.previewImageUrl ? (
                  <img
                    src={selectedTemplate.previewImageUrl}
                    alt={selectedTemplate.title}
                    className="w-16 h-12 object-cover"
                  />
                ) : (
                  <div className="w-16 h-12 bg-gray-200 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-semibold text-gray-900 truncate">{selectedTemplate.title}</p>
                  <p className="text-sm text-gray-500 font-mono uppercase">{selectedTemplate.category}</p>
                </div>
              </div>

              {/* Notification Result */}
              {notificationResult && (
                <div
                  className={`p-3 border flex items-center gap-2 font-mono text-base ${
                    notificationResult.success
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {notificationResult.success ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>
                        Notification sent to {notificationResult.emailsSent} realtor
                        {notificationResult.emailsSent !== 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span>Failed to send notification</span>
                    </>
                  )}
                </div>
              )}

              {!notificationResult && (
                <>
                  {/* Realtor Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-mono font-semibold text-gray-900 uppercase tracking-wider">
                        Select Realtors
                      </label>
                      {realtors.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={selectAllRealtors}
                          className="text-xs h-7 font-mono uppercase tracking-wider rounded-none"
                        >
                          {selectedRealtorIds.length === realtors.length
                            ? 'Deselect All'
                            : 'Select All'}
                        </Button>
                      )}
                    </div>

                    {loadingRealtors ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : realtors.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 border border-gray-200">
                        <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-base text-gray-500 font-mono">No active realtors</p>
                      </div>
                    ) : (
                      <div className="border border-gray-200 max-h-48 overflow-y-auto">
                        {realtors.map((realtor) => (
                          <label
                            key={realtor.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <Checkbox
                              checked={selectedRealtorIds.includes(realtor.id)}
                              onCheckedChange={() => toggleRealtorSelection(realtor.id)}
                              className="rounded-none"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-mono font-semibold text-gray-900">
                                {realtor.firstName} {realtor.lastName}
                              </p>
                              <p className="text-sm text-gray-500 font-mono truncate">
                                {realtor.email}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 rounded-none font-mono uppercase tracking-wider text-sm"
                      variant="outline"
                      onClick={() => handleSendNotification(true)}
                      disabled={isSendingNotification || realtors.length === 0}
                    >
                      {isSendingNotification ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Users className="h-4 w-4 mr-2" />
                      )}
                      Notify All ({realtors.length})
                    </Button>
                    <Button
                      className="flex-1 rounded-none font-mono uppercase tracking-wider text-sm"
                      onClick={() => handleSendNotification(false)}
                      disabled={isSendingNotification || selectedRealtorIds.length === 0}
                      style={{ backgroundColor: brandColor }}
                    >
                      {isSendingNotification ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Notify Selected ({selectedRealtorIds.length})
                    </Button>
                  </div>
                </>
              )}

              {/* Close Button after success */}
              {notificationResult?.success && (
                <Button
                  className="w-full rounded-none font-mono uppercase tracking-wider text-sm"
                  onClick={handleCloseNotifyModal}
                  style={{ backgroundColor: brandColor }}
                >
                  Done
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
