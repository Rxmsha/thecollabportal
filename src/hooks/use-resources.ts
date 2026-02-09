'use client'

import { useState, useEffect, useCallback } from 'react'
import xano from '@/services/xano'

/**
 * Resource type from the API
 */
export interface Resource {
  id: number
  title: string
  description: string
  buttonText: string
  resourceUrl: string
  resourceType: 'link' | 'file'
  audience: 'agents' | 'realtors' | 'both'
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Hook state
 */
interface UseResourcesState {
  resources: Resource[]
  isLoading: boolean
  error: string | null
}

/**
 * Hook return type
 */
interface UseResourcesReturn extends UseResourcesState {
  refresh: () => Promise<void>
}

/**
 * Custom hook for fetching resources for the current user's role
 *
 * Usage:
 * ```tsx
 * const { resources, isLoading, error, refresh } = useResources()
 * ```
 */
export function useResources(): UseResourcesReturn {
  const [state, setState] = useState<UseResourcesState>({
    resources: [],
    isLoading: true,
    error: null,
  })

  const fetchResources = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data, error } = await xano.getResources()

      if (error) {
        setState({ resources: [], isLoading: false, error })
        return
      }

      setState({
        resources: data || [],
        isLoading: false,
        error: null,
      })
    } catch (err) {
      setState({
        resources: [],
        isLoading: false,
        error: 'Failed to load resources',
      })
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  return {
    ...state,
    refresh: fetchResources,
  }
}

/**
 * Hook for admin resource management
 */
interface UseAdminResourcesReturn extends UseResourcesState {
  refresh: () => Promise<void>
  createResource: (data: CreateResourceData) => Promise<{ success: boolean; error?: string }>
  updateResource: (id: number, data: UpdateResourceData) => Promise<{ success: boolean; error?: string }>
  deleteResource: (id: number) => Promise<{ success: boolean; error?: string }>
}

interface CreateResourceData {
  title: string
  description: string
  buttonText: string
  resourceUrl: string
  resourceType: 'link' | 'file'
  audience: 'agents' | 'realtors' | 'both'
  displayOrder?: number
}

interface UpdateResourceData extends Partial<CreateResourceData> {
  isActive?: boolean
}

/**
 * Custom hook for admin resource management (CRUD operations)
 *
 * Usage:
 * ```tsx
 * const { resources, isLoading, createResource, updateResource, deleteResource } = useAdminResources()
 * ```
 */
export function useAdminResources(): UseAdminResourcesReturn {
  const [state, setState] = useState<UseResourcesState>({
    resources: [],
    isLoading: true,
    error: null,
  })

  const fetchResources = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data, error } = await xano.adminGetResources()

      if (error) {
        setState({ resources: [], isLoading: false, error })
        return
      }

      setState({
        resources: data || [],
        isLoading: false,
        error: null,
      })
    } catch (err) {
      setState({
        resources: [],
        isLoading: false,
        error: 'Failed to load resources',
      })
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const createResource = useCallback(async (data: CreateResourceData) => {
    try {
      const { error } = await xano.adminCreateResource(data)

      if (error) {
        return { success: false, error }
      }

      await fetchResources()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to create resource' }
    }
  }, [fetchResources])

  const updateResource = useCallback(async (id: number, data: UpdateResourceData) => {
    try {
      const { error } = await xano.adminUpdateResource(id, data)

      if (error) {
        return { success: false, error }
      }

      await fetchResources()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to update resource' }
    }
  }, [fetchResources])

  const deleteResource = useCallback(async (id: number) => {
    try {
      const { error } = await xano.adminDeleteResource(id)

      if (error) {
        return { success: false, error }
      }

      await fetchResources()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to delete resource' }
    }
  }, [fetchResources])

  return {
    ...state,
    refresh: fetchResources,
    createResource,
    updateResource,
    deleteResource,
  }
}
