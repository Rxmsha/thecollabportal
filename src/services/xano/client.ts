// Base Xano API Client
// Configure your Xano instance base URLs in environment variables

export const XANO_AUTH_URL = process.env.NEXT_PUBLIC_XANO_AUTH_URL || 'https://your-instance.xano.io/api:1'
export const XANO_API_URL = process.env.NEXT_PUBLIC_XANO_API_URL || 'https://your-instance.xano.io/api:2'

// Get Xano base URL (without /api:xxx) for file storage
export function getXanoBaseUrl(): string {
  const apiUrl = XANO_API_URL
  // Remove /api:xxx from the URL to get base URL
  return apiUrl.replace(/\/api:[^/]+$/, '')
}

export interface XanoResponse<T> {
  data: T
  error?: string
}

export class XanoClient {
  protected authUrl: string
  protected apiUrl: string
  protected authToken: string | null = null

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

  protected getHeaders(): HeadersInit {
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
        const errorMsg = data.message || data.error || (Object.keys(data).length > 0 ? JSON.stringify(data) : null) || `Request failed (${response.status})`
        return { data: null as T, error: errorMsg }
      }

      return { data }
    } catch (error) {
      return { data: null as T, error: 'Network error' }
    }
  }

  // Make request without auth token (for public endpoints)
  async requestPublic<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<XanoResponse<T>> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.message || data.error || (Object.keys(data).length > 0 ? JSON.stringify(data) : null) || `Request failed (${response.status})`
        return { data: null as T, error: errorMsg }
      }

      return { data }
    } catch (error) {
      return { data: null as T, error: 'Network error' }
    }
  }
}
