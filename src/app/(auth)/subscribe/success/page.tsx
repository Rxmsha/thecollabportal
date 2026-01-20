'use client'

import React, { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8eef7] px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardContent className="pt-8 pb-6 px-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to The Collab Portal!
            </h1>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
                <Mail className="h-5 w-5" />
                <span className="font-medium">Check Your Email</span>
              </div>
              <p className="text-sm text-blue-700">
                We've sent your login credentials to{' '}
                {email ? (
                  <span className="font-medium">{decodeURIComponent(email)}</span>
                ) : (
                  'your email address'
                )}
                . Use the temporary password to sign in and get started.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-left bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                      1
                    </span>
                    Check your email for login credentials
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                      2
                    </span>
                    Sign in and set up your branding (logo & colors)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">
                      3
                    </span>
                    Start inviting your Realtor partners
                  </li>
                </ol>
              </div>

              <Link href="/login" className="block">
                <Button className="w-full">
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#e8eef7]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
