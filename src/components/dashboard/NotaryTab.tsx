'use client'

import { useState, useCallback } from 'react'
import { Phone } from 'lucide-react'
import { CountyMap } from './CountyMap'

export function NotaryTab() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)

  const handleCountySelect = useCallback(async (countyName: string, stateAbbr: string) => {
    setSelectedCounty(countyName)
    setSelectedState(stateAbbr)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
          Interactive US County Map
        </h1>
        <p className="text-slate-400">
          Click on any county to view details • Search to find specific counties • Use state legend to filter
        </p>
      </div>

      {/* County Map */}
      <CountyMap
        onCountySelect={handleCountySelect}
        selectedCounty={selectedCounty}
        selectedState={selectedState}
      />

      {/* Help CTA */}
      <div className="mt-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
        <p className="text-sm text-slate-300">
          Can't find a notary in your area? Our team can help connect you with one.
        </p>
        <a
          href="tel:+18885458007"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-400/30 transition-all whitespace-nowrap"
        >
          <Phone className="w-4 h-4" />
          (888) 545-8007
        </a>
      </div>
    </div>
  )
}
