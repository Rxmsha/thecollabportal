'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

const tools = [
  {
    id: 'showcase',
    name: 'Showcase',
    subtitle: 'The Listing Specialist',
    description: 'Turn property details into polished MLS descriptions, social posts, and video scripts.',
    icon: Home,
    color: 'text-blue-600',
    url: 'https://collabportal.vercel.app/showcase',
  },
]

export default function RealtorToolsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meet Your AI Specialist</h1>
        <p className="text-gray-500 mt-1">
          Transform your workflow with AI-powered tools designed for realtors.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
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
  )
}
