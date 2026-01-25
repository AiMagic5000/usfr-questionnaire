import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const data = await request.json()

    console.log('Form submission received:', JSON.stringify(data, null, 2))

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

      // Create a case record
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          clerk_user_id: userId,
          status: 'pending_review',
          property_address: data.propertyInfo?.propertyAddress,
          property_city: data.propertyInfo?.propertyCity,
          property_state: data.propertyInfo?.propertyState,
          property_zip: data.propertyInfo?.propertyZip,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (caseError) {
        console.error('Case creation error:', caseError)
      } else {
        console.log('Case created:', caseData?.id)
      }
    }

    // TODO: Send notification email
    // await sendEmail({ to: 'claim@usforeclosurerecovery.com', subject: 'New Intake', ... })

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
