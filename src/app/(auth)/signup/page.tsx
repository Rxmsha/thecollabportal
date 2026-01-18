'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    // Signup is disabled - redirect to login
    router.replace('/login')
  }, [router])

  return null
}
