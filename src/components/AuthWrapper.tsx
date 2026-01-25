'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AuthWrapperProps {
  children: ReactNode
  redirectIfSignedIn?: string
  requireAuth?: boolean
  loadingComponent?: ReactNode
}

export function AuthWrapper({
  children,
  redirectIfSignedIn,
  requireAuth = false,
  loadingComponent,
}: AuthWrapperProps) {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (redirectIfSignedIn && isSignedIn) {
      router.push(redirectIfSignedIn)
    }

    if (requireAuth && !isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, redirectIfSignedIn, requireAuth, router])

  if (!isLoaded) {
    return (
      loadingComponent || (
        <div className="min-h-screen bg-usfr-light flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-usfr-primary border-t-transparent rounded-full" />
        </div>
      )
    )
  }

  if (requireAuth && !isSignedIn) {
    return null
  }

  if (redirectIfSignedIn && isSignedIn) {
    return null
  }

  return <>{children}</>
}
