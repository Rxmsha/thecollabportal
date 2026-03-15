'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Mail, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SignupSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Brief loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-8 py-10 text-center">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome to The Collab Portal!
            </h1>
            <p className="text-cyan-100">
              Your payment was successful
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Check Your Email</p>
                  <p className="text-sm text-gray-600 mt-1">
                    We've sent your login credentials to the email you provided. Look for an email from The Collab Portal.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="font-semibold text-gray-900">What's Next?</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="bg-cyan-100 text-cyan-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">1</span>
                  <span className="text-gray-600 text-sm">Check your email for login credentials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-cyan-100 text-cyan-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">2</span>
                  <span className="text-gray-600 text-sm">Log in and change your temporary password</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-cyan-100 text-cyan-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">3</span>
                  <span className="text-gray-600 text-sm">Add your branding and start inviting realtors</span>
                </li>
              </ul>
            </div>

            <Link
              href="/login"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="text-center text-sm text-gray-500 mt-6">
              Need help? Contact us at{' '}
              <a href="mailto:support@thecollabportal.com" className="text-cyan-600 hover:underline">
                support@thecollabportal.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} The Collab Portal. All rights reserved.
        </p>
      </div>
    </div>
  )
}
