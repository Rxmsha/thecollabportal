// Agent-related methods for Xano API

import { XanoClient } from './client'
import { transformKeys } from './utils'

export function addAgentMethods<T extends XanoClient>(client: T) {
  return {
    async getAgents(params?: { status?: string; search?: string }) {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await client.request<any[]>(`/agents${query}`)
      // Transform snake_case keys to camelCase
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    async getAgent(id: number) {
      const response = await client.request<any>(`/agents/${id}`)
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    async updateAgent(id: number, data: Partial<any>) {
      return client.request<any>(`/agents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    async updateAgentBranding(agentId: number, data: {
      phone?: string
      brandColor?: string
      logoUrl?: string
      calendlyLink?: string
      cmaLink?: string
      bio?: string
    }) {
      // Convert camelCase to snake_case for Xano
      return client.request<any>('/update_agent_branding', {
        method: 'POST',
        body: JSON.stringify({
          agents_id: agentId,
          phone: data.phone,
          brand_color: data.brandColor,
          logo_url: data.logoUrl,
          calendly_link: data.calendlyLink,
          cma_link: data.cmaLink,
          bio: data.bio,
        }),
      })
    },

    // Get current agent's profile (authenticated agent)
    async getMyAgentProfile() {
      const response = await client.request<any>('/get_agent_profile')
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    // Update current agent's profile (authenticated agent) - for branding page
    async updateMyAgentProfile(data: {
      phone?: string
      brandColor?: string
      logoUrl?: string
      calendlyLink?: string
      cmaLink?: string
      bio?: string
    }) {
      return client.request<any>('/agents/me', {
        method: 'PATCH',
        body: JSON.stringify({
          phone: data.phone,
          brand_color: data.brandColor,
          logo_url: data.logoUrl,
          calendly_link: data.calendlyLink,
          cma_link: data.cmaLink,
          bio: data.bio,
        }),
      })
    },

    // Update agent profile info (first name, last name, phone, notifications) - for settings page
    async updateAgentProfile(data: {
      firstName?: string
      lastName?: string
      phone?: string
      templateNotificationsEnabled?: boolean
    }) {
      return client.request<any>('/update_agent_profile', {
        method: 'POST',
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          template_notifications_enabled: data.templateNotificationsEnabled,
        }),
      })
    },

    // Agent: Get stats for their realtors
    async getAgentStats() {
      return client.request<{
        totalRealtors: number
        activeRealtors: number
        pendingRealtors: number
        seatsUsed: number
        seatLimit: number
        seatsRemaining: number
        occupiedSeats: number
        canInvite: boolean
      }>('/my_agent_stats')
    },

    // Agent: Send template notification to realtors
    async agentSendTemplateNotificationToRealtors(templateId: number, realtorIds?: number[]) {
      return client.request<{
        success: boolean
        templateId: number
        emailsSent: number
      }>('/agent_send_template_notification_to_realtors', {
        method: 'POST',
        body: JSON.stringify({
          template_id: templateId,
          realtor_ids: realtorIds && realtorIds.length > 0 ? realtorIds : null
        }),
      })
    },

    // Agent: Unlink a realtor from themselves (deactivates realtor)
    async agentUnlinkRealtor(realtorId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        status: string
        agentId: null
        seatsUsed: number
      }>('/agent_unlink_realtor', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },
  }
}
