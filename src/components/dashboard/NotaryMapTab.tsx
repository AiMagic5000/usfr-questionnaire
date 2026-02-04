'use client'

import { useState, useCallback } from 'react'
import { Phone, MapPin, Star } from 'lucide-react'
import { CountyMap } from './CountyMap'
import type { Notary } from './NotaryResults'

export function NotaryMapTab() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const handleCountySelect = useCallback((countyName: string, stateAbbr: string) => {
    setSelectedCounty(countyName)
    setSelectedState(stateAbbr)
    fetchNotaries(countyName, stateAbbr)
  }, [])

  const fetchNotaries = async (county: string, state: string) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/notaries?county=${encodeURIComponent(county)}&state=${encodeURIComponent(state)}&limit=20`
      )
      const data = await res.json()
      setNotaries(data.notaries || [])
      setTotal(data.total || 0)
    } catch {
      setNotaries([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl">
      <div className="p-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive US County Map
          </h1>
          <p className="text-gray-500">
            Click on any county to view notaries in that area
          </p>
        </div>

        <CountyMap
          onCountySelect={handleCountySelect}
          selectedCounty={selectedCounty}
          selectedState={selectedState}
        />

        {selectedCounty && selectedState && (
          <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCounty} County, {selectedState}
              </h3>
              <span className="text-sm text-gray-500">
                {total} notar{total === 1 ? 'y' : 'ies'}
              </span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-4 h-4 border-2 border-usfr-primary border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : notaries.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No notary data for this county yet. Try a nearby county.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {notaries.map(n => (
                  <MapNotaryRow key={n.id} notary={n} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-600">
            Can't find a notary in your area? Our team can help connect you with one.
          </p>
          <a
            href="tel:+18885458007"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-usfr-primary text-white rounded-lg text-sm font-medium hover:bg-usfr-primary/90 transition-colors whitespace-nowrap"
          >
            <Phone className="w-4 h-4" />
            (888) 545-8007
          </a>
        </div>
      </div>
    </div>
  )
}

function MapNotaryRow({ notary }: { notary: Notary }) {
  const phoneFormatted = notary.phone
    ? notary.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    : null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 flex gap-3 hover:border-usfr-secondary transition-colors">
      {notary.image_url ? (
        <img
          src={notary.image_url}
          alt={notary.business_name}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm truncate">{notary.business_name}</h4>
        {notary.rating !== null && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">
              {notary.rating.toFixed(1)} ({notary.review_count})
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 mt-1">
          {phoneFormatted && (
            <a href={`tel:${notary.phone}`} className="text-xs text-usfr-secondary hover:underline">
              {phoneFormatted}
            </a>
          )}
          {notary.is_mobile && (
            <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Mobile</span>
          )}
        </div>
      </div>
    </div>
  )
}
