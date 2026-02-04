'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Search, RotateCcw, Download, Loader2, X, Phone, MapPin, Star, ExternalLink } from 'lucide-react'

interface CountyMapProps {
  onCountySelect: (countyName: string, stateAbbr: string) => void
  selectedCounty: string | null
  selectedState: string | null
}

interface Notary {
  id: string
  business_name: string
  yelp_url: string | null
  website_url: string | null
  phone: string | null
  address: string | null
  city: string | null
  county_name: string
  state: string | null
  state_abbr: string
  zip_code: string | null
  rating: number | null
  review_count: number
  categories: string[] | null
  image_url: string | null
  is_mobile: boolean
  price_range: string | null
}

const STATE_FIPS_TO_ABBR: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '12': 'FL', '13': 'GA',
  '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA',
  '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD',
  '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO',
  '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ',
  '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
  '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC',
  '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT',
  '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI', '56': 'WY',
}

const ABBR_TO_NAME: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

// Judicial foreclosure states (require court proceedings) = BLUE
const JUDICIAL_STATES = new Set([
  'CT', 'DE', 'FL', 'HI', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA',
  'ME', 'MD', 'MA', 'NE', 'NJ', 'NM', 'NY', 'ND', 'OH', 'OK',
  'PA', 'RI', 'SC', 'SD', 'VT', 'WI',
])

// Non-judicial foreclosure states (power of sale) = RED
const NON_JUDICIAL_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'DC', 'GA', 'ID', 'MI',
  'MN', 'MS', 'MO', 'MT', 'NV', 'NH', 'NC', 'OR', 'TN', 'TX',
  'UT', 'VA', 'WA', 'WV', 'WY',
])

const JUDICIAL_COLOR = '#2563eb'     // Blue
const NON_JUDICIAL_COLOR = '#dc2626' // Red
const UNKNOWN_COLOR = '#6b7280'      // Gray fallback

function getForeclosureColor(stateAbbr: string): string {
  if (JUDICIAL_STATES.has(stateAbbr)) return JUDICIAL_COLOR
  if (NON_JUDICIAL_STATES.has(stateAbbr)) return NON_JUDICIAL_COLOR
  return UNKNOWN_COLOR
}

function StarRating({ rating }: { rating: number }) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)
    } else if (i === fullStars && hasHalf) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />)
    } else {
      stars.push(<Star key={i} className="w-3 h-3 text-slate-600" />)
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>
}

function NotaryCard({ notary }: { notary: Notary }) {
  const phoneFormatted = notary.phone
    ? notary.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    : null

  return (
    <div className="bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-all">
      <div className="flex gap-3">
        {notary.image_url ? (
          <img
            src={notary.image_url}
            alt={notary.business_name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-slate-100 text-sm truncate">
            {notary.business_name}
          </h5>

          {notary.rating !== null && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={notary.rating} />
              <span className="text-xs text-slate-400">
                {notary.rating.toFixed(1)} ({notary.review_count})
              </span>
            </div>
          )}

          {phoneFormatted && (
            <a
              href={`tel:${notary.phone}`}
              className="flex items-center gap-1 text-xs text-cyan-400 font-medium hover:underline mt-1"
            >
              <Phone className="w-3 h-3" />
              {phoneFormatted}
            </a>
          )}

          <div className="flex items-center gap-2 mt-1">
            {notary.yelp_url && (
              <a
                href={notary.yelp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-400 hover:underline"
              >
                Yelp
              </a>
            )}
            {notary.website_url && (
              <a
                href={notary.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:underline"
              >
                Website
              </a>
            )}
          </div>

          {notary.is_mobile && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">
              Mobile
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function CountyMap({ onCountySelect, selectedCounty, selectedState }: CountyMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredStates, setFilteredStates] = useState<Set<string>>(new Set(Object.values(STATE_FIPS_TO_ABBR)))
  const [stateColorMap, setStateColorMap] = useState<Record<string, string>>({})
  const [totalCounties, setTotalCounties] = useState(0)
  const [visibleCounties, setVisibleCounties] = useState(0)
  const [popupData, setPopupData] = useState<{
    county: string
    state: string
    fips: string
    visible: boolean
  } | null>(null)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [loadingNotaries, setLoadingNotaries] = useState(false)

  const d3Ref = useRef<typeof import('d3') | null>(null)
  const topoRef = useRef<typeof import('topojson-client') | null>(null)
  const countyPathsRef = useRef<d3.Selection<SVGPathElement, GeoJSON.Feature, SVGGElement, unknown> | null>(null)

  // Initialize map
  useEffect(() => {
    let isMounted = true

    async function initMap() {
      try {
        const [d3Module, topoModule] = await Promise.all([
          import('d3'),
          import('topojson-client'),
        ])

        if (!isMounted) return

        d3Ref.current = d3Module
        topoRef.current = topoModule

        const topoResponse = await fetch(
          'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json'
        )
        const us = await topoResponse.json()

        if (!isMounted || !svgRef.current || !containerRef.current) return

        const d3 = d3Module
        const topojson = topoModule
        const svg = d3.select(svgRef.current)
        const container = containerRef.current
        const width = container.clientWidth
        const height = Math.max(400, Math.min(width * 0.625, 600))

        svg.attr('viewBox', `0 0 975 610`).attr('width', width).attr('height', height)

        svg.selectAll('*').remove()

        const g = svg.append('g')

        const counties = topojson.feature(us, us.objects.counties) as unknown as GeoJSON.FeatureCollection
        const states = topojson.feature(us, us.objects.states) as unknown as GeoJSON.FeatureCollection

        setTotalCounties(counties.features.length)
        setVisibleCounties(counties.features.length)

        // Build state color map based on judicial vs non-judicial
        const colorMap: Record<string, string> = {}

        counties.features.forEach((feature) => {
          const fips = String(feature.id || '').padStart(5, '0')
          const stateFips = fips.substring(0, 2)
          const stateAbbr = STATE_FIPS_TO_ABBR[stateFips]
          if (stateAbbr && !colorMap[stateAbbr]) {
            colorMap[stateAbbr] = getForeclosureColor(stateAbbr)
          }
        })

        setStateColorMap(colorMap)

        // Draw counties
        const countyPaths = g
          .selectAll('.county')
          .data(counties.features)
          .join('path')
          .attr('class', 'county')
          .attr('d', d3.geoPath() as unknown as string)
          .attr('fill', (d: unknown) => {
            const feature = d as GeoJSON.Feature
            const fips = String(feature.id || '').padStart(5, '0')
            const stateFips = fips.substring(0, 2)
            const stateAbbr = STATE_FIPS_TO_ABBR[stateFips]
            return colorMap[stateAbbr] || '#334155'
          })
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 0.5)
          .attr('data-fips', (d: unknown) => (d as GeoJSON.Feature).id || '')
          .style('cursor', 'pointer')
          .style('transition', 'all 0.2s ease')
          .on('mouseenter', function () {
            d3.select(this)
              .attr('stroke-width', 1)
              .style('filter', 'brightness(1.2)')
          })
          .on('mouseleave', function () {
            const isSelected = d3.select(this).classed('selected')
            d3.select(this)
              .attr('stroke-width', isSelected ? 2 : 0.5)
              .style('filter', 'none')
          })
          .on('click', function (event, d: unknown) {
            event.stopPropagation()
            const feature = d as GeoJSON.Feature
            const fips = String(feature.id || '').padStart(5, '0')
            const stateFips = fips.substring(0, 2)
            const stateAbbr = STATE_FIPS_TO_ABBR[stateFips] || ''
            const countyName = (feature.properties?.name as string) || ''

            if (countyName && stateAbbr) {
              // Clear previous selection
              g.selectAll('.county').classed('selected', false).attr('stroke-width', 0.5).attr('stroke', '#0f172a')

              // Mark as selected
              d3.select(this)
                .classed('selected', true)
                .attr('stroke', '#fbbf24')
                .attr('stroke-width', 2)

              // Show popup and fetch notaries
              setPopupData({
                county: countyName,
                state: stateAbbr,
                fips,
                visible: true,
              })

              // Fetch notaries
              fetchNotaries(countyName, stateAbbr)

              onCountySelect(countyName, stateAbbr)
            }
          })

        countyPathsRef.current = countyPaths as d3.Selection<SVGPathElement, GeoJSON.Feature, SVGGElement, unknown>

        // Draw state borders
        g.selectAll('.state-border')
          .data(states.features)
          .join('path')
          .attr('class', 'state-border')
          .attr('d', d3.geoPath() as unknown as string)
          .attr('fill', 'none')
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2)
          .style('pointer-events', 'none')

        // Zoom behavior
        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 12])
          .on('zoom', (event) => {
            g.attr('transform', event.transform)
          })

        svg.call(zoom)

        ;(svgRef.current as SVGSVGElement & { __zoom?: typeof zoom }).__zoom = zoom

        setIsLoading(false)
      } catch (err) {
        console.error('Error loading map:', err)
        if (isMounted) setIsLoading(false)
      }
    }

    initMap()

    return () => {
      isMounted = false
    }
  }, [onCountySelect])

  // Fetch notaries
  const fetchNotaries = async (countyName: string, stateAbbr: string) => {
    setLoadingNotaries(true)
    setNotaries([])

    try {
      const params = new URLSearchParams({
        state: stateAbbr,
        county: countyName,
        limit: '10',
      })
      const response = await fetch(`/api/notaries?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotaries(data.notaries || [])
      }
    } catch {
      setNotaries([])
    } finally {
      setLoadingNotaries(false)
    }
  }

  // Update county visibility based on filters and search
  const updateCountyVisibility = useCallback(() => {
    if (!countyPathsRef.current || !d3Ref.current) return

    const d3 = d3Ref.current
    let visible = 0

    countyPathsRef.current.style('opacity', function (d: unknown) {
      const feature = d as GeoJSON.Feature
      const fips = String(feature.id || '').padStart(5, '0')
      const stateFips = fips.substring(0, 2)
      const stateAbbr = STATE_FIPS_TO_ABBR[stateFips]
      const countyName = (feature.properties?.name as string) || ''

      const stateMatch = filteredStates.has(stateAbbr)
      const searchMatch = !searchQuery || countyName.toLowerCase().includes(searchQuery.toLowerCase())

      const isVisible = stateMatch && searchMatch

      if (isVisible) {
        visible++
        return '1'
      } else if (stateMatch) {
        return '0.3'
      } else {
        return '0'
      }
    })

    setVisibleCounties(visible)
  }, [filteredStates, searchQuery])

  useEffect(() => {
    updateCountyVisibility()
  }, [updateCountyVisibility])

  // Toggle state filter
  const toggleState = (stateAbbr: string) => {
    setFilteredStates((prev) => {
      const next = new Set(prev)
      if (next.has(stateAbbr)) {
        next.delete(stateAbbr)
      } else {
        next.add(stateAbbr)
      }
      return next
    })
  }

  // Reset view
  const handleReset = () => {
    setSearchQuery('')
    setFilteredStates(new Set(Object.values(STATE_FIPS_TO_ABBR)))
    setPopupData(null)

    if (!svgRef.current || !d3Ref.current) return
    const d3 = d3Ref.current
    const svg = d3.select(svgRef.current)
    const zoom = (svgRef.current as SVGSVGElement & { __zoom?: ReturnType<typeof d3.zoom> }).__zoom
    if (zoom) {
      svg.transition().duration(500).call(zoom.transform as never, d3.zoomIdentity)
    }

    // Clear selection
    if (countyPathsRef.current) {
      countyPathsRef.current.classed('selected', false).attr('stroke-width', 0.5).attr('stroke', '#0f172a')
    }
  }

  // Export data
  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      totalCounties,
      visibleCounties,
      filteredStates: Array.from(filteredStates),
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `county-map-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-5">
      {/* Main map area */}
      <div className="flex-1">
        {/* Search + Controls */}
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search county name..."
              className="w-full pl-9 pr-4 py-3 border-2 border-slate-600 bg-slate-700 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleReset}
            className="px-5 py-3 bg-gradient-to-br from-slate-700 to-slate-600 text-slate-100 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-slate-900/30 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset View
          </button>
          <button
            onClick={handleExport}
            className="px-5 py-3 bg-gradient-to-br from-slate-700 to-slate-600 text-slate-100 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-slate-900/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {/* Map Container */}
        <div
          ref={containerRef}
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700"
          style={{ minHeight: 500 }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Loading county map...</p>
              </div>
            </div>
          )}
          <svg ref={svgRef} className="w-full" style={{ display: isLoading ? 'none' : 'block' }} />
        </div>

        {/* Popup */}
        {popupData?.visible && (
          <div
            ref={popupRef}
            className="fixed bg-slate-800 border-2 border-cyan-400 rounded-xl p-5 shadow-2xl z-50 min-w-[350px] max-w-[450px] animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <button
              onClick={() => setPopupData(null)}
              className="absolute top-3 right-3 w-7 h-7 bg-slate-700 rounded-md text-slate-300 hover:bg-cyan-400 hover:text-slate-900 transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 border-b-2 border-slate-700 pb-3">
              <h3 className="text-xl font-bold text-cyan-400 mb-1">
                {popupData.county}
              </h3>
              <p className="text-sm text-slate-400">
                {ABBR_TO_NAME[popupData.state]} ({popupData.state})
              </p>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                Information
              </h4>
              <div className="text-sm text-slate-300">
                <div>
                  <strong className="text-slate-100">FIPS Code:</strong> {popupData.fips}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                Notaries ({notaries.length})
              </h4>
              {loadingNotaries ? (
                <div className="text-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mx-auto" />
                </div>
              ) : notaries.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notaries.map((notary) => (
                    <NotaryCard key={notary.id} notary={notary} />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-700/50 border border-dashed border-slate-600 rounded-lg p-3 text-center text-sm text-slate-400">
                  No notaries found in this county
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <a
                href={`https://www.congress.gov/members?state=${popupData.state}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-400/30 transition-all text-center"
              >
                State Laws
              </a>
              <a
                href={`https://en.wikipedia.org/wiki/${popupData.county}_County,_${popupData.state}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-400/30 transition-all text-center"
              >
                More Info
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-72 flex flex-col gap-5">
        {/* Foreclosure Type Legend */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-2xl border border-slate-700">
          <h3 className="text-base font-semibold text-cyan-400 mb-3 uppercase tracking-wide">
            Foreclosure Type
          </h3>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded" style={{ backgroundColor: JUDICIAL_COLOR }} />
              <span className="text-sm text-slate-200">Judicial ({JUDICIAL_STATES.size} states)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded" style={{ backgroundColor: NON_JUDICIAL_COLOR }} />
              <span className="text-sm text-slate-200">Non-Judicial ({NON_JUDICIAL_STATES.size} states)</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Judicial states require court proceedings for foreclosure. Non-judicial states allow power-of-sale foreclosure without court involvement.
          </p>
        </div>

        {/* State List */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-2xl border border-slate-700 max-h-[400px] overflow-y-auto">
          <h3 className="text-base font-semibold text-cyan-400 mb-3 uppercase tracking-wide">
            States
          </h3>
          <div className="space-y-1">
            {Object.entries(stateColorMap)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([stateAbbr, color]) => (
                <button
                  key={stateAbbr}
                  onClick={() => toggleState(stateAbbr)}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer transition-all text-sm ${
                    filteredStates.has(stateAbbr)
                      ? 'hover:bg-slate-700 text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded transition-all ${
                      filteredStates.has(stateAbbr) ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                  <span>
                    {stateAbbr} - {ABBR_TO_NAME[stateAbbr]}
                  </span>
                  <span className="ml-auto text-xs text-slate-500">
                    {JUDICIAL_STATES.has(stateAbbr) ? 'J' : 'NJ'}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-2xl border border-slate-700">
          <h3 className="text-base font-semibold text-cyan-400 mb-3 uppercase tracking-wide">
            Statistics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-700">
              <span className="text-slate-400">Total Counties:</span>
              <span className="text-cyan-400 font-semibold">{totalCounties}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-700">
              <span className="text-slate-400">States:</span>
              <span className="text-cyan-400 font-semibold">{filteredStates.size}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2">
              <span className="text-slate-400">Visible:</span>
              <span className="text-cyan-400 font-semibold">{visibleCounties}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
