'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// Predefined brand colors - minimalistic professional palette
export const BRAND_COLORS = [
  { name: 'Navy', value: '#1e3a5f', textColor: 'white' },
  { name: 'Slate', value: '#475569', textColor: 'white' },
  { name: 'Charcoal', value: '#374151', textColor: 'white' },
  { name: 'Steel', value: '#334155', textColor: 'white' },
  { name: 'Graphite', value: '#1f2937', textColor: 'white' },
  { name: 'Forest', value: '#14532d', textColor: 'white' },
  { name: 'Burgundy', value: '#7f1d1d', textColor: 'white' },
  { name: 'Deep Blue', value: '#1e40af', textColor: 'white' },
]

export const DEFAULT_BRAND_COLOR = '#1e3a5f'
export const DEFAULT_LOGO = null // null means use the default "CP" text logo

interface BrandingContextType {
  brandColor: string
  setBrandColor: (color: string) => void
  brandColorHover: string
  logo: string | null
  setLogo: (logo: string | null) => void
  profilePhoto: string | null
  setProfilePhoto: (photo: string | null) => void
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [brandColor, setBrandColorState] = useState(DEFAULT_BRAND_COLOR)
  const [logo, setLogoState] = useState<string | null>(DEFAULT_LOGO)
  const [profilePhoto, setProfilePhotoState] = useState<string | null>(null)

  // Load saved color, logo, and profile photo on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('adminBrandColor')
    if (savedColor) {
      setBrandColorState(savedColor)
    }
    const savedLogo = localStorage.getItem('adminLogo')
    if (savedLogo) {
      setLogoState(savedLogo)
    }
    const savedProfilePhoto = localStorage.getItem('agentProfilePhoto')
    if (savedProfilePhoto) {
      setProfilePhotoState(savedProfilePhoto)
    }
  }, [])

  // Save color when it changes
  const setBrandColor = (color: string) => {
    setBrandColorState(color)
    localStorage.setItem('adminBrandColor', color)
  }

  // Save logo when it changes
  const setLogo = (newLogo: string | null) => {
    setLogoState(newLogo)
    if (newLogo) {
      localStorage.setItem('adminLogo', newLogo)
    } else {
      localStorage.removeItem('adminLogo')
    }
  }

  // Save profile photo when it changes
  const setProfilePhoto = (photo: string | null) => {
    setProfilePhotoState(photo)
    if (photo) {
      localStorage.setItem('agentProfilePhoto', photo)
    } else {
      localStorage.removeItem('agentProfilePhoto')
    }
  }

  // Calculate hover color (slightly lighter)
  const brandColorHover = adjustBrightness(brandColor, 20)

  return (
    <BrandingContext.Provider value={{ brandColor, setBrandColor, brandColorHover, logo, setLogo, profilePhoto, setProfilePhoto }}>
      {children}
    </BrandingContext.Provider>
  )
}

// Custom event names for syncing state across components
const BRAND_COLOR_CHANGE_EVENT = 'agentBrandColorChange'
const PROFILE_PHOTO_CHANGE_EVENT = 'agentProfilePhotoChange'

export function useBranding() {
  const context = useContext(BrandingContext)
  const pathname = usePathname()

  // Detect portal type - use separate localStorage keys for each
  const isAgentPortal = pathname?.startsWith('/agent') || false
  const isRealtorPortal = pathname?.startsWith('/realtor') || false
  const brandColorKey = isAgentPortal ? 'agentBrandColor' : isRealtorPortal ? 'realtorBrandColor' : 'adminBrandColor'

  // Local state for when used outside BrandingProvider (agent/realtor portals)
  const [localBrandColor, setLocalBrandColor] = useState(DEFAULT_BRAND_COLOR)
  const [localLogo, setLocalLogo] = useState<string | null>(null)
  const [localProfilePhoto, setLocalProfilePhoto] = useState<string | null>(null)

  // Load from localStorage on mount (for agent/realtor portals)
  useEffect(() => {
    if (context === undefined) {
      const savedColor = localStorage.getItem(brandColorKey)
      const savedLogo = localStorage.getItem('adminLogo')
      const savedProfilePhoto = localStorage.getItem('agentProfilePhoto')

      if (savedColor) setLocalBrandColor(savedColor)
      if (savedLogo) setLocalLogo(savedLogo)
      if (savedProfilePhoto) setLocalProfilePhoto(savedProfilePhoto)
    }
  }, [context, brandColorKey])

  // Listen for custom events to sync state across components (agent portal only)
  useEffect(() => {
    if (context === undefined && isAgentPortal) {
      const handleBrandColorChange = (e: CustomEvent) => {
        setLocalBrandColor(e.detail.color)
      }
      const handleProfilePhotoChange = (e: CustomEvent) => {
        setLocalProfilePhoto(e.detail.photo)
      }

      window.addEventListener(BRAND_COLOR_CHANGE_EVENT, handleBrandColorChange as EventListener)
      window.addEventListener(PROFILE_PHOTO_CHANGE_EVENT, handleProfilePhotoChange as EventListener)

      return () => {
        window.removeEventListener(BRAND_COLOR_CHANGE_EVENT, handleBrandColorChange as EventListener)
        window.removeEventListener(PROFILE_PHOTO_CHANGE_EVENT, handleProfilePhotoChange as EventListener)
      }
    }
  }, [context, isAgentPortal])

  // Return context if within provider (admin portal)
  if (context !== undefined) {
    return context
  }

  // Working setters for when outside provider (agent/realtor portals)
  const setBrandColor = (color: string) => {
    setLocalBrandColor(color)
    localStorage.setItem(brandColorKey, color)
    // Dispatch custom event to sync other components (agent portal only)
    if (isAgentPortal) {
      window.dispatchEvent(new CustomEvent(BRAND_COLOR_CHANGE_EVENT, { detail: { color } }))
    }
  }

  const setLogo = (newLogo: string | null) => {
    setLocalLogo(newLogo)
    if (newLogo) {
      localStorage.setItem('adminLogo', newLogo)
    } else {
      localStorage.removeItem('adminLogo')
    }
  }

  const setProfilePhoto = (photo: string | null) => {
    setLocalProfilePhoto(photo)
    if (photo) {
      localStorage.setItem('agentProfilePhoto', photo)
    } else {
      localStorage.removeItem('agentProfilePhoto')
    }
    // Dispatch custom event to sync other components (agent portal only)
    if (isAgentPortal) {
      window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_CHANGE_EVENT, { detail: { photo } }))
    }
  }

  // Return local state with working setters
  return {
    brandColor: localBrandColor,
    setBrandColor,
    brandColorHover: adjustBrightness(localBrandColor, 20),
    logo: localLogo,
    setLogo,
    profilePhoto: localProfilePhoto,
    setProfilePhoto,
  }
}

// Helper function to lighten/darken a hex color
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt

  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)
}
