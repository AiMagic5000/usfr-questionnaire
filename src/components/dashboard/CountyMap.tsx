'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Search, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react'

interface CountyMapProps {
  onCountySelect: (countyName: string, stateAbbr: string) => void
  selectedCounty: string | null
  selectedState: string | null
}

const STATE_FIPS_TO_ABBR: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY',
}

const ABBR_TO_NAME: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin',
  WY: 'Wyoming',
}

export function CountyMap({ onCountySelect, selectedCounty, selectedState }: CountyMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statesWithCounties, setStatesWithCounties] = useState<
    Array<{ state: string; counties: string[] }>
  >([])
  const [filteredResults, setFilteredResults] = useState<
    Array<{ county: string; state: string }>
  >([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const d3Ref = useRef<typeof import('d3') | null>(null)
  const topoRef = useRef<typeof import('topojson-client') | null>(null)

  // Load state/county data for search
  useEffect(() => {
    async function loadStates() {
      try {
        const response = await fetch('/api/notaries/states')
        if (response.ok) {
          const data = await response.json()
          setStatesWithCounties(data.states || [])
        }
      } catch {
        // Search will still work via map clicks
      }
    }
    loadStates()
  }, [])

  // Filter search results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([])
      setShowSearchResults(false)
      return
    }

    const query = searchQuery.toLowerCase()
    const results: Array<{ county: string; state: string }> = []

    for (const stateData of statesWithCounties) {
      for (const county of stateData.counties) {
        if (county.toLowerCase().includes(query) || stateData.state.toLowerCase().includes(query)) {
          results.push({ county, state: stateData.state })
        }
        if (results.length >= 20) break
      }
      if (results.length >= 20) break
    }

    setFilteredResults(results)
    setShowSearchResults(results.length > 0)
  }, [searchQuery, statesWithCounties])

  const handleSearchSelect = useCallback(
    (county: string, state: string) => {
      setSearchQuery('')
      setShowSearchResults(false)
      onCountySelect(county, state)
    },
    [onCountySelect]
  )

  // Initialize D3 map
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
        const height = Math.min(width * 0.625, 500)

        svg.attr('viewBox', `0 0 975 610`).attr('width', width).attr('height', height)

        // Clear existing content
        svg.selectAll('*').remove()

        const g = svg.append('g')

        // County boundaries
        const counties = topojson.feature(us, us.objects.counties) as unknown as GeoJSON.FeatureCollection
        const states = topojson.feature(us, us.objects.states) as unknown as GeoJSON.FeatureCollection

        // County paths
        g.selectAll('.county')
          .data(counties.features)
          .join('path')
          .attr('class', 'county')
          .attr('d', d3.geoPath() as unknown as string)
          .attr('fill', '#e8eef5')
          .attr('stroke', '#c5d3e3')
          .attr('stroke-width', 0.3)
          .style('cursor', 'pointer')
          .on('mouseenter', function () {
            d3.select(this).attr('fill', '#b3d1f0')
          })
          .on('mouseleave', function (event, d: unknown) {
            const feature = d as GeoJSON.Feature
            const fips = String(feature.id || '').padStart(5, '0')
            const stateFips = fips.substring(0, 2)
            const stateAbbr = STATE_FIPS_TO_ABBR[stateFips] || ''
            const countyName = (feature.properties?.name as string) || ''
            const isSelected = countyName === selectedCounty && stateAbbr === selectedState
            d3.select(this).attr('fill', isSelected ? '#4a90d9' : '#e8eef5')
          })
          .on('click', function (event, d: unknown) {
            const feature = d as GeoJSON.Feature
            const fips = String(feature.id || '').padStart(5, '0')
            const stateFips = fips.substring(0, 2)
            const stateAbbr = STATE_FIPS_TO_ABBR[stateFips] || ''
            const countyName = (feature.properties?.name as string) || ''

            if (countyName && stateAbbr) {
              // Reset all counties
              g.selectAll('.county').attr('fill', '#e8eef5')
              // Highlight selected
              d3.select(this).attr('fill', '#4a90d9')
              onCountySelect(countyName, stateAbbr)
            }
          })

        // State boundaries
        g.selectAll('.state')
          .data(states.features)
          .join('path')
          .attr('class', 'state')
          .attr('d', d3.geoPath() as unknown as string)
          .attr('fill', 'none')
          .attr('stroke', '#003366')
          .attr('stroke-width', 1)
          .style('pointer-events', 'none')

        // Zoom behavior
        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 12])
          .on('zoom', (event) => {
            g.attr('transform', event.transform)
          })

        svg.call(zoom)

        // Store zoom ref for controls
        ;(svgRef.current as SVGSVGElement & { __zoom?: typeof zoom }).
          __zoom = zoom

        setIsLoading(false)
      } catch (err) {
        if (isMounted) setIsLoading(false)
      }
    }

    initMap()

    return () => {
      isMounted = false
    }
  }, [onCountySelect, selectedCounty, selectedState])

  const handleZoomIn = () => {
    if (!svgRef.current || !d3Ref.current) return
    const d3 = d3Ref.current
    const svg = d3.select(svgRef.current)
    const zoom = (svgRef.current as SVGSVGElement & { __zoom?: ReturnType<typeof d3.zoom> }).__zoom
    if (zoom) {
      svg.transition().duration(300).call(zoom.scaleBy as never, 1.5)
    }
  }

  const handleZoomOut = () => {
    if (!svgRef.current || !d3Ref.current) return
    const d3 = d3Ref.current
    const svg = d3.select(svgRef.current)
    const zoom = (svgRef.current as SVGSVGElement & { __zoom?: ReturnType<typeof d3.zoom> }).__zoom
    if (zoom) {
      svg.transition().duration(300).call(zoom.scaleBy as never, 0.67)
    }
  }

  const handleReset = () => {
    if (!svgRef.current || !d3Ref.current) return
    const d3 = d3Ref.current
    const svg = d3.select(svgRef.current)
    const zoom = (svgRef.current as SVGSVGElement & { __zoom?: ReturnType<typeof d3.zoom> }).__zoom
    if (zoom) {
      svg.transition().duration(500).call(zoom.transform as never, d3.zoomIdentity)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Search + Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search county or state..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
            />
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {filteredResults.map((r) => (
                  <button
                    key={`${r.county}-${r.state}`}
                    onClick={() => handleSearchSelect(r.county, r.state)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    <span className="font-medium">{r.county}</span>
                    <span className="text-gray-500"> County, {r.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className="relative bg-[#f5f8fa]"
        style={{ minHeight: 350 }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f5f8fa] z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#003366] mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading county map...</p>
            </div>
          </div>
        )}
        <svg ref={svgRef} className="w-full" style={{ display: isLoading ? 'none' : 'block' }} />
      </div>

      {/* Map Legend */}
      <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>Click a county to find notaries. Scroll to zoom.</span>
        {selectedCounty && selectedState && (
          <span className="font-medium text-[#003366]">
            Selected: {selectedCounty}, {selectedState}
          </span>
        )}
      </div>
    </div>
  )
}
