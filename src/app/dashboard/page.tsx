import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  return <DashboardContent />
}
