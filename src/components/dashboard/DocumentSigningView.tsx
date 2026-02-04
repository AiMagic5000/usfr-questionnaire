'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  PenTool,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Stamp,
  Download,
} from 'lucide-react'
import { SignaturePad } from './SignaturePad'

interface DocumentSigningViewProps {
  documentId: string
}

interface DocumentField {
  id: string
  label: string
  type: string
  required: boolean
  value?: string
  default?: string
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
}

export function DocumentSigningView({ documentId }: DocumentSigningViewProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [templateFields, setTemplateFields] = useState<DocumentField[]>([])
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [showSignaturePad, setShowSignaturePad] = useState(false)

  useEffect(() => {
    loadDocument()
  }, [documentId])

  const loadDocument = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch document from API
      const res = await fetch(`/api/documents?document_id=${documentId}`)
      if (!res.ok) {
        throw new Error('Document not found')
      }
      const data = await res.json()
      const doc = data.document

      if (!doc) {
        throw new Error('Document not found')
      }

      setDocument(doc)

      // If already signed, show the signature
      if (doc.signature_url) {
        setSignatureData(doc.signature_url)
      }

      // Load template to get field definitions
      if (doc.template_id) {
        const templateRes = await fetch(`/api/documents/templates?template_id=${doc.template_id}`)
        if (templateRes.ok) {
          const templateData = await templateRes.json()
          const fields = templateData.template?.form_fields?.fields || []
          setTemplateFields(fields)
        }
      }

      // Set form values from document form_data
      setFormValues(doc.form_data || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature)
    setShowSignaturePad(false)
  }

  const handleSubmit = async () => {
    if (!document || !signatureData) return

    // Validate required fields
    const missingFields = templateFields
      .filter(f => f.required && f.type !== 'signature' && !formValues[f.id])
      .map(f => f.label)

    if (missingFields.length > 0) {
      alert(`Please complete all required fields: ${missingFields.join(', ')}`)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: document.id,
          action: 'sign',
          signature_url: signatureData,
          form_data: formValues,
          actor_email: user?.primaryEmailAddress?.emailAddress || 'unknown',
          signer_ip: 'client',
          signer_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to sign document')
      }

      setIsComplete(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit document. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-usfr-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
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

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-usfr-dark mb-4">Document Signed!</h2>
          <p className="text-gray-600 mb-2">
            Your signature has been recorded and securely stored.
          </p>
          {document.requires_notary && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-purple-700">
                <Stamp className="w-4 h-4" />
                <span className="text-sm font-medium">This document requires notarization</span>
              </div>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard?tab=documents')}
            className="w-full py-3 bg-usfr-primary text-white rounded-lg font-medium hover:bg-usfr-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const signatureFields = templateFields.filter(f => f.type === 'signature')
  const otherFields = templateFields.filter(f => f.type !== 'signature')
  const populatedCount = Object.values(formValues).filter(v => v && v.trim()).length

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard?tab=documents')}
                className="p-2 text-gray-500 hover:text-usfr-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-usfr-dark">{document.title}</h1>
                <p className="text-sm text-gray-500">{document.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {document.requires_notary && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  <Stamp className="w-3 h-3" />
                  Notary Required
                </span>
              )}
              <a
                href={document.file_url}
                download={document.file_name}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                title="Download template"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setZoom(z => Math.max(50, z - 10))}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(150, z + 10))}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Auto-populated notice */}
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {populatedCount} of {otherFields.length} fields auto-populated from your questionnaire
                    </p>
                    <p className="text-sm text-blue-700">
                      Review the information below and make any necessary corrections before signing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document template preview / download */}
              <div
                className="p-8 bg-white"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                    {document.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Download the template below to view the full document, then complete the fields on the right and add your signature.
                  </p>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <a
                    href={document.file_url}
                    download={document.file_name}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-usfr-primary text-white rounded-lg font-medium hover:bg-usfr-primary/90 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download {document.file_name}
                  </a>
                  <p className="text-xs text-gray-400 mt-3">
                    DOCX format - viewable in Microsoft Word, Google Docs, or any document viewer
                  </p>
                </div>

                {/* Show field summary */}
                {otherFields.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Document Data Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {otherFields.map(field => (
                        <div key={field.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">{field.label}</p>
                          <p className="font-medium text-gray-900 text-sm">
                            {formValues[field.id] || '--'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fields Panel */}
          <div className="space-y-6">
            {/* Field Inputs */}
            {otherFields.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-usfr-dark mb-4">Document Fields</h3>
                <div className="space-y-4">
                  {otherFields.map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                        {formValues[field.id] && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                            <Sparkles className="w-3 h-3" />
                            Auto
                          </span>
                        )}
                      </label>
                      <input
                        type={field.type === 'date' ? 'date' : 'text'}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-usfr-dark mb-4">Your Signature</h3>

              {signatureData ? (
                <div className="space-y-4">
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                    <img
                      src={signatureData}
                      alt="Your signature"
                      className="max-h-24 mx-auto"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSignatureData(null)
                      setShowSignaturePad(true)
                    }}
                    className="w-full py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear & Re-sign
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSignaturePad(true)}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-usfr-secondary hover:bg-usfr-secondary/5 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-usfr-secondary"
                >
                  <PenTool className="w-8 h-8" />
                  <span className="font-medium">Click to Sign</span>
                </button>
              )}
            </div>

            {/* Legal consent */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                By clicking "Complete & Submit", you agree that your electronic signature is legally
                binding and equivalent to your handwritten signature. This document, your signature,
                IP address, and timestamp are securely recorded for legal compliance.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !signatureData}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                signatureData
                  ? 'bg-usfr-accent text-white hover:bg-usfr-accent/90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Complete & Submit
                </>
              )}
            </button>

            {!signatureData && (
              <p className="text-center text-sm text-gray-500">
                Please add your signature to submit
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <SignaturePad
          onComplete={handleSignatureComplete}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  )
}
