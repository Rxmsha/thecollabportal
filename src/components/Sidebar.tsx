'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Palette,
  Wrench,
  Calculator,
  Settings,
  AlertCircle,
  Activity,
  Mail,
  Building2,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

const adminNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Agents', href: '/admin/agents', icon: Building2 },
  { name: 'Realtors', href: '/admin/realtors', icon: Users },
  { name: 'Templates', href: '/admin/templates', icon: FileText },
  { name: 'Usage Logs', href: '/admin/logs', icon: Activity },
  { name: 'Error Logs', href: '/admin/errors', icon: AlertCircle },
]

const agentNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
  { name: 'Branding', href: '/agent/branding', icon: Palette },
  { name: 'My Realtors', href: '/agent/realtors', icon: Users },
  { name: 'Invite Realtor', href: '/agent/invite', icon: UserPlus },
  { name: 'Templates', href: '/agent/templates', icon: FileText },
  { name: 'AI Tools', href: '/agent/tools', icon: Wrench },
  { name: 'Calculators', href: '/agent/calculators', icon: Calculator },
  { name: 'Settings', href: '/agent/settings', icon: Settings },
]

const realtorNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/realtor/dashboard', icon: LayoutDashboard },
  { name: 'Templates', href: '/realtor/templates', icon: FileText },
  { name: 'AI Tools', href: '/realtor/tools', icon: Wrench },
  { name: 'Calculators', href: '/realtor/calculators', icon: Calculator },
  { name: 'Contact Agent', href: '/realtor/contact', icon: Mail },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems
      case 'agent':
        return agentNavItems
      case 'realtor':
        return realtorNavItems
      default:
        return []
    }
  }

  const getRoleTitle = (): string => {
    switch (user?.role) {
      case 'admin':
        return 'Admin Portal'
      case 'agent':
        return 'Agent Portal'
      case 'realtor':
        return 'Realtor Portal'
      default:
        return 'Portal'
    }
  }

  const navItems = getNavItems()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">TheCollabPortal</h1>
              <p className="text-xs text-gray-500">{getRoleTitle()}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} TheCollabPortal
          </p>
        </div>
      </div>
    </aside>
  )
}
