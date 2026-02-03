import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <UnifiedDashboard />
    </Suspense>
  )
}
