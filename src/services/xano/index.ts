// Xano API Service Layer
// This file composes all domain-specific methods into a single service

import { XanoClient, XANO_AUTH_URL, XANO_API_URL } from './client'
import { addAuthMethods } from './auth'
import { addAgentMethods } from './agents'
import { addRealtorMethods } from './realtors'
import { addTemplateMethods } from './templates'
import { addResourceMethods } from './resources'
import { addAdminMethods } from './admin'
import { addLogMethods } from './logs'
import { addFileMethods } from './files'
import { addStripeMethods } from './stripe'

// Create the XanoService class that combines all domain methods
class XanoService extends XanoClient {
  // Auth methods
  login: ReturnType<typeof addAuthMethods>['login']
  signup: ReturnType<typeof addAuthMethods>['signup']
  me: ReturnType<typeof addAuthMethods>['me']
  validateInvite: ReturnType<typeof addAuthMethods>['validateInvite']
  acceptInvite: ReturnType<typeof addAuthMethods>['acceptInvite']
  changePassword: ReturnType<typeof addAuthMethods>['changePassword']
  completeFirstLogin: ReturnType<typeof addAuthMethods>['completeFirstLogin']

  // Agent methods
  getAgents: ReturnType<typeof addAgentMethods>['getAgents']
  getAgent: ReturnType<typeof addAgentMethods>['getAgent']
  updateAgent: ReturnType<typeof addAgentMethods>['updateAgent']
  updateAgentBranding: ReturnType<typeof addAgentMethods>['updateAgentBranding']
  getMyAgentProfile: ReturnType<typeof addAgentMethods>['getMyAgentProfile']
  updateMyAgentProfile: ReturnType<typeof addAgentMethods>['updateMyAgentProfile']
  updateAgentProfile: ReturnType<typeof addAgentMethods>['updateAgentProfile']
  getAgentStats: ReturnType<typeof addAgentMethods>['getAgentStats']
  agentSendTemplateNotificationToRealtors: ReturnType<typeof addAgentMethods>['agentSendTemplateNotificationToRealtors']
  agentUnlinkRealtor: ReturnType<typeof addAgentMethods>['agentUnlinkRealtor']

  // Realtor methods
  getRealtors: ReturnType<typeof addRealtorMethods>['getRealtors']
  getMyRealtors: ReturnType<typeof addRealtorMethods>['getMyRealtors']
  deactivateRealtor: ReturnType<typeof addRealtorMethods>['deactivateRealtor']
  reactivateRealtor: ReturnType<typeof addRealtorMethods>['reactivateRealtor']
  getRealtor: ReturnType<typeof addRealtorMethods>['getRealtor']
  getMyRealtorDetails: ReturnType<typeof addRealtorMethods>['getMyRealtorDetails']
  resetMyRealtorPassword: ReturnType<typeof addRealtorMethods>['resetMyRealtorPassword']
  inviteRealtor: ReturnType<typeof addRealtorMethods>['inviteRealtor']
  updateRealtor: ReturnType<typeof addRealtorMethods>['updateRealtor']
  getMyRealtorProfile: ReturnType<typeof addRealtorMethods>['getMyRealtorProfile']
  updateRealtorProfile: ReturnType<typeof addRealtorMethods>['updateRealtorProfile']
  activateMyRealtorStatus: ReturnType<typeof addRealtorMethods>['activateMyRealtorStatus']
  resendRealtorInvite: ReturnType<typeof addRealtorMethods>['resendRealtorInvite']
  getMyAgent: ReturnType<typeof addRealtorMethods>['getMyAgent']

  // Template methods
  getTemplates: ReturnType<typeof addTemplateMethods>['getTemplates']
  getTemplate: ReturnType<typeof addTemplateMethods>['getTemplate']
  getPublishedTemplates: ReturnType<typeof addTemplateMethods>['getPublishedTemplates']
  createTemplate: ReturnType<typeof addTemplateMethods>['createTemplate']
  updateTemplate: ReturnType<typeof addTemplateMethods>['updateTemplate']
  deleteTemplate: ReturnType<typeof addTemplateMethods>['deleteTemplate']
  updateTemplateStatus: ReturnType<typeof addTemplateMethods>['updateTemplateStatus']
  publishTemplate: ReturnType<typeof addTemplateMethods>['publishTemplate']

  // Resource methods
  getResources: ReturnType<typeof addResourceMethods>['getResources']
  adminGetResources: ReturnType<typeof addResourceMethods>['adminGetResources']
  adminCreateResource: ReturnType<typeof addResourceMethods>['adminCreateResource']
  adminUpdateResource: ReturnType<typeof addResourceMethods>['adminUpdateResource']
  adminDeleteResource: ReturnType<typeof addResourceMethods>['adminDeleteResource']

  // Admin methods
  updateAgentSeatLimit: ReturnType<typeof addAdminMethods>['updateAgentSeatLimit']
  createAgent: ReturnType<typeof addAdminMethods>['createAgent']
  adminGetRealtors: ReturnType<typeof addAdminMethods>['adminGetRealtors']
  adminDeactivateRealtor: ReturnType<typeof addAdminMethods>['adminDeactivateRealtor']
  adminReactivateRealtor: ReturnType<typeof addAdminMethods>['adminReactivateRealtor']
  adminGetRealtorDetails: ReturnType<typeof addAdminMethods>['adminGetRealtorDetails']
  adminResetRealtorPassword: ReturnType<typeof addAdminMethods>['adminResetRealtorPassword']
  sendTemplateNotification: ReturnType<typeof addAdminMethods>['sendTemplateNotification']
  sendTemplateNotificationToRealtors: ReturnType<typeof addAdminMethods>['sendTemplateNotificationToRealtors']
  getAllRealtors: ReturnType<typeof addAdminMethods>['getAllRealtors']
  getAdminStats: ReturnType<typeof addAdminMethods>['getAdminStats']
  recalculateAllSeats: ReturnType<typeof addAdminMethods>['recalculateAllSeats']
  resetAgentPassword: ReturnType<typeof addAdminMethods>['resetAgentPassword']
  adminGetAgentDetails: ReturnType<typeof addAdminMethods>['adminGetAgentDetails']
  adminDeactivateAgent: ReturnType<typeof addAdminMethods>['adminDeactivateAgent']
  adminReactivateAgent: ReturnType<typeof addAdminMethods>['adminReactivateAgent']
  adminDeleteAgent: ReturnType<typeof addAdminMethods>['adminDeleteAgent']
  adminDeleteRealtor: ReturnType<typeof addAdminMethods>['adminDeleteRealtor']
  adminResendRealtorInvite: ReturnType<typeof addAdminMethods>['adminResendRealtorInvite']
  adminUnlinkRealtor: ReturnType<typeof addAdminMethods>['adminUnlinkRealtor']
  adminLinkRealtorToAgent: ReturnType<typeof addAdminMethods>['adminLinkRealtorToAgent']
  adminCreateRealtor: ReturnType<typeof addAdminMethods>['adminCreateRealtor']

  // Log methods
  getUsageLogs: ReturnType<typeof addLogMethods>['getUsageLogs']
  createUsageLog: ReturnType<typeof addLogMethods>['createUsageLog']
  getErrorLogs: ReturnType<typeof addLogMethods>['getErrorLogs']
  resolveError: ReturnType<typeof addLogMethods>['resolveError']
  logError: ReturnType<typeof addLogMethods>['logError']

  // File methods
  uploadFile: ReturnType<typeof addFileMethods>['uploadFile']

  // Stripe methods
  createCheckoutSession: ReturnType<typeof addStripeMethods>['createCheckoutSession']
  verifyCheckoutSession: ReturnType<typeof addStripeMethods>['verifyCheckoutSession']

  constructor(authUrl: string, apiUrl: string) {
    super(authUrl, apiUrl)

    // Compose all domain methods
    const authMethods = addAuthMethods(this)
    const agentMethods = addAgentMethods(this)
    const realtorMethods = addRealtorMethods(this)
    const templateMethods = addTemplateMethods(this)
    const resourceMethods = addResourceMethods(this)
    const adminMethods = addAdminMethods(this)
    const logMethods = addLogMethods(this)
    const fileMethods = addFileMethods(this)
    const stripeMethods = addStripeMethods(this)

    // Assign auth methods
    this.login = authMethods.login
    this.signup = authMethods.signup
    this.me = authMethods.me
    this.validateInvite = authMethods.validateInvite
    this.acceptInvite = authMethods.acceptInvite
    this.changePassword = authMethods.changePassword
    this.completeFirstLogin = authMethods.completeFirstLogin

    // Assign agent methods
    this.getAgents = agentMethods.getAgents
    this.getAgent = agentMethods.getAgent
    this.updateAgent = agentMethods.updateAgent
    this.updateAgentBranding = agentMethods.updateAgentBranding
    this.getMyAgentProfile = agentMethods.getMyAgentProfile
    this.updateMyAgentProfile = agentMethods.updateMyAgentProfile
    this.updateAgentProfile = agentMethods.updateAgentProfile
    this.getAgentStats = agentMethods.getAgentStats
    this.agentSendTemplateNotificationToRealtors = agentMethods.agentSendTemplateNotificationToRealtors
    this.agentUnlinkRealtor = agentMethods.agentUnlinkRealtor

    // Assign realtor methods
    this.getRealtors = realtorMethods.getRealtors
    this.getMyRealtors = realtorMethods.getMyRealtors
    this.deactivateRealtor = realtorMethods.deactivateRealtor
    this.reactivateRealtor = realtorMethods.reactivateRealtor
    this.getRealtor = realtorMethods.getRealtor
    this.getMyRealtorDetails = realtorMethods.getMyRealtorDetails
    this.resetMyRealtorPassword = realtorMethods.resetMyRealtorPassword
    this.inviteRealtor = realtorMethods.inviteRealtor
    this.updateRealtor = realtorMethods.updateRealtor
    this.getMyRealtorProfile = realtorMethods.getMyRealtorProfile
    this.updateRealtorProfile = realtorMethods.updateRealtorProfile
    this.activateMyRealtorStatus = realtorMethods.activateMyRealtorStatus
    this.resendRealtorInvite = realtorMethods.resendRealtorInvite
    this.getMyAgent = realtorMethods.getMyAgent

    // Assign template methods
    this.getTemplates = templateMethods.getTemplates
    this.getTemplate = templateMethods.getTemplate
    this.getPublishedTemplates = templateMethods.getPublishedTemplates
    this.createTemplate = templateMethods.createTemplate
    this.updateTemplate = templateMethods.updateTemplate
    this.deleteTemplate = templateMethods.deleteTemplate
    this.updateTemplateStatus = templateMethods.updateTemplateStatus
    this.publishTemplate = templateMethods.publishTemplate

    // Assign resource methods
    this.getResources = resourceMethods.getResources
    this.adminGetResources = resourceMethods.adminGetResources
    this.adminCreateResource = resourceMethods.adminCreateResource
    this.adminUpdateResource = resourceMethods.adminUpdateResource
    this.adminDeleteResource = resourceMethods.adminDeleteResource

    // Assign admin methods
    this.updateAgentSeatLimit = adminMethods.updateAgentSeatLimit
    this.createAgent = adminMethods.createAgent
    this.adminGetRealtors = adminMethods.adminGetRealtors
    this.adminDeactivateRealtor = adminMethods.adminDeactivateRealtor
    this.adminReactivateRealtor = adminMethods.adminReactivateRealtor
    this.adminGetRealtorDetails = adminMethods.adminGetRealtorDetails
    this.adminResetRealtorPassword = adminMethods.adminResetRealtorPassword
    this.sendTemplateNotification = adminMethods.sendTemplateNotification
    this.sendTemplateNotificationToRealtors = adminMethods.sendTemplateNotificationToRealtors
    this.getAllRealtors = adminMethods.getAllRealtors
    this.getAdminStats = adminMethods.getAdminStats
    this.recalculateAllSeats = adminMethods.recalculateAllSeats
    this.resetAgentPassword = adminMethods.resetAgentPassword
    this.adminGetAgentDetails = adminMethods.adminGetAgentDetails
    this.adminDeactivateAgent = adminMethods.adminDeactivateAgent
    this.adminReactivateAgent = adminMethods.adminReactivateAgent
    this.adminDeleteAgent = adminMethods.adminDeleteAgent
    this.adminDeleteRealtor = adminMethods.adminDeleteRealtor
    this.adminResendRealtorInvite = adminMethods.adminResendRealtorInvite
    this.adminUnlinkRealtor = adminMethods.adminUnlinkRealtor
    this.adminLinkRealtorToAgent = adminMethods.adminLinkRealtorToAgent
    this.adminCreateRealtor = adminMethods.adminCreateRealtor

    // Assign log methods
    this.getUsageLogs = logMethods.getUsageLogs
    this.createUsageLog = logMethods.createUsageLog
    this.getErrorLogs = logMethods.getErrorLogs
    this.resolveError = logMethods.resolveError
    this.logError = logMethods.logError

    // Assign file methods
    this.uploadFile = fileMethods.uploadFile

    // Assign stripe methods
    this.createCheckoutSession = stripeMethods.createCheckoutSession
    this.verifyCheckoutSession = stripeMethods.verifyCheckoutSession
  }
}

// Create and export the singleton instance
export const xano = new XanoService(XANO_AUTH_URL, XANO_API_URL)
export default xano

// Re-export types and utilities for convenience
export { XanoClient, XANO_AUTH_URL, XANO_API_URL } from './client'
export type { XanoResponse } from './client'
export { transformKeys, snakeToCamel } from './utils'
