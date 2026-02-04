'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  PenTool,
  Sparkles,
  CheckCircle2,
  Loader2,
  Stamp,
  Download,
  FileText,
  AlertCircle,
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
  const documentRef = useRef<HTMLDivElement>(null)
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [templateFields, setTemplateFields] = useState<DocumentField[]>([])
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [docHtml, setDocHtml] = useState<string>('')
  const [isRenderingDoc, setIsRenderingDoc] = useState(false)
  const [activeSection, setActiveSection] = useState<'document' | 'fields'>('document')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    loadDocument()
  }, [documentId])

  const loadDocument = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/documents?document_id=${documentId}`)
      if (!res.ok) throw new Error('Document not found')
      const data = await res.json()
      const doc = data.document
      if (!doc) throw new Error('Document not found')

      setDocument(doc)

      if (doc.signature_url) {
        setSignatureData(doc.signature_url)
      }

      if (doc.template_id) {
        const templateRes = await fetch(`/api/documents/templates?template_id=${doc.template_id}`)
        if (templateRes.ok) {
          const templateData = await templateRes.json()
          const fields = templateData.template?.form_fields?.fields || []
          setTemplateFields(fields)
        }
      }

      setFormValues(doc.form_data || {})

      // Render the DOCX file as HTML
      if (doc.file_url) {
        await renderDocx(doc.file_url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document')
    } finally {
      setIsLoading(false)
    }
  }

  const renderDocx = async (fileUrl: string) => {
    setIsRenderingDoc(true)
    try {
      const mammoth = (await import('mammoth')).default
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Failed to fetch document file')
      const arrayBuffer = await response.arrayBuffer()
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Title'] => h1.doc-title",
            "p[style-name='Heading 1'] => h2.doc-heading",
            "p[style-name='Heading 2'] => h3.doc-subheading",
          ],
        }
      )
      setDocHtml(result.value)
    } catch (err) {
      console.error('DOCX render error:', err)
      setDocHtml('')
    } finally {
      setIsRenderingDoc(false)
    }
  }

  // Replace placeholders in the rendered HTML with form values
  const getProcessedHtml = useCallback(() => {
    if (!docHtml) return ''
    let processed = docHtml

    // Replace common placeholder patterns: [FIELD_NAME], {{field_name}}, ________
    for (const [key, value] of Object.entries(formValues)) {
      if (!value) continue
      const upperKey = key.toUpperCase().replace(/_/g, ' ')
      const patterns = [
        new RegExp(`\\[${upperKey}\\]`, 'gi'),
        new RegExp(`\\{\\{${key}\\}\\}`, 'gi'),
        new RegExp(`\\[${key}\\]`, 'gi'),
      ]
      for (const pattern of patterns) {
        processed = processed.replace(pattern, `<span class="filled-field">${value}</span>`)
      }
    }

    return processed
  }, [docHtml, formValues])

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature)
    setShowSignaturePad(false)
  }

  const generateSignedPdf = async (): Promise<string | null> => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const pdf = new jsPDF('p', 'mm', 'letter')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15

      // Title
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(document?.title || 'Document', margin, 20)

      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100)
      pdf.text(`Case Document ID: ${document?.id}`, margin, 27)
      pdf.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 32)
      pdf.setTextColor(0)

      let yPos = 40

      // Render form data
      if (templateFields.length > 0) {
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Document Information', margin, yPos)
        yPos += 8

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')

        for (const field of templateFields) {
          if (field.type === 'signature') continue
          const value = formValues[field.id] || '---'

          if (yPos > pageHeight - 40) {
            pdf.addPage()
            yPos = 20
          }

          pdf.setFont('helvetica', 'bold')
          pdf.text(`${field.label}:`, margin, yPos)
          pdf.setFont('helvetica', 'normal')
          const labelWidth = pdf.getTextWidth(`${field.label}: `)
          pdf.text(value, margin + labelWidth, yPos)
          yPos += 7
        }
      }

      // Render document body from HTML content
      if (documentRef.current) {
        const docContent = documentRef.current.querySelector('.doc-body')
        if (docContent) {
          const canvas = await html2canvas(docContent as HTMLElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          })

          const imgData = canvas.toDataURL('image/png')
          const imgWidth = pageWidth - (margin * 2)
          const imgHeight = (canvas.height / canvas.width) * imgWidth

          // May need multiple pages for long documents
          let remaining = imgHeight
          let srcY = 0
          const pageContentHeight = pageHeight - 40

          if (yPos + 10 > pageHeight - 40) {
            pdf.addPage()
            yPos = 20
          }
          yPos += 5

          // Simple approach: add full image, let it overflow to next pages
          if (imgHeight < pageContentHeight - yPos) {
            pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight)
            yPos += imgHeight + 10
          } else {
            // For very long documents, add on new page at scale
            pdf.addPage()
            yPos = 15
            const scaledHeight = Math.min(imgHeight, pageContentHeight * 3)
            pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, scaledHeight)
            pdf.addPage()
            yPos = 20
          }
        }
      }

      // Signature page
      pdf.addPage()
      yPos = 20

      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Signature & Certification', margin, yPos)
      yPos += 12

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      const certText = [
        'I, the undersigned, hereby certify that:',
        '',
        '1. I have read and understand the contents of this document.',
        '2. All information provided is true and accurate to the best of my knowledge.',
        '3. I am signing this document voluntarily and of my own free will.',
        '4. I agree that this electronic signature is legally binding and equivalent',
        '   to my handwritten signature under applicable federal and state law,',
        '   including the ESIGN Act and UETA.',
      ]

      for (const line of certText) {
        pdf.text(line, margin, yPos)
        yPos += 6
      }

      yPos += 10

      // Add signature image
      if (signatureData) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('Signature:', margin, yPos)
        yPos += 3

        pdf.addImage(signatureData, 'PNG', margin, yPos, 70, 25)
        yPos += 30

        // Signature line
        pdf.setDrawColor(0)
        pdf.line(margin, yPos, margin + 80, yPos)
        yPos += 5
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')

        const signerName = formValues['client_name'] || formValues['heir_name'] || formValues['signor_name'] || user?.fullName || ''
        if (signerName) {
          pdf.text(`Printed Name: ${signerName}`, margin, yPos)
          yPos += 5
        }
        pdf.text(`Date Signed: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, yPos)
        yPos += 5
        pdf.text(`IP Address: ${typeof window !== 'undefined' ? 'Recorded' : 'N/A'}`, margin, yPos)
        yPos += 5
        pdf.text(`Document ID: ${document?.id}`, margin, yPos)
      }

      // Footer on all pages
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150)
        pdf.text(
          `US Foreclosure Recovery | Electronically signed via secure portal | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        )
        pdf.setTextColor(0)
      }

      const pdfDataUrl = pdf.output('datauristring')
      return pdfDataUrl
    } catch (err) {
      console.error('PDF generation error:', err)
      return null
    }
  }

  const handleSubmit = async () => {
    if (!document || !signatureData) return

    const missingFields = templateFields
      .filter(f => f.required && f.type !== 'signature' && !formValues[f.id])
      .map(f => f.label)

    if (missingFields.length > 0) {
      alert(`Please complete all required fields:\n\n${missingFields.join('\n')}`)
      return
    }

    setIsSubmitting(true)

    try {
      // Generate the signed PDF
      const signedPdfUrl = await generateSignedPdf()

      const res = await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: document.id,
          action: 'sign',
          signature_url: signatureData,
          form_data: formValues,
          signed_pdf_url: signedPdfUrl,
          actor_email: user?.primaryEmailAddress?.emailAddress || 'unknown',
          signer_ip: 'client',
          signer_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to sign document')
      }

      if (signedPdfUrl) {
        setPdfUrl(signedPdfUrl)
      }

      setIsComplete(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-usfr-dark mb-2">Document Signed</h2>
          <p className="text-gray-600 mb-2">
            Your signature has been recorded and securely stored with legal compliance metadata.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left text-xs text-gray-500 space-y-1">
            <p>Document: {document.title}</p>
            <p>Signed: {new Date().toLocaleString()}</p>
            <p>ID: {document.id}</p>
          </div>
          {document.requires_notary && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-purple-700">
                <Stamp className="w-4 h-4" />
                <span className="text-sm font-medium">This document requires notarization</span>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Use the Find Notary tab to locate a mobile notary in your area.
              </p>
            </div>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${document.file_name?.replace('.docx', '')}-signed.pdf`}
              className="w-full py-3 mb-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Signed PDF
            </a>
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
  const totalFields = otherFields.length
  const alreadySigned = document.status === 'signed' || document.status === 'printed'

  return (
    <div className="min-h-screen bg-gray-50" ref={documentRef}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
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
              {alreadySigned && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Signed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile tab toggle */}
        <div className="flex lg:hidden border-t border-gray-100">
          <button
            onClick={() => setActiveSection('document')}
            className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
              activeSection === 'document'
                ? 'text-usfr-primary border-b-2 border-usfr-primary'
                : 'text-gray-500'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            Document
          </button>
          <button
            onClick={() => setActiveSection('fields')}
            className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
              activeSection === 'fields'
                ? 'text-usfr-primary border-b-2 border-usfr-primary'
                : 'text-gray-500'
            }`}
          >
            <PenTool className="w-4 h-4 inline mr-1" />
            Fields & Sign
            {!signatureData && (
              <span className="ml-1 w-2 h-2 bg-red-500 rounded-full inline-block" />
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Document Viewer - Left Panel */}
          <div className={`lg:flex-1 ${activeSection !== 'document' ? 'hidden lg:block' : ''}`}>
            {/* Auto-populated notice */}
            {populatedCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  <strong>{populatedCount} of {totalFields} fields</strong> auto-populated from your questionnaire.
                  Review and edit in the Fields panel before signing.
                </p>
              </div>
            )}

            {/* Rendered Document */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{document.file_name}</span>
                </div>
                <a
                  href={document.file_url}
                  download={document.file_name}
                  className="text-xs text-usfr-primary hover:underline flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  DOCX
                </a>
              </div>

              {isRenderingDoc ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-usfr-primary mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Rendering document...</p>
                  </div>
                </div>
              ) : docHtml ? (
                <div className="doc-body p-6 sm:p-10 lg:p-12 max-w-none">
                  {/* Inject document styles */}
                  <style>{`
                    .doc-body {
                      font-family: 'Times New Roman', Georgia, serif;
                      font-size: 12pt;
                      line-height: 1.6;
                      color: #1a1a1a;
                    }
                    .doc-body h1, .doc-body h2, .doc-body h3 {
                      font-family: Arial, Helvetica, sans-serif;
                      margin-top: 1.5em;
                      margin-bottom: 0.5em;
                    }
                    .doc-body h1, .doc-body .doc-title {
                      font-size: 18pt;
                      font-weight: bold;
                      text-align: center;
                      text-transform: uppercase;
                      margin-bottom: 1em;
                    }
                    .doc-body h2, .doc-body .doc-heading {
                      font-size: 14pt;
                      font-weight: bold;
                      border-bottom: 1px solid #ccc;
                      padding-bottom: 4px;
                    }
                    .doc-body h3, .doc-body .doc-subheading {
                      font-size: 12pt;
                      font-weight: bold;
                    }
                    .doc-body p {
                      margin-bottom: 0.8em;
                      text-align: justify;
                    }
                    .doc-body table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1em 0;
                    }
                    .doc-body table td, .doc-body table th {
                      border: 1px solid #999;
                      padding: 6px 10px;
                      font-size: 11pt;
                    }
                    .doc-body ul, .doc-body ol {
                      padding-left: 2em;
                      margin-bottom: 0.8em;
                    }
                    .doc-body li {
                      margin-bottom: 0.3em;
                    }
                    .filled-field {
                      background: #e8f4fd;
                      border-bottom: 2px solid #2563eb;
                      padding: 1px 4px;
                      font-weight: 600;
                      color: #1e40af;
                    }
                    .doc-body img {
                      max-width: 100%;
                    }
                  `}</style>
                  <div dangerouslySetInnerHTML={{ __html: getProcessedHtml() }} />

                  {/* Signature placement area at the bottom of the document */}
                  <div className="mt-12 pt-8 border-t-2 border-gray-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                          SIGNATURE:
                        </p>
                        {signatureData ? (
                          <div className="border-b-2 border-black pb-1 mb-1">
                            <img
                              src={signatureData}
                              alt="Signature"
                              className="h-16 object-contain"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveSection('fields')
                              setTimeout(() => setShowSignaturePad(true), 100)
                            }}
                            className="w-full h-16 border-2 border-dashed border-red-300 bg-red-50 rounded flex items-center justify-center gap-2 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <PenTool className="w-5 h-5" />
                            <span className="font-medium text-sm">Click to add signature</span>
                          </button>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formValues['client_name'] || formValues['heir_name'] || formValues['signor_name'] || 'Signee Name'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                          DATE:
                        </p>
                        <div className="border-b-2 border-black pb-1 mb-1 h-16 flex items-end">
                          <span className="text-base">
                            {signatureData
                              ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                              : ''}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Date of Signature</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">
                    Document preview unavailable. You can still fill out the fields and sign.
                  </p>
                  <a
                    href={document.file_url}
                    download={document.file_name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-usfr-primary text-white rounded-lg text-sm hover:bg-usfr-primary/90"
                  >
                    <Download className="w-4 h-4" />
                    Download {document.file_name}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Fields & Signature Panel - Right Side */}
          <div className={`lg:w-96 space-y-4 ${activeSection !== 'fields' ? 'hidden lg:block' : ''}`}>
            {/* Field Inputs */}
            {otherFields.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-usfr-dark">Document Fields</h3>
                  <span className="text-xs text-gray-500">
                    {populatedCount}/{totalFields} filled
                  </span>
                </div>
                <div className="space-y-3">
                  {otherFields.map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        {formValues[field.id] && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Auto
                          </span>
                        )}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formValues[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
                          disabled={alreadySigned}
                        />
                      ) : (
                        <input
                          type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                          value={formValues[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-usfr-secondary focus:border-transparent"
                          disabled={alreadySigned}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-usfr-dark mb-3">Your Signature</h3>

              {signatureData ? (
                <div className="space-y-3">
                  <div className="border-2 border-green-200 bg-green-50 rounded-lg p-3">
                    <img
                      src={signatureData}
                      alt="Your signature"
                      className="max-h-20 mx-auto"
                    />
                  </div>
                  {!alreadySigned && (
                    <button
                      onClick={() => {
                        setSignatureData(null)
                        setShowSignaturePad(true)
                      }}
                      className="w-full py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Clear & Re-sign
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSignaturePad(true)}
                  className="w-full py-10 border-2 border-dashed border-red-300 bg-red-50 rounded-lg hover:border-usfr-secondary hover:bg-usfr-secondary/5 transition-colors flex flex-col items-center justify-center gap-2 text-red-600 hover:text-usfr-secondary"
                >
                  <PenTool className="w-8 h-8" />
                  <span className="font-semibold">Sign Document</span>
                  <span className="text-xs text-gray-500">Draw or type your legal signature</span>
                </button>
              )}
            </div>

            {/* Legal Consent */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Legal Notice:</strong> By clicking "Sign & Submit", you agree that your electronic
                signature is legally binding and equivalent to your handwritten signature pursuant to
                the Electronic Signatures in Global and National Commerce Act (ESIGN Act) and the
                Uniform Electronic Transactions Act (UETA). Your signature, IP address, browser
                information, and timestamp are securely recorded for legal compliance.
              </p>
            </div>

            {/* Submit Button */}
            {!alreadySigned && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !signatureData}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  signatureData
                    ? 'bg-usfr-accent text-white hover:bg-usfr-accent/90 shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing & Generating PDF...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Sign & Submit Document
                  </>
                )}
              </button>
            )}

            {!signatureData && !alreadySigned && (
              <p className="text-center text-xs text-red-500 font-medium">
                Signature required to submit this document
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
