'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Stamp,
  Download,
  FileText,
  AlertCircle,
  Send,
  ExternalLink,
  Clock,
  Eye,
  RefreshCw,
  Printer,
  Edit3,
  Mail,
  User,
} from 'lucide-react'

interface DocumentSigningViewProps {
  documentId: string
}

interface DocumentData {
  id: string
  title: string
  description: string
  file_url: string
  file_name: string
  status: string
  form_data: Record<string, string>
  requires_notary: boolean
  signature_url: string | null
  signed_at: string | null
  notarized_at: string | null
  document_group: string
  case_id: string
  template_id: string
  docuseal_submission_id: number | null
  docuseal_signing_url: string | null
}

interface SigningInfo {
  signing_url: string | null
  submission_id: number | null
  submitter_status: string | null
  completed_at: string | null
  signed_documents: Array<{ name: string; url: string }>
}

const statusDisplay: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Ready to Sign', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  sent_for_signing: { label: 'Sent for Signing', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Send },
  viewed: { label: 'Viewed by Client', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Eye },
  signed: { label: 'Signed', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 },
  printed: { label: 'Printed', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: CheckCircle2 },
}

export function DocumentSigningView({ documentId }: DocumentSigningViewProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [signingInfo, setSigningInfo] = useState<SigningInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [showEmbeddedSigning, setShowEmbeddedSigning] = useState(false)

  // Client info for signing
  const [clientEmail, setClientEmail] = useState('')
  const [clientName, setClientName] = useState('')

  const isEditMode = searchParams.get('mode') === 'edit'

  const loadDocument = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/documents?document_id=${documentId}`)
      if (!res.ok) throw new Error('Document not found')
      const data = await res.json()
      const doc = data.document
      if (!doc) throw new Error('Document not found')

      setDocument(doc)

      // Pre-fill client info from form_data if available
      if (doc.form_data?.client_email) {
        setClientEmail(doc.form_data.client_email)
      }
      if (doc.form_data?.client_name) {
        setClientName(doc.form_data.client_name)
      }

      // If there's a DocuSeal submission, get signing status
      if (doc.docuseal_submission_id) {
        await loadSigningInfo(documentId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document')
    } finally {
      setIsLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    loadDocument()
  }, [loadDocument])

  const loadSigningInfo = async (docId: string) => {
    try {
      const res = await fetch(`/api/docuseal?document_id=${docId}`)
      if (res.ok) {
        const info = await res.json()
        setSigningInfo(info)
      }
    } catch {
      // Non-critical
    }
  }

  const handleSendForSigning = async () => {
    if (!document) return

    if (!clientEmail || !clientEmail.includes('@')) {
      setSendError('Please enter a valid client email address.')
      return
    }

    setIsSending(true)
    setSendError(null)

    try {
      const res = await fetch('/api/docuseal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: document.id,
          client_email: clientEmail,
          client_name: clientName || undefined,
          send_email: true,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create signing request')
      }

      const result = await res.json()

      await loadDocument()

      if (result.signing_url) {
        setSigningInfo({
          signing_url: result.signing_url,
          submission_id: result.submission_id,
          submitter_status: 'pending',
          completed_at: null,
          signed_documents: [],
        })
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send for signing')
    } finally {
      setIsSending(false)
    }
  }

  const handleRefreshStatus = async () => {
    if (!document) return
    setIsRefreshing(true)
    try {
      await loadSigningInfo(document.id)
      const res = await fetch(`/api/documents?document_id=${documentId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.document) setDocument(data.document)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Listen for DocuSeal iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'completed' || event.data?.event === 'completed') {
        setShowEmbeddedSigning(false)
        loadDocument()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [loadDocument])

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-usfr-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-usfr-dark mb-4">Document Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This document could not be loaded.'}</p>
          <button
            onClick={() => router.push('/dashboard?tab=documents')}
            className="w-full py-3 bg-usfr-primary text-white rounded-lg font-medium hover:bg-usfr-primary/90 transition-colors"
          >
            Return to Documents
          </button>
        </div>
      </div>
    )
  }

  // Full-screen embedded signing view
  if (showEmbeddedSigning && signingInfo?.signing_url) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmbeddedSigning(false)}
              className="p-2 text-gray-500 hover:text-usfr-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-usfr-dark">{document.title}</h1>
              <p className="text-xs text-gray-500">Complete your signature below</p>
            </div>
          </div>
        </header>
        <div className="flex-1">
          <iframe
            src={signingInfo.signing_url}
            className="w-full h-full min-h-[calc(100vh-60px)] border-0"
            title={`Sign: ${document.title}`}
            allow="camera"
          />
        </div>
      </div>
    )
  }

  const status = statusDisplay[document.status] || statusDisplay.pending
  const StatusIcon = status.icon
  const isSigned = document.status === 'signed' || document.status === 'printed'
  const hasSigning = !!document.docuseal_submission_id
  const isAwaitingSignature = document.status === 'sent_for_signing' || document.status === 'viewed'
  const formData = document.form_data || {}
  const populatedFields = Object.entries(formData).filter(
    ([key, v]) => v && String(v).trim() && key !== 'client_email' && key !== 'client_name'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard?tab=documents')}
                className="p-2 text-gray-500 hover:text-usfr-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-usfr-dark">{document.title}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">{document.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {document.requires_notary && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  <Stamp className="w-3 h-3" />
                  Notary Required
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Document Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">{document.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{document.description}</p>

              {/* Quick Actions Row */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="text-xs text-gray-400">
                  Group: <span className="text-gray-600 capitalize">{document.document_group}</span>
                </span>
                {document.file_url && (
                  <>
                    <a
                      href={document.file_url}
                      download={document.file_name}
                      className="inline-flex items-center gap-1 text-xs text-usfr-primary hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                    <button
                      onClick={() => window.open(document.file_url, '_blank')}
                      className="inline-flex items-center gap-1 text-xs text-usfr-primary hover:underline"
                    >
                      <Printer className="w-3 h-3" />
                      Print
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pre-filled Data Summary */}
        {populatedFields.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Pre-filled Information</h3>
            <p className="text-sm text-gray-500 mb-4">
              This data was automatically populated from the intake questionnaire.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {populatedFields.map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-900 font-medium truncate">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signing Status & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Document Signing</h3>
            {hasSigning && (
              <button
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-usfr-primary transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            )}
          </div>

          {/* Signed State */}
          {isSigned && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Document Successfully Signed</p>
                  {document.signed_at && (
                    <p className="text-sm text-green-700 mt-1">
                      Signed on {new Date(document.signed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>

              {signingInfo?.signed_documents && signingInfo.signed_documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Signed Documents:</p>
                  {signingInfo.signed_documents.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-4 h-4 text-usfr-primary" />
                      <span className="text-sm text-gray-900">{doc.name}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                    </a>
                  ))}
                </div>
              )}

              {document.requires_notary && !document.notarized_at && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Stamp className="w-4 h-4" />
                    <span className="text-sm font-medium">Notarization Required</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Use the Find Notary tab to locate a mobile notary in your area.
                  </p>
                </div>
              )}

              {document.notarized_at && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Notarized on {new Date(document.notarized_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Awaiting Signature State */}
          {isAwaitingSignature && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Send className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    {document.status === 'viewed' ? 'Document Viewed by Client' : 'Signing Request Sent'}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {document.status === 'viewed'
                      ? 'The client has opened the signing link and is reviewing the document.'
                      : 'An email with the signing link has been sent to the client.'}
                  </p>
                </div>
              </div>

              {signingInfo?.signing_url && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowEmbeddedSigning(true)}
                    className="flex-1 py-3 bg-usfr-accent text-white rounded-lg font-medium hover:bg-usfr-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Sign Document Now
                  </button>
                  <a
                    href={signingInfo.signing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Ready to Send State */}
          {!hasSigning && !isSigned && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  {isEditMode
                    ? 'Fill in the client details below, then send for electronic signing. DocuSeal will let the signer fill in any remaining fields on the document.'
                    : 'Enter the client\'s email to send this document for electronic signing. The client will receive a secure link to review and sign.'}
                </p>
              </div>

              {/* Client Info Form */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Client Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Client Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => {
                          setClientEmail(e.target.value)
                          setSendError(null)
                        }}
                        placeholder="client@example.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Client Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {sendError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{sendError}</p>
                </div>
              )}

              <button
                onClick={handleSendForSigning}
                disabled={isSending || !clientEmail}
                className="w-full py-4 bg-usfr-accent text-white rounded-xl font-semibold text-lg hover:bg-usfr-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Signing Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send for Electronic Signing
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                The client will receive an email with a secure signing link.
                Documents are signed via DocuSeal, compliant with the ESIGN Act.
              </p>
            </div>
          )}
        </div>

        {/* Back to Documents */}
        <div className="text-center pb-8">
          <button
            onClick={() => router.push('/dashboard?tab=documents')}
            className="text-sm text-gray-500 hover:text-usfr-primary transition-colors"
          >
            Back to Documents
          </button>
        </div>
      </div>
    </div>
  )
}
