import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'
import { getContractDocument } from '@/lib/contract-documents'

/**
 * POST /api/documents/prepare
 * Creates a document record from a contract template for signing.
 * Optionally pulls intake questionnaire data to auto-populate document fields.
 * Body: { template_id, title, filename, description, group, client_email?, client_name?, clerk_user_id?, docuseal_template_id? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, title, filename, description, group, client_email, client_name, clerk_user_id, docuseal_template_id } = body

    if (!template_id || !title || !filename) {
      return NextResponse.json(
        { error: 'template_id, title, and filename are required' },
        { status: 400 }
      )
    }

    const supabase = createAgentsServerClient()

    // Build the public URL for the DOCX file
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usfr.vercel.app'
    const fileUrl = `${siteUrl}/documents/${filename}`

    // Look up contract document metadata for accurate requires_notary
    const contractDoc = getContractDocument(template_id)
    const requiresNotary = contractDoc?.requiresNotary ?? group === 'notary'

    // Build form_data - start with any provided client info
    const formData: Record<string, string> = {}
    if (client_email) formData.client_email = client_email
    if (client_name) formData.client_name = client_name

    // Auto-fill defaults from placeholder field definitions
    if (contractDoc) {
      for (const field of contractDoc.placeholderFields) {
        if (field.defaultValue && !formData[field.formDataKey]) {
          formData[field.formDataKey] = field.defaultValue
        }
      }
    }

    // Pull questionnaire data to auto-populate document fields
    if (clerk_user_id) {
      const { data: intake } = await supabase
        .from('intake_responses')
        .select('form_data')
        .eq('clerk_user_id', clerk_user_id)
        .single()

      if (intake?.form_data) {
        const q = intake.form_data as Record<string, unknown>
        // Map questionnaire fields to document fields
        if (q.firstName) formData.client_first_name = String(q.firstName)
        if (q.lastName) formData.client_last_name = String(q.lastName)
        if (q.middleName) formData.client_middle_name = String(q.middleName)
        if (q.firstName && q.lastName) {
          formData.client_name = `${q.firstName} ${q.lastName}`
        }
        if (q.email) formData.client_email = formData.client_email || String(q.email)
        if (q.phonePrimary) formData.client_phone = String(q.phonePrimary)
        if (q.dateOfBirth) formData.client_dob = String(q.dateOfBirth)
        if (q.ssnLastFour) formData.ssn_last_four = String(q.ssnLastFour)
        if (q.currentAddress) formData.client_address = String(q.currentAddress)
        if (q.currentCity) formData.client_city = String(q.currentCity)
        if (q.currentState) formData.client_state = String(q.currentState)
        if (q.currentZip) formData.client_zip = String(q.currentZip)
        // Property info
        if (q.propertyAddress) formData.property_address = String(q.propertyAddress)
        if (q.propertyCity) formData.property_city = String(q.propertyCity)
        if (q.propertyState) formData.property_state = String(q.propertyState)
        if (q.propertyZip) formData.property_zip = String(q.propertyZip)
        if (q.propertyCounty) formData.property_county = String(q.propertyCounty)
        if (q.parcelNumber) formData.parcel_number = String(q.parcelNumber)
        if (q.foreclosureType) formData.foreclosure_type = String(q.foreclosureType)
        if (q.saleDate) formData.sale_date = String(q.saleDate)
        if (q.saleAmount) formData.sale_amount = String(q.saleAmount)
        if (q.estimatedSurplus) formData.estimated_surplus = String(q.estimatedSurplus)
        // Agent info
        if (q.agentFullName) formData.agent_name = String(q.agentFullName)
      }
    }

    // Create the document record
    const { data: doc, error } = await supabase
      .from('documents')
      .insert({
        title,
        description: description || '',
        file_url: fileUrl,
        file_name: filename,
        document_group: group || 'agreements',
        status: 'pending',
        requires_notary: requiresNotary,
        form_data: formData,
        priority: 1,
        docuseal_template_id: docuseal_template_id || null,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create document', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      document_id: doc.id,
      file_url: fileUrl,
      requires_notary: requiresNotary,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
