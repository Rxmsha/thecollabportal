'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { useBranding } from '@/context/BrandingContext'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { brandColor } = useBranding()

  // Close sidebar when clicking a link (mobile)
  const handleCloseSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300',
          // Mobile: controlled by sidebarOpen state
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop (lg+): always visible
          'lg:!translate-x-0'
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          onNavigate={handleCloseSidebar}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* Mobile menu button - toggles sidebar open/close */}
        <button
          className="lg:hidden fixed top-3 left-3 z-50 p-2.5 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
          style={{ backgroundColor: brandColor }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* Main content with responsive padding */}
        <main className="p-4 pt-16 sm:p-6 sm:pt-6 lg:pt-6">{children}</main>
      </div>
    </div>
  )
}
