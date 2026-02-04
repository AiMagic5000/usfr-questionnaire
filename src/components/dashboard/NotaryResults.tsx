'use client'

import { Star, Phone, MapPin, ExternalLink, Loader2, Globe, MessageCircle } from 'lucide-react'

export interface Notary {
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

interface NotaryResultsProps {
  notaries: Notary[]
  isLoading: boolean
  selectedCounty: string | null
  selectedState: string | null
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      )
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      )
    } else {
      stars.push(
        <Star key={i} className="w-4 h-4 text-gray-300" />
      )
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{stars}</div>
      <span className="text-sm font-semibold text-yellow-600">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-gray-500">({reviewCount})</span>
    </div>
  )
}

export function NotaryCard({ notary }: { notary: Notary }) {
  const phoneFormatted = notary.phone
    ? notary.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    : null

  const location = [notary.city, notary.state_abbr, notary.zip_code]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full">
      {/* Image Section - Prominent like Fiverr */}
      <div className="relative w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
        {notary.image_url ? (
          <img
            src={notary.image_url}
            alt={notary.business_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement?.classList.add('flex', 'items-center', 'justify-center')
            }}
          />
        ) : (
          <MapPin className="w-16 h-16 text-indigo-300" />
        )}

        {/* Mobile Service Badge - Positioned on image */}
        {notary.is_mobile && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
              Mobile Service
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Business Name */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {notary.business_name}
        </h3>

        {/* Star Rating */}
        {notary.rating !== null && (
          <div className="mb-3">
            <StarRating rating={notary.rating} reviewCount={notary.review_count} />
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-start gap-2 mb-3 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{location}</span>
          </div>
        )}

        {/* Categories */}
        {notary.categories && notary.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {notary.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Spacer to push contact section to bottom */}
        <div className="flex-1"></div>

        {/* Phone Number - Prominent */}
        {phoneFormatted && (
          <a
            href={`tel:${notary.phone}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mb-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            {phoneFormatted}
          </a>
        )}

        {/* Links Row */}
        <div className="flex items-center justify-center gap-4 pt-3 border-t border-gray-100">
          {notary.yelp_url && (
            <a
              href={notary.yelp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              YellowPages
            </a>
          )}
          {notary.website_url && (
            <a
              href={notary.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
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
  )
}

export function NotaryResults({
  notaries,
  isLoading,
  selectedCounty,
  selectedState,
}: NotaryResultsProps) {
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600 font-medium">
            Loading notaries in {selectedCounty}, {selectedState}...
          </span>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (!selectedCounty) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
          <MapPin className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Select a County
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Click on a county on the map or use the search to find mobile notaries in your area.
        </p>
      </div>
    )
  }

  if (notaries.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mb-6">
          <MapPin className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          No Notaries Found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We don't have notary data for {selectedCounty} County, {selectedState} yet.
          Try a nearby county or call us for assistance.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {selectedCounty} County, {selectedState}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {notaries.length} notar{notaries.length === 1 ? 'y' : 'ies'} available
          </p>
        </div>
      </div>

      {/* Grid Layout - Fiverr Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notaries.map((notary) => (
          <NotaryCard key={notary.id} notary={notary} />
        ))}
      </div>
    </div>
  )
}
