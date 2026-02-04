import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'
import { createAgentsServerClient } from '@/lib/supabase-agents'
import { CASE_DOCUMENT_SETS, determineCaseType, generateCaseNumber } from '@/lib/case-documents'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const data = await request.json()

    if (userId) {
      const supabase = createServerClient()

      // Update the intake response to mark as complete
      const { error } = await supabase
        .from('intake_responses')
        .upsert(
          {
            clerk_user_id: userId,
            form_data: data,
            current_step: 9,
            completed_steps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            is_complete: true,
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'clerk_user_id',
          }
        )

      if (error) {
        console.error('Supabase submit error:', error)
      }

      // Create recovery case + document package on agents DB
      try {
        const agentsDb = createAgentsServerClient()
        const personalInfo = data.personalInfo || {}
        const propertyInfo = data.propertyInfo || {}
        const deceasedOwner = data.deceasedOwner || {}

        const caseType = determineCaseType(data)
        const requiredDocs = CASE_DOCUMENT_SETS[caseType]
        const caseNumber = generateCaseNumber()
        const clientId = crypto.randomUUID()

        // Check for existing case to avoid duplicates
        const { data: existingCases } = await agentsDb
          .from('recovery_cases')
          .select('id')
          .eq('clerk_user_id', userId)
          .limit(1)

        if (existingCases && existingCases.length > 0) {
          // Case already exists - skip creation
        } else {
          const { data: newCase, error: caseError } = await agentsDb
            .from('recovery_cases')
            .insert({
              client_id: clientId,
              agent_id: data.agentIdentification?.agentId || null,
              clerk_user_id: userId,
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
              ownership_type: data.ownership?.ownershipType || null,
              is_heir: deceasedOwner.isHeir || false,
              deceased_owner_name: deceasedOwner.deceasedOwnerName || null,
              questionnaire_data: data,
            })
            .select()
            .single()

          if (caseError) {
            console.error('Recovery case creation error:', caseError)
          } else if (newCase) {
            // Fetch templates and create document instances
            const templateNames = requiredDocs.map(d => d.templateName)
            const { data: templates } = await agentsDb
              .from('document_templates')
              .select('*')
              .in('name', templateNames)

            if (templates && templates.length > 0) {
              const templateMap = new Map(templates.map(t => [t.name, t]))
              const clientFullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim()
              const fullAddress = `${propertyInfo.propertyAddress || ''}, ${propertyInfo.propertyCity || ''}, ${propertyInfo.propertyState || ''} ${propertyInfo.propertyZip || ''}`.trim()

              const documentsToInsert = requiredDocs
                .filter(doc => templateMap.has(doc.templateName))
                .map(doc => {
                  const template = templateMap.get(doc.templateName)!
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

              const { data: createdDocs, error: docsError } = await agentsDb
                .from('documents')
                .insert(documentsToInsert)
                .select()

              if (docsError) {
                console.error('Document creation error:', docsError)
              }

              // Audit log entries
              for (const doc of createdDocs || []) {
                await agentsDb.from('document_audit_log').insert({
                  document_id: doc.id,
                  action: 'created',
                  actor_email: personalInfo.email || userId,
                  details: { case_number: caseNumber, case_type: caseType, template: doc.title },
                })
              }
            }
          }
        }
      } catch (agentErr) {
        console.error('Recovery case/docs creation error:', agentErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
