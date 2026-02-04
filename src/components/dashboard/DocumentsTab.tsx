'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  PenTool,
  Clock,
  CheckCircle2,
  Stamp,
  ChevronRight,
  FileCheck,
  Loader2,
  Sparkles,
  Send,
  Eye,
} from 'lucide-react'
import { ContractLibrary } from './ContractLibrary'

interface CaseDocument {
  id: string
  title: string
  description: string
  status: string
  requires_notary: boolean
  document_group: string
  priority: number
  form_data: Record<string, string>
  signature_url: string | null
  signed_at: string | null
  notarized_at: string | null
  case_id: string
}

const statusConfig: Record<string, {
  label: string
  bg: string
  text: string
  icon: typeof Clock
}> = {
  pending: {
    label: 'Ready to Sign',
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    icon: PenTool,
  },
  sent_for_signing: {
    label: 'Sent for Signing',
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    icon: Send,
  },
  viewed: {
    label: 'Viewed',
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    icon: Eye,
  },
  signed: {
    label: 'Signed',
    bg: 'bg-green-100',
    text: 'text-green-600',
    icon: CheckCircle2,
  },
  printed: {
    label: 'Printed',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    icon: CheckCircle2,
  },
}

export function DocumentsTab() {
  const { user } = useUser()
  const router = useRouter()
  const [caseDocuments, setCaseDocuments] = useState<CaseDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasCase, setHasCase] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [user])

  const loadDocuments = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      const clerkId = user.id
      const res = await fetch(`/api/documents?clerk_user_id=${clerkId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.documents && data.documents.length > 0) {
          setCaseDocuments(data.documents)
          setHasCase(true)
        }
      }
    } catch {
      // Silently fail - will show empty state
    } finally {
      setIsLoading(false)
    }
  }

  const activeQueue = caseDocuments.filter(
    d => d.status === 'pending' || d.status === 'sent_for_signing' || d.status === 'viewed'
  )
  const signedDocs = caseDocuments.filter(d => d.status === 'signed' || d.status === 'printed')

  return (
    <div className="space-y-8">
      {/* Signing Queue Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-usfr-primary/10 rounded-lg flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-usfr-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-usfr-dark text-lg">Documents to Sign</h3>
            <p className="text-sm text-gray-500">
              {isLoading
                ? 'Loading documents...'
                : activeQueue.length > 0
                  ? `${activeQueue.length} document${activeQueue.length !== 1 ? 's' : ''} in the signing pipeline`
                  : hasCase
                    ? 'All documents are signed'
                    : 'Complete the questionnaire to generate your document package'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : activeQueue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeQueue.map(doc => {
              const config = statusConfig[doc.status] || statusConfig.pending
              const StatusIcon = config.icon
              const populatedFields = Object.values(doc.form_data || {}).filter(v => v && String(v).trim()).length
              return (
                <button
                  key={doc.id}
                  onClick={() => router.push(`/dashboard/sign/${doc.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-usfr-secondary hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {doc.title}
                        </h4>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-usfr-secondary flex-shrink-0 transition-colors" />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{doc.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {doc.requires_notary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-600">
                            <Stamp className="w-3 h-3" />
                            Notary Required
                          </span>
                        )}
                        {populatedFields > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600">
                            <Sparkles className="w-3 h-3" />
                            {populatedFields} Fields Filled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : !hasCase ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-2" />
            <p className="font-medium text-blue-900">No Active Case</p>
            <p className="text-sm text-blue-700 mt-1">
              Complete the intake questionnaire and your personalized document package will be generated automatically.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-green-900">All documents signed</p>
            <p className="text-sm text-green-700">No pending documents at this time.</p>
          </div>
        )}

        {/* Signed documents */}
        {signedDocs.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Completed ({signedDocs.length})
            </p>
            <div className="space-y-2">
              {signedDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => router.push(`/dashboard/sign/${doc.id}`)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg w-full text-left hover:bg-gray-100 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {doc.signed_at && (
                        <p className="text-xs text-gray-400">
                          Signed {new Date(doc.signed_at).toLocaleDateString()}
                        </p>
                      )}
                      {doc.requires_notary && !doc.notarized_at && (
                        <span className="text-xs text-purple-600 font-medium">Awaiting notarization</span>
                      )}
                      {doc.notarized_at && (
                        <span className="text-xs text-green-600 font-medium">Notarized</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Contract Library Section */}
      <ContractLibrary />
    </div>
  )
}
