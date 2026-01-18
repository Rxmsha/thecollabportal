import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, FileText, Video, Image } from 'lucide-react'
import { Template } from '@/types'

interface TemplateCardProps {
  template: Template
  onUse?: () => void
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const getFormatIcon = () => {
    switch (template.format) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'canva':
        return <Image className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = () => {
    switch (template.category) {
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

  const getFormatColor = () => {
    switch (template.format) {
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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Preview Image */}
      <div className="aspect-video bg-gray-100 relative">
        {template.previewImageUrl ? (
          <img
            src={template.previewImageUrl}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {getFormatIcon()}
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant={getCategoryColor() as any} className="text-xs">
            {template.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {template.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {template.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getFormatColor() as any} className="text-xs">
              {getFormatIcon()}
              <span className="ml-1 capitalize">{template.format.replace('_', ' ')}</span>
            </Badge>
          </div>

          <Button
            onClick={onUse}
            className="w-full"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
