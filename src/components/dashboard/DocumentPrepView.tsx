'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  User,
  MapPin,
  Send,
  Loader2,
  AlertCircle,
  Stamp,
  CheckCircle2,
  Edit3,
  Mail,
} from 'lucide-react'
import { NotarySelector } from './NotarySelector'
import {
  type ContractDocument,
  type PlaceholderField,
  getContractDocument,
  getContractDocumentByTemplateId,
} from '@/lib/contract-documents'

interface DocumentPrepViewProps {
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
  document_group: string
  docuseal_template_id: number | null
  case_id: string | null
}

interface NotarySelection {
  id: string
  business_name: string
  phone: string | null
  address: string | null
  state_abbr: string
  county_name: string
}

const STEPS_NO_NOTARY = ['Fill Fields', 'Client Info', 'Review & Send']
const STEPS_WITH_NOTARY = ['Fill Fields', 'Client Info', 'Select Notary', 'Review & Send']

export function DocumentPrepView({ documentId }: DocumentPrepViewProps) {
  const router = useRouter()
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [contractDoc, setContractDoc] = useState<ContractDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [clientEmail, setClientEmail] = useState('')
  const [clientName, setClientName] = useState('')
  const [selectedNotary, setSelectedNotary] = useState<NotarySelection | null>(null)
  const [notaryEmail, setNotaryEmail] = useState('')

  const requiresNotary = document?.requires_notary ?? contractDoc?.requiresNotary ?? false
  const steps = requiresNotary ? STEPS_WITH_NOTARY : STEPS_NO_NOTARY
  const totalSteps = steps.length

  // Load document
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

      // Find contract document metadata
      let cd: ContractDocument | undefined
      if (doc.docuseal_template_id) {
        cd = getContractDocumentByTemplateId(doc.docuseal_template_id)
      }
      if (!cd && doc.file_name) {
        // Try to find by filename pattern (cd-1, cd-2, etc.)
        const match = doc.file_name.match(/cd-(\d+)/)
        if (match) {
          cd = getContractDocument(`cd-${match[1]}`)
        }
      }
      setContractDoc(cd || null)

      // Initialize field values from document's form_data
      const initialValues: Record<string, string> = { ...doc.form_data }

      // Add defaults from contract document definition
      if (cd?.placeholderFields?.length) {
        for (const field of cd.placeholderFields) {
          if (field.defaultValue && !initialValues[field.formDataKey]) {
            initialValues[field.formDataKey] = field.defaultValue
          }
        }
      }

      // Always set company name default
      if (!initialValues.company_name) {
        initialValues.company_name = 'US Foreclosure Recovery'
      }

      // Set today's date if signing_date is empty
      if (!initialValues.signing_date) {
        initialValues.signing_date = new Date().toISOString().split('T')[0]
      }

      setFieldValues(initialValues)

      // Pre-fill client info
      if (doc.form_data?.client_email) {
        setClientEmail(doc.form_data.client_email)
      }
      if (doc.form_data?.client_name) {
        setClientName(doc.form_data.client_name)
      } else if (doc.form_data?.client_first_name || doc.form_data?.client_last_name) {
        setClientName(`${doc.form_data.client_first_name || ''} ${doc.form_data.client_last_name || ''}`.trim())
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

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }))
  }

  const handleNotarySelect = (notary: NotarySelection | null, email: string) => {
    setSelectedNotary(notary)
    setNotaryEmail(email)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Fields
        // Check required fields only if using contractDoc placeholderFields
        if (contractDoc?.placeholderFields?.length) {
          const requiredFields = contractDoc.placeholderFields.filter(f => f.required)
          return requiredFields.every(f => fieldValues[f.formDataKey]?.trim())
        }
        // When using common fields, no required fields - allow proceeding
        return true
      case 1: // Client Info
        return clientEmail && clientEmail.includes('@')
      case 2: // Notary (if applicable) or Review
        if (requiresNotary) {
          return selectedNotary && notaryEmail && notaryEmail.includes('@')
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1 && canProceed()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      router.push('/dashboard?tab=documents')
    }
  }

  const handleSend = async () => {
    if (!document || !canProceed()) return

    setIsSending(true)
    setSendError(null)

    try {
      // Send the DocuSeal signing request
      const res = await fetch('/api/docuseal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: document.id,
          client_email: clientEmail,
          client_name: clientName || undefined,
          prepared_fields: fieldValues,
          notary_email: requiresNotary && selectedNotary ? notaryEmail : undefined,
          notary_name: requiresNotary && selectedNotary ? selectedNotary.business_name : undefined,
          notary_id: requiresNotary && selectedNotary ? selectedNotary.id : undefined,
          send_email: true,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to send signing request')
      }

      // If notary involved, send them a context email
      if (requiresNotary && selectedNotary && notaryEmail) {
        await fetch('/api/notary-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notary_email: notaryEmail,
            notary_name: selectedNotary.business_name,
            document_title: document.title,
            document_description: document.description,
            client_name: clientName || fieldValues.client_name || `${fieldValues.client_first_name || ''} ${fieldValues.client_last_name || ''}`.trim(),
            client_email: clientEmail,
            client_phone: fieldValues.client_phone || undefined,
            client_address: fieldValues.client_address ? `${fieldValues.client_address}, ${fieldValues.client_city || ''}, ${fieldValues.client_state || ''} ${fieldValues.client_zip || ''}`.trim() : undefined,
            property_address: fieldValues.property_address ? `${fieldValues.property_address}, ${fieldValues.property_city || ''}, ${fieldValues.property_state || ''} ${fieldValues.property_zip || ''}`.trim() : undefined,
            property_county: fieldValues.property_county || undefined,
          }),
        })
      }

      setShowSuccess(true)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
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

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Signing Request Sent</h2>
          <p className="text-gray-600 mb-6">
            {requiresNotary
              ? `The document has been sent to ${clientEmail} and ${notaryEmail} for signing.`
              : `The document has been sent to ${clientEmail} for signing.`}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/dashboard/sign/${document.id}`)}
              className="w-full py-3 bg-usfr-primary text-white rounded-lg font-medium hover:bg-usfr-primary/90 transition-colors"
            >
              View Signing Status
            </button>
            <button
              onClick={() => router.push('/dashboard?tab=documents')}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Build field list: use placeholderFields if available, otherwise create fields from form_data
  // Also include common fields that should always be available
  const COMMON_FIELDS: PlaceholderField[] = [
    { name: 'Claimant First Name', formDataKey: 'client_first_name', type: 'text', required: false },
    { name: 'Claimant Last Name', formDataKey: 'client_last_name', type: 'text', required: false },
    { name: 'Claimant Middle Name', formDataKey: 'client_middle_name', type: 'text', required: false },
    { name: 'Client Address', formDataKey: 'client_address', type: 'text', required: false },
    { name: 'Client City', formDataKey: 'client_city', type: 'text', required: false },
    { name: 'Client State', formDataKey: 'client_state', type: 'text', required: false },
    { name: 'Client Zip', formDataKey: 'client_zip', type: 'text', required: false },
    { name: 'Client Phone', formDataKey: 'client_phone', type: 'text', required: false },
    { name: 'Property Address', formDataKey: 'property_address', type: 'text', required: false },
    { name: 'Property City', formDataKey: 'property_city', type: 'text', required: false },
    { name: 'Property State', formDataKey: 'property_state', type: 'text', required: false },
    { name: 'Property Zip', formDataKey: 'property_zip', type: 'text', required: false },
    { name: 'Property County', formDataKey: 'property_county', type: 'text', required: false },
    { name: 'Parcel Number', formDataKey: 'parcel_number', type: 'text', required: false },
    { name: 'Sale Date', formDataKey: 'sale_date', type: 'date', required: false },
    { name: 'Sale Amount', formDataKey: 'sale_amount', type: 'text', required: false },
    { name: 'Estimated Surplus', formDataKey: 'estimated_surplus', type: 'text', required: false },
    { name: 'Signing Date', formDataKey: 'signing_date', type: 'date', required: false },
    { name: 'Company Name', formDataKey: 'company_name', type: 'text', required: false, defaultValue: 'US Foreclosure Recovery' },
  ]

  // Use placeholder fields from contract doc if available, otherwise use common fields
  const fields: PlaceholderField[] = contractDoc?.placeholderFields?.length
    ? contractDoc.placeholderFields
    : COMMON_FIELDS

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 text-gray-500 hover:text-usfr-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-usfr-dark">Prepare Document</h1>
                <p className="text-xs text-gray-500">{document.title}</p>
              </div>
            </div>
            {requiresNotary && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                <Stamp className="w-3 h-3" />
                Notary Required
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      idx < currentStep
                        ? 'bg-green-500 text-white'
                        : idx === currentStep
                        ? 'bg-usfr-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 hidden sm:block">{step}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-1 sm:mx-2 ${
                      idx < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Step 0: Fill Fields */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Edit3 className="w-5 h-5 text-usfr-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Fill Document Fields</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Enter or edit the information below. All fields will be pre-filled in the document before signing.
                {!contractDoc?.placeholderFields?.length && (
                  <span className="block mt-1 text-xs text-gray-400">
                    Fill in any applicable fields for this document.
                  </span>
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div key={field.formDataKey}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                      value={fieldValues[field.formDataKey] || ''}
                      onChange={(e) => handleFieldChange(field.formDataKey, e.target.value)}
                      placeholder={field.defaultValue || ''}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Client Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-usfr-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Enter the client's contact information. They will receive an email with a secure link to sign the document.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
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
          )}

          {/* Step 2: Notary Selection (if required) */}
          {currentStep === 2 && requiresNotary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-usfr-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Select Notary</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Select a notary to handle the document signing. The notary will receive an email with client details and a signing link.
              </p>

              <NotarySelector
                initialState={fieldValues.client_state || fieldValues.property_state || ''}
                initialCounty={fieldValues.property_county || ''}
                onSelect={handleNotarySelect}
                selectedNotaryId={selectedNotary?.id}
              />
            </div>
          )}

          {/* Final Step: Review & Send */}
          {currentStep === totalSteps - 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-usfr-primary" />
                <h2 className="text-lg font-semibold text-gray-900">Review & Send</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Review the information below and click "Send for Signing" to send the document.
              </p>

              {/* Document Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Document</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{document.title}</p>
                    <p className="text-xs text-gray-500">{document.description}</p>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Client</h3>
                <p className="text-gray-900">{clientName || 'Not specified'}</p>
                <p className="text-sm text-blue-600">{clientEmail}</p>
              </div>

              {/* Notary Info */}
              {requiresNotary && selectedNotary && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Notary</h3>
                  <p className="text-gray-900">{selectedNotary.business_name}</p>
                  <p className="text-sm text-purple-600">{notaryEmail}</p>
                  {selectedNotary.phone && (
                    <p className="text-xs text-gray-500 mt-1">{selectedNotary.phone}</p>
                  )}
                </div>
              )}

              {/* Filled Fields Summary */}
              {Object.keys(fieldValues).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Pre-filled Fields</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(fieldValues)
                      .filter(([, v]) => v && v.trim())
                      .slice(0, 8)
                      .map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                          <span className="text-gray-900 ml-1">{value}</span>
                        </div>
                      ))}
                  </div>
                  {Object.keys(fieldValues).filter(k => fieldValues[k]?.trim()).length > 8 && (
                    <p className="text-xs text-gray-400 mt-2">
                      +{Object.keys(fieldValues).filter(k => fieldValues[k]?.trim()).length - 8} more fields
                    </p>
                  )}
                </div>
              )}

              {sendError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{sendError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-usfr-primary text-white rounded-lg font-medium hover:bg-usfr-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={isSending || !canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-usfr-accent text-white rounded-lg font-medium hover:bg-usfr-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send for Signing
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
