'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, Loader2, Database, ChevronLeft, ChevronRight, MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { type ForeclosureLead, type MappedFormData, mapLeadToFormData } from '@/lib/lead-to-form-mapper'

interface ImportLeadsModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: MappedFormData) => void
}

type ModalState = 'loading' | 'no-access' | 'search' | 'confirm'

interface SearchMeta {
  total: number
  page: number
  totalPages: number
}

export function ImportLeadsModal({ isOpen, onClose, onImport }: ImportLeadsModalProps) {
  const [modalState, setModalState] = useState<ModalState>('loading')
  const [statesAccess, setStatesAccess] = useState<string[]>([])
  const [noAccessMessage, setNoAccessMessage] = useState('')

  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [leads, setLeads] = useState<ForeclosureLead[]>([])
  const [meta, setMeta] = useState<SearchMeta>({ total: 0, page: 1, totalPages: 0 })
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  // Confirm state
  const [selectedLead, setSelectedLead] = useState<ForeclosureLead | null>(null)
  const [mappedData, setMappedData] = useState<MappedFormData | null>(null)

  const getSessionToken = () => sessionStorage.getItem('usfr_agent_session') || ''

  // Auto-connect on open using agent session (no credentials needed)
  useEffect(() => {
    if (!isOpen) return

    async function checkAccess() {
      setModalState('loading')
      try {
        const response = await fetch('/api/leads/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-agent-session': getSessionToken(),
          },
          body: JSON.stringify({}),
        })

        const result = await response.json()

        if (result.connected) {
          setStatesAccess(result.statesAccess || [])
          setModalState('search')
          searchLeads(1, '', '', result.statesAccess || [])
        } else {
          setNoAccessMessage(result.error || 'No leads access found for your account.')
          setModalState('no-access')
        }
      } catch {
        setNoAccessMessage('Failed to check leads access. Please try again.')
        setModalState('no-access')
      }
    }

    checkAccess()
  }, [isOpen])

  const searchLeads = useCallback(async (
    page: number,
    search: string,
    state: string,
    states?: string[]
  ) => {
    setIsSearching(true)
    setSearchError('')

    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-session': getSessionToken(),
        },
        body: JSON.stringify({
          search: search || undefined,
          state: state || undefined,
          page,
        }),
      })

      const result = await response.json()

      if (result.error) {
        setSearchError(result.error)
        setLeads([])
      } else {
        setLeads(result.leads || [])
        setMeta(result.meta || { total: 0, page: 1, totalPages: 0 })
        if (result.statesAccess) {
          setStatesAccess(result.statesAccess)
        }
      }
    } catch {
      setSearchError('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearch = () => {
    searchLeads(1, searchTerm, stateFilter)
  }

  const handleSelectLead = (lead: ForeclosureLead) => {
    setSelectedLead(lead)
    setMappedData(mapLeadToFormData(lead))
    setModalState('confirm')
  }

  const handleImport = () => {
    if (mappedData) {
      onImport(mappedData)
      handleClose()
    }
  }

  const handleClose = () => {
    setModalState('loading')
    setSearchTerm('')
    setStateFilter('')
    setLeads([])
    setSelectedLead(null)
    setMappedData(null)
    setSearchError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003366]/10 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-[#003366]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#003366]">Import Lead Data</h3>
              <p className="text-xs text-gray-500">
                {modalState === 'loading' && 'Connecting to leads database...'}
                {modalState === 'no-access' && 'Access unavailable'}
                {modalState === 'search' && 'Search and select a lead'}
                {modalState === 'confirm' && 'Review and confirm import'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* LOADING */}
          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#0066cc] mb-4" />
              <p className="text-sm text-gray-500">Checking your leads access...</p>
            </div>
          )}

          {/* NO ACCESS */}
          {modalState === 'no-access' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-gray-700 font-medium mb-2">Leads Access Not Available</p>
              <p className="text-sm text-gray-500 max-w-md">{noAccessMessage}</p>
              <p className="text-xs text-gray-400 mt-4">
                Your agent email must have an active subscription on USForeclosureLeads.com to import lead data.
              </p>
            </div>
          )}

          {/* SEARCH & SELECT */}
          {modalState === 'search' && (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, address, or city..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                {statesAccess.length > 1 && !statesAccess.includes('ALL') && (
                  <select
                    value={stateFilter}
                    onChange={(e) => {
                      setStateFilter(e.target.value)
                      searchLeads(1, searchTerm, e.target.value)
                    }}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] text-sm"
                  >
                    <option value="">All States</option>
                    {statesAccess.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2.5 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>

              {searchError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {searchError}
                </div>
              )}

              {/* Results count */}
              {meta.total > 0 && (
                <p className="text-xs text-gray-500">
                  Showing {leads.length} of {meta.total} leads
                </p>
              )}

              {/* Lead cards */}
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0066cc]" />
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  {meta.total === 0 ? 'No leads found. Try a different search.' : 'Loading...'}
                </div>
              ) : (
                <div className="space-y-2">
                  {leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#0066cc] hover:bg-[#003366]/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#003366] truncate">{lead.owner_name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {lead.property_address}, {lead.city}, {lead.state_abbr} {lead.zip_code}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {lead.sale_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {lead.sale_date}
                              </span>
                            )}
                            {lead.estimated_market_value && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${Number(lead.estimated_market_value).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-[#0066cc] font-medium flex-shrink-0">Select</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => searchLeads(meta.page - 1, searchTerm, stateFilter)}
                    disabled={meta.page <= 1 || isSearching}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-[#003366] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-xs text-gray-500">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() => searchLeads(meta.page + 1, searchTerm, stateFilter)}
                    disabled={meta.page >= meta.totalPages || isSearching}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-[#003366] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CONFIRM & IMPORT */}
          {modalState === 'confirm' && selectedLead && mappedData && (
            <div className="space-y-4">
              <button
                onClick={() => setModalState('search')}
                className="flex items-center gap-1 text-sm text-[#0066cc] hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to search results
              </button>

              <div className="bg-[#003366]/5 border border-[#003366]/20 rounded-lg p-4">
                <p className="font-medium text-[#003366]">{selectedLead.owner_name}</p>
                <p className="text-sm text-gray-600">
                  {selectedLead.property_address}, {selectedLead.city}, {selectedLead.state_abbr} {selectedLead.zip_code}
                </p>
              </div>

              <p className="text-sm font-medium text-gray-700">Fields that will be populated:</p>

              {/* Personal Info */}
              {Object.keys(mappedData.personalInfo).length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#003366] uppercase tracking-wide mb-2">Step 1: Personal Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {mappedData.personalInfo.firstName && (
                      <div><span className="text-gray-500">First Name:</span> {mappedData.personalInfo.firstName}</div>
                    )}
                    {mappedData.personalInfo.lastName && (
                      <div><span className="text-gray-500">Last Name:</span> {mappedData.personalInfo.lastName}</div>
                    )}
                    {mappedData.personalInfo.middleName && (
                      <div><span className="text-gray-500">Middle Name:</span> {mappedData.personalInfo.middleName}</div>
                    )}
                    {mappedData.personalInfo.email && (
                      <div><span className="text-gray-500">Email:</span> {mappedData.personalInfo.email}</div>
                    )}
                    {mappedData.personalInfo.phonePrimary && (
                      <div><span className="text-gray-500">Phone:</span> {mappedData.personalInfo.phonePrimary}</div>
                    )}
                    {mappedData.personalInfo.currentAddress && (
                      <div className="col-span-2"><span className="text-gray-500">Address:</span> {mappedData.personalInfo.currentAddress}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Property Info */}
              {Object.keys(mappedData.propertyInfo).length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#003366] uppercase tracking-wide mb-2">Step 2: Property Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {mappedData.propertyInfo.propertyAddress && (
                      <div className="col-span-2"><span className="text-gray-500">Address:</span> {mappedData.propertyInfo.propertyAddress}</div>
                    )}
                    {mappedData.propertyInfo.propertyCity && (
                      <div><span className="text-gray-500">City:</span> {mappedData.propertyInfo.propertyCity}</div>
                    )}
                    {mappedData.propertyInfo.propertyState && (
                      <div><span className="text-gray-500">State:</span> {mappedData.propertyInfo.propertyState}</div>
                    )}
                    {mappedData.propertyInfo.propertyZip && (
                      <div><span className="text-gray-500">ZIP:</span> {mappedData.propertyInfo.propertyZip}</div>
                    )}
                    {mappedData.propertyInfo.parcelNumber && (
                      <div><span className="text-gray-500">Parcel #:</span> {mappedData.propertyInfo.parcelNumber}</div>
                    )}
                    {mappedData.propertyInfo.foreclosureType && (
                      <div><span className="text-gray-500">Type:</span> {mappedData.propertyInfo.foreclosureType}</div>
                    )}
                    {mappedData.propertyInfo.saleDate && (
                      <div><span className="text-gray-500">Sale Date:</span> {mappedData.propertyInfo.saleDate}</div>
                    )}
                    {mappedData.propertyInfo.saleAmount && (
                      <div><span className="text-gray-500">Sale Amount:</span> {mappedData.propertyInfo.saleAmount}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Liens Info */}
              {Object.keys(mappedData.liens).length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#003366] uppercase tracking-wide mb-2">Step 4: Liens & Encumbrances</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {mappedData.liens.firstMortgageLender && (
                      <div><span className="text-gray-500">Lender:</span> {mappedData.liens.firstMortgageLender}</div>
                    )}
                    {mappedData.liens.firstMortgageBalance && (
                      <div><span className="text-gray-500">Balance:</span> {mappedData.liens.firstMortgageBalance}</div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                You can edit any auto-populated field after import.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>

          {modalState === 'confirm' && (
            <button
              onClick={handleImport}
              className="px-6 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#e65c00] transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Import & Populate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
