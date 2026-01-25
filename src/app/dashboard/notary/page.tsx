import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NotaryScheduling } from '@/components/dashboard/NotaryScheduling'

export const dynamic = 'force-dynamic'

export default async function NotaryPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  return <NotaryScheduling />
}
