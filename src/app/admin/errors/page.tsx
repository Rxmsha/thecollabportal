'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Bug,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import xano from '@/services/xano'
import { formatDateTime } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/context/BrandingContext'
import { ErrorLog } from '@/types'

const ITEMS_PER_PAGE = 50

export default function AdminErrorsPage() {
  const { user } = useAuth()
  const { brandColor } = useBranding()
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [resolvedFilter, setResolvedFilter] = useState('unresolved')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadErrors()
    setCurrentPage(1)
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

  // Pagination calculations
  const totalPages = Math.ceil(errors.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedErrors = errors.slice(startIndex, endIndex)

  // Stats
  const criticalCount = errors.filter(e => e.severity === 'critical' && !e.resolved).length
  const warningCount = errors.filter(e => e.severity === 'warning' && !e.resolved).length
  const infoCount = errors.filter(e => e.severity === 'info' && !e.resolved).length
  const resolvedCount = errors.filter(e => e.resolved).length

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-600',
          label: 'Critical'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-600',
          label: 'Warning'
        }
      default:
        return {
          icon: Info,
          color: 'text-blue-600',
          bgColor: 'bg-blue-600',
          label: 'Info'
        }
    }
  }

  const getSourceConfig = (source: string) => {
    const configs: { [key: string]: { color: string; bgColor: string } } = {
      zapier: { color: 'text-orange-600', bgColor: 'bg-orange-600' },
      stripe: { color: 'text-purple-600', bgColor: 'bg-purple-600' },
      sendgrid: { color: 'text-blue-600', bgColor: 'bg-blue-600' },
      xano: { color: 'text-[#0077B6]', bgColor: 'bg-[#0077B6]' },
      frontend: { color: 'text-gray-600', bgColor: 'bg-gray-600' },
    }
    return configs[source] || { color: 'text-gray-600', bgColor: 'bg-gray-600' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="dot-matrix text-xl text-gray-900">ERROR LOGS</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            Monitor and resolve system errors
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40 font-mono text-xs uppercase tracking-wider rounded-none border-gray-300">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all" className="font-mono text-xs uppercase">All Severities</SelectItem>
              <SelectItem value="critical" className="font-mono text-xs uppercase">Critical</SelectItem>
              <SelectItem value="warning" className="font-mono text-xs uppercase">Warning</SelectItem>
              <SelectItem value="info" className="font-mono text-xs uppercase">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
            <SelectTrigger className="w-40 font-mono text-xs uppercase tracking-wider rounded-none border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all" className="font-mono text-xs uppercase">All Status</SelectItem>
              <SelectItem value="unresolved" className="font-mono text-xs uppercase">Unresolved</SelectItem>
              <SelectItem value="resolved" className="font-mono text-xs uppercase">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 overflow-hidden">
          <div className="bg-red-600 px-4 py-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-white" />
            <span className="text-white font-mono text-xs uppercase tracking-wider">Critical</span>
          </div>
          <CardContent className="p-4 bg-white">
            <div className="text-3xl font-bold text-red-600 font-mono">{criticalCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden">
          <div className="bg-amber-600 px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-white" />
            <span className="text-white font-mono text-xs uppercase tracking-wider">Warning</span>
          </div>
          <CardContent className="p-4 bg-white">
            <div className="text-3xl font-bold text-amber-600 font-mono">{warningCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden">
          <div className="bg-blue-600 px-4 py-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-white" />
            <span className="text-white font-mono text-xs uppercase tracking-wider">Info</span>
          </div>
          <CardContent className="p-4 bg-white">
            <div className="text-3xl font-bold text-blue-600 font-mono">{infoCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden">
          <div className="bg-emerald-600 px-4 py-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-white" />
            <span className="text-white font-mono text-xs uppercase tracking-wider">Resolved</span>
          </div>
          <CardContent className="p-4 bg-white">
            <div className="text-3xl font-bold text-emerald-600 font-mono">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 overflow-hidden">
        <div className="px-6 py-3 flex items-center gap-3" style={{ backgroundColor: brandColor }}>
          <Bug className="h-5 w-5 text-white" />
          <span className="text-white font-mono font-medium uppercase tracking-wider">Error Log</span>
          <span className="text-white/60 font-mono text-sm ml-auto">
            {errors.length} {errors.length === 1 ? 'error' : 'errors'}
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </span>
        </div>
        <CardContent className="p-0 bg-white">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 w-1/4 animate-pulse" />
                    <div className="h-3 bg-gray-100 w-1/2 animate-pulse" />
                    <div className="h-3 bg-gray-100 w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedErrors.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {paginatedErrors.map((error) => {
                const severityConfig = getSeverityConfig(error.severity)
                const sourceConfig = getSourceConfig(error.source)
                const SeverityIcon = severityConfig.icon

                return (
                  <div
                    key={error.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      error.resolved ? 'bg-gray-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 ${severityConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <SeverityIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider border ${severityConfig.color} border-current bg-white`}>
                              {severityConfig.label}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono uppercase tracking-wider border ${sourceConfig.color} border-current bg-white`}>
                              {error.source}
                            </span>
                            {error.resolved && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono uppercase tracking-wider border text-emerald-600 border-emerald-600 bg-white">
                                <CheckCircle className="h-3 w-3" />
                                Resolved
                              </span>
                            )}
                          </div>
                          <h3 className="font-mono font-medium text-gray-900">
                            {error.scenarioName}
                          </h3>
                          <p className="text-sm text-gray-500 font-mono mt-1">
                            {error.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-mono">
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
                          className="rounded-none font-mono uppercase tracking-wider text-xs"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-12 w-12 bg-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <p className="text-gray-500 font-mono uppercase tracking-wider">No errors found</p>
              <p className="text-sm text-gray-400 mt-1 font-mono">
                {resolvedFilter === 'unresolved'
                  ? 'All errors have been resolved!'
                  : 'No matching errors'}
              </p>
            </div>
          )}
        </CardContent>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500 font-mono">
              Showing {startIndex + 1}-{Math.min(endIndex, errors.length)} of {errors.length}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-none font-mono"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-none font-mono"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 1) return true
                    return false
                  })
                  .map((page, idx, arr) => {
                    const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className="px-2 text-gray-400 font-mono">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="rounded-none font-mono min-w-[36px]"
                          style={currentPage === page ? { backgroundColor: brandColor } : undefined}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    )
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-none font-mono"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-none font-mono"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
