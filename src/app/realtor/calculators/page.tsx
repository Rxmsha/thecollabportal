'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, Home, DollarSign, ExternalLink } from 'lucide-react'

const calculators = [
  {
    id: 'mortgage',
    name: 'Mortgage Calculator',
    description: 'Calculate monthly payments based on purchase price, down payment, interest rate, and term',
    icon: Calculator,
    color: 'bg-blue-100 text-blue-600',
    embedUrl: 'https://www.ratehub.ca/mortgage-payment-calculator',
  },
  {
    id: 'purchase',
    name: 'Purchase Calculator',
    description: 'Determine how much home your clients can afford based on their income and expenses',
    icon: Home,
    color: 'bg-green-100 text-green-600',
    embedUrl: 'https://www.ratehub.ca/mortgage-affordability-calculator',
  },
  {
    id: 'closing-cost',
    name: 'Closing Cost Calculator',
    description: 'Estimate land transfer tax, legal fees, title insurance, and other closing costs',
    icon: DollarSign,
    color: 'bg-purple-100 text-purple-600',
    embedUrl: 'https://www.ratehub.ca/land-transfer-tax',
  },
]

export default function RealtorCalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = React.useState('mortgage')

  const currentCalculator = calculators.find((c) => c.id === activeCalculator) || calculators[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calculators</h1>
        <p className="text-gray-500 mt-1">
          Use these calculators to help your clients understand their mortgage options
        </p>
      </div>

      {/* Calculator Selection */}
      <div className="grid gap-4 md:grid-cols-3">
        {calculators.map((calc) => {
          const Icon = calc.icon
          const isActive = activeCalculator === calc.id
          return (
            <Card
              key={calc.id}
              className={`cursor-pointer transition-all ${
                isActive
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setActiveCalculator(calc.id)}
            >
              <CardContent className="p-4">
                <div className={`h-10 w-10 rounded-lg ${calc.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-gray-900">{calc.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{calc.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Calculator Embed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <currentCalculator.icon className="h-5 w-5" />
                {currentCalculator.name}
              </CardTitle>
              <CardDescription>{currentCalculator.description}</CardDescription>
            </div>
            <Button variant="outline" disabled>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg border overflow-hidden">
            {/* Calculator embed placeholder */}
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Calculator Embed
                </h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  In production, this would display an embedded calculator from Bendigi
                  or another calculator provider.
                </p>
                <Button disabled>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Calculator
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Using Calculators with Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">First-Time Buyers</h4>
              <p className="text-sm text-gray-600">
                Start with the Purchase Calculator to help first-time buyers understand
                how much home they can afford before searching for properties.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Making an Offer</h4>
              <p className="text-sm text-gray-600">
                Use the Mortgage Calculator to show clients their monthly payments
                at different price points when preparing to make an offer.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Closing Preparation</h4>
              <p className="text-sm text-gray-600">
                Help buyers budget for closing day by using the Closing Cost Calculator
                to estimate all additional expenses beyond the purchase price.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Connect with Your Agent</h4>
              <p className="text-sm text-gray-600">
                For detailed mortgage advice and pre-approval, connect clients with
                your mortgage partner directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
