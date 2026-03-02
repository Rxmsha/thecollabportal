'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/context/BrandingContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import xano from '@/services/xano'

export default function RealtorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const { setBrandColor } = useBranding()
  const router = useRouter()
  const [brandingLoaded, setBrandingLoaded] = useState(false)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'realtor')) {
      router.push('/login')
    }
  }, [user, isLoading, isAuthenticated, router])

  // Fetch and apply the linked agent's brand color
  useEffect(() => {
    const loadAgentBranding = async () => {
      if (isAuthenticated && user?.role === 'realtor') {
        try {
          const { data } = await xano.getMyAgent()
          if (data?.brandColor) {
            setBrandColor(data.brandColor)
          }
        } catch (error) {
          console.error('Failed to load agent branding:', error)
        } finally {
          setBrandingLoaded(true)
        }
      }
    }
    loadAgentBranding()
  }, [isAuthenticated, user, setBrandColor])

  if (isLoading || !brandingLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 bg-[#1a2332] flex items-center justify-center mx-auto mb-2 animate-pulse">
            <span className="text-white font-bold text-sm font-mono">CP</span>
          </div>
          <p className="text-gray-500 text-sm font-mono uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'realtor') {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
