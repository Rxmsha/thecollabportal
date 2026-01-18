'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Redirect based on role
    switch (user?.role) {
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'agent':
        router.push('/agent/dashboard')
        break
      case 'realtor':
        router.push('/realtor/dashboard')
        break
      default:
        router.push('/login')
    }
  }, [user, isLoading, isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">CP</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">TheCollabPortal</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}
