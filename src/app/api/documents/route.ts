import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'

/**
 * GET /api/documents - Get documents for a case or client
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('case_id')
    const clientId = searchParams.get('client_id')
    const clerkUserId = searchParams.get('clerk_user_id')
    const documentId = searchParams.get('document_id')

    const supabase = createAgentsServerClient()

    // Single document fetch
    if (documentId) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Document not found', details: error.message },
          { status: 404 }
        )
      }

      return NextResponse.json({ document: data })
    }

    // List documents for a case
    if (caseId) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('priority', { ascending: true })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch documents', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ documents: data || [] })
    }

    // List all documents for a client by clerk user ID
    if (clerkUserId) {
      // First get their cases
      const { data: cases, error: casesError } = await supabase
        .from('recovery_cases')
        .select('id')
        .eq('clerk_user_id', clerkUserId)

      if (casesError || !cases?.length) {
        return NextResponse.json({ documents: [] })
      }

      const caseIds = cases.map(c => c.id)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .in('case_id', caseIds)
        .order('priority', { ascending: true })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch documents', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ documents: data || [] })
    }

    return NextResponse.json(
      { error: 'case_id, client_id, clerk_user_id, or document_id required' },
      { status: 400 }
    )
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/documents - Update a document (sign, update fields, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { document_id, action, form_data, signature_url, signer_ip, signer_user_agent } = body

    if (!document_id || !action) {
      return NextResponse.json(
        { error: 'document_id and action are required' },
        { status: 400 }
      )
    }

    const supabase = createAgentsServerClient()

    // Get the current document
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .single()

    if (fetchError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = {}

    switch (action) {
      case 'update_fields':
        if (form_data) {
          updates.form_data = { ...doc.form_data, ...form_data }
          updates.status = 'pending'
        }
        break

      case 'mark_ready':
        updates.status = 'pending'
        break

      case 'sign':
        if (!signature_url) {
          return NextResponse.json(
            { error: 'signature_url required for signing' },
            { status: 400 }
          )
        }
        updates.signature_url = signature_url
        updates.signed_at = new Date().toISOString()
        updates.signer_ip = signer_ip || null
        updates.signer_user_agent = signer_user_agent || null
        updates.consent_given_at = new Date().toISOString()
        updates.consent_text = 'I agree that this electronic signature is legally binding and equivalent to my handwritten signature.'
        updates.status = doc.requires_notary ? 'signed' : 'signed'
        if (form_data) {
          updates.form_data = { ...doc.form_data, ...form_data }
        }
        break

      case 'notarize':
        updates.notarized_at = new Date().toISOString()
        updates.status = 'signed'
        break

      case 'mark_printed':
        updates.printed_at = new Date().toISOString()
        updates.status = 'printed'
        break

      case 'mark_mailed':
        updates.mailed_at = new Date().toISOString()
        updates.tracking_number = body.tracking_number || null
        updates.mailing_notes = body.mailing_notes || null
        updates.status = 'printed'
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const { data: updated, error: updateError } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', document_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update document', details: updateError.message },
        { status: 500 }
      )
    }

    // Audit log
    await supabase.from('document_audit_log').insert({
      document_id,
      action,
      actor_email: body.actor_email || 'unknown',
      ip_address: signer_ip || null,
      user_agent: signer_user_agent || null,
      details: { updates_applied: Object.keys(updates) },
    })

    // Check if all case documents are signed - update case status
    if (action === 'sign' && doc.case_id) {
      const { data: caseDocs } = await supabase
        .from('documents')
        .select('status, requires_notary, notarized_at')
        .eq('case_id', doc.case_id)

      if (caseDocs) {
        const allSigned = caseDocs.every(d => d.status === 'signed' || d.status === 'printed')
        const needsNotary = caseDocs.some(d => d.requires_notary && !d.notarized_at)

        if (allSigned) {
          const newStatus = needsNotary ? 'notarization' : 'submitted'
          await supabase
            .from('recovery_cases')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', doc.case_id)
        } else {
          await supabase
            .from('recovery_cases')
            .update({ status: 'signing', updated_at: new Date().toISOString() })
            .eq('id', doc.case_id)
        }
      }
    }

    return NextResponse.json({ document: updated })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
