import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'
import {
  createSubmission,
  getSubmission,
  listTemplates,
  getTemplate,
  createTemplateFromUrl,
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
      const submitter = submission.submitters?.[0]
      return NextResponse.json({
        document_id: documentId,
        status: doc.status,
        docuseal_submission_id: doc.docuseal_submission_id,
        signing_url: submitter?.embed_src || null,
        submitter_status: submitter?.status || null,
        completed_at: submitter?.completed_at || null,
        signed_documents: submitter?.documents || [],
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
 * Body: { document_id, client_email, client_name }
 *
 * Flow:
 * 1. Look up the document and its template
 * 2. Ensure a DocuSeal template exists (create from DOCX if not)
 * 3. Create a DocuSeal submission with pre-filled fields
 * 4. Store the submission ID and signing URL on the document
 * 5. Return the embed signing URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document_id, client_email, client_name, send_email } = body

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
      const submitter = existing.submitters?.[0]
      return NextResponse.json({
        signing_url: submitter?.embed_src || null,
        submission_id: doc.docuseal_submission_id,
        status: submitter?.status || 'pending',
      })
    }

    // Determine client email from document's case
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

    // Get or create DocuSeal template
    let docusealTemplateId = doc.docuseal_template_id

    if (!docusealTemplateId) {
      // Check if we already have a DocuSeal template for this document template
      if (doc.template_id) {
        const { data: tmpl } = await supabase
          .from('document_templates')
          .select('docuseal_template_id, file_url, name')
          .eq('id', doc.template_id)
          .single()

        if (tmpl?.docuseal_template_id) {
          docusealTemplateId = tmpl.docuseal_template_id
        } else if (tmpl?.file_url) {
          // Create DocuSeal template from the DOCX file
          const docUrl = tmpl.file_url.startsWith('http')
            ? tmpl.file_url
            : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://usfr.vercel.app'}${tmpl.file_url}`

          const dsTemplate = await createTemplateFromUrl(
            tmpl.name || doc.title,
            docUrl,
            doc.template_id
          )

          docusealTemplateId = dsTemplate.id

          // Store the DocuSeal template ID on our template record
          await supabase
            .from('document_templates')
            .update({ docuseal_template_id: dsTemplate.id })
            .eq('id', doc.template_id)
        }
      }

      // If still no template, try creating from the document's own file_url
      if (!docusealTemplateId && doc.file_url) {
        const fileUrl = doc.file_url.startsWith('http')
          ? doc.file_url
          : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://usfr.vercel.app'}${doc.file_url}`

        const dsTemplate = await createTemplateFromUrl(
          doc.title,
          fileUrl,
          `doc-${document_id}`
        )
        docusealTemplateId = dsTemplate.id
      }
    }

    if (!docusealTemplateId) {
      return NextResponse.json(
        { error: 'Could not create or find a DocuSeal template for this document' },
        { status: 500 }
      )
    }

    // Build pre-filled fields from the document's form_data
    const prefilledFields: Array<{ name: string; default_value: string; readonly: boolean }> = []
    const formData = doc.form_data || {}

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

    // Create the signing submission
    const submissions = await createSubmission({
      templateId: docusealTemplateId,
      sendEmail: send_email !== false,
      submitters: [{
        email: recipientEmail,
        name: recipientName || undefined,
        role: 'First Party',
        external_id: document_id,
        fields: prefilledFields.length > 0 ? prefilledFields : undefined,
      }],
      message: {
        subject: `Please sign: ${doc.title}`,
        body: `Hello ${recipientName || 'Client'},\n\nPlease review and sign the attached document "${doc.title}" for your foreclosure surplus recovery case.\n\nThis is a secure document that requires your electronic signature.`,
      },
    })

    const submission = Array.isArray(submissions) ? submissions[0] : submissions
    const submitter = submission?.submitters?.[0]

    // Store DocuSeal IDs on our document record
    await supabase
      .from('documents')
      .update({
        docuseal_submission_id: submission?.id || null,
        docuseal_template_id: docusealTemplateId,
        docuseal_submitter_id: submitter?.id || null,
        docuseal_signing_url: submitter?.embed_src || null,
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
      },
    })

    return NextResponse.json({
      signing_url: submitter?.embed_src || null,
      submission_id: submission?.id || null,
      submitter_id: submitter?.id || null,
      status: 'sent_for_signing',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
