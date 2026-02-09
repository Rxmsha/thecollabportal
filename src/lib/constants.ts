// App-wide constants
// Centralized values used across the application

// ==================== User Roles ====================
export const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  REALTOR: 'realtor',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.AGENT]: 'Agent',
  [ROLES.REALTOR]: 'Realtor',
}

export const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  [ROLES.ADMIN]: { bg: 'bg-purple-100', text: 'text-purple-700' },
  [ROLES.AGENT]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [ROLES.REALTOR]: { bg: 'bg-green-100', text: 'text-green-700' },
}

// ==================== Realtor Statuses ====================
export const REALTOR_STATUS = {
  ACTIVE: 'active',
  INVITED: 'invited',
  INACTIVE: 'inactive',
} as const

export type RealtorStatusType = (typeof REALTOR_STATUS)[keyof typeof REALTOR_STATUS]

export const REALTOR_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: REALTOR_STATUS.ACTIVE, label: 'Active' },
  { value: REALTOR_STATUS.INVITED, label: 'Invited' },
  { value: REALTOR_STATUS.INACTIVE, label: 'Inactive' },
] as const

// ==================== Agent Statuses ====================
export const AGENT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  INACTIVE: 'inactive',
} as const

export type AgentStatusType = (typeof AGENT_STATUS)[keyof typeof AGENT_STATUS]

export const AGENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: AGENT_STATUS.ACTIVE, label: 'Active' },
  { value: AGENT_STATUS.SUSPENDED, label: 'Suspended' },
  { value: AGENT_STATUS.INACTIVE, label: 'Inactive' },
] as const

// ==================== Template Constants ====================
export const TEMPLATE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const

export type TemplateStatusType = (typeof TEMPLATE_STATUS)[keyof typeof TEMPLATE_STATUS]

export const TEMPLATE_CATEGORIES = {
  SOCIAL_MEDIA: 'social-media',
  EMAIL: 'email',
  FLYER: 'flyer',
  PRESENTATION: 'presentation',
  CHECKLIST: 'checklist',
  GUIDE: 'guide',
} as const

export type TemplateCategoryType = (typeof TEMPLATE_CATEGORIES)[keyof typeof TEMPLATE_CATEGORIES]

export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: TEMPLATE_CATEGORIES.SOCIAL_MEDIA, label: 'Social Media' },
  { value: TEMPLATE_CATEGORIES.EMAIL, label: 'Email' },
  { value: TEMPLATE_CATEGORIES.FLYER, label: 'Flyer' },
  { value: TEMPLATE_CATEGORIES.PRESENTATION, label: 'Presentation' },
  { value: TEMPLATE_CATEGORIES.CHECKLIST, label: 'Checklist' },
  { value: TEMPLATE_CATEGORIES.GUIDE, label: 'Guide' },
] as const

export const TEMPLATE_FORMATS = {
  CANVA: 'canva',
  PDF: 'pdf',
  DOC: 'doc',
  VIDEO: 'video',
  LINK: 'link',
} as const

export type TemplateFormatType = (typeof TEMPLATE_FORMATS)[keyof typeof TEMPLATE_FORMATS]

export const TEMPLATE_FORMAT_OPTIONS = [
  { value: TEMPLATE_FORMATS.CANVA, label: 'Canva' },
  { value: TEMPLATE_FORMATS.PDF, label: 'PDF' },
  { value: TEMPLATE_FORMATS.DOC, label: 'Document' },
  { value: TEMPLATE_FORMATS.VIDEO, label: 'Video' },
  { value: TEMPLATE_FORMATS.LINK, label: 'Link' },
] as const

// ==================== Resource Constants ====================
export const RESOURCE_TYPE = {
  LINK: 'link',
  FILE: 'file',
} as const

export type ResourceTypeValue = (typeof RESOURCE_TYPE)[keyof typeof RESOURCE_TYPE]

export const RESOURCE_TYPE_OPTIONS = [
  { value: RESOURCE_TYPE.LINK, label: 'External Link', icon: 'ExternalLink' },
  { value: RESOURCE_TYPE.FILE, label: 'File Upload', icon: 'FileUp' },
] as const

// ==================== Audience Constants ====================
export const AUDIENCE = {
  AGENTS: 'agents',
  REALTORS: 'realtors',
  BOTH: 'both',
} as const

export type AudienceType = (typeof AUDIENCE)[keyof typeof AUDIENCE]

export const AUDIENCE_OPTIONS = [
  { value: AUDIENCE.BOTH, label: 'Both Agents & Realtors' },
  { value: AUDIENCE.AGENTS, label: 'Agents Only' },
  { value: AUDIENCE.REALTORS, label: 'Realtors Only' },
] as const

// ==================== Error Log Constants ====================
export const ERROR_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const

export type ErrorSeverityType = (typeof ERROR_SEVERITY)[keyof typeof ERROR_SEVERITY]

export const ERROR_SEVERITY_OPTIONS = [
  { value: 'all', label: 'All Severities' },
  { value: ERROR_SEVERITY.CRITICAL, label: 'Critical' },
  { value: ERROR_SEVERITY.WARNING, label: 'Warning' },
  { value: ERROR_SEVERITY.INFO, label: 'Info' },
] as const

export const ERROR_SOURCE = {
  ZAPIER: 'zapier',
  STRIPE: 'stripe',
  SENDGRID: 'sendgrid',
  XANO: 'xano',
  FRONTEND: 'frontend',
} as const

// ==================== Log Event Categories ====================
export const LOG_CATEGORY = {
  AGENT: 'agent',
  REALTOR: 'realtor',
  TEMPLATE: 'template',
} as const

export type LogCategoryType = (typeof LOG_CATEGORY)[keyof typeof LOG_CATEGORY]

export const LOG_CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: LOG_CATEGORY.AGENT, label: 'Agent Events' },
  { value: LOG_CATEGORY.REALTOR, label: 'Realtor Events' },
  { value: LOG_CATEGORY.TEMPLATE, label: 'Template Events' },
] as const

// ==================== Pagination ====================
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

// ==================== Validation ====================
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  BIO_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const

// ==================== App Routes ====================
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  SUBSCRIBE: '/subscribe',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_AGENTS: '/admin/agents',
  ADMIN_REALTORS: '/admin/realtors',
  ADMIN_TEMPLATES: '/admin/templates',
  ADMIN_RESOURCES: '/admin/resources',
  ADMIN_TOOLS: '/admin/tools',
  ADMIN_CALCULATORS: '/admin/calculators',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_ERRORS: '/admin/errors',
  ADMIN_SETTINGS: '/admin/settings',

  // Agent
  AGENT_DASHBOARD: '/agent/dashboard',
  AGENT_BRANDING: '/agent/branding',
  AGENT_REALTORS: '/agent/realtors',
  AGENT_INVITE: '/agent/invite',
  AGENT_TEMPLATES: '/agent/templates',
  AGENT_TOOLS: '/agent/tools',
  AGENT_CALCULATORS: '/agent/calculators',
  AGENT_SETTINGS: '/agent/settings',

  // Realtor
  REALTOR_DASHBOARD: '/realtor/dashboard',
  REALTOR_TEMPLATES: '/realtor/templates',
  REALTOR_TOOLS: '/realtor/tools',
  REALTOR_CALCULATORS: '/realtor/calculators',
  REALTOR_CONTACT: '/realtor/contact',
  REALTOR_SETTINGS: '/realtor/settings',
} as const
