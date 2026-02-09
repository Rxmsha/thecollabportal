// Realtor-related methods for Xano API

import { XanoClient } from './client'
import { transformKeys } from './utils'

export function addRealtorMethods<T extends XanoClient>(client: T) {
  return {
    async getRealtors(params?: { agentId?: number; status?: string; search?: string }) {
      const queryParams = new URLSearchParams()
      if (params?.agentId) queryParams.append('agent_id', params.agentId.toString())
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await client.request<any[]>(`/realtors${query}`)
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    // Get realtors for the currently authenticated agent
    async getMyRealtors(params?: { status?: string; search?: string }) {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      const response = await client.request<any[]>(`/get_my_realtors${query}`)
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    // Deactivate a realtor
    async deactivateRealtor(realtorId: number) {
      return client.request<{ success: boolean; realtorId: number; status: string }>('/update_realtor_status', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    // Reactivate a realtor (generates new password and sends welcome email)
    async reactivateRealtor(realtorId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        email: string
        firstName: string
        lastName: string
        status: string
        tempPassword: string
      }>('/reactivate_realtor', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    async getRealtor(id: number) {
      return client.request<any>(`/realtors/${id}`)
    },

    // Agent: Get detailed info for one of their realtors
    async getMyRealtorDetails(realtorId: number) {
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
      }>(`/get_my_realtor_details?realtor_id=${realtorId}`)
    },

    // Agent: Reset password for one of their realtors
    async resetMyRealtorPassword(realtorId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        email: string
        firstName: string
        lastName: string
        tempPassword: string
      }>('/reset_my_realtor_password', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    async inviteRealtor(data: {
      email: string
      firstName: string
      lastName: string
      brokerage?: string
      phone?: string
    }) {
      // Use realtor_ prefix to avoid Xano's implicit field mapping issue
      const payload = {
        realtor_email: data.email,
        realtor_first_name: data.firstName,
        realtor_last_name: data.lastName,
        realtor_brokerage: data.brokerage || '',
        realtor_phone: data.phone || '',
      }
      return client.request<{
        realtorId: number
        userId: number
        firstName: string
        lastName: string
        email: string
        status: string
        tempPassword: string
      }>('/invite_realtor', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    async updateRealtor(id: number, data: Partial<any>) {
      return client.request<any>(`/realtors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    // Get current realtor's profile (authenticated realtor)
    async getMyRealtorProfile() {
      const response = await client.request<any>('/get_realtor_profile')
      if (response.data) {
        response.data = transformKeys(response.data)
      }
      return response
    },

    // Update current realtor's profile (authenticated realtor)
    async updateRealtorProfile(data: {
      firstName?: string
      lastName?: string
      phone?: string
      brokerage?: string
    }) {
      return client.request<any>('/update_realtor_profile', {
        method: 'POST',
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          brokerage: data.brokerage,
        }),
      })
    },

    // Activate current realtor's status (called after first login for realtors)
    async activateMyRealtorStatus() {
      return client.request<{ success: boolean }>('/activate_my_realtor_status', {
        method: 'POST',
      })
    },

    // Agent: Resend invite to an invited realtor (generates new password and sends onboarding email)
    async resendRealtorInvite(realtorId: number) {
      return client.request<{
        success: boolean
        realtorId: number
        email: string
        message: string
      }>('/resend_realtor_invite', {
        method: 'POST',
        body: JSON.stringify({ realtor_id: realtorId }),
      })
    },

    // Realtor: Get linked agent information
    async getMyAgent() {
      return client.request<{
        id: number
        firstName: string
        lastName: string
        email: string
        phone: string
        companyName: string
        brandColor: string
        logoUrl: string
        calendlyLink: string
        cmaLink: string
        bio: string
      }>('/get_my_agent')
    },
  }
}
