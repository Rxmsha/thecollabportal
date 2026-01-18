// User types
export type UserRole = 'admin' | 'agent' | 'realtor'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  agentId?: number // For realtors, links to their agent
}

// Agent types
export type AgentStatus = 'active' | 'suspended' | 'cancelled'

export interface Agent {
  id: number
  firstName: string
  lastName: string
  email: string
  companyName: string
  phone: string
  status: AgentStatus
  brandColor: string
  logoUrl: string
  calendlyLink: string
  cmaLink: string
  bio: string
  seatLimit: number
  seatsUsed: number
  createdAt: string
  lastLogin: string
}

// Realtor types
export type RealtorStatus = 'invited' | 'active' | 'inactive'

export interface Realtor {
  id: number
  agentId: number
  firstName: string
  lastName: string
  email: string
  brokerage: string
  phone: string
  status: RealtorStatus
  inviteSentAt: string
  activatedAt: string | null
  lastEmailSent: string | null
}

// Template types
export type TemplateCategory = 'listing' | 'social' | 'email' | 'video' | 'document'
export type TemplateFormat = 'canva' | 'pdf' | 'google_doc' | 'video'
export type TemplateAudience = 'mortgage_agents' | 'realtors'
export type TemplateStatus = 'draft' | 'published'

export interface Template {
  id: number
  title: string
  category: TemplateCategory
  format: TemplateFormat
  audience: TemplateAudience[]
  shortDescription: string
  previewImageUrl: string
  downloadLink: string
  status: TemplateStatus
  publishedAt: string | null
  createdAt: string
  releaseNotes: string
  createdBy: string
}

// Log types
export type EventType =
  | 'template_published'
  | 'email_sent'
  | 'realtor_invited'
  | 'realtor_activated'
  | 'agent_created'
  | 'branding_updated'

export interface UsageLog {
  id: number
  eventType: EventType
  agentId: number | null
  realtorId: number | null
  templateId: number | null
  details: string
  createdAt: string
}

// Error log types
export type ErrorSource = 'zapier' | 'stripe' | 'sendgrid' | 'xano' | 'frontend'
export type ErrorSeverity = 'info' | 'warning' | 'critical'

export interface ErrorLog {
  id: number
  source: ErrorSource
  scenarioName: string
  message: string
  severity: ErrorSeverity
  resolved: boolean
  resolvedBy: string | null
  createdAt: string
}

// Auth types
export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name: string
  role: UserRole
  companyName?: string
  phone?: string
}
