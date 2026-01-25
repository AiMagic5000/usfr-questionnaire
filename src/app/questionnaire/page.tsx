import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { QuestionnaireContent } from '@/components/questionnaire/QuestionnaireContent'

// Force dynamic to skip static generation
export const dynamic = 'force-dynamic'

export default async function QuestionnairePage() {
  const { userId } = await auth()

  // Redirect to home if not signed in
  if (!userId) {
    redirect('/')
  }

  return <QuestionnaireContent />
}
