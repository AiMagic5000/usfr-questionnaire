'use client'

import { useState, useRef, useEffect } from 'react'
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
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { SignaturePad } from './SignaturePad'

interface DocumentSigningViewProps {
  documentId: string
}

// Mock document data - in production, fetch from API
const MOCK_DOCUMENTS: Record<string, {
  title: string
  content: string
  fields: Array<{
    id: string
    label: string
    value: string
    type: 'text' | 'date' | 'signature' | 'initials'
    required: boolean
    aiPopulated: boolean
  }>
}> = {
  'doc-1': {
    title: 'Surplus Funds Claim Application',
    content: `
SURPLUS FUNDS CLAIM APPLICATION

STATE OF [STATE]
COUNTY OF [COUNTY]

I, [CLAIMANT_NAME], hereby submit this claim for surplus funds resulting from the foreclosure sale of the property located at:

[PROPERTY_ADDRESS]
[PROPERTY_CITY], [PROPERTY_STATE] [PROPERTY_ZIP]

CLAIMANT INFORMATION:
Name: [CLAIMANT_NAME]
Date of Birth: [DOB]
Current Address: [CURRENT_ADDRESS]
Phone: [PHONE]
Email: [EMAIL]

PROPERTY INFORMATION:
Parcel Number: [PARCEL_NUMBER]
Foreclosure Sale Date: [SALE_DATE]
Type of Foreclosure: [FORECLOSURE_TYPE]

I hereby certify that I am entitled to claim the surplus funds from the above-referenced foreclosure sale, and that all information provided in this application is true and correct to the best of my knowledge.

SIGNATURE: ____________________________
DATE: ____________________________
    `,
    fields: [
      { id: 'claimant_name', label: 'Full Legal Name', value: 'John Michael Smith', type: 'text', required: true, aiPopulated: true },
      { id: 'dob', label: 'Date of Birth', value: '1985-03-15', type: 'date', required: true, aiPopulated: true },
      { id: 'property_address', label: 'Property Address', value: '123 Main Street', type: 'text', required: true, aiPopulated: true },
      { id: 'property_city', label: 'City', value: 'Phoenix', type: 'text', required: true, aiPopulated: true },
      { id: 'property_state', label: 'State', value: 'AZ', type: 'text', required: true, aiPopulated: true },
      { id: 'sale_date', label: 'Foreclosure Sale Date', value: '2024-01-15', type: 'date', required: true, aiPopulated: true },
      { id: 'signature', label: 'Your Signature', value: '', type: 'signature', required: true, aiPopulated: false },
      { id: 'sign_date', label: 'Date', value: new Date().toISOString().split('T')[0], type: 'date', required: true, aiPopulated: true },
    ]
  },
  'doc-2': {
    title: 'Authorization to Release Information',
    content: `
AUTHORIZATION TO RELEASE INFORMATION

I, [CLAIMANT_NAME], hereby authorize US Foreclosure Recovery and its agents to:

1. Obtain any and all records related to the property at [PROPERTY_ADDRESS]
2. Communicate with county offices, financial institutions, and other relevant parties
3. Access foreclosure sale records and surplus fund information
4. Act on my behalf in matters related to surplus fund recovery

This authorization is valid from the date signed until the claim is resolved or until revoked in writing.

SIGNATURE: ____________________________
DATE: ____________________________
    `,
    fields: [
      { id: 'claimant_name', label: 'Full Legal Name', value: 'John Michael Smith', type: 'text', required: true, aiPopulated: true },
      { id: 'property_address', label: 'Property Address', value: '123 Main Street, Phoenix, AZ 85001', type: 'text', required: true, aiPopulated: true },
      { id: 'signature', label: 'Your Signature', value: '', type: 'signature', required: true, aiPopulated: false },
      { id: 'sign_date', label: 'Date', value: new Date().toISOString().split('T')[0], type: 'date', required: true, aiPopulated: true },
    ]
  },
  'doc-6': {
    title: 'W-9 Tax Form',
    content: `
FORM W-9 - REQUEST FOR TAXPAYER IDENTIFICATION NUMBER

Name: [NAME]
Business name/disregarded entity name: [BUSINESS_NAME]
Address: [ADDRESS]
City, State, ZIP: [CITY_STATE_ZIP]

Taxpayer Identification Number (SSN): XXX-XX-[SSN_LAST4]

Under penalties of perjury, I certify that the information provided is correct.

SIGNATURE: ____________________________
DATE: ____________________________
    `,
    fields: [
      { id: 'name', label: 'Full Legal Name', value: 'John Michael Smith', type: 'text', required: true, aiPopulated: true },
      { id: 'address', label: 'Current Address', value: '456 New Home Ave', type: 'text', required: true, aiPopulated: true },
      { id: 'city_state_zip', label: 'City, State, ZIP', value: 'Phoenix, AZ 85001', type: 'text', required: true, aiPopulated: true },
      { id: 'ssn_last4', label: 'SSN (Last 4 digits)', value: '1234', type: 'text', required: true, aiPopulated: true },
      { id: 'signature', label: 'Your Signature', value: '', type: 'signature', required: true, aiPopulated: false },
      { id: 'sign_date', label: 'Date', value: new Date().toISOString().split('T')[0], type: 'date', required: true, aiPopulated: true },
    ]
  }
}

export function DocumentSigningView({ documentId }: DocumentSigningViewProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [document, setDocument] = useState<typeof MOCK_DOCUMENTS['doc-1'] | null>(null)
  const [fields, setFields] = useState<typeof MOCK_DOCUMENTS['doc-1']['fields']>([])
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [showSignaturePad, setShowSignaturePad] = useState(false)

  useEffect(() => {
    // Load document data
    const doc = MOCK_DOCUMENTS[documentId]
    if (doc) {
      setDocument(doc)
      setFields(doc.fields)
    }
  }, [documentId])

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(prev => prev.map(f =>
      f.id === fieldId ? { ...f, value } : f
    ))
  }

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature)
    setShowSignaturePad(false)
    // Update the signature field
    setFields(prev => prev.map(f =>
      f.type === 'signature' ? { ...f, value: signature } : f
    ))
  }

  const handleSubmit = async () => {
    // Validate all required fields
    const missingFields = fields.filter(f => f.required && !f.value)
    if (missingFields.length > 0) {
      alert(`Please complete all required fields: ${missingFields.map(f => f.label).join(', ')}`)
      return
    }

    setIsSubmitting(true)

    try {
      // In production, send to API
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsComplete(true)
    } catch (error) {
      console.error('Error submitting document:', error)
      alert('Failed to submit document. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded || !document) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-usfr-primary border-t-transparent rounded-full" />
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
          <p className="text-gray-600 mb-6">
            Your signature has been recorded. This document is now complete.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-usfr-primary text-white rounded-lg font-medium hover:bg-usfr-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const signatureField = fields.find(f => f.type === 'signature')
  const otherFields = fields.filter(f => f.type !== 'signature')
  const aiPopulatedCount = fields.filter(f => f.aiPopulated).length

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-usfr-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-usfr-dark">{document.title}</h1>
                <p className="text-sm text-gray-500">Review and sign this document</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              {/* AI Notice */}
              <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {aiPopulatedCount} of {fields.length} fields auto-populated
                    </p>
                    <p className="text-sm text-blue-700">
                      Review the information below and make any necessary corrections.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div
                className="p-8 bg-white"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              >
                <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed">
                  {document.content}
                </pre>
              </div>
            </div>
          </div>

          {/* Fields Panel */}
          <div className="space-y-6">
            {/* Field Inputs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-usfr-dark mb-4">Document Fields</h3>
              <div className="space-y-4">
                {otherFields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      {field.aiPopulated && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      )}
                    </label>
                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

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
