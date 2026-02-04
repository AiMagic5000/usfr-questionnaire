'use client'

import { useRouter } from 'next/navigation'
import {
  PenTool,
  Clock,
  CheckCircle2,
  Stamp,
  ChevronRight,
  FileCheck,
} from 'lucide-react'
import { ContractLibrary } from './ContractLibrary'
import type { Document } from './UnifiedDashboard'

interface DocumentsTabProps {
  documents: Document[]
}

export function DocumentsTab({ documents }: DocumentsTabProps) {
  const router = useRouter()

  const signingQueue = documents.filter(d => d.status !== 'completed')
  const completedDocs = documents.filter(d => d.status === 'completed')

  const statusConfig = {
    pending: {
      label: 'Preparing',
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      icon: Clock,
    },
    ready_to_sign: {
      label: 'Ready to Sign',
      bg: 'bg-green-100',
      text: 'text-green-600',
      icon: PenTool,
    },
    awaiting_notary: {
      label: 'Needs Notary',
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      icon: Stamp,
    },
    completed: {
      label: 'Signed',
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      icon: CheckCircle2,
    },
  } as const

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
              {signingQueue.length > 0
                ? `${signingQueue.length} document${signingQueue.length !== 1 ? 's' : ''} awaiting your action`
                : 'All documents are signed'}
            </p>
          </div>
        </div>

        {signingQueue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {signingQueue.map(doc => {
              const config = statusConfig[doc.status]
              const StatusIcon = config.icon
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
                      <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {doc.requiresNotary && doc.status !== 'awaiting_notary' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-600">
                            <Stamp className="w-3 h-3" />
                            Notary Required
                          </span>
                        )}
                        {doc.aiPopulated && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600">
                            AI-Filled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-green-900">All documents signed</p>
            <p className="text-sm text-green-700">No pending documents at this time.</p>
          </div>
        )}

        {/* Completed documents */}
        {completedDocs.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Recently Completed
            </p>
            <div className="space-y-2">
              {completedDocs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{doc.title}</p>
                    {doc.signedAt && (
                      <p className="text-xs text-gray-400">
                        Signed {new Date(doc.signedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
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
