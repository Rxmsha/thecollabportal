// Admin-only methods for Xano API

import { XanoClient } from './client'
import { transformKeys } from './utils'

export function addAdminMethods<T extends XanoClient>(client: T) {
  return {
    // Admin: Update agent seat limit
    async updateAgentSeatLimit(agentId: number, seatLimit: number) {
      return client.request<{ success: boolean; agentId: number; seatLimit: number }>('/admin_update_agent_seat_limit', {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId, seat_limit: seatLimit }),
      })
    },

    // Admin: Create a new agent (generates temp password, creates user + agent records)
    async createAgent(data: {
      email: string
      firstName: string
      lastName: string
      companyName: string
      phone?: string
      seatLimit?: number
    }) {
      // Convert camelCase to snake_case for Xano
      const payload = {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        company_name: data.companyName,
        phone: data.phone || '',
        seat_limit: data.seatLimit || 10,
      }
      return client.request<{
        agentId: number
        userId: number
        email: string
        tempPassword: string
      }>('/create_agent', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    // Admin: Get all realtors across all agents
    async adminGetRealtors(params?: { status?: string }) {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await client.request<any[]>(`/admin_get_realtors${query}`)
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    // Admin: Deactivate a realtor
    async adminDeactivateRealtor(realtorId: number) {
      return client.request<{ success: boolean; realtorId: number; status: string }>('/admin_deactivate_realtor', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    // Admin: Reactivate a realtor (generates new password and sends email from linked agent)
    async adminReactivateRealtor(realtorId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        email: string
        firstName: string
        lastName: string
        status: string
        tempPassword: string
        agentName: string
      }>('/admin_reactivate_realtor', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    // Admin: Get detailed realtor info with linked agent
    async adminGetRealtorDetails(realtorId: number) {
      return client.request<{
        id: number
        firstName: string
        lastName: string
        email: string
        phone: string
        brokerage: string
        status: string
        agentId: number
        userId: number
        inviteSentAt: string
        activatedAt: string
        createdAt: string
        agent: {
          id: number
          firstName: string
          lastName: string
          email: string
          phone: string
          companyName: string
        }
      }>(`/admin_get_realtor_details?realtor_id=${realtorId}`)
    },

    // Admin: Reset realtor password (generates new password and sends email from linked agent)
    async adminResetRealtorPassword(realtorId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        email: string
        firstName: string
        lastName: string
        tempPassword: string
        agentName: string
      }>('/admin_reset_realtor_password', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    // Admin: Manually send template notification to agents
    async sendTemplateNotification(templateId: number, agentIds?: number[]) {
      return client.request<{
        success: boolean
        templateId: number
        agentEmailsSent: number
      }>('/admin_send_template_notification', {
        method: 'POST',
        body: JSON.stringify({
          template_id: templateId,
          agent_ids: agentIds && agentIds.length > 0 ? agentIds : null
        }),
      })
    },

    // Admin: Send template notification to realtors (appears from their agent)
    async sendTemplateNotificationToRealtors(templateId: number, realtorIds?: number[]) {
      return client.request<{
        success: boolean
        templateId: number
        realtorEmailsSent: number
      }>('/admin_send_template_notification_to_realtors', {
        method: 'POST',
        body: JSON.stringify({
          template_id: templateId,
          realtor_ids: realtorIds && realtorIds.length > 0 ? realtorIds : null
        }),
      })
    },

    // Admin: Get all realtors (for notification selection)
    async getAllRealtors() {
      return client.request<any[]>('/admin_get_all_realtors')
    },

    // Admin: Get dashboard stats
    async getAdminStats() {
      return client.request<{
        totalAgents: number
        activeAgents: number
        totalRealtors: number
        activeRealtors: number
        totalTemplates: number
        publishedTemplates: number
      }>('/dashboard_stats')
    },

    // Admin: Recalculate seats_used for all agents
    async recalculateAllSeats() {
      return client.request<{ success: boolean; agentsUpdated: number; totalAgents: number }>('/admin_recalculate_seats', {
        method: 'POST',
      })
    },

    // Admin: Reset agent password (generates new temp password and sends email)
    async resetAgentPassword(agentId: number) {
      return client.request<{
        success: boolean
        agentId: number
        email: string
        firstName: string
        lastName: string
        tempPassword: string
      }>('/reset_agent_password', {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId }),
      })
    },

    // Admin: Get detailed agent info with linked realtors
    async adminGetAgentDetails(agentId: number) {
      const response = await client.request<{
        id: number
        firstName: string
        lastName: string
        email: string
        phone: string
        companyName: string
        brandColor: string
        status: string
        seatLimit: number
        seatsUsed: number
        createdAt: string
        realtors: any[]
      }>(`/admin_get_agent_details?agent_id=${agentId}`)
      if (response.data && response.data.realtors) {
        response.data.realtors = transformKeys(response.data.realtors)
      }
      return response
    },

    // Admin: Deactivate an agent
    async adminDeactivateAgent(agentId: number) {
      return client.request<{ success: boolean; agentId: number; status: string }>('/admin_deactivate_agent', {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId }),
      })
    },

    // Admin: Reactivate an agent (generates new password and sends email)
    async adminReactivateAgent(agentId: number) {
      return client.request<{
        success: boolean
        agentId: number
        email: string
        firstName: string
        lastName: string
        status: string
        tempPassword: string
      }>('/admin_reactivate_agent', {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId }),
      })
    },

    // Admin: Delete an agent and all linked realtors
    async adminDeleteAgent(agentId: number) {
      return client.request<{
        success: boolean
        deletedAgentId: number
        message: string
      }>('/admin_delete_agent', {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId }),
      })
    },

    // Admin: Delete a realtor (also deletes user account and recalculates agent's seats_used)
    async adminDeleteRealtor(realtorId: number) {
      return client.request<{
        success: boolean
        agentId: number
        seatsUsed: number
      }>('/admin_delete_realtor', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    // Admin: Resend invite to an invited realtor (email appears from linked agent)
    async adminResendRealtorInvite(realtorId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        email: string
        agentName: string
        message: string
      }>('/admin_resend_realtor_invite', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    // Admin: Unlink a realtor from their agent (deactivates realtor)
    async adminUnlinkRealtor(realtorId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        status: string
        agentId: null
      }>('/admin_unlink_realtor', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    // Admin: Link an unlinked realtor to an agent
    async adminLinkRealtorToAgent(realtorId: number, agentId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        agentId: number
        agent: {
          id: number
          firstName: string
          lastName: string
          email: string
          phone: string
          companyName: string
          status: string
        }
      }>('/admin_link_realtor_to_agent', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId, agent_id: agentId }),
      })
    },

    // Admin: Create a new realtor with optional agent linking
    async adminCreateRealtor(data: {
      firstName: string
      lastName: string
      email: string
      brokerage?: string
      phone?: string
      agentId?: number | null
    }) {
      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        brokerage: data.brokerage || '',
        phone: data.phone || '',
        agent_id: data.agentId || null,
      }
      return client.request<{
        success: boolean
        realtorId: number
        userId: number
        firstName: string
        lastName: string
        email: string
        status: string
        agentId: number | null
        agentName: string | null
        tempPassword: string
      }>('/admin_create_realtor', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  }
}
