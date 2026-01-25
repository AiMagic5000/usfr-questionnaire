import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

// Force dynamic to skip static generation
export const dynamic = 'force-dynamic'

export default async function QuestionnairePage() {
  const { userId } = await auth()

  // Redirect to home if not signed in, otherwise to dashboard
  if (!userId) {
    redirect('/')
  }

  // Questionnaire is now a tab in the unified dashboard
  redirect('/dashboard')
}
