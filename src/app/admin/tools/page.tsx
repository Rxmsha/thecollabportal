'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Sparkles, Home, ExternalLink, Bot } from 'lucide-react'

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
    audience: 'agent',
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
    audience: 'agent',
  },
  {
    id: 'showcase',
    name: 'Showcase',
    subtitle: 'The Listing Specialist',
    description: 'Turn property details into polished MLS descriptions, social posts, and video scripts.',
    icon: Home,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600',
    url: 'https://collabportal.vercel.app/showcase',
    audience: 'realtor',
  },
]

export default function AdminToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const currentTool = tools.find((t) => t.id === activeTool)

  if (currentTool) {
    const Icon = currentTool.icon
    return (
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTool(null)}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="dot-matrix text-xl text-gray-900">{currentTool.name.toUpperCase()}</h1>
              <p className="text-sm text-gray-500 font-mono">{currentTool.subtitle}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(currentTool.url, '_blank')}
            className="font-mono uppercase tracking-wider"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
        <div className="flex-1 overflow-hidden border-0">
          <Card className="h-full border-0 overflow-hidden">
            <div className={`${currentTool.bgColor} px-6 py-3 flex items-center gap-3`}>
              <Icon className="h-5 w-5 text-white" />
              <span className="text-white font-mono font-medium">{currentTool.name}</span>
              <span className="text-white/70 font-mono text-sm">- {currentTool.subtitle}</span>
            </div>
            <iframe
              src={currentTool.url}
              className="w-full h-[calc(100%-48px)] bg-white"
              title={currentTool.name}
              allow="clipboard-write"
            />
          </Card>
        </div>
      </div>
    )
  }

  const agentTools = tools.filter((t) => t.audience === 'agent')
  const realtorTools = tools.filter((t) => t.audience === 'realtor')

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-xl text-gray-900">AI TOOLS</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          Preview and test all AI-powered tools available to agents and realtors.
        </p>
      </div>

      {/* Agent Tools */}
      <div>
        <h2 className="font-mono text-sm tracking-wider uppercase text-gray-900 mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#0077B6]" />
          Agent Tools
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {agentTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.id}
                className="border-0 overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
                onClick={() => setActiveTool(tool.id)}
              >
                <div className={`${tool.bgColor} px-6 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-white" />
                    <span className="text-white font-mono font-semibold uppercase tracking-wider">{tool.name}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                </div>
                <CardContent className="p-6 bg-white">
                  <p className="text-sm font-mono font-medium text-gray-700">{tool.subtitle}</p>
                  <p className="text-gray-500 font-mono text-sm mt-2">{tool.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Realtor Tools */}
      <div>
        <h2 className="font-mono text-sm tracking-wider uppercase text-gray-900 mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 text-emerald-600" />
          Realtor Tools
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {realtorTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.id}
                className="border-0 overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
                onClick={() => setActiveTool(tool.id)}
              >
                <div className={`${tool.bgColor} px-6 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-white" />
                    <span className="text-white font-mono font-semibold uppercase tracking-wider">{tool.name}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                </div>
                <CardContent className="p-6 bg-white">
                  <p className="text-sm font-mono font-medium text-gray-700">{tool.subtitle}</p>
                  <p className="text-gray-500 font-mono text-sm mt-2">{tool.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
