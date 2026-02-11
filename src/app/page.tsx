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
        <div className="h-12 w-12 bg-gray-900 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-mono font-bold text-xl">CP</span>
        </div>
        <h1 className="dot-matrix text-2xl text-gray-900 mb-2">THECOLLABPORTAL</h1>
        <p className="text-gray-900 font-mono uppercase tracking-wider text-sm">Loading...</p>
      </div>
    </div>
  )
}
