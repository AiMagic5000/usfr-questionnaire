import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'
import {
  createSubmission,
  getSubmission,
  listTemplates,
  getTemplate,
} from '@/lib/docuseal'

/**
 * GET /api/docuseal - Get signing status for a document
 * Query params: document_id (get signing link/status for a specific document)
 *               list_templates (list all DocuSeal templates)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('document_id')
    const doListTemplates = searchParams.get('list_templates')

    if (doListTemplates === 'true') {
      const result = await listTemplates()
      return NextResponse.json(result)
    }

    if (!documentId) {
      return NextResponse.json({ error: 'document_id required' }, { status: 400 })
    }

    const supabase = createAgentsServerClient()
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // If there's already a DocuSeal submission, get its status
    if (doc.docuseal_submission_id) {
      const submission = await getSubmission(doc.docuseal_submission_id)
      const clientSubmitter = submission.submitters?.find(s => s.role === 'First Party') || submission.submitters?.[0]
      const notarySubmitter = submission.submitters?.find(s => s.role === 'Notary')

      return NextResponse.json({
        document_id: documentId,
        status: doc.status,
        docuseal_submission_id: doc.docuseal_submission_id,
        signing_url: clientSubmitter?.embed_src || null,
        submitter_status: clientSubmitter?.status || null,
        completed_at: clientSubmitter?.completed_at || null,
        signed_documents: clientSubmitter?.documents || [],
        // Notary info
        notary_signing_url: notarySubmitter?.embed_src || null,
        notary_status: notarySubmitter?.status || null,
        notary_completed_at: notarySubmitter?.completed_at || null,
      })
    }

    return NextResponse.json({
      document_id: documentId,
      status: doc.status,
      docuseal_submission_id: null,
      signing_url: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/docuseal - Create a signing request for a document
 * Body: {
 *   document_id,
 *   client_email,
 *   client_name,
 *   send_email?,
 *   prepared_fields?,
 *   notary_email?,
 *   notary_name?,
 *   notary_id?
 * }
 *
 * Flow:
 * 1. Look up the document and its template
 * 2. Create a DocuSeal submission with pre-filled fields
 * 3. If notary info provided, add second submitter with "Notary" role
 * 4. Store the submission ID and signing URL on the document
 * 5. Return the embed signing URLs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      document_id,
      client_email,
      client_name,
      send_email,
      prepared_fields,
      notary_email,
      notary_name,
      notary_id,
    } = body

    if (!document_id) {
      return NextResponse.json({ error: 'document_id is required' }, { status: 400 })
    }

    const supabase = createAgentsServerClient()

    // Get the document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // If already has a submission, return existing signing URL
    if (doc.docuseal_submission_id) {
      const existing = await getSubmission(doc.docuseal_submission_id)
      const clientSubmitter = existing.submitters?.find(s => s.role === 'First Party') || existing.submitters?.[0]
      const notarySubmitter = existing.submitters?.find(s => s.role === 'Notary')
      return NextResponse.json({
        signing_url: clientSubmitter?.embed_src || null,
        submission_id: doc.docuseal_submission_id,
        status: clientSubmitter?.status || 'pending',
        notary_signing_url: notarySubmitter?.embed_src || null,
        notary_status: notarySubmitter?.status || null,
      })
    }

    // Determine client email from document's case if not provided
    let recipientEmail = client_email
    let recipientName = client_name

    if (!recipientEmail && doc.case_id) {
      const { data: recoveryCase } = await supabase
        .from('recovery_cases')
        .select('client_email, client_first_name, client_last_name')
        .eq('id', doc.case_id)
        .single()

      if (recoveryCase) {
        recipientEmail = recipientEmail || recoveryCase.client_email
        recipientName = recipientName || `${recoveryCase.client_first_name || ''} ${recoveryCase.client_last_name || ''}`.trim()
      }
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Client email is required. Provide client_email or ensure the case has a client email.' },
        { status: 400 }
      )
    }

    // Use the pre-existing DocuSeal template ID stored on the document record.
    const docusealTemplateId = doc.docuseal_template_id

    if (!docusealTemplateId) {
      return NextResponse.json(
        { error: 'This document does not have a DocuSeal template configured. Please select a document from the Contract Library.' },
        { status: 400 }
      )
    }

    // Build pre-filled fields from prepared_fields or document's form_data
    const prefilledFields: Array<{ name: string; default_value: string; readonly: boolean }> = []
    const formData = prepared_fields || doc.form_data || {}

    // Get the DocuSeal template to map field names
    const dsTemplate = await getTemplate(docusealTemplateId)
    const templateFieldNames = dsTemplate.fields.map(f => f.name.toLowerCase())

    // Map our form_data keys to DocuSeal field names
    for (const [key, value] of Object.entries(formData)) {
      if (!value || String(value).trim() === '') continue

      // Try direct match first
      const fieldName = key.replace(/_/g, ' ')
      if (templateFieldNames.some(n => n === fieldName.toLowerCase() || n === key.toLowerCase())) {
        prefilledFields.push({
          name: fieldName,
          default_value: String(value),
          readonly: true,
        })
      }
    }

    // Build submitters array
    const submitters: Array<{
      email: string
      name?: string
      role: string
      external_id?: string
      fields?: Array<{ name: string; default_value: string; readonly: boolean }>
    }> = [
      {
        email: recipientEmail,
        name: recipientName || undefined,
        role: 'First Party',
        external_id: document_id,
        fields: prefilledFields.length > 0 ? prefilledFields : undefined,
      },
    ]

    // Add notary as second submitter if provided
    if (notary_email && notary_name) {
      submitters.push({
        email: notary_email,
        name: notary_name,
        role: 'Notary',
        external_id: `${document_id}-notary`,
      })
    }

    // Create the signing submission.
    // No message object is sent -- DocuSeal uses the branded invitation_email.html.erb
    // template with the signing link, professional layout, and company branding.
    // Subject lines are configured per-template in DocuSeal preferences.
    const submissions = await createSubmission({
      templateId: docusealTemplateId,
      sendEmail: send_email !== false,
      submitters,
      // When notary is involved, both can sign independently
      order: submitters.length > 1 ? 'random' : undefined,
    })

    const submission = Array.isArray(submissions) ? submissions[0] : submissions
    const clientSubmitter = submission?.submitters?.find(s => s.role === 'First Party') || submission?.submitters?.[0]
    const notarySubmitter = submission?.submitters?.find(s => s.role === 'Notary')

    // Store DocuSeal IDs and notary info on our document record
    await supabase
      .from('documents')
      .update({
        docuseal_submission_id: submission?.id || null,
        docuseal_template_id: docusealTemplateId,
        docuseal_submitter_id: clientSubmitter?.id || null,
        docuseal_signing_url: clientSubmitter?.embed_src || null,
        docuseal_notary_submitter_id: notarySubmitter?.id || null,
        notary_email: notary_email || null,
        notary_name: notary_name || null,
        notary_id: notary_id || null,
        prepared_fields: prepared_fields || null,
        prepared_at: new Date().toISOString(),
        status: 'sent_for_signing',
      })
      .eq('id', document_id)

    // Audit log
    await supabase.from('document_audit_log').insert({
      document_id,
      action: 'sent_for_signing',
      actor_email: 'system',
      details: {
        docuseal_submission_id: submission?.id,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        notary_email: notary_email || null,
        notary_name: notary_name || null,
        has_notary: !!notary_email,
      },
    })

    return NextResponse.json({
      signing_url: clientSubmitter?.embed_src || null,
      submission_id: submission?.id || null,
      submitter_id: clientSubmitter?.id || null,
      notary_signing_url: notarySubmitter?.embed_src || null,
      notary_submitter_id: notarySubmitter?.id || null,
      status: 'sent_for_signing',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
