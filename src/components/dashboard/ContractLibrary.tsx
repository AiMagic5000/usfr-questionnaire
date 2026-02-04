'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Lock,
  Unlock,
  Shield,
  FolderOpen,
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { CONTRACT_DOCUMENTS, DOCUMENT_GROUPS, type ContractDocument } from '@/lib/contract-documents'
import { PinEntryModal } from './PinEntryModal'

const ADMIN_EMAILS = ['coreypearsonemail@gmail.com']

export function ContractLibrary() {
  const { user } = useUser()
  const [isPinValidated, setIsPinValidated] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [activeGroup, setActiveGroup] = useState<string>('all')

  useEffect(() => {
    // Admin bypass - no PIN needed
    const userEmail = user?.primaryEmailAddress?.emailAddress || ''
    if (ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      setIsPinValidated(true)
      setAgentName('Admin')
      return
    }

    const savedToken = sessionStorage.getItem('usfr_agent_session')
    const savedName = sessionStorage.getItem('usfr_agent_name')
    if (savedToken && savedName) {
      setIsPinValidated(true)
      setAgentName(savedName)
    } else {
      setShowPinModal(true)
    }
  }, [user])

  const handlePinSuccess = (name: string, token: string) => {
    sessionStorage.setItem('usfr_agent_session', token)
    sessionStorage.setItem('usfr_agent_name', name)
    setIsPinValidated(true)
    setAgentName(name)
    setShowPinModal(false)
  }

  const groupedDocuments = CONTRACT_DOCUMENTS.reduce<Record<string, ContractDocument[]>>(
    (acc, doc) => {
      const group = doc.group
      if (!acc[group]) acc[group] = []
      acc[group] = [...acc[group], doc]
      return acc
    },
    {}
  )

  const filteredDocuments =
    activeGroup === 'all'
      ? CONTRACT_DOCUMENTS
      : CONTRACT_DOCUMENTS.filter((d) => d.group === activeGroup)

  const groupColors: Record<string, string> = {
    agreements: 'bg-blue-100 text-blue-600',
    authorization: 'bg-green-100 text-green-600',
    notary: 'bg-purple-100 text-purple-600',
    administrative: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6">
      {showPinModal && (
        <PinEntryModal
          onSuccess={handlePinSuccess}
          onCancel={() => setShowPinModal(false)}
        />
      )}

      {/* Agent Info Bar */}
      {isPinValidated && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Unlock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">
                Documents Unlocked
              </p>
              <p className="text-sm text-green-700">
                Agent: {agentName}
              </p>
            </div>
          </div>
          <Shield className="w-5 h-5 text-green-400" />
        </div>
      )}

      {/* Security Notice */}
      {!isPinValidated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Documents Are Secured
          </h3>
          <p className="text-yellow-700 text-sm mb-4">
            Enter your 6-digit Asset Recovery Agent PIN to access contract documents.
          </p>
          <button
            onClick={() => setShowPinModal(true)}
            className="px-6 py-3 bg-[#003366] text-white rounded-lg font-medium hover:bg-[#002244] transition-colors"
          >
            Enter PIN to Unlock
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveGroup('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeGroup === 'all'
              ? 'bg-[#003366] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          All ({CONTRACT_DOCUMENTS.length})
        </button>
        {Object.entries(DOCUMENT_GROUPS).map(([key, group]) => {
          const count = groupedDocuments[key]?.length || 0
          return (
            <button
              key={key}
              onClick={() => setActiveGroup(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeGroup === key
                  ? 'bg-[#003366] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {group.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white rounded-xl border border-gray-200 p-5 transition-all ${
              isPinValidated
                ? 'hover:border-[#0066cc] hover:shadow-md'
                : 'select-none'
            }`}
            style={{
              filter: isPinValidated ? 'none' : 'blur(6px)',
              pointerEvents: isPinValidated ? 'auto' : 'none',
            }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${groupColors[doc.group]}`}>
                {doc.group === 'notary' ? (
                  <FolderOpen className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm leading-tight">
                  {doc.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${groupColors[doc.group]}`}>
                  {DOCUMENT_GROUPS[doc.group].label}
                </span>
              </div>
              <a
                href={`/documents/${doc.filename}`}
                download={doc.filename}
                className="p-2 text-gray-400 hover:text-[#003366] hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Download document"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
