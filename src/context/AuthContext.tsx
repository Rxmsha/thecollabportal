'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, UserRole } from '@/types'
import xano from '@/services/xano'

// Demo users for testing (when Xano is not configured)
const DEMO_USERS: Record<string, User & { password: string }> = {
  'admin@thecollabportal.com': {
    id: 1,
    email: 'admin@thecollabportal.com',
    name: 'Admin User',
    role: 'admin',
    password: 'demo123',
  },
  'sarah@mortgagepro.com': {
    id: 2,
    email: 'sarah@mortgagepro.com',
    name: 'Sarah Johnson',
    role: 'agent',
    password: 'demo123',
  },
  'jessica.realtor@torontorealty.com': {
    id: 3,
    email: 'jessica.realtor@torontorealty.com',
    name: 'Jessica Miller',
    role: 'realtor',
    agentId: 2,
    password: 'demo123',
  },
}

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
      // Check for demo user in localStorage
      const demoUser = localStorage.getItem('demo_user')
      if (demoUser) {
        setUser(JSON.parse(demoUser))
        setIsLoading(false)
        return
      }

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
      })
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    // Try Xano API first
    try {
      const { data, error } = await xano.login(email, password)

      if (data && data.authToken) {
        xano.setAuthToken(data.authToken)
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          agentId: data.user.agent_id,
        })

        // Redirect based on role
        const redirectPath = getRedirectPath(data.user.role)
        router.push(redirectPath)

        return { success: true }
      }
    } catch (error) {
      console.log('Xano login failed, trying demo users...')
    }

    // Fallback to demo users if Xano fails
    const demoUser = DEMO_USERS[email.toLowerCase()]
    if (demoUser && demoUser.password === password) {
      const userData: User = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        agentId: demoUser.agentId,
      }

      // Store demo user in localStorage
      localStorage.setItem('demo_user', JSON.stringify(userData))
      setUser(userData)

      // Redirect based on role
      const redirectPath = getRedirectPath(userData.role)
      router.push(redirectPath)

      return { success: true }
    }

    return { success: false, error: 'Invalid email or password' }
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
    localStorage.removeItem('demo_user')
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
