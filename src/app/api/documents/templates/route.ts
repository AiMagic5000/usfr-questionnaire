import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'

/**
 * GET /api/documents/templates - Get document templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('template_id')

    const supabase = createAgentsServerClient()

    if (templateId) {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Template not found', details: error.message },
          { status: 404 }
        )
      }

      return NextResponse.json({ template: data })
    }

    // List all templates
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch templates', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ templates: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
