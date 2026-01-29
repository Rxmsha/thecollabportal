'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, UserRole } from '@/types'
import xano from '@/services/xano'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

interface SignupData {
  email: string
  password: string
  name: string
  role: UserRole
  companyName?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('xano_auth_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      xano.setAuthToken(token)
      const { data, error } = await xano.me()

      if (error || !data) {
        localStorage.removeItem('xano_auth_token')
        setIsLoading(false)
        return
      }

      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        agentId: data.agent_id,
        firstLoginCompleted: data.first_login_completed,
      })
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await xano.login(email, password)

      if (error || !data) {
        return { success: false, error: error || 'Invalid email or password' }
      }

      if (data.authToken) {
        xano.setAuthToken(data.authToken)
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          agentId: data.user.agent_id,
          firstLoginCompleted: data.user.first_login_completed,
        })

        // Redirect based on role
        const redirectPath = getRedirectPath(data.user.role)
        router.push(redirectPath)

        return { success: true }
      }

      return { success: false, error: 'Invalid email or password' }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const signup = async (signupData: SignupData) => {
    try {
      const { data, error } = await xano.signup(signupData)

      if (error || !data) {
        return { success: false, error: error || 'Signup failed' }
      }

      xano.setAuthToken(data.authToken)
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        agentId: data.user.agent_id,
        firstLoginCompleted: data.user.first_login_completed,
      })

      // Redirect based on role
      const redirectPath = getRedirectPath(data.user.role)
      router.push(redirectPath)

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Signup failed' }
    }
  }

  const logout = () => {
    xano.setAuthToken(null)
    setUser(null)
    router.push('/login')
  }

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data })
    }
  }

  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'agent':
        return '/agent/dashboard'
      case 'realtor':
        return '/realtor/dashboard'
      default:
        return '/login'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
