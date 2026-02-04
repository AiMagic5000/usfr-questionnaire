import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'

/**
 * POST /api/docuseal/webhook - Handle DocuSeal webhook events
 *
 * Events:
 * - submission.completed: All submitters have completed signing
 * - form.completed: A single submitter has completed their part
 * - form.viewed: A submitter has viewed the signing form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventType = body.event_type
    const data = body.data

    if (!eventType || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    const supabase = createAgentsServerClient()

    switch (eventType) {
      case 'form.viewed': {
        // A submitter has opened the signing form
        const submitterId = data.id
        if (submitterId) {
          await supabase
            .from('documents')
            .update({ status: 'viewed' })
            .eq('docuseal_submitter_id', submitterId)
            .eq('status', 'sent_for_signing')
        }
        break
      }

      case 'form.completed': {
        // A submitter has completed signing
        const submitterId = data.id
        const submissionId = data.submission_id
        const documents = data.documents || []
        const values = data.values || []

        if (!submitterId) break

        // Get the signed PDF URL from the completed documents
        const signedPdfUrl = documents[0]?.url || null

        // Update our document record
        const { data: updatedDoc } = await supabase
          .from('documents')
          .update({
            status: 'signed',
            signed_at: new Date().toISOString(),
            signed_pdf_url: signedPdfUrl,
            docuseal_completed_at: data.completed_at || new Date().toISOString(),
          })
          .eq('docuseal_submitter_id', submitterId)
          .select('id, case_id, title')
          .single()

        if (updatedDoc) {
          // Audit log
          await supabase.from('document_audit_log').insert({
            document_id: updatedDoc.id,
            action: 'signed_via_docuseal',
            actor_email: data.email || 'unknown',
            details: {
              submission_id: submissionId,
              submitter_id: submitterId,
              signed_pdf_url: signedPdfUrl,
              values_count: values.length,
            },
          })

          // Check if all case documents are now signed
          if (updatedDoc.case_id) {
            const { data: caseDocs } = await supabase
              .from('documents')
              .select('status, requires_notary, notarized_at')
              .eq('case_id', updatedDoc.case_id)

            if (caseDocs) {
              const allSigned = caseDocs.every(
                d => d.status === 'signed' || d.status === 'printed'
              )
              const needsNotary = caseDocs.some(
                d => d.requires_notary && !d.notarized_at
              )

              if (allSigned) {
                const newStatus = needsNotary ? 'notarization' : 'submitted'
                await supabase
                  .from('recovery_cases')
                  .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', updatedDoc.case_id)
              } else {
                await supabase
                  .from('recovery_cases')
                  .update({
                    status: 'signing',
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', updatedDoc.case_id)
              }
            }
          }
        }
        break
      }

      case 'submission.completed': {
        // Entire submission is complete (all submitters done)
        const submissionId = data.id
        if (submissionId) {
          // Update all documents linked to this submission
          await supabase
            .from('documents')
            .update({
              status: 'signed',
              signed_at: new Date().toISOString(),
            })
            .eq('docuseal_submission_id', submissionId)
            .neq('status', 'signed')
        }
        break
      }

      default:
        // Unhandled event type - acknowledge it
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
