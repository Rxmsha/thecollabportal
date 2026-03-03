// Resource-related methods for Xano API

import { XanoClient } from './client'
import { transformKeys } from './utils'

export function addResourceMethods<T extends XanoClient>(client: T) {
  return {
    // Get resources for the current user's role
    async getResources() {
      const response = await client.request<any[]>('/get_resources')
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    // Admin: Get all resources
    async adminGetResources() {
      const response = await client.request<any[]>('/admin_get_resources')
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    // Admin: Create a new resource
    async adminCreateResource(data: {
      title: string
      description: string
      buttonText: string
      resourceUrl: string
      resourceType: 'link' | 'file'
      audience: 'agents' | 'realtors' | 'both'
      category?: string
      displayOrder?: number
    }) {
      return client.request<{ success: boolean; resource: any }>('/admin_create_resource', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          button_text: data.buttonText,
          resource_url: data.resourceUrl,
          resource_type: data.resourceType,
          audience: data.audience,
          category: data.category || 'other',
          display_order: data.displayOrder || 0,
        }),
      })
    },

    // Admin: Update a resource
    async adminUpdateResource(resourceId: number, data: {
      title?: string
      description?: string
      buttonText?: string
      resourceUrl?: string
      resourceType?: 'link' | 'file'
      audience?: 'agents' | 'realtors' | 'both'
      category?: string
      displayOrder?: number
      isActive?: boolean
    }) {
      return client.request<{ success: boolean; resource: any }>('/admin_update_resource', {
        method: 'POST',
        body: JSON.stringify({
          resource_id: resourceId,
          title: data.title,
          description: data.description,
          button_text: data.buttonText,
          resource_url: data.resourceUrl,
          resource_type: data.resourceType,
          audience: data.audience,
          category: data.category,
          display_order: data.displayOrder,
          is_active: data.isActive,
        }),
      })
    },

    // Admin: Delete a resource
    async adminDeleteResource(resourceId: number) {
      return client.request<{ success: boolean; message: string }>('/admin_delete_resource', {
        method: 'POST',
        body: JSON.stringify({ resource_id: resourceId }),
      })
    },
  }
}
