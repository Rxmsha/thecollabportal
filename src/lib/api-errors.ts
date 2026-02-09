// Centralized API Error Handling
// Utilities for consistent error handling across the app

import { toast } from '@/hooks/use-toast'

/**
 * Standard API error structure
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
  field?: string // For form validation errors
}

/**
 * Common error messages for consistent UX
 */
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',

  // Auth errors
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',

  // Validation errors
  VALIDATION_FAILED: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',

  // CRUD errors
  NOT_FOUND: 'The requested item was not found.',
  CREATE_FAILED: 'Failed to create. Please try again.',
  UPDATE_FAILED: 'Failed to save changes. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',

  // Generic
  UNKNOWN: 'Something went wrong. Please try again.',
} as const

/**
 * Parse error from API response
 */
export function parseApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error && typeof error === 'object' && 'message' in error) {
    return error as ApiError
  }

  // String error
  if (typeof error === 'string') {
    return { message: error }
  }

  // Error object
  if (error instanceof Error) {
    return { message: error.message }
  }

  // Unknown error
  return { message: ERROR_MESSAGES.UNKNOWN }
}

/**
 * Handle API error with toast notification
 */
export function handleApiError(
  error: unknown,
  options?: {
    fallbackMessage?: string
    showToast?: boolean
    logError?: boolean
  }
): ApiError {
  const { fallbackMessage, showToast = true, logError = true } = options || {}

  const parsedError = parseApiError(error)
  const message = parsedError.message || fallbackMessage || ERROR_MESSAGES.UNKNOWN

  if (logError) {
    console.error('API Error:', parsedError)
  }

  if (showToast) {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }

  return { ...parsedError, message }
}

/**
 * Handle successful API response with toast
 */
export function handleApiSuccess(message: string, title = 'Success') {
  toast({
    title,
    description: message,
    variant: 'success',
  })
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: ApiError): boolean {
  return error.status === 401 || error.code === 'UNAUTHORIZED'
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: ApiError): boolean {
  return error.status === 403 || error.code === 'FORBIDDEN'
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: ApiError): boolean {
  return error.status === 400 || error.code === 'VALIDATION_ERROR'
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: ApiError): boolean {
  return error.status === 404 || error.code === 'NOT_FOUND'
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown, context?: string): string {
  const parsed = parseApiError(error)

  // Use specific message if available
  if (parsed.message && parsed.message !== ERROR_MESSAGES.UNKNOWN) {
    return parsed.message
  }

  // Generate context-aware message
  if (context) {
    return `Failed to ${context}. Please try again.`
  }

  return ERROR_MESSAGES.UNKNOWN
}

/**
 * Wrapper for async operations with error handling
 * Usage: const result = await withErrorHandling(() => xano.getResources(), 'load resources')
 */
export async function withErrorHandling<T>(
  operation: () => Promise<{ data: T; error?: string }>,
  context?: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation()

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  } catch (error) {
    const message = getErrorMessage(error, context)
    return { data: null, error: message }
  }
}
