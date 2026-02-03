'use client'

import { useState, useCallback } from 'react'
import { Info, Phone } from 'lucide-react'
import { CountyMap } from './CountyMap'
import { NotaryResults, type Notary } from './NotaryResults'

export function NotaryTab() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleCountySelect = useCallback(async (countyName: string, stateAbbr: string) => {
    setSelectedCounty(countyName)
    setSelectedState(stateAbbr)
    setIsLoading(true)
    setNotaries([])

    try {
      const params = new URLSearchParams({
        state: stateAbbr,
        county: countyName,
        limit: '20',
      })
      const response = await fetch(`/api/notaries?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotaries(data.notaries || [])
      }
    } catch {
      setNotaries([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Purple Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">
              Find a Local Mobile Notary
            </h3>
            <p className="text-sm text-purple-700">
              Depending on wherever the client lives or the people that need to
              receive recovery funds, they can have a local notary stop by at
              their convenience and notarize any documents necessary to complete
              any stage of the documentation procedure.
            </p>
          </div>
        </div>
      </div>

      {/* Map + Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* County Map */}
        <div className="lg:col-span-3">
          <CountyMap
            onCountySelect={handleCountySelect}
            selectedCounty={selectedCounty}
            selectedState={selectedState}
          />
        </div>

        {/* Notary Results */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-4 min-h-[350px]">
            <NotaryResults
              notaries={notaries}
              isLoading={isLoading}
              selectedCounty={selectedCounty}
              selectedState={selectedState}
            />
          </div>
        </div>
      </div>

      {/* Help CTA */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600">
          Can't find a notary in your area? Our team can help connect you with one.
        </p>
        <a
          href="tel:+18885458007"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#003366] text-white rounded-lg text-sm font-medium hover:bg-[#002244] transition-colors whitespace-nowrap"
        >
          <Phone className="w-4 h-4" />
          (888) 545-8007
        </a>
      </div>
    </div>
  )
}
