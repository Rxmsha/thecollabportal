'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calculator, Home, DollarSign, GitCompare, RefreshCw } from 'lucide-react'

const BENDIGI_API_KEY = '6b8d4bcbd614b83d:GKInd7r_8LRhNkacBhoO2B9-ArTyV_yk'
const BENDIGI_TERMS = 'https://canadianmortgageapp.com/terms'

const calculators = [
  {
    id: 'simple-mtg',
    name: 'Mortgage Calculator',
    icon: Calculator,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'purchase',
    name: 'Purchase Calculator',
    icon: Home,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'closing-cost',
    name: 'Closing Cost Calculator',
    icon: DollarSign,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'compare',
    name: 'Compare Side-by-Side',
    icon: GitCompare,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'renewal',
    name: 'Renewal Calculator',
    icon: RefreshCw,
    color: 'bg-teal-100 text-teal-600',
  },
]

function BendigiCalculator({ toolId }: { toolId: string }) {
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://tools.bendigi.com/assets/calculators.js"]')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://tools.bendigi.com/assets/calculators.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div
      className="bendigi-calculators"
      key={toolId}
      // @ts-ignore
      apikey={BENDIGI_API_KEY}
      terms={BENDIGI_TERMS}
      tools={toolId}
    />
  )
}

export default function AdminCalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState('simple-mtg')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calculators</h1>
        <p className="text-gray-500 mt-1">
          Preview all calculators available to agents and realtors
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {calculators.map((calc) => {
          const Icon = calc.icon
          const isActive = activeCalculator === calc.id
          return (
            <Card
              key={calc.id}
              className={`cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-300'
              }`}
              onClick={() => setActiveCalculator(calc.id)}
            >
              <CardContent className="p-4">
                <div className={`h-10 w-10 rounded-lg ${calc.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{calc.name}</h3>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <BendigiCalculator toolId={activeCalculator} />
        </CardContent>
      </Card>
    </div>
  )
}
