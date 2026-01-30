// Xano API Service Layer
// Configure your Xano instance base URLs in environment variables

const XANO_AUTH_URL = process.env.NEXT_PUBLIC_XANO_AUTH_URL || 'https://your-instance.xano.io/api:1'
const XANO_API_URL = process.env.NEXT_PUBLIC_XANO_API_URL || 'https://your-instance.xano.io/api:2'

// Get Xano base URL (without /api:xxx) for file storage
function getXanoBaseUrl(): string {
  const apiUrl = XANO_API_URL
  // Remove /api:xxx from the URL to get base URL
  return apiUrl.replace(/\/api:[^/]+$/, '')
}

interface XanoResponse<T> {
  data: T
  error?: string
}

// Helper to convert snake_case to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Transform object keys from snake_case to camelCase
function transformKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys)
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key)
      acc[camelKey] = transformKeys(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

class XanoService {
  private authUrl: string
  private apiUrl: string
  private authToken: string | null = null

  constructor(authUrl: string, apiUrl: string) {
    this.authUrl = authUrl
    this.apiUrl = apiUrl
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('xano_auth_token')
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('xano_auth_token', token)
      } else {
        localStorage.removeItem('xano_auth_token')
      }
    }
  }

  private getHeaders(): HeadersInit {
    // Always get the latest token from localStorage
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('xano_auth_token')
    }
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }
    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuthUrl: boolean = false
  ): Promise<XanoResponse<T>> {
    try {
      const baseUrl = useAuthUrl ? this.authUrl : this.apiUrl
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Xano API error:', { status: response.status, data })
        return { data: null as T, error: data.message || data.error || JSON.stringify(data) || 'Request failed' }
      }

      return { data }
    } catch (error) {
      return { data: null as T, error: 'Network error' }
    }
  }

  // Auth endpoints (use auth API group)
  async login(email: string, password: string) {
    return this.request<{ authToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true)
  }

  async signup(data: {
    email: string
    password: string
    name: string
    role: string
    companyName?: string
    phone?: string
  }) {
    return this.request<{ authToken: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true)
  }

  async me() {
    return this.request<any>('/auth/me', {}, true)
  }

  // Invite endpoints (use main API group but public)
  async validateInvite(token: string) {
    return this.request<{ valid: boolean; email: string; firstName: string; lastName: string; agentId: number }>(`/invites/validate?token=${token}`)
  }

  async acceptInvite(data: {
    token: string
    password: string
  }) {
    return this.request<{ authToken: string; user: any }>('/auth/accept_invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Agent endpoints
  async getAgents(params?: { status?: string; search?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await this.request<any[]>(`/agents${query}`)
    // Transform snake_case keys to camelCase
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  async getAgent(id: number) {
    const response = await this.request<any>(`/agents/${id}`)
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  async updateAgent(id: number, data: Partial<any>) {
    return this.request<any>(`/agents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

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
    return this.request<{
      agentId: number
      userId: number
      email: string
      tempPassword: string
    }>('/create_agent', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async updateAgentBranding(agentId: number, data: {
    phone?: string
    brandColor?: string
    logoUrl?: string
    calendlyLink?: string
    cmaLink?: string
    bio?: string
  }) {
    // Convert camelCase to snake_case for Xano
    return this.request<any>('/update_agent_branding', {
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
  }

  // Realtor endpoints
  async getRealtors(params?: { agentId?: number; status?: string; search?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.agentId) queryParams.append('agent_id', params.agentId.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await this.request<any[]>(`/realtors${query}`)
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  // Get realtors for the currently authenticated agent
  async getMyRealtors(params?: { status?: string; search?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await this.request<any[]>(`/get_my_realtors${query}`)
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  // Deactivate a realtor
  async deactivateRealtor(realtorId: number) {
    return this.request<{ success: boolean; realtorId: number; status: string }>('/update_realtor_status', {
      method: 'POST',
      body: JSON.stringify({ realtor_id: realtorId }),
    })
  }

  // Reactivate a realtor (generates new password and sends welcome email)
  async reactivateRealtor(realtorId: number) {
    return this.request<{
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
  }

  async getRealtor(id: number) {
    return this.request<any>(`/realtors/${id}`)
  }

  // Agent: Get detailed info for one of their realtors
  async getMyRealtorDetails(realtorId: number) {
    return this.request<{
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
  }

  // Agent: Reset password for one of their realtors
  async resetMyRealtorPassword(realtorId: number) {
    return this.request<{
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
  }

  // Admin: Get all realtors across all agents
  async adminGetRealtors(params?: { status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await this.request<any[]>(`/admin_get_realtors${query}`)
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  // Admin: Deactivate a realtor
  async adminDeactivateRealtor(realtorId: number) {
    return this.request<{ success: boolean; realtorId: number; status: string }>('/admin_deactivate_realtor', {
      method: 'POST',
      body: JSON.stringify({ realtor_id: realtorId }),
    })
  }

  // Admin: Reactivate a realtor (generates new password and sends email from linked agent)
  async adminReactivateRealtor(realtorId: number) {
    return this.request<{
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
  }

  // Admin: Get detailed realtor info with linked agent
  async adminGetRealtorDetails(realtorId: number) {
    return this.request<{
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
  }

  // Admin: Reset realtor password (generates new password and sends email from linked agent)
  async adminResetRealtorPassword(realtorId: number) {
    return this.request<{
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
  }

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
    return this.request<{
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
  }

  async updateRealtor(id: number, data: Partial<any>) {
    return this.request<any>(`/realtors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Template endpoints
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
    const response = await this.request<any[]>(`/templates${query}`)
    // Transform snake_case keys to camelCase
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  async getTemplate(id: number) {
    return this.request<any>(`/admin_get_template?template_id=${id}`)
  }

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
    const response = await this.request<any[]>(`/get_published_templates${query}`)
    // Transform snake_case keys to camelCase
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

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
    return this.request<{
      id: number
      title: string
      category: string
      format: string
      status: string
    }>('/create_template', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async updateTemplate(id: number, data: Partial<any>) {
    return this.request<any>('/admin_update_template', {
      method: 'POST',
      body: JSON.stringify({
        template_id: id,
        ...data,
      }),
    })
  }

  async deleteTemplate(id: number) {
    return this.request<any>('/admin_delete_template', {
      method: 'POST',
      body: JSON.stringify({ template_id: id }),
    })
  }

  async updateTemplateStatus(id: number, status: 'draft' | 'published') {
    return this.request<{
      success: boolean
      templateId: number
      status: string
      notificationSent: boolean
    }>('/admin_update_template_status', {
      method: 'POST',
      body: JSON.stringify({ template_id: id, status }),
    })
  }

  // Admin: Manually send template notification to agents
  async sendTemplateNotification(templateId: number, agentIds?: number[]) {
    return this.request<{
      success: boolean
      templateId: number
      emailsSent: number
    }>('/admin_send_template_notification', {
      method: 'POST',
      body: JSON.stringify({
        template_id: templateId,
        agent_ids: agentIds && agentIds.length > 0 ? agentIds : null
      }),
    })
  }

  async publishTemplate(id: number) {
    return this.request<any>('/templates/publish', {
      method: 'POST',
      body: JSON.stringify({ template_id: id }),
    })
  }

  // Usage logs endpoints
  async getUsageLogs(params?: { eventType?: string; limit?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.eventType) queryParams.append('event_type', params.eventType)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    return this.request<any[]>(`/usage_logs${query}`)
  }

  async createUsageLog(data: {
    eventType: string
    agentId?: number
    realtorId?: number
    templateId?: number
    details?: string
  }) {
    return this.request<any>('/usage_logs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Error logs endpoints
  async getErrorLogs(params?: { severity?: string; resolved?: boolean }) {
    const queryParams = new URLSearchParams()
    if (params?.severity) queryParams.append('severity', params.severity)
    if (params?.resolved !== undefined)
      queryParams.append('resolved', params.resolved.toString())
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    return this.request<any[]>(`/error_logs${query}`)
  }

  async resolveError(id: number, resolvedBy: string) {
    return this.request<any>('/resolve_error_log', {
      method: 'POST',
      body: JSON.stringify({ error_log_id: id, resolved_by: resolvedBy }),
    })
  }

  // File upload
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${this.apiUrl}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: this.authToken ? `Bearer ${this.authToken}` : '',
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: data.message || 'Upload failed' }
      }

      // Convert relative path to full URL
      if (data.file?.path) {
        const baseUrl = getXanoBaseUrl()
        data.file.url = `${baseUrl}${data.file.path}`
      }

      return { data }
    } catch (error) {
      return { data: null, error: 'Upload error' }
    }
  }

  // Stats/Dashboard endpoints
  async getAdminStats() {
    return this.request<{
      totalAgents: number
      activeAgents: number
      totalRealtors: number
      activeRealtors: number
      totalTemplates: number
      publishedTemplates: number
    }>('/dashboard_stats')
  }

  async getAgentStats() {
    return this.request<{
      totalRealtors: number
      activeRealtors: number
      pendingRealtors: number
      seatsUsed: number
      seatLimit: number
      seatsRemaining: number
      occupiedSeats: number
      canInvite: boolean
    }>('/my_agent_stats')
  }

  // Stripe/Subscription endpoints (public, no auth required)
  async createCheckoutSession(data: {
    firstName: string
    lastName: string
    email: string
    companyName?: string
  }) {
    return this.request<{
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
  }

  async verifyCheckoutSession(sessionId: string) {
    return this.request<{
      verified: boolean
      email: string
      customerId: string
    }>(`/verify_checkout_session?session_id=${sessionId}`)
  }

  // Change password (authenticated)
  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }) {
    return this.request<{ success: boolean }>('/change_password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      }),
    })
  }

  // Get current agent's profile (authenticated agent)
  async getMyAgentProfile() {
    const response = await this.request<any>('/get_agent_profile')
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  // Update current agent's profile (authenticated agent) - for branding page
  async updateMyAgentProfile(data: {
    phone?: string
    brandColor?: string
    logoUrl?: string
    calendlyLink?: string
    cmaLink?: string
    bio?: string
  }) {
    return this.request<any>('/agents/me', {
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
  }

  // Update agent profile info (first name, last name, phone, notifications) - for settings page
  async updateAgentProfile(data: {
    firstName?: string
    lastName?: string
    phone?: string
    templateNotificationsEnabled?: boolean
  }) {
    return this.request<any>('/update_agent_profile', {
      method: 'POST',
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        template_notifications_enabled: data.templateNotificationsEnabled,
      }),
    })
  }

  // Admin: Reset agent password (generates new temp password and sends email)
  async resetAgentPassword(agentId: number) {
    return this.request<{
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
  }

  // Admin: Get detailed agent info with linked realtors
  async adminGetAgentDetails(agentId: number) {
    const response = await this.request<{
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
  }

  // Admin: Deactivate an agent
  async adminDeactivateAgent(agentId: number) {
    return this.request<{ success: boolean; agentId: number; status: string }>('/admin_deactivate_agent', {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId }),
    })
  }

  // Admin: Reactivate an agent (generates new password and sends email)
  async adminReactivateAgent(agentId: number) {
    return this.request<{
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
  }

  // Admin: Delete an agent and all linked realtors
  async adminDeleteAgent(agentId: number) {
    return this.request<{
      success: boolean
      deletedAgentId: number
      message: string
    }>('/admin_delete_agent', {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId }),
    })
  }

  // Admin: Delete a realtor
  async adminDeleteRealtor(realtorId: number) {
    return this.request<{
      success: boolean
      deletedRealtorId: number
      message: string
    }>('/admin_delete_realtor', {
      method: 'POST',
      body: JSON.stringify({ realtor_id: realtorId }),
    })
  }

  // Mark first login as completed (after password change or dismissal)
  async completeFirstLogin() {
    return this.request<{ success: boolean; role: string; realtorId: number | null }>('/complete_first_login', {
      method: 'POST',
    })
  }

  // Activate current realtor's status (called after first login for realtors)
  async activateMyRealtorStatus() {
    return this.request<{ success: boolean }>('/activate_my_realtor_status', {
      method: 'POST',
    })
  }

  // Agent: Send template notification to realtors
  // If realtorIds is provided, sends only to those realtors. Otherwise sends to all active realtors.
  async agentSendTemplateNotificationToRealtors(templateId: number, realtorIds?: number[]) {
    return this.request<{
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
  }
}

export const xano = new XanoService(XANO_AUTH_URL, XANO_API_URL)
export default xano
