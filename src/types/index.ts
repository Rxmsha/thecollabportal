// User types
export type UserRole = 'admin' | 'agent' | 'realtor'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  agentId?: number // For realtors, links to their agent
  firstLoginCompleted?: boolean // For agents - tracks if they've seen the password change prompt
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
export type TemplateCategory = 'social-media' | 'email' | 'flyer' | 'presentation' | 'checklist' | 'guide' | 'business-card' | 'print'
export type TemplateFormat = 'canva' | 'pdf' | 'doc' | 'video' | 'link'
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
  | 'realtor_invited'
  | 'realtor_activated'
  | 'agent_created'
  | 'agent_activated'
  | 'agent_deactivated'
  | 'agent_reactivated'
  | 'realtor_deactivated_by_agent'
  | 'realtor_deactivated_by_admin'
  | 'realtor_reactivated_by_agent'
  | 'realtor_reactivated_by_admin'
  | 'template_created'
  | 'template_published'
  | 'template_updated'
  | 'template_deleted'
  | 'template_notification_sent_to_agents'
  | 'template_notification_sent_to_realtors'

export interface UsageLog {
  id: number
  eventType: EventType
  agentId: number | null
  realtorId: number | null
  templateId: number | null
  details: Record<string, any> | null
  createdAt: string
  // Joined data for display
  agent?: {
    id: number
    firstName: string
    lastName: string
    email: string
  } | null
  realtor?: {
    id: number
    firstName: string
    lastName: string
    email: string
  } | null
  template?: {
    id: number
    title: string
  } | null
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
