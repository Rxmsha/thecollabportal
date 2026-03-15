'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Sparkles, ExternalLink, Bot } from 'lucide-react'
import { useBranding } from '@/context/BrandingContext'

const tools = [
  {
    id: 'fileprep',
    name: 'FilePrep',
    subtitle: 'The Deal Specialist',
    description: 'Turn messy discovery notes into professional underwriter files and client-ready summaries.',
    icon: FileText,
    color: 'text-[#0077B6]',
    bgColor: 'bg-[#0077B6]',
    url: 'https://collabportal.vercel.app/fileprep',
  },
  {
    id: 'content-coach',
    name: 'Content Coach',
    subtitle: 'The Personal Brand Specialist',
    description: 'Transform your daily activity into ready-to-use posts, captions, and email snippets.',
    icon: Sparkles,
    color: 'text-orange-600',
    bgColor: 'bg-orange-600',
    url: 'https://collabportal.vercel.app/content-coach',
  },
]

export default function AgentToolsPage() {
  const { brandColor } = useBranding()
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const currentTool = tools.find((t) => t.id === activeTool)

  if (currentTool) {
    const Icon = currentTool.icon
    return (
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4 border-b border-gray-200 pb-3 sm:pb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTool(null)}
              className="hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="dot-matrix text-xl sm:text-2xl text-gray-900 truncate">{currentTool.name}</h1>
              <p className="text-sm sm:text-base text-gray-700 truncate">{currentTool.subtitle}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(currentTool.url, '_blank')}
            className="rounded-lg w-full sm:w-auto text-sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
        <div className="flex-1 overflow-hidden border-0 min-h-0">
          <Card className="h-full border-0 overflow-hidden rounded-lg">
            <div className={`${currentTool.bgColor} px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 rounded-t-lg`}>
              <Icon className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-white font-semibold text-sm sm:text-base truncate">{currentTool.name}</span>
              <span className="text-white/70 text-xs sm:text-sm hidden sm:inline">- {currentTool.subtitle}</span>
            </div>
            <iframe
              src={currentTool.url}
              className="w-full h-[calc(100%-40px)] sm:h-[calc(100%-48px)] bg-white rounded-b-lg"
              title={currentTool.name}
              allow="clipboard-write"
            />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-3 sm:pb-4">
        <h1 className="dot-matrix text-xl sm:text-2xl text-gray-900">AI Tools</h1>
        <p className="text-sm sm:text-base text-gray-700 mt-1">
          Transform your workflow with AI-powered tools designed for mortgage agents.
        </p>
      </div>

      {/* Tools Section */}
      <div>
        <h2 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 flex-shrink-0" style={{ color: brandColor }} />
          Your AI Specialists
        </h2>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.id}
                className="border-0 overflow-hidden rounded-lg cursor-pointer transition-all hover:shadow-lg group"
                onClick={() => setActiveTool(tool.id)}
              >
                <div className={`${tool.bgColor} px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between rounded-t-lg`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Icon className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-white font-semibold text-sm sm:text-base truncate">{tool.name}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/70 group-hover:text-white transition-colors flex-shrink-0" />
                </div>
                <CardContent className="p-4 sm:p-6 bg-white rounded-b-lg">
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{tool.subtitle}</p>
                  <p className="text-sm sm:text-base text-gray-700 mt-1.5 sm:mt-2">{tool.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
