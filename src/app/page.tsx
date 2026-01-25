import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { HomeContent } from '@/components/HomeContent'

// Force dynamic to skip static generation
export const dynamic = 'force-dynamic'

export default async function Home() {
  const { userId } = await auth()

  // Redirect to questionnaire if already signed in
  if (userId) {
    redirect('/questionnaire')
  }

  return <HomeContent />
}
