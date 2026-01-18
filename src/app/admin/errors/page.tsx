'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import xano from '@/services/xano'
import { formatDateTime } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { ErrorLog } from '@/types'

export default function AdminErrorsPage() {
  const { user } = useAuth()
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [resolvedFilter, setResolvedFilter] = useState('unresolved')

  useEffect(() => {
    loadErrors()
  }, [severityFilter, resolvedFilter])

  const loadErrors = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await xano.getErrorLogs({
        severity: severityFilter === 'all' ? undefined : severityFilter,
        resolved: resolvedFilter === 'all' ? undefined : resolvedFilter === 'resolved',
      })
      if (data) {
        setErrors(data)
      }
    } catch (error) {
      console.error('Failed to load errors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = async (errorId: number) => {
    try {
      await xano.resolveError(errorId, user?.name || 'Admin')
      setErrors((prev) =>
        prev.map((e) =>
          e.id === errorId
            ? { ...e, resolved: true, resolvedBy: user?.name || 'Admin' }
            : e
        )
      )
    } catch (error) {
      console.error('Failed to resolve error:', error)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'warning':
        return <Badge variant="warning">Warning</Badge>
      default:
        return <Badge variant="default">Info</Badge>
    }
  }

  const getSourceBadge = (source: string) => {
    const colors: { [key: string]: string } = {
      zapier: 'orange',
      stripe: 'purple',
      sendgrid: 'default',
      xano: 'secondary',
      frontend: 'secondary',
    }
    return (
      <Badge variant={(colors[source] as any) || 'secondary'} className="capitalize">
        {source}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-500 mt-1">
            Monitor and resolve system errors
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : errors.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className={`p-4 ${
                    error.resolved ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(error.severity)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityBadge(error.severity)}
                          {getSourceBadge(error.source)}
                          {error.resolved && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {error.scenarioName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {error.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{formatDateTime(error.createdAt)}</span>
                          {error.resolved && error.resolvedBy && (
                            <span>Resolved by {error.resolvedBy}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!error.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(error.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-gray-500">No errors found</p>
              <p className="text-sm text-gray-400 mt-1">
                {resolvedFilter === 'unresolved'
                  ? 'All errors have been resolved!'
                  : 'No matching errors'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
