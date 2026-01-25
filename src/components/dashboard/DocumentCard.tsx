'use client'

import { Document } from './DashboardContent'
import {
  FileText,
  CheckCircle2,
  Clock,
  PenTool,
  Stamp,
  Sparkles,
  ChevronRight,
  Calendar,
  Eye
} from 'lucide-react'

interface DocumentCardProps {
  document: Document
  index: number
  onSign: () => void
  onNotary: () => void
}

export function DocumentCard({ document, index, onSign, onNotary }: DocumentCardProps) {
  const getStatusBadge = () => {
    switch (document.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </span>
        )
      case 'ready_to_sign':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-usfr-accent/10 text-usfr-accent rounded-full text-sm font-medium">
            <PenTool className="w-4 h-4" />
            Ready to Sign
          </span>
        )
      case 'awaiting_notary':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <Stamp className="w-4 h-4" />
            Awaiting Notary
          </span>
        )
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Preparing
          </span>
        )
    }
  }

  const getActionButton = () => {
    switch (document.status) {
      case 'completed':
        return (
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Eye className="w-4 h-4" />
            View Document
          </button>
        )
      case 'ready_to_sign':
        return (
          <button
            onClick={onSign}
            className="flex items-center gap-2 px-4 py-2 bg-usfr-accent text-white rounded-lg hover:bg-usfr-accent/90 transition-colors font-medium"
          >
            <PenTool className="w-4 h-4" />
            Sign Now
            <ChevronRight className="w-4 h-4" />
          </button>
        )
      case 'awaiting_notary':
        return (
          <button
            onClick={onNotary}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Stamp className="w-4 h-4" />
            Schedule Notary
            <ChevronRight className="w-4 h-4" />
          </button>
        )
      case 'pending':
        return (
          <span className="text-sm text-gray-500 italic">
            Document being prepared...
          </span>
        )
    }
  }

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
        document.status === 'completed'
          ? 'border-green-200 bg-green-50/30'
          : document.status === 'ready_to_sign'
          ? 'border-usfr-accent/30 hover:border-usfr-accent hover:shadow-md'
          : 'border-gray-100 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Priority Number / Check */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg ${
            document.status === 'completed'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {document.status === 'completed' ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            index
          )}
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-usfr-dark">
              {document.title}
            </h3>
            {document.aiPopulated && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                AI-Populated
              </span>
            )}
            {document.requiresNotary && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium">
                <Stamp className="w-3 h-3" />
                Notary Required
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4">
            {document.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {getStatusBadge()}

            {document.signedAt && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Signed {new Date(document.signedAt).toLocaleDateString()}
              </span>
            )}

            {document.notarizedAt && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Stamp className="w-4 h-4" />
                Notarized {new Date(document.notarizedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {getActionButton()}
        </div>
      </div>
    </div>
  )
}
