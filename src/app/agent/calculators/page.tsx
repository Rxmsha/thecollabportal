'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calculator, Home, DollarSign, GitCompare, RefreshCw } from 'lucide-react'
import { useBranding } from '@/context/BrandingContext'

const BENDIGI_API_KEY = '6b8d4bcbd614b83d:GKInd7r_8LRhNkacBhoO2B9-ArTyV_yk'
const BENDIGI_TERMS = 'https://canadianmortgageapp.com/terms'

const calculators = [
  {
    id: 'simple-mtg',
    name: 'Mortgage Calculator',
    icon: Calculator,
  },
  {
    id: 'purchase',
    name: 'Purchase Calculator',
    icon: Home,
  },
  {
    id: 'closing-cost',
    name: 'Closing Cost Calculator',
    icon: DollarSign,
  },
  {
    id: 'compare',
    name: 'Compare Side-by-Side',
    icon: GitCompare,
  },
  {
    id: 'renewal',
    name: 'Renewal Calculator',
    icon: RefreshCw,
  },
]

function BendigiCalculator({ toolId }: { toolId: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load the Bendigi script if not already loaded
    const loadScript = () => {
      return new Promise<void>((resolve) => {
        const existingScript = document.querySelector('script[src="https://tools.bendigi.com/assets/calculators.js"]')
        if (existingScript) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = 'https://tools.bendigi.com/assets/calculators.js'
        script.async = true
        script.onload = () => resolve()
        document.body.appendChild(script)
      })
    }

    // Initialize the calculator
    const initCalculator = async () => {
      if (!containerRef.current) return

      // Clear previous content
      containerRef.current.innerHTML = ''

      // Create the Bendigi div with proper HTML attributes
      const bendigiDiv = document.createElement('div')
      bendigiDiv.className = 'bendigi-calculators'
      bendigiDiv.setAttribute('apikey', BENDIGI_API_KEY)
      bendigiDiv.setAttribute('terms', BENDIGI_TERMS)
      bendigiDiv.setAttribute('tools', toolId)

      containerRef.current.appendChild(bendigiDiv)

      // Load script and re-initialize
      await loadScript()

      // Trigger Bendigi to scan for new calculator divs
      // The script looks for .bendigi-calculators on load
      // For dynamic content, we may need to reload the script
      const oldScript = document.querySelector('script[src="https://tools.bendigi.com/assets/calculators.js"]')
      if (oldScript) {
        oldScript.remove()
      }
      const newScript = document.createElement('script')
      newScript.src = 'https://tools.bendigi.com/assets/calculators.js'
      newScript.async = true
      document.body.appendChild(newScript)
    }

    initCalculator()
  }, [toolId])

  return <div ref={containerRef} className="min-h-[400px]" />
}

export default function AgentCalculatorsPage() {
  const { brandColor } = useBranding()
  const [activeCalculator, setActiveCalculator] = useState('simple-mtg')
  const activeCalc = calculators.find((c) => c.id === activeCalculator)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="dot-matrix text-2xl text-gray-900">Calculators</h1>
        <p className="text-base text-gray-700 mt-1">
          Use these calculators to help your clients understand their options
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {calculators.map((calc) => {
          const Icon = calc.icon
          const isActive = activeCalculator === calc.id
          return (
            <Card
              key={calc.id}
              className={`cursor-pointer transition-all border-0 overflow-hidden rounded-lg ${
                isActive ? 'ring-2 shadow-lg' : 'hover:shadow-md'
              }`}
              style={isActive ? { '--tw-ring-color': brandColor } as React.CSSProperties : undefined}
              onClick={() => setActiveCalculator(calc.id)}
            >
              <div
                className={`px-4 py-3 flex items-center justify-center rounded-t-lg ${
                  isActive ? '' : 'bg-gray-100'
                }`}
                style={isActive ? { backgroundColor: brandColor } : undefined}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <CardContent className="p-3 bg-white rounded-b-lg">
                <h3
                  className={`text-xs text-center ${
                    isActive ? 'font-semibold' : 'text-gray-700'
                  }`}
                  style={isActive ? { color: brandColor } : undefined}
                >
                  {calc.name}
                </h3>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-0 overflow-hidden rounded-lg">
        <div className="px-6 py-3 flex items-center gap-3 rounded-t-lg" style={{ backgroundColor: brandColor }}>
          {activeCalc && (
            <>
              <activeCalc.icon className="h-5 w-5 text-white" />
              <span className="text-white font-semibold">
                {activeCalc.name}
              </span>
            </>
          )}
        </div>
        <CardContent className="p-6 bg-white rounded-b-lg">
          <BendigiCalculator toolId={activeCalculator} />
        </CardContent>
      </Card>
    </div>
  )
}
