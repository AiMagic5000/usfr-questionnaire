'use client'

import { useState, useCallback, useEffect } from 'react'
import { Phone, Search, MapPin } from 'lucide-react'
import { CountyMap } from './CountyMap'
import { NotaryResults, Notary } from './NotaryResults'

export function NotaryTab() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const limit = 12

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setOffset(0)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch notaries when county is selected or search changes
  useEffect(() => {
    if (selectedCounty && selectedState) {
      fetchNotaries(selectedCounty, selectedState, 0)
    }
  }, [selectedCounty, selectedState])

  useEffect(() => {
    if (debouncedSearch.trim()) {
      fetchNotariesBySearch(debouncedSearch, 0)
    } else if (!selectedCounty) {
      setNotaries([])
      setTotalCount(0)
      setHasMore(false)
    }
  }, [debouncedSearch])

  const fetchNotaries = async (county: string, state: string, currentOffset: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/notaries?county=${encodeURIComponent(county)}&state=${encodeURIComponent(state)}&limit=${limit}&offset=${currentOffset}`
      )
      const data = await response.json()

      if (currentOffset === 0) {
        setNotaries(data.notaries || [])
      } else {
        setNotaries((prev) => [...prev, ...(data.notaries || [])])
      }

      setTotalCount(data.total || 0)
      setHasMore((data.notaries?.length || 0) === limit)
    } catch (error) {
      console.error('Failed to fetch notaries:', error)
      setNotaries([])
      setTotalCount(0)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotariesBySearch = async (search: string, currentOffset: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/notaries?search=${encodeURIComponent(search)}&limit=${limit}&offset=${currentOffset}`
      )
      const data = await response.json()

      if (currentOffset === 0) {
        setNotaries(data.notaries || [])
      } else {
        setNotaries((prev) => [...prev, ...(data.notaries || [])])
      }

      setTotalCount(data.total || 0)
      setHasMore((data.notaries?.length || 0) === limit)
    } catch (error) {
      console.error('Failed to fetch notaries:', error)
      setNotaries([])
      setTotalCount(0)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCountySelect = useCallback(async (countyName: string, stateAbbr: string) => {
    setSelectedCounty(countyName)
    setSelectedState(stateAbbr)
    setSearchQuery('')
    setOffset(0)
  }, [])

  const handleLoadMore = () => {
    const newOffset = offset + limit
    setOffset(newOffset)

    if (debouncedSearch.trim()) {
      fetchNotariesBySearch(debouncedSearch, newOffset)
    } else if (selectedCounty && selectedState) {
      fetchNotaries(selectedCounty, selectedState, newOffset)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Section 1: Interactive County Map */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Info Banner */}
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

      {/* Section 2: Notary Directory */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Directory Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Notary Directory
          </h2>
          <p className="text-slate-600">
            Search our comprehensive database of verified mobile notaries across the United States.
            Select a county on the map above or search by name, phone, zip code, or area code.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, zip code, or area code..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Results Count */}
        {(notaries.length > 0 || isLoading) && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {notaries.length} of {totalCount} notaries
            </p>
            {selectedCounty && selectedState && (
              <p className="text-sm font-medium text-slate-700">
                {selectedCounty} County, {selectedState}
              </p>
            )}
          </div>
        )}

        {/* Results Grid */}
        <div className="bg-white">
          {!selectedCounty && !debouncedSearch.trim() && notaries.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Start Your Search
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Select a county on the map above or use the search bar to find mobile notaries in your area.
              </p>
            </div>
          ) : (
            <>
              {/* Notary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {isLoading && offset === 0 ? (
                  // Loading skeletons
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-4 animate-pulse"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                          <div className="h-3 bg-slate-200 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : notaries.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      No Notaries Found
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      {selectedCounty && selectedState
                        ? `We don't have notary data for ${selectedCounty} County, ${selectedState} yet. Try a nearby county or call us for assistance.`
                        : 'No results found for your search. Try a different term or select a county on the map.'}
                    </p>
                  </div>
                ) : (
                  notaries.map((notary) => (
                    <NotaryCard key={notary.id} notary={notary} />
                  ))
                )}
              </div>

              {/* Load More Button */}
              {hasMore && !isLoading && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}

              {/* Loading More Indicator */}
              {isLoading && offset > 0 && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-sm text-slate-600">
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

// Notary Card Component (Light Theme)
function NotaryCard({ notary }: { notary: Notary }) {
  const phoneFormatted = notary.phone
    ? notary.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20 transition-all">
      <div className="flex gap-4">
        {notary.image_url ? (
          <img
            src={notary.image_url}
            alt={notary.business_name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-slate-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm truncate">
            {notary.business_name}
          </h4>

          {notary.rating !== null && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={notary.rating} />
              <span className="text-xs text-slate-500">
                {notary.rating.toFixed(1)} ({notary.review_count} reviews)
              </span>
            </div>
          )}

          {notary.categories && notary.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {notary.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {notary.address && (
            <p className="text-xs text-slate-500 mt-1.5 truncate">
              <MapPin className="w-3 h-3 inline mr-1" />
              {notary.address}
              {notary.city ? `, ${notary.city}` : ''}
              {notary.state_abbr ? `, ${notary.state_abbr}` : ''}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {phoneFormatted && (
              <a
                href={`tel:${notary.phone}`}
                className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
              >
                <Phone className="w-3 h-3" />
                {phoneFormatted}
              </a>
            )}
            {notary.yelp_url && (
              <a
                href={notary.yelp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-red-600 hover:underline"
              >
                Yelp
              </a>
            )}
            {notary.website_url && (
              <a
                href={notary.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-600 hover:underline"
              >
                Website
              </a>
            )}
          </div>

          {notary.is_mobile && (
            <span className="inline-block mt-1.5 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
              Mobile Service Available
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Star Rating Component (Light Theme)
function StarRating({ rating }: { rating: number }) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg
          key={i}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <svg
          key={i}
          className="w-4 h-4 text-yellow-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#half-${i})`}
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      )
    } else {
      stars.push(
        <svg
          key={i}
          className="w-4 h-4 text-slate-300"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>
}
