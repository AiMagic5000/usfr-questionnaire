import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { formData, currentStep, completedSteps } = body

    const supabase = createServerClient()

    // Upsert the intake response
    const { error } = await supabase
      .from('intake_responses')
      .upsert(
        {
          clerk_user_id: userId,
          form_data: formData,
          current_step: currentStep,
          completed_steps: completedSteps,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'clerk_user_id',
        }
      )

    if (error) {
      console.error('Supabase save error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
