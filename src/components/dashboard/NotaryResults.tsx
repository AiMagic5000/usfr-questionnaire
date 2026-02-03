'use client'

import { Star, Phone, MapPin, ExternalLink, Loader2 } from 'lucide-react'

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

function StarRating({ rating }: { rating: number }) {
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

  return <div className="flex items-center gap-0.5">{stars}</div>
}

function NotaryCard({ notary }: { notary: Notary }) {
  const phoneFormatted = notary.phone
    ? notary.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#0066cc] hover:shadow-md transition-all">
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
          <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-purple-500" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">
            {notary.business_name}
          </h4>

          {notary.rating !== null && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={notary.rating} />
              <span className="text-xs text-gray-500">
                {notary.rating.toFixed(1)} ({notary.review_count} reviews)
              </span>
            </div>
          )}

          {notary.categories && notary.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {notary.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {notary.address && (
            <p className="text-xs text-gray-500 mt-1.5 truncate">
              <MapPin className="w-3 h-3 inline mr-1" />
              {notary.address}
              {notary.city ? `, ${notary.city}` : ''}
              {notary.state_abbr ? `, ${notary.state_abbr}` : ''}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            {phoneFormatted && (
              <a
                href={`tel:${notary.phone}`}
                className="flex items-center gap-1 text-xs text-[#003366] font-medium hover:underline"
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
                <ExternalLink className="w-3 h-3" />
                Yelp
              </a>
            )}
            {notary.website_url && (
              <a
                href={notary.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Website
              </a>
            )}
          </div>

          {notary.is_mobile && (
            <span className="inline-block mt-1.5 text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
              Mobile Service Available
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
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
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="w-4 h-4 animate-spin text-[#003366]" />
          <span className="text-sm text-gray-600">
            Loading notaries in {selectedCounty}, {selectedState}...
          </span>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (!selectedCounty) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Select a County
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Click on a county on the map or use the search to find mobile notaries in your area.
        </p>
      </div>
    )
  }

  if (notaries.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Notaries Found
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          We don't have notary data for {selectedCounty} County, {selectedState} yet.
          Try a nearby county or call us for assistance.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {selectedCounty} County, {selectedState}
        </h3>
        <span className="text-sm text-gray-500">
          {notaries.length} notar{notaries.length === 1 ? 'y' : 'ies'} found
        </span>
      </div>
      <div className="space-y-3">
        {notaries.map((notary) => (
          <NotaryCard key={notary.id} notary={notary} />
        ))}
      </div>
    </div>
  )
}
