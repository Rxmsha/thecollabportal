'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, User, Mail, Building2, Check, ArrowRight, Phone } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
}

export default function SubscribePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SubscriptionFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: keyof SubscriptionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in all required fields')
        setIsLoading(false)
        return
      }

      // Call our API route to create agent and send welcome email
      const response = await fetch('/api/signup-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      // Redirect to success page
      router.push('/subscribe/success?email=' + encodeURIComponent(formData.email))
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const features = [
    'Access to all marketing templates',
    'Invite up to 50 Realtors',
    'Custom branding (logo & colors)',
    'AI-powered content tools',
    'Email notifications for new resources',
    'Dedicated partner portal for each Realtor',
  ]

  return (
    <div className="min-h-screen bg-[#e8eef7] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">The Collab Portal</h1>
          <p className="text-gray-600 mt-2">
            Start building stronger relationships with your Realtor partners
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Features Card */}
          <Card className="shadow-lg h-fit">
            <CardContent className="pt-8 pb-6 px-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What's Included
              </h2>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Cancel anytime. No long-term commitment.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Signup Form Card */}
          <Card className="shadow-lg">
            <CardContent className="pt-8 pb-6 px-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Create Your Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-gray-400">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-gray-400">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="ABC Mortgage"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Creating Account...'
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                  Your login credentials will be sent to your email.
                </p>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
