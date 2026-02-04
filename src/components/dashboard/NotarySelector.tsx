'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, MapPin, Star, Phone, Mail, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react'

interface Notary {
  id: string
  business_name: string
  phone: string | null
  address: string | null
  city: string | null
  county_name: string
  state: string | null
  state_abbr: string
  zip_code: string | null
  rating: number | null
  review_count: number
}

interface NotarySelectorProps {
  initialState?: string
  initialCounty?: string
  onSelect: (notary: Notary | null, email: string) => void
  selectedNotaryId?: string
}

// Manual notary entry when no results found
interface ManualNotary {
  business_name: string
  phone: string
  email: string
}

const US_STATES = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' }, { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' }, { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' }, { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' }, { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' }, { abbr: 'DC', name: 'District of Columbia' },
]

export function NotarySelector({ initialState, initialCounty, onSelect, selectedNotaryId }: NotarySelectorProps) {
  const [state, setState] = useState(initialState || '')
  const [county, setCounty] = useState(initialCounty || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [counties, setCounties] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCounties, setIsLoadingCounties] = useState(false)
  const [selectedNotary, setSelectedNotary] = useState<Notary | null>(null)
  const [notaryEmail, setNotaryEmail] = useState('')
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualNotary, setManualNotary] = useState<ManualNotary>({ business_name: '', phone: '', email: '' })

  // Fetch counties when state changes
  useEffect(() => {
    if (!state) {
      setCounties([])
      return
    }

    const fetchCounties = async () => {
      setIsLoadingCounties(true)
      try {
        const res = await fetch(`/api/notaries?state=${state}&distinct_counties=true`)
        if (res.ok) {
          const data = await res.json()
          setCounties(data.counties || [])
        }
      } catch {
        setCounties([])
      } finally {
        setIsLoadingCounties(false)
      }
    }

    fetchCounties()
  }, [state])

  // Search notaries
  const searchNotaries = useCallback(async () => {
    if (!state) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({ state })
      if (county) params.append('county', county)
      if (searchQuery) params.append('search', searchQuery)
      params.append('limit', '20')

      const res = await fetch(`/api/notaries?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotaries(data.notaries || [])
      }
    } catch {
      setNotaries([])
    } finally {
      setIsLoading(false)
    }
  }, [state, county, searchQuery])

  // Auto-search when state/county changes
  useEffect(() => {
    if (state) {
      searchNotaries()
    }
  }, [state, county, searchNotaries])

  const handleSelectNotary = (notary: Notary) => {
    setSelectedNotary(notary)
    // Don't call onSelect until email is provided
  }

  // Notify parent when both notary and email are set
  useEffect(() => {
    if (selectedNotary && notaryEmail && notaryEmail.includes('@')) {
      onSelect(selectedNotary, notaryEmail)
    } else if (!selectedNotary) {
      onSelect(null, '')
    }
  }, [selectedNotary, notaryEmail, onSelect])

  const renderStars = (rating: number | null) => {
    if (!rating) return null
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Location Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <div className="relative">
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value)
                setCounty('')
                setNotaries([])
                setSelectedNotary(null)
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-usfr-secondary focus:border-transparent appearance-none bg-white"
            >
              <option value="">Select State</option>
              {US_STATES.map(s => (
                <option key={s.abbr} value={s.abbr}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
          <div className="relative">
            <select
              value={county}
              onChange={(e) => {
                setCounty(e.target.value)
                setSelectedNotary(null)
              }}
              disabled={!state || isLoadingCounties}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-usfr-secondary focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Counties</option>
              {counties.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {isLoadingCounties ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchNotaries()}
          placeholder="Search by name, phone, or zip..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
        />
      </div>

      {/* Manual entry link */}
      {!showManualEntry && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowManualEntry(true)}
            className="text-sm text-usfr-primary hover:underline"
          >
            Can't find your notary? Enter details manually
          </button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-usfr-primary animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Searching notaries...</span>
        </div>
      ) : notaries.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {notaries.map((notary, index) => {
            const isSelected = selectedNotary?.id === notary.id
            const imageIndex = (index % 6) + 1
            return (
              <button
                key={notary.id}
                type="button"
                onClick={() => handleSelectNotary(notary)}
                className={`w-full text-left rounded-xl border overflow-hidden transition-all ${
                  isSelected
                    ? 'border-usfr-secondary ring-2 ring-usfr-secondary'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Notary Image */}
                <div className="relative h-28 overflow-hidden bg-gray-100">
                  <img
                    src={`/images/notary/notary-${imageIndex}.png`}
                    alt="Notary Services"
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-usfr-secondary text-white rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {notary.rating && (
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-medium">{notary.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {/* Notary Info */}
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm truncate">{notary.business_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500 truncate">
                      {notary.city || notary.county_name}{notary.state_abbr ? `, ${notary.state_abbr}` : ''}{notary.zip_code ? ` ${notary.zip_code}` : ''}
                    </p>
                  </div>
                  {notary.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-usfr-primary flex-shrink-0" />
                      <p className="text-xs text-usfr-primary font-medium">{notary.phone}</p>
                    </div>
                  )}
                  {notary.address && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{notary.address}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : state ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No notaries found in this area</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search or enter notary details manually</p>
          <button
            type="button"
            onClick={() => setShowManualEntry(true)}
            className="mt-3 px-4 py-2 text-sm font-medium text-usfr-primary border border-usfr-primary rounded-lg hover:bg-usfr-primary/5 transition-colors"
          >
            Enter Notary Manually
          </button>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Select a state to search for notaries</p>
        </div>
      )}

      {/* Notary Email Input */}
      {selectedNotary && !showManualEntry && (
        <div className="bg-usfr-secondary/5 border border-usfr-secondary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-usfr-secondary" />
            <span className="font-medium text-gray-900">Selected: {selectedNotary.business_name}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notary Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={notaryEmail}
                onChange={(e) => setNotaryEmail(e.target.value)}
                placeholder="notary@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter the notary's email address to send them the signing request</p>
          </div>
        </div>
      )}

      {/* Manual Notary Entry Form */}
      {showManualEntry && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Enter Notary Details</h3>
            <button
              type="button"
              onClick={() => {
                setShowManualEntry(false)
                setManualNotary({ business_name: '', phone: '', email: '' })
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notary Name / Business <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualNotary.business_name}
                onChange={(e) => setManualNotary(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="John Smith Notary Services"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notary Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={manualNotary.email}
                  onChange={(e) => setManualNotary(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="notary@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={manualNotary.phone}
                  onChange={(e) => setManualNotary(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={!manualNotary.business_name.trim() || !manualNotary.email.includes('@')}
              onClick={() => {
                // Create a manual notary object and select it
                const manual: Notary = {
                  id: `manual-${Date.now()}`,
                  business_name: manualNotary.business_name,
                  phone: manualNotary.phone || null,
                  address: null,
                  city: null,
                  county_name: county || 'N/A',
                  state: null,
                  state_abbr: state || 'N/A',
                  zip_code: null,
                  rating: null,
                  review_count: 0,
                }
                setSelectedNotary(manual)
                setNotaryEmail(manualNotary.email)
                setShowManualEntry(false)
              }}
              className="w-full py-2.5 bg-usfr-primary text-white rounded-lg font-medium hover:bg-usfr-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Use This Notary
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
