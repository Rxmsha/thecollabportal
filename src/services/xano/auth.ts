// Authentication methods for Xano API

import { XanoClient } from './client'

export function addAuthMethods<T extends XanoClient>(client: T) {
  return {
    // Auth endpoints (use auth API group)
    async login(email: string, password: string) {
      return client.request<{ authToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, true)
    },

    async signup(data: {
      email: string
      password: string
      name: string
      role: string
      companyName?: string
      phone?: string
    }) {
      return client.request<{ authToken: string; user: any }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }, true)
    },

    async me() {
      return client.request<any>('/auth/me', {}, true)
    },

    // Invite endpoints (use main API group but public)
    async validateInvite(token: string) {
      return client.request<{ valid: boolean; email: string; firstName: string; lastName: string; agentId: number }>(`/invites/validate?token=${token}`)
    },

    async acceptInvite(data: {
      token: string
      password: string
    }) {
      return client.request<{ authToken: string; user: any }>('/auth/accept_invite', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Change password (authenticated)
    async changePassword(data: {
      currentPassword: string
      newPassword: string
    }) {
      return client.request<{ success: boolean }>('/change_password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: data.currentPassword,
          new_password: data.newPassword,
        }),
      })
    },

    // Mark first login as completed (after password change or dismissal)
    async completeFirstLogin() {
      return client.request<{ success: boolean; role: string; realtorId: number | null }>('/complete_first_login', {
        method: 'POST',
      })
    },
  }
}
