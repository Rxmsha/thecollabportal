'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'agent')) {
      router.push('/login')
    }
  }, [user, isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto mb-2 animate-pulse">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'agent') {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
