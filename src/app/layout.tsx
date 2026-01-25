import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Client Intake Questionnaire | US Foreclosure Recovery',
  description: 'Complete the client intake questionnaire to begin your surplus funds claim with US Foreclosure Recovery.',
  keywords: 'foreclosure surplus funds, excess proceeds, tax sale surplus, claim recovery, foreclosure recovery',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Client Intake Questionnaire | US Foreclosure Recovery',
    description: 'Complete the client intake questionnaire to begin your surplus funds claim.',
    type: 'website',
    siteName: 'US Foreclosure Recovery',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if Clerk keys are available
  const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // If no Clerk keys, render without provider (for build)
  if (!hasClerkKeys) {
    return (
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    )
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#003366',
          colorTextOnPrimaryBackground: '#ffffff',
          colorBackground: '#f5f8fa',
          colorInputBackground: '#ffffff',
          colorInputText: '#333333',
        },
        elements: {
          formButtonPrimary: 'bg-[#003366] hover:bg-[#002244]',
          card: 'shadow-lg',
          headerTitle: 'text-[#003366]',
          headerSubtitle: 'text-gray-600',
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
