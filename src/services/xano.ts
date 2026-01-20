// Xano API Service Layer
// Configure your Xano instance base URLs in environment variables

const XANO_AUTH_URL = process.env.NEXT_PUBLIC_XANO_AUTH_URL || 'https://your-instance.xano.io/api:1'
const XANO_API_URL = process.env.NEXT_PUBLIC_XANO_API_URL || 'https://your-instance.xano.io/api:2'

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

  async updateAgentBranding(data: {
    brandColor?: string
    logoUrl?: string
    calendlyLink?: string
    cmaLink?: string
    bio?: string
  }) {
    return this.request<any>('/update_agent_branding', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Realtor endpoints
  async getRealtors(params?: { agentId?: number; status?: string; search?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.agentId) queryParams.append('agent_id', params.agentId.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    return this.request<any[]>(`/realtors${query}`)
  }

  async getRealtor(id: number) {
    return this.request<any>(`/realtors/${id}`)
  }

  async inviteRealtor(data: {
    email: string
    firstName: string
    lastName: string
    brokerage?: string
    phone?: string
  }) {
    return this.request<any>('/invite_realtor', {
      method: 'POST',
      body: JSON.stringify(data),
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
  }) {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.audience) queryParams.append('audience', params.audience)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await this.request<any[]>(`/templates${query}`)
    // Transform snake_case keys to camelCase
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  async getTemplate(id: number) {
    return this.request<any>(`/templates/${id}`)
  }

  async createTemplate(data: {
    title: string
    category: string
    format: string
    audience: string[]
    shortDescription: string
    downloadLink: string
    previewImageUrl?: string
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
      status: 'draft',
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
    return this.request<any>(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
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
      seatsUsed: number
      seatLimit: number
      templatesAccessed: number
    }>('/stats/agent')
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
    return this.request<{ success: boolean }>('/auth/change_password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      }),
    }, true)
  }

  // Get current agent's profile (authenticated agent)
  async getMyAgentProfile() {
    const response = await this.request<any>('/agents/me')
    if (response.data) {
      response.data = transformKeys(response.data)
    }
    return response
  }

  // Update current agent's profile (authenticated agent)
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

  // Admin: Reset agent password (generates new temp password)
  async resetAgentPassword(agentId: number) {
    return this.request<{
      success: boolean
      tempPassword: string
      agentId: number
      agentEmail: string
    }>('/reset_agent_password', {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId }),
    })
  }
}

export const xano = new XanoService(XANO_AUTH_URL, XANO_API_URL)
export default xano
