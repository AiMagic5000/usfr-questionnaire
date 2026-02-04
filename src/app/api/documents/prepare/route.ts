import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'

/**
 * POST /api/documents/prepare
 * Creates a document record from a contract template for signing.
 * Body: { template_id, title, filename, description, group, client_email?, client_name? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, title, filename, description, group, client_email, client_name } = body

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
        requires_notary: group === 'notary',
        form_data: client_email
          ? { client_email: client_email, client_name: client_name || '' }
          : {},
        priority: 1,
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
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
