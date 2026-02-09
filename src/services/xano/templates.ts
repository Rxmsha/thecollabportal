// Template-related methods for Xano API

import { XanoClient } from './client'
import { transformKeys } from './utils'

export function addTemplateMethods<T extends XanoClient>(client: T) {
  return {
    async getTemplates(params?: {
      category?: string
      audience?: string
      status?: string
      search?: string
      format?: string
    }) {
      const queryParams = new URLSearchParams()
      if (params?.category) queryParams.append('category', params.category)
      if (params?.audience) queryParams.append('audience', params.audience)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.format) queryParams.append('format', params.format)
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await client.request<any[]>(`/templates${query}`)
      // Transform snake_case keys to camelCase
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    async getTemplate(id: number) {
      return client.request<any>(`/admin_get_template?template_id=${id}`)
    },

    async getPublishedTemplates(params?: {
      category?: string
      format?: string
      search?: string
    }) {
      const queryParams = new URLSearchParams()
      if (params?.category) queryParams.append('category', params.category)
      if (params?.format) queryParams.append('format', params.format)
      if (params?.search) queryParams.append('search', params.search)
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await client.request<any[]>(`/get_published_templates${query}`)
      // Transform snake_case keys to camelCase
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    async createTemplate(data: {
      title: string
      category: string
      format: string
      audience: string[]
      shortDescription: string
      downloadLink: string
      previewImageUrl?: string
      status?: 'draft' | 'published'
      releaseNotes?: string
    }) {
      // Convert camelCase to snake_case for Xano
      const payload = {
        title: data.title,
        category: data.category,
        format: data.format,
        audience: data.audience,
        short_description: data.shortDescription,
        download_link: data.downloadLink,
        preview_image_url: data.previewImageUrl || '',
        release_notes: data.releaseNotes || '',
        status: data.status || 'draft',
      }
      return client.request<{
        id: number
        title: string
        category: string
        format: string
        status: string
      }>('/create_template', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    async updateTemplate(id: number, data: Partial<any>) {
      return client.request<any>('/admin_update_template', {
        method: 'POST',
        body: JSON.stringify({
          template_id: id,
          ...data,
        }),
      })
    },

    async deleteTemplate(id: number) {
      return client.request<any>('/admin_delete_template', {
        method: 'POST',
        body: JSON.stringify({ template_id: id }),
      })
    },

    async updateTemplateStatus(id: number, status: 'draft' | 'published') {
      return client.request<{
        success: boolean
        templateId: number
        status: string
        notificationSent: boolean
      }>('/admin_update_template_status', {
        method: 'POST',
        body: JSON.stringify({ template_id: id, status }),
      })
    },

    async publishTemplate(id: number) {
      return client.request<any>('/templates/publish', {
        method: 'POST',
        body: JSON.stringify({ template_id: id }),
      })
    },
  }
}
