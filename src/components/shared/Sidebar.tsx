'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBranding } from '@/context/BrandingContext'
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
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  { name: 'Resources', href: '/admin/resources', icon: BookOpen },
  { name: 'AI Tools', href: '/admin/tools', icon: Wrench },
  { name: 'Calculators', href: '/admin/calculators', icon: Calculator },
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
]

const realtorNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/realtor/dashboard', icon: LayoutDashboard },
  { name: 'Templates', href: '/realtor/templates', icon: FileText },
  { name: 'AI Tools', href: '/realtor/tools', icon: Wrench },
  { name: 'Calculators', href: '/realtor/calculators', icon: Calculator },
]

const adminBottomItems: NavItem[] = [
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

const agentBottomItems: NavItem[] = [
  { name: 'Contact Support', href: '/agent/contact', icon: Mail },
  { name: 'Settings', href: '/agent/settings', icon: Settings },
]

const realtorBottomItems: NavItem[] = [
  { name: 'Contact Agent', href: '/realtor/contact', icon: Mail },
  { name: 'Settings', href: '/realtor/settings', icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, onCollapsedChange, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { brandColor, brandColorHover, logo, profilePhoto } = useBranding()
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  const isCollapsed = onCollapsedChange ? collapsed : internalCollapsed
  const setIsCollapsed = onCollapsedChange || setInternalCollapsed

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

  const getBottomItems = (): NavItem[] => {
    switch (user?.role) {
      case 'admin':
        return adminBottomItems
      case 'agent':
        return agentBottomItems
      case 'realtor':
        return realtorBottomItems
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
  const bottomItems = getBottomItems()

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors relative group rounded-lg ${
          isCollapsed ? 'justify-center px-2' : ''
        } ${
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
        title={isCollapsed ? item.name : undefined}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!isCollapsed && item.name}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.name}
          </div>
        )}
      </Link>
    )
  }

  return (
    <aside
      className={`h-screen text-white flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ backgroundColor: brandColor }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 object-contain flex-shrink-0 rounded-lg"
            />
          ) : (
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
              CP
            </div>
          )}
          {!isCollapsed && (
            <div>
              <p className="font-semibold text-sm">The Collab Portal</p>
              <p className="text-xs text-white/60">{getRoleTitle()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button - hidden on mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 border border-white/20 rounded-full hidden lg:flex items-center justify-center cursor-pointer z-10 transition-colors"
        style={{ backgroundColor: brandColor }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandColorHover}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = brandColor}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* User Info */}
      {user && (
        <div className={`p-4 border-b border-white/10 ${isCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            {user.role === 'agent' && profilePhoto ? (
              <img
                src={profilePhoto}
                alt={user.name || 'Profile'}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-white/60 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={`flex-1 p-4 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
        {navItems.map(renderNavLink)}
      </nav>

      {/* Bottom Navigation */}
      <div className={`p-4 border-t border-white/10 space-y-1 ${isCollapsed ? 'px-2' : ''}`}>
        {bottomItems.map(renderNavLink)}
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full relative group rounded-lg ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && 'Sign Out'}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
