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

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-usfr-primary animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Searching notaries...</span>
        </div>
      ) : notaries.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notaries.map(notary => {
            const isSelected = selectedNotary?.id === notary.id
            return (
              <button
                key={notary.id}
                type="button"
                onClick={() => handleSelectNotary(notary)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-usfr-secondary bg-usfr-secondary/5 ring-2 ring-usfr-secondary'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-usfr-secondary text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{notary.business_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderStars(notary.rating)}
                      {notary.review_count > 0 && (
                        <span className="text-xs text-gray-400">({notary.review_count} reviews)</span>
                      )}
                    </div>
                    {notary.address && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {notary.address}{notary.city ? `, ${notary.city}` : ''}{notary.state_abbr ? `, ${notary.state_abbr}` : ''}{notary.zip_code ? ` ${notary.zip_code}` : ''}
                      </p>
                    )}
                    {notary.phone && (
                      <p className="text-xs text-usfr-primary mt-1">
                        <Phone className="w-3 h-3 inline mr-1" />
                        {notary.phone}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ) : state ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No notaries found in this area</p>
          <p className="text-xs text-gray-400 mt-1">Try a different county or search term</p>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Select a state to search for notaries</p>
        </div>
      )}

      {/* Notary Email Input */}
      {selectedNotary && (
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
    </div>
  )
}
