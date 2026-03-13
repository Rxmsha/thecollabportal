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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="dot-matrix text-2xl text-gray-900">Error Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and resolve system errors
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-3">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-40 text-sm rounded-lg border-gray-300 bg-white">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all" className="text-sm">All Severities</SelectItem>
              <SelectItem value="critical" className="text-sm">Critical</SelectItem>
              <SelectItem value="warning" className="text-sm">Warning</SelectItem>
              <SelectItem value="info" className="text-sm">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
            <SelectTrigger className="w-full sm:w-40 text-sm rounded-lg border-gray-300 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all" className="text-sm">All Status</SelectItem>
              <SelectItem value="unresolved" className="text-sm">Unresolved</SelectItem>
              <SelectItem value="resolved" className="text-sm">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="bg-red-600 px-3 sm:px-4 py-2 flex items-center gap-2 rounded-t-lg">
            <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-medium truncate">Critical</span>
          </div>
          <CardContent className="p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="text-2xl sm:text-3xl font-bold text-red-600">{criticalCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="bg-amber-600 px-3 sm:px-4 py-2 flex items-center gap-2 rounded-t-lg">
            <AlertTriangle className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-medium truncate">Warning</span>
          </div>
          <CardContent className="p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">{warningCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="bg-blue-600 px-3 sm:px-4 py-2 flex items-center gap-2 rounded-t-lg">
            <Info className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-medium truncate">Info</span>
          </div>
          <CardContent className="p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{infoCount}</div>
          </CardContent>
        </Card>
        <Card className="border-0 overflow-hidden rounded-lg">
          <div className="bg-emerald-600 px-3 sm:px-4 py-2 flex items-center gap-2 rounded-t-lg">
            <CheckCircle className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-medium truncate">Resolved</span>
          </div>
          <CardContent className="p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 overflow-hidden rounded-lg">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
          <Bug className="h-5 w-5 text-white flex-shrink-0" />
          <span className="text-white font-semibold text-sm sm:text-base">Error Log</span>
          <span className="text-white/60 text-xs sm:text-sm ml-auto">
            {errors.length} {errors.length === 1 ? 'error' : 'errors'}
            <span className="hidden sm:inline">{totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}</span>
          </span>
        </div>
        <CardContent className="p-0 bg-white rounded-b-lg">
          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
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
                    className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                      error.resolved ? 'bg-gray-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg ${severityConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <SeverityIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${severityConfig.color} border-current bg-white`}>
                            {severityConfig.label}
                          </span>
                          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border ${sourceConfig.color} border-current bg-white capitalize`}>
                            {error.source}
                          </span>
                          {error.resolved && (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full border text-emerald-600 border-emerald-600 bg-white">
                              <CheckCircle className="h-3 w-3" />
                              <span className="hidden sm:inline">Resolved</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base break-words">
                          {error.scenarioName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                          {error.message}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-400 flex-wrap">
                            <span>{formatDateTime(error.createdAt)}</span>
                            {error.resolved && error.resolvedBy && (
                              <span className="truncate">Resolved by {error.resolvedBy}</span>
                            )}
                          </div>
                          {!error.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve(error.id)}
                              className="rounded-lg text-xs w-full sm:w-auto mt-2 sm:mt-0"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="text-gray-500 font-medium text-sm sm:text-base">No errors found</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {resolvedFilter === 'unresolved'
                  ? 'All errors have been resolved!'
                  : 'No matching errors'}
              </p>
            </div>
          )}
        </CardContent>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 rounded-b-lg">
            <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
              Showing {startIndex + 1}-{Math.min(endIndex, errors.length)} of {errors.length}
            </div>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded-lg hidden sm:flex"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers - simplified on mobile */}
              <div className="flex items-center gap-1 mx-1 sm:mx-2">
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
                          <span className="px-1 sm:px-2 text-gray-400 text-sm">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="rounded-lg min-w-[32px] sm:min-w-[36px] text-xs sm:text-sm"
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
                className="rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg hidden sm:flex"
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
