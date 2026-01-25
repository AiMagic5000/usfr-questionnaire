import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get the user's saved intake response
    const { data, error } = await supabase
      .from('intake_responses')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine for new users
      console.error('Supabase load error:', error)
      return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({
        formData: null,
        currentStep: 1,
        completedSteps: [],
        isComplete: false,
      })
    }

    return NextResponse.json({
      formData: data.form_data,
      currentStep: data.current_step || 1,
      completedSteps: data.completed_steps || [],
      isComplete: data.is_complete || false,
      lastUpdated: data.updated_at,
    })
  } catch (error) {
    console.error('Load error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
