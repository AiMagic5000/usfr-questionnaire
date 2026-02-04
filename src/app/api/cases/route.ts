import { NextRequest, NextResponse } from 'next/server'
import { createAgentsServerClient } from '@/lib/supabase-agents'
import { CASE_DOCUMENT_SETS, determineCaseType, generateCaseNumber } from '@/lib/case-documents'

/**
 * GET /api/cases - List cases for a client or agent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clerkUserId = searchParams.get('clerk_user_id')
    const agentId = searchParams.get('agent_id')
    const caseId = searchParams.get('case_id')

    if (!clerkUserId && !agentId && !caseId) {
      return NextResponse.json(
        { error: 'clerk_user_id, agent_id, or case_id required' },
        { status: 400 }
      )
    }

    const supabase = createAgentsServerClient()

    if (caseId) {
      // Get single case with documents
      const { data: caseData, error: caseError } = await supabase
        .from('recovery_cases')
        .select('*')
        .eq('id', caseId)
        .single()

      if (caseError) {
        return NextResponse.json(
          { error: 'Case not found', details: caseError.message },
          { status: 404 }
        )
      }

      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('priority', { ascending: true })

      if (docsError) {
        return NextResponse.json(
          { error: 'Failed to fetch documents', details: docsError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        case: caseData,
        documents: docs || [],
      })
    }

    // List cases
    let query = supabase
      .from('recovery_cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (clerkUserId) {
      query = query.eq('clerk_user_id', clerkUserId)
    }
    if (agentId) {
      query = query.eq('agent_id', agentId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cases', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ cases: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/cases - Create a new recovery case from questionnaire data
 * Auto-generates the required document set based on case type
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionnaire_data, clerk_user_id, agent_id } = body

    if (!questionnaire_data) {
      return NextResponse.json(
        { error: 'questionnaire_data is required' },
        { status: 400 }
      )
    }

    const supabase = createAgentsServerClient()

    // Extract key fields from questionnaire
    const personalInfo = questionnaire_data.personalInfo || {}
    const propertyInfo = questionnaire_data.propertyInfo || {}
    const deceasedOwner = questionnaire_data.deceasedOwner || {}

    // Determine case type and required documents
    const caseType = determineCaseType(questionnaire_data)
    const requiredDocs = CASE_DOCUMENT_SETS[caseType]

    // Create the case
    const caseNumber = generateCaseNumber()
    const clientId = crypto.randomUUID()

    const { data: newCase, error: caseError } = await supabase
      .from('recovery_cases')
      .insert({
        client_id: clientId,
        agent_id: agent_id || null,
        clerk_user_id: clerk_user_id || null,
        case_number: caseNumber,
        status: 'documents_pending',
        client_first_name: personalInfo.firstName || null,
        client_last_name: personalInfo.lastName || null,
        client_email: personalInfo.email || null,
        client_phone: personalInfo.phonePrimary || null,
        client_address: personalInfo.currentAddress || null,
        client_city: personalInfo.currentCity || null,
        client_state: personalInfo.currentState || null,
        client_zip: personalInfo.currentZip || null,
        client_ssn_last4: personalInfo.ssnLastFour || null,
        client_dob: personalInfo.dateOfBirth || null,
        property_address: propertyInfo.propertyAddress || null,
        property_city: propertyInfo.propertyCity || null,
        property_state: propertyInfo.propertyState || null,
        property_zip: propertyInfo.propertyZip || null,
        property_county: propertyInfo.propertyCounty || null,
        parcel_number: propertyInfo.parcelNumber || null,
        foreclosure_type: propertyInfo.foreclosureType || null,
        sale_date: propertyInfo.saleDate || null,
        sale_amount: propertyInfo.saleAmount || null,
        estimated_surplus: propertyInfo.estimatedSurplus || null,
        ownership_type: questionnaire_data.ownership?.ownershipType || null,
        is_heir: deceasedOwner.isHeir || false,
        deceased_owner_name: deceasedOwner.deceasedOwnerName || null,
        questionnaire_data,
      })
      .select()
      .single()

    if (caseError) {
      return NextResponse.json(
        { error: 'Failed to create case', details: caseError.message },
        { status: 500 }
      )
    }

    // Fetch templates by name
    const templateNames = requiredDocs.map(d => d.templateName)
    const { data: templates, error: templatesError } = await supabase
      .from('document_templates')
      .select('*')
      .in('name', templateNames)

    if (templatesError || !templates) {
      return NextResponse.json(
        { error: 'Failed to fetch templates', details: templatesError?.message },
        { status: 500 }
      )
    }

    // Create document instances for this case
    const templateMap = new Map(templates.map(t => [t.name, t]))
    const clientFullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim()
    const fullAddress = `${propertyInfo.propertyAddress || ''}, ${propertyInfo.propertyCity || ''}, ${propertyInfo.propertyState || ''} ${propertyInfo.propertyZip || ''}`.trim()

    const documentsToInsert = requiredDocs
      .filter(doc => {
        const template = templateMap.get(doc.templateName)
        return template != null
      })
      .map(doc => {
        const template = templateMap.get(doc.templateName)!

        // Auto-populate form fields from questionnaire data
        const formData: Record<string, string> = {}
        const fields = template.form_fields?.fields || []
        for (const field of fields) {
          if (field.id === 'client_name' || field.id === 'heir_name' || field.id === 'signor_name') {
            formData[field.id] = clientFullName
          } else if (field.id === 'client_address') {
            formData[field.id] = `${personalInfo.currentAddress || ''}, ${personalInfo.currentCity || ''}, ${personalInfo.currentState || ''} ${personalInfo.currentZip || ''}`
          } else if (field.id === 'property_address') {
            formData[field.id] = fullAddress
          } else if (field.id === 'county') {
            formData[field.id] = propertyInfo.propertyCounty || ''
          } else if (field.id === 'state') {
            formData[field.id] = propertyInfo.propertyState || ''
          } else if (field.id === 'client_phone') {
            formData[field.id] = personalInfo.phonePrimary || ''
          } else if (field.id === 'client_email') {
            formData[field.id] = personalInfo.email || ''
          } else if (field.id === 'deceased_name') {
            formData[field.id] = deceasedOwner.deceasedOwnerName || ''
          } else if (field.id === 'relationship') {
            formData[field.id] = deceasedOwner.relationshipToDeceased || ''
          } else if (field.id === 'date_of_death') {
            formData[field.id] = deceasedOwner.dateOfDeath || ''
          } else if (field.id === 'foreclosure_type') {
            formData[field.id] = propertyInfo.foreclosureType || ''
          } else if (field.id === 'sign_date') {
            formData[field.id] = new Date().toISOString().split('T')[0]
          } else if (field.id === 'heir_or_owner') {
            formData[field.id] = deceasedOwner.isHeir ? 'heir of this property' : 'previous homeowner'
          }
        }

        return {
          title: template.name,
          description: template.description,
          file_url: template.file_url,
          file_name: template.file_name,
          client_id: clientId,
          case_id: newCase.id,
          template_id: template.id,
          status: 'pending',
          requires_notary: doc.requiresNotary,
          document_group: doc.group,
          priority: doc.priority,
          form_data: formData,
        }
      })

    const { data: createdDocs, error: docsError } = await supabase
      .from('documents')
      .insert(documentsToInsert)
      .select()

    if (docsError) {
      return NextResponse.json(
        { error: 'Failed to create documents', details: docsError.message },
        { status: 500 }
      )
    }

    // Audit log
    for (const doc of createdDocs || []) {
      await supabase.from('document_audit_log').insert({
        document_id: doc.id,
        action: 'created',
        actor_email: personalInfo.email || clerk_user_id || 'system',
        details: { case_number: caseNumber, case_type: caseType, template: doc.title },
      })
    }

    return NextResponse.json({
      case: newCase,
      case_type: caseType,
      documents: createdDocs || [],
      document_count: createdDocs?.length || 0,
    }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
