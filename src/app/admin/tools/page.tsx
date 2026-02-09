'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Sparkles, Home } from 'lucide-react'

const tools = [
  {
    id: 'fileprep',
    name: 'FilePrep',
    subtitle: 'The Deal Specialist',
    description: 'Turn messy discovery notes into professional underwriter files and client-ready summaries.',
    icon: FileText,
    color: 'text-blue-600',
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
    url: 'https://collabportal.vercel.app/content-coach',
    audience: 'agent',
  },
  {
    id: 'showcase',
    name: 'Showcase',
    subtitle: 'The Listing Specialist',
    description: 'Turn property details into polished MLS descriptions, social posts, and video scripts.',
    icon: Home,
    color: 'text-blue-600',
    url: 'https://collabportal.vercel.app/showcase',
    audience: 'realtor',
  },
]

export default function AdminToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const currentTool = tools.find((t) => t.id === activeTool)

  if (currentTool) {
    return (
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTool(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Button>
        </div>
        <div className="flex-1 rounded-lg overflow-hidden border bg-white">
          <iframe
            src={currentTool.url}
            className="w-full h-full"
            title={currentTool.name}
            allow="clipboard-write"
          />
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
        <p className="text-sm text-gray-500 mt-1">
          Preview and test all AI-powered tools available to agents and realtors.
        </p>
      </div>

      {/* Agent Tools */}
      <div>
        <h2 className="font-mono text-sm tracking-wider uppercase text-gray-900 mb-4">Agent Tools</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {agentTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
                onClick={() => setActiveTool(tool.id)}
              >
                <CardContent className="p-6">
                  <h3 className={`text-xl font-semibold ${tool.color}`}>{tool.name}</h3>
                  <p className="text-sm font-medium text-gray-700 mt-1">{tool.subtitle}</p>
                  <p className="text-gray-500 mt-3">{tool.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Realtor Tools */}
      <div>
        <h2 className="font-mono text-sm tracking-wider uppercase text-gray-900 mb-4">Realtor Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {realtorTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
                onClick={() => setActiveTool(tool.id)}
              >
                <CardContent className="p-6">
                  <h3 className={`text-xl font-semibold ${tool.color}`}>{tool.name}</h3>
                  <p className="text-sm font-medium text-gray-700 mt-1">{tool.subtitle}</p>
                  <p className="text-gray-500 mt-3">{tool.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
