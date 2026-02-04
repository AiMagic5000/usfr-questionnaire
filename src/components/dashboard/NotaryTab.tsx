'use client'

import { useState, useCallback, useEffect } from 'react'
import { Phone, Search, MapPin, Star, Filter } from 'lucide-react'
import { CountyMap } from './CountyMap'
import { NotaryCard, type Notary } from './NotaryResults'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
]

export function NotaryTab() {
  // Map state
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [mapNotaries, setMapNotaries] = useState<Notary[]>([])
  const [mapLoading, setMapLoading] = useState(false)
  const [mapTotal, setMapTotal] = useState(0)

  // Directory state (separate from map)
  const [dirNotaries, setDirNotaries] = useState<Notary[]>([])
  const [dirLoading, setDirLoading] = useState(false)
  const [dirTotal, setDirTotal] = useState(0)
  const [dirOffset, setDirOffset] = useState(0)
  const [dirHasMore, setDirHasMore] = useState(false)
  const [dirSearch, setDirSearch] = useState('')
  const [debouncedDirSearch, setDebouncedDirSearch] = useState('')
  const [dirStateFilter, setDirStateFilter] = useState('')
  const dirLimit = 12

  // Load featured notaries on mount
  useEffect(() => {
    fetchFeatured(0)
  }, [])

  // Debounce directory search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDirSearch(dirSearch)
      setDirOffset(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [dirSearch])

  // React to directory search or state filter changes
  useEffect(() => {
    if (debouncedDirSearch.trim()) {
      fetchDirSearch(debouncedDirSearch, dirStateFilter, 0)
    } else if (dirStateFilter) {
      fetchDirByState(dirStateFilter, 0)
    } else {
      fetchFeatured(0)
    }
  }, [debouncedDirSearch, dirStateFilter])

  // Fetch featured/top-rated notaries (no filters)
  const fetchFeatured = async (currentOffset: number) => {
    setDirLoading(true)
    try {
      const res = await fetch(
        `/api/notaries?browse=featured&limit=${dirLimit}&offset=${currentOffset}`
      )
      const data = await res.json()
      if (currentOffset === 0) {
        setDirNotaries(data.notaries || [])
      } else {
        setDirNotaries(prev => [...prev, ...(data.notaries || [])])
      }
      setDirTotal(data.total || 0)
      setDirHasMore((data.notaries?.length || 0) === dirLimit)
    } catch {
      setDirNotaries([])
      setDirTotal(0)
      setDirHasMore(false)
    } finally {
      setDirLoading(false)
    }
  }

  // Fetch directory by search term
  const fetchDirSearch = async (search: string, state: string, currentOffset: number) => {
    setDirLoading(true)
    try {
      let url = `/api/notaries?search=${encodeURIComponent(search)}&limit=${dirLimit}&offset=${currentOffset}`
      if (state) url += `&state=${encodeURIComponent(state)}`
      const res = await fetch(url)
      const data = await res.json()
      if (currentOffset === 0) {
        setDirNotaries(data.notaries || [])
      } else {
        setDirNotaries(prev => [...prev, ...(data.notaries || [])])
      }
      setDirTotal(data.total || 0)
      setDirHasMore((data.notaries?.length || 0) === dirLimit)
    } catch {
      setDirNotaries([])
      setDirTotal(0)
      setDirHasMore(false)
    } finally {
      setDirLoading(false)
    }
  }

  // Fetch directory by state only
  const fetchDirByState = async (state: string, currentOffset: number) => {
    setDirLoading(true)
    try {
      const res = await fetch(
        `/api/notaries?state=${encodeURIComponent(state)}&limit=${dirLimit}&offset=${currentOffset}`
      )
      const data = await res.json()
      if (currentOffset === 0) {
        setDirNotaries(data.notaries || [])
      } else {
        setDirNotaries(prev => [...prev, ...(data.notaries || [])])
      }
      setDirTotal(data.total || 0)
      setDirHasMore((data.notaries?.length || 0) === dirLimit)
    } catch {
      setDirNotaries([])
      setDirTotal(0)
      setDirHasMore(false)
    } finally {
      setDirLoading(false)
    }
  }

  // Map: fetch notaries when county selected
  useEffect(() => {
    if (selectedCounty && selectedState) {
      fetchMapNotaries(selectedCounty, selectedState)
    }
  }, [selectedCounty, selectedState])

  const fetchMapNotaries = async (county: string, state: string) => {
    setMapLoading(true)
    try {
      const res = await fetch(
        `/api/notaries?county=${encodeURIComponent(county)}&state=${encodeURIComponent(state)}&limit=20`
      )
      const data = await res.json()
      setMapNotaries(data.notaries || [])
      setMapTotal(data.total || 0)
    } catch {
      setMapNotaries([])
      setMapTotal(0)
    } finally {
      setMapLoading(false)
    }
  }

  const handleCountySelect = useCallback((countyName: string, stateAbbr: string) => {
    setSelectedCounty(countyName)
    setSelectedState(stateAbbr)
  }, [])

  const handleDirLoadMore = () => {
    const newOffset = dirOffset + dirLimit
    setDirOffset(newOffset)
    if (debouncedDirSearch.trim()) {
      fetchDirSearch(debouncedDirSearch, dirStateFilter, newOffset)
    } else if (dirStateFilter) {
      fetchDirByState(dirStateFilter, newOffset)
    } else {
      fetchFeatured(newOffset)
    }
  }

  return (
    <div className="space-y-0">
      {/* ====== SECTION 1: MAP ====== */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-xl">
        <div className="mb-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Local Notary Services
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Depending on wherever the client lives or the people that need to receive recovery funds,
                they can have a local notary stop by at their convenience and notarize any documents
                necessary to complete any stage of the documentation procedure.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Interactive US County Map
          </h1>
          <p className="text-slate-400">
            Click on any county to view notaries in that area
          </p>
        </div>

        <CountyMap
          onCountySelect={handleCountySelect}
          selectedCounty={selectedCounty}
          selectedState={selectedState}
        />

        {/* Map results (inline, compact) */}
        {selectedCounty && selectedState && (
          <div className="mt-6 bg-slate-800/80 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedCounty} County, {selectedState}
              </h3>
              <span className="text-sm text-slate-400">
                {mapTotal} notar{mapTotal === 1 ? 'y' : 'ies'}
              </span>
            </div>
            {mapLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            ) : mapNotaries.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No notary data for this county yet. Try a nearby county.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {mapNotaries.map(n => (
                  <MapNotaryRow key={n.id} notary={n} />
                ))}
              </div>
            )}
          </div>
        )}

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

      {/* ====== SECTION 2: NOTARY DIRECTORY (Fiverr-style) ====== */}
      <div className="p-6 bg-white rounded-b-xl">
        <div className="max-w-7xl mx-auto">
          {/* Directory Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Notary Directory
            </h2>
            <p className="text-gray-600">
              Browse our nationwide database of verified mobile notaries. Search by name, phone, zip code, or filter by state.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={dirSearch}
                onChange={(e) => setDirSearch(e.target.value)}
                placeholder="Search by name, phone, zip code..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={dirStateFilter}
                onChange={(e) => {
                  setDirStateFilter(e.target.value)
                  setDirOffset(0)
                }}
                className="pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="">All States</option>
                {US_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {dirTotal > 0
                ? `Showing ${dirNotaries.length} of ${dirTotal} notaries`
                : dirLoading ? 'Loading...' : 'No results'}
            </p>
            {!debouncedDirSearch && !dirStateFilter && dirTotal > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Top Rated
              </div>
            )}
          </div>

          {/* Fiverr-style Card Grid */}
          {dirLoading && dirOffset === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 bg-gray-200 rounded-full w-20" />
                      <div className="h-6 bg-gray-200 rounded-full w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : dirNotaries.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Notaries Found</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Try a different search term, select a different state, or click a county on the map above.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dirNotaries.map(notary => (
                  <NotaryCard key={notary.id} notary={notary} />
                ))}
              </div>

              {/* Load More */}
              {dirHasMore && !dirLoading && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleDirLoadMore}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Load More Notaries
                  </button>
                </div>
              )}

              {dirLoading && dirOffset > 0 && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading more...
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** Compact notary row for map results (dark theme) */
function MapNotaryRow({ notary }: { notary: Notary }) {
  const phoneFormatted = notary.phone
    ? notary.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    : null

  return (
    <div className="bg-slate-700/50 rounded-lg p-3 flex gap-3 hover:bg-slate-700 transition-colors">
      {notary.image_url ? (
        <img
          src={notary.image_url}
          alt={notary.business_name}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-sm truncate">{notary.business_name}</h4>
        {notary.rating !== null && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-slate-300">
              {notary.rating.toFixed(1)} ({notary.review_count})
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 mt-1">
          {phoneFormatted && (
            <a href={`tel:${notary.phone}`} className="text-xs text-cyan-400 hover:underline">
              {phoneFormatted}
            </a>
          )}
          {notary.is_mobile && (
            <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">Mobile</span>
          )}
        </div>
      </div>
    </div>
  )
}
