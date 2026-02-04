'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Download,
  Lock,
  Unlock,
  Shield,
  FolderOpen,
  PenTool,
  Printer,
  Edit3,
  Loader2,
  MoreHorizontal,
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { CONTRACT_DOCUMENTS, DOCUMENT_GROUPS, type ContractDocument } from '@/lib/contract-documents'
import { PinEntryModal } from './PinEntryModal'

const ADMIN_EMAILS = ['coreypearsonemail@gmail.com']

export function ContractLibrary() {
  const { user } = useUser()
  const router = useRouter()
  const [isPinValidated, setIsPinValidated] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const [preparingDoc, setPreparingDoc] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null)
    if (openMenuId) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [openMenuId])

  const handlePinSuccess = (name: string, token: string) => {
    sessionStorage.setItem('usfr_agent_session', token)
    sessionStorage.setItem('usfr_agent_name', name)
    setIsPinValidated(true)
    setAgentName(name)
    setShowPinModal(false)
  }

  const prepareDocument = async (doc: ContractDocument) => {
    const res = await fetch('/api/documents/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: doc.id,
        title: doc.title,
        filename: doc.filename,
        description: doc.description,
        group: doc.group,
        clerk_user_id: user?.id || undefined,
        docuseal_template_id: doc.docusealTemplateId || undefined,
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to prepare document')
    }

    return res.json()
  }

  const handleSign = async (doc: ContractDocument) => {
    setPreparingDoc(doc.id)
    try {
      const data = await prepareDocument(doc)
      router.push(`/dashboard/prepare/${data.document_id}`)
    } catch {
      alert('Failed to prepare document for signing. Please try again.')
    } finally {
      setPreparingDoc(null)
    }
  }

  const handleDownload = (doc: ContractDocument) => {
    const link = document.createElement('a')
    link.href = `/documents/${doc.filename}`
    link.download = doc.filename
    link.click()
  }

  const handlePrint = (doc: ContractDocument) => {
    const siteUrl = window.location.origin
    const docUrl = encodeURIComponent(`${siteUrl}/documents/${doc.filename}`)
    window.open(`https://docs.google.com/gview?url=${docUrl}&embedded=true`, '_blank')
  }

  const handleEdit = async (doc: ContractDocument) => {
    setPreparingDoc(doc.id)
    try {
      const data = await prepareDocument(doc)
      router.push(`/dashboard/prepare/${data.document_id}`)
    } catch {
      alert('Failed to prepare document. Please try again.')
    } finally {
      setPreparingDoc(null)
    }
  }

  const filteredDocuments =
    activeGroup === 'all'
      ? CONTRACT_DOCUMENTS
      : CONTRACT_DOCUMENTS.filter((d) => d.group === activeGroup)

  const groupedDocuments = CONTRACT_DOCUMENTS.reduce<Record<string, ContractDocument[]>>(
    (acc, doc) => {
      if (!acc[doc.group]) acc[doc.group] = []
      acc[doc.group] = [...acc[doc.group], doc]
      return acc
    },
    {}
  )

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

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-usfr-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-usfr-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-usfr-dark text-lg">Contract Library</h3>
          <p className="text-sm text-gray-500">
            {isPinValidated
              ? `${CONTRACT_DOCUMENTS.length} documents available - Sign, download, print, or edit`
              : 'Enter your PIN to access documents'}
          </p>
        </div>
      </div>

      {/* Agent Info Bar */}
      {isPinValidated && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Unlock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Documents Unlocked</p>
              <p className="text-sm text-green-700">Agent: {agentName}</p>
            </div>
          </div>
          <Shield className="w-5 h-5 text-green-400" />
        </div>
      )}

      {/* Locked State */}
      {!isPinValidated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Documents Are Secured</h3>
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
        {filteredDocuments.map((doc) => {
          const isLoading = preparingDoc === doc.id
          const menuOpen = openMenuId === doc.id

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${
                isPinValidated
                  ? 'hover:border-[#0066cc] hover:shadow-md'
                  : 'select-none'
              }`}
              style={{
                filter: isPinValidated ? 'none' : 'blur(6px)',
                pointerEvents: isPinValidated ? 'auto' : 'none',
              }}
            >
              {/* Document Info */}
              <div className="p-5">
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-4">
                <div className="flex items-center gap-2">
                  {/* Primary: Sign Document */}
                  <button
                    onClick={() => handleSign(doc)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ff6600] text-white rounded-lg text-sm font-medium hover:bg-[#e65c00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PenTool className="w-4 h-4" />
                    )}
                    {isLoading ? 'Preparing...' : 'Sign'}
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2.5 text-gray-500 hover:text-[#003366] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download DOCX"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Print */}
                  <button
                    onClick={() => handlePrint(doc)}
                    className="p-2.5 text-gray-500 hover:text-[#003366] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Print document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {/* Edit / Fill Fields */}
                  <button
                    onClick={() => handleEdit(doc)}
                    disabled={isLoading}
                    className="p-2.5 text-gray-500 hover:text-[#003366] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Edit & fill fields"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
