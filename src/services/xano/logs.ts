// Usage and Error log methods for Xano API

import { XanoClient } from './client'

export function addLogMethods<T extends XanoClient>(client: T) {
  return {
    // Usage logs endpoints
    async getUsageLogs(params?: { eventType?: string; limit?: number }) {
      const queryParams = new URLSearchParams()
      if (params?.eventType) queryParams.append('event_type', params.eventType)
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      return client.request<any[]>(`/usage_logs${query}`)
    },

    async createUsageLog(data: {
      eventType: string
      agentId?: number
      realtorId?: number
      templateId?: number
      details?: string
    }) {
      return client.request<any>('/usage_logs', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Error logs endpoints
    async getErrorLogs(params?: { severity?: string; resolved?: boolean }) {
      const queryParams = new URLSearchParams()
      if (params?.severity) queryParams.append('severity', params.severity)
      if (params?.resolved !== undefined)
        queryParams.append('resolved', params.resolved.toString())
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      return client.request<any[]>(`/error_logs${query}`)
    },

    async resolveError(id: number, resolvedBy: string) {
      return client.request<any>('/resolve_error_log', {
        method: 'POST',
        body: JSON.stringify({ error_log_id: id, resolved_by: resolvedBy }),
      })
    },

    // Log an error (fire and forget - doesn't throw)
    async logError(source: string, scenarioName: string, message: string, severity: 'error' | 'warning' | 'critical' = 'error') {
      try {
        await client.request<any>('/log-error', {
          method: 'POST',
          body: JSON.stringify({
            source,
            scenario_name: scenarioName,
            message,
            severity,
          }),
        })
      } catch (e) {
        // Silently fail - we don't want error logging to cause more errors
        console.error('Failed to log error:', e)
      }
    },
  }
}
