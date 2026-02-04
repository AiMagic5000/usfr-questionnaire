'use client'

import { useState, useEffect } from 'react'
import { Phone, Search, MapPin, Star, Filter } from 'lucide-react'
import { NotaryCard, type Notary } from './NotaryResults'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
]

export function NotaryTab() {
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const limit = 12

  useEffect(() => {
    fetchFeatured(0)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (debouncedSearch.trim()) {
      fetchSearch(debouncedSearch, stateFilter, 0)
    } else if (stateFilter) {
      fetchByState(stateFilter, 0)
    } else {
      fetchFeatured(0)
    }
  }, [debouncedSearch, stateFilter])

  const fetchFeatured = async (currentOffset: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/notaries?browse=featured&limit=${limit}&offset=${currentOffset}&include_all=true`
      )
      const data = await res.json()
      if (currentOffset === 0) {
        setNotaries(data.notaries || [])
      } else {
        setNotaries(prev => [...prev, ...(data.notaries || [])])
      }
      setTotal(data.total || 0)
      setHasMore((data.notaries?.length || 0) === limit)
    } catch {
      setNotaries([])
      setTotal(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchSearch = async (term: string, state: string, currentOffset: number) => {
    setLoading(true)
    try {
      let url = `/api/notaries?search=${encodeURIComponent(term)}&limit=${limit}&offset=${currentOffset}`
      if (state) url += `&state=${encodeURIComponent(state)}`
      const res = await fetch(url)
      const data = await res.json()
      if (currentOffset === 0) {
        setNotaries(data.notaries || [])
      } else {
        setNotaries(prev => [...prev, ...(data.notaries || [])])
      }
      setTotal(data.total || 0)
      setHasMore((data.notaries?.length || 0) === limit)
    } catch {
      setNotaries([])
      setTotal(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchByState = async (state: string, currentOffset: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/notaries?state=${encodeURIComponent(state)}&limit=${limit}&offset=${currentOffset}`
      )
      const data = await res.json()
      if (currentOffset === 0) {
        setNotaries(data.notaries || [])
      } else {
        setNotaries(prev => [...prev, ...(data.notaries || [])])
      }
      setTotal(data.total || 0)
      setHasMore((data.notaries?.length || 0) === limit)
    } catch {
      setNotaries([])
      setTotal(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    const newOffset = offset + limit
    setOffset(newOffset)
    if (debouncedSearch.trim()) {
      fetchSearch(debouncedSearch, stateFilter, newOffset)
    } else if (stateFilter) {
      fetchByState(stateFilter, newOffset)
    } else {
      fetchFeatured(newOffset)
    }
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="max-w-7xl mx-auto">
        {/* Purple notice */}
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-5 flex items-start gap-4">
          <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-purple-900 mb-1">
              Local Notary Services
            </h3>
            <p className="text-sm text-purple-700 leading-relaxed">
              Depending on wherever the client lives or the people that need to receive recovery funds,
              they can have a local notary stop by at their convenience and notarize any documents
              necessary to complete any stage of the documentation procedure.
            </p>
          </div>
        </div>

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, zip code..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value)
                setOffset(0)
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
            {total > 0
              ? `Showing ${notaries.length} of ${total} notaries`
              : loading ? 'Loading...' : 'No results'}
          </p>
          {!debouncedSearch && !stateFilter && total > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Top Rated
            </div>
          )}
        </div>

        {/* Card Grid */}
        {loading && offset === 0 ? (
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
        ) : notaries.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Notaries Found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Try a different search term or select a different state.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notaries.map(notary => (
                <NotaryCard key={notary.id} notary={notary} />
              ))}
            </div>

            {hasMore && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Load More Notaries
                </button>
              </div>
            )}

            {loading && offset > 0 && (
              <div className="text-center py-6">
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Loading more...
                </div>
              </div>
            )}
          </>
        )}

        {/* Help CTA */}
        <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
