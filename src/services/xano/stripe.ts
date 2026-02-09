// Stripe/Subscription methods for Xano API

import { XanoClient } from './client'

export function addStripeMethods<T extends XanoClient>(client: T) {
  return {
    // Stripe/Subscription endpoints (public, no auth required)
    async createCheckoutSession(data: {
      firstName: string
      lastName: string
      email: string
      companyName?: string
    }) {
      return client.request<{
        checkoutUrl: string
        sessionId: string
      }>('/create_checkout_session', {
        method: 'POST',
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          company_name: data.companyName || '',
        }),
      })
    },

    async verifyCheckoutSession(sessionId: string) {
      return client.request<{
        verified: boolean
        email: string
        customerId: string
      }>(`/verify_checkout_session?session_id=${sessionId}`)
    },
  }
}
